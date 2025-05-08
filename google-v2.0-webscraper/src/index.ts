import "dotenv/config";
import fs from "fs/promises";
import loadTopSites from "./util/loadTopSites.js";
import { sequelize, TopSite } from "./models/index.js";
import { Crawler } from "./crawler.js";
import { pathToFileURL } from "url";

// Sikrer at TopSite-tabellen har innhold, ellers fyller den med top-1m.txt
async function ensureTopSites() {
  const count = await TopSite.count();
  if (count === 0) {
    const raw = await fs.readFile("top-1m.txt", "utf-8");
    const urls = Array.from(new Set(raw.split(/\r?\n/))).filter(Boolean);
    await TopSite.bulkCreate(
      urls.map((u, i) => ({ url: u, rank: i + 1 })),
      { ignoreDuplicates: true }
    );
    console.log(`Seeded ${urls.length} top_sites`);
  }
}

// Hovedfunksjon for å kjøre crawler-systemet
export default async function runScraper() {
  try {
    // Kobler til databasen
    await sequelize.authenticate();
    console.log("Database connection established");

    // Synkroniserer tabeller (force: false = behold eksisterende data)
    await sequelize.sync({ force: false });
    console.log("Database tables created");

    // Fyller TopSites om nødvendig og starter crawling
    await ensureTopSites();
    await loadTopSites();
    console.log("All crawling tasks completed");

    // Lukker alle Puppeteer-instanser
    await Crawler.closeAll();
    console.log("All browser instances closed");
  } catch (err) {
    console.error("Scraper failed:", err);
  } finally {
    // Lukker databasetilkoblingen uansett utfall
    await sequelize.close();
    console.log("DB connection closed");
  }
}

// Sjekker om filen kjøres direkte, og starter runScraper
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runScraper().catch((err) => {
    console.error("Scraper failed:", err);
    process.exit(1);
  });
}
