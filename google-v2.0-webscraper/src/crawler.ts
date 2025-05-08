import PptExtra from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { Browser, Page, BrowserContext, LaunchOptions } from "puppeteer";
import { Website, Keyword, WebsiteKeyword, sequelize } from "./models/index.js";
import { loadLemmatizedWord } from "./util/lemmatizedMap.js";
import isRootForbidden from "./util/RobotsParser.js";
import UserAgent from "user-agents";
import dns from "dns/promises";
import { URL } from "url";

export class Crawler {
  // Statisk referanse til browser
  private static browser: Browser;
  private static initialized = false;

  // Instansvariabler for kontekst og side
  private context!: BrowserContext;
  private page!: Page;
  private currentUrl!: string;

  private constructor() {}

  // Initialiserer puppeteer-browser med stealth-plugin
  private static async init(): Promise<void> {
    if (Crawler.initialized) return;

    const puppeteer = PptExtra as typeof PptExtra & {
      use: (plugin: any) => typeof PptExtra;
      launch: (options?: LaunchOptions) => Promise<Browser>;
    };
    puppeteer.use(StealthPlugin());
    Crawler.browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 60000,
    });

    Crawler.initialized = true;
  }

  // Lager en crawler-instans etter å ha initialisert browser
  public static async create(): Promise<Crawler> {
    await Crawler.init();
    return new Crawler();
  }

  // Setter opp en ny side og kontekst for hver crawling
  private async initializePage(): Promise<void> {
    if (this.context) {
      await this.context.close().catch(() => {});
    }

    this.context = await Crawler.browser.createBrowserContext();
    this.page = await this.context.newPage();

    this.page.setDefaultNavigationTimeout(120_000);
    this.page.setDefaultTimeout(120_000);

    // Setter tilfeldig brukeragent og skjermstørrelse
    await this.page.setUserAgent(
      new UserAgent({ deviceCategory: "desktop" }).toString()
    );
    await this.page.setViewport({
      width: 1200 + Math.floor(Math.random() * 300),
      height: 700 + Math.floor(Math.random() * 300),
    });

    // Blokkerer unødvendige ressurser (bilder, video, fonter)
    await this.page.setRequestInterception(true);
    this.page.on("request", (req) => {
      const t = req.resourceType();
      if (t === "image" || t === "font" || t === "media") {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Logger sidefeil
    this.page.on("error", (err) => {
      console.error(`Page error on ${this.currentUrl}:`, err);
    });
  }

  // Hovedfunksjon for å crawle en nettside
  public async crawl(
    url: string,
    siteId: string,
    rank: number
  ): Promise<boolean | null> {
    this.currentUrl = url;
    await this.initializePage();

    try {
      await this.validateUrl(url); // Sjekker om URL og DNS er gyldig
      if (!(await this.checkRobots(url))) return false; // Sjekker robots.txt

      // Laster inn siden og venter på at alt er klart
      const [response] = await Promise.all([
        this.page.goto(url, { waitUntil: "networkidle0" }),
        this.page.waitForFunction('document.readyState === "complete"'),
      ]);
      if (!response || !response.ok()) return false;

      // Henter metadata (tittel og beskrivelse)
      const { title, description } = await this.getMeta();

      // Bearbeider tekstinnhold til lemmatiserte ord
      const words = await this.processContent();
      if (!words.length) return false;

      // Lagrer alle data i databasen
      await this.saveData(url, title, description, words, siteId, rank);
      console.log(`Indexed ${url}`);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      // Skiller mellom permanente og midlertidige feil
      if (
        msg.includes("Invalid URL or DNS failure") ||
        ![
          "ERR_BLOCKED_BY_CLIENT",
          "ERR_CONNECTION_CLOSED",
          "ERR_CONNECTION_TIMED_OUT",
          "ERR_CERT_COMMON_NAME_INVALID",
          "deadlock",
          "Navigation timeout",
          "Protocol error",
          "detached Frame",
        ].some((code) => msg.includes(code))
      ) {
        console.warn(`Permanent failure for ${url}: ${msg}`);
        return false;
      }

      console.warn(`Will retry ${url} later due to retryable error: ${msg}`);
      return null;
    } finally {
      // Lukker kontekst etter crawling
      await this.context.close().catch(() => {});
    }
  }

  // Validerer at URL og DNS-oppslag fungerer
  private async validateUrl(url: string): Promise<void> {
    try {
      new URL(url);
      await dns.lookup(new URL(url).hostname);
    } catch {
      throw new Error(`Invalid URL or DNS failure: ${url}`);
    }
  }

  // Henter metadata fra nettsiden
  private async getMeta(): Promise<{ title: string; description: string }> {
    return this.page.evaluate(() => {
      const d = document.querySelector('meta[name="description"]');
      return {
        title: document.title || "",
        description: d?.getAttribute("content") || "",
      };
    });
  }

  // Leser robots.txt og sjekker om root er blokkert
  private async checkRobots(url: string): Promise<boolean> {
    try {
      const resp = await fetch(new URL("/robots.txt", url).toString(), {
        headers: { "User-Agent": new UserAgent().toString() },
      });
      if (!resp.ok) return true;
      const body = await resp.text();
      return !isRootForbidden(body);
    } catch {
      return true;
    }
  }

  // Bearbeider tekstinnhold til en liste av lemmatiserte ord
  private async processContent(): Promise<string[]> {
    const raw = await this.page.evaluate(() =>
      document.body.innerText.toLowerCase()
    );
    const tokens = raw
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => /^[a-z]{2,30}$/.test(w));
    return Promise.all(tokens.map(loadLemmatizedWord));
  }

  // Lagrer nettside og ordstatistikk i databasen
  private async saveData(
    url: string,
    title: string,
    desc: string,
    words: string[],
    siteId: string,
    rank: number
  ): Promise<void> {
    const tx = await sequelize.transaction();
    try {
      const site = await Website.create(
        {
          title: title.slice(0, 255),
          description: desc.slice(0, 500),
          url,
          word_count: words.length,
          rank: rank,
        },
        { transaction: tx }
      );

      const kwMap = new Map<string, Keyword>();
      for (const w of Array.from(new Set(words))) {
        const [kw] = await Keyword.findOrCreate({
          where: { word: w },
          defaults: { documents_containing_word: 0 },
          transaction: tx,
        });
        await kw.increment("documents_containing_word", { transaction: tx });
        kwMap.set(w, kw);
      }

      const occ = words.reduce((acc, w, i) => {
        if (!acc[w]) acc[w] = { count: 0, pos: i + 1 };
        acc[w].count++;
        return acc;
      }, {} as Record<string, { count: number; pos: number }>);

      await WebsiteKeyword.bulkCreate(
        Object.entries(occ).map(([w, s]) => ({
          website_id: site.id,
          keyword_id: kwMap.get(w)!.id,
          occurrences: s.count,
          position: s.pos,
        })),
        { transaction: tx, ignoreDuplicates: true }
      );

      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }

  // Lukker browser når man er ferdig
  public static async closeAll(): Promise<void> {
    if (!Crawler.initialized) return;
    await Crawler.browser.close();
    Crawler.initialized = false;
  }
}
