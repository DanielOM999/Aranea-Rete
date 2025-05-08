import { Op } from "sequelize";
import { TopSite } from "../models/index.js";
import { Crawler } from "../crawler.js";
import TaskThrottler from "./TaskThrottler.js";

// Konfigurasjon for samtidighet og throttling
const CONCURRENCY = parseInt(process.env.CONCURRENCY_LIMIT || "10", 10); // Maks samtidige oppgaver (fra miljøvariabel eller standardverdi)
const THROTTLE_INTERVAL_MS = parseInt(
  process.env.THROTTLE_INTERVAL_MS || "100",
  10
); // Tidsintervall mellom oppgavene (fra miljøvariabel eller standardverdi)
const BASE_BACKOFF_MS = 1000; // Basis forsinkelse for retry-backoff
const MAX_BACKOFF_EXP = 10; // Maks antall retry-backoff eksponenter

// Hovedfunksjonen som laster nettsider og crawls
export default async function loadTopSites(): Promise<void> {
  const throttler = new TaskThrottler(CONCURRENCY, THROTTLE_INTERVAL_MS); // Initialiserer throttler med samtidighetsbegrensning og intervall
  let firstPassComplete = false; // Flag for å indikere om første gjennomgang er fullført

  while (true) {
    const now = new Date(); // Henter den nåværende datoen/tiden
    const whereClause = firstPassComplete
      ? {
          // Betingelser for å hente nettsider etter første runde (basert på forsøksantall og neste forsøkstidspunkt)
          scraped: false,
          attempt_count: { [Op.gt]: 0 },
          next_attempt: { [Op.lte]: now },
        }
      : {
          // Betingelser for å hente nettsider før første runde
          scraped: false,
          next_attempt: { [Op.or]: [null, { [Op.lte]: now }] },
        };

    // Henter nettsider som ikke er crawlet enda og som møter betingelsene
    const sites = await TopSite.findAll({
      where: whereClause,
      order: [
        ["rank", "ASC"], // Sorterer etter rang
        ["attempt_count", "ASC"], // Sorterer etter antall forsøk
        ["next_attempt", "ASC"], // Sorterer etter neste forsøk
      ],
      limit: CONCURRENCY, // Begrens antall nettsider som hentes samtidig
    });

    // Setter flag for å indikere at første pass er fullført
    if (!firstPassComplete && sites.every((s) => s.attempt_count > 0)) {
      firstPassComplete = true;
    }

    // Hvis ingen nettsider er funnet, vent i 60 sekunder før ny sjekk
    if (sites.length === 0) {
      console.log("Nothing to crawl right now; sleeping 60s…");
      await new Promise((r) => setTimeout(r, 60_000)); // Sover i 60 sekunder
      continue; // Går tilbake til starten av løkken
    }

    // Behandler nettsidene asynkront med TaskThrottler
    const tasks = sites.map((site) =>
      (async () => {
        await throttler.throttle(); // Venter på at throttleren gir tillatelse
        throttler.acquire(); // Begynner oppgaven etter throttling

        try {
          console.log("Starting to scrape: ", site.url); // Skriver ut at scraping starter for nettsiden
          const crawler = await Crawler.create(); // Lager en ny Crawler-instans
          const result = await crawler.crawl(
            `https://${site.url}`,
            site.id,
            site.rank
          ); // Crawls nettsiden

          if (result === true) {
            // Hvis crawlingen var vellykket
            await site.update({ scraped: true, last_error: null }); // Merker nettsiden som crawlet og uten feil
          } else if (result === false) {
            // Hvis crawlingen mislyktes permanent
            await site.update({
              scraped: true,
              last_error: "permanent failure",
            }); // Merker nettsiden som crawlet med permanent feil
          } else {
            // Hvis det er en feil som kan prøves igjen senere
            const attempts = site.attempt_count + 1; // Øker forsøksantallet
            const exp = Math.min(attempts, MAX_BACKOFF_EXP); // Beregner backoff-ekspansjon
            const delayMs = BASE_BACKOFF_MS * 2 ** exp; // Beregner forsinkelsestiden
            const nextDate = new Date(Date.now() + delayMs); // Beregner tidspunktet for neste forsøk

            // Oppdaterer nettsiden med ny forsinkelse og feilstatus
            await site.update({
              attempt_count: attempts,
              next_attempt: nextDate,
              last_error: "retryable error, deferred",
            });
            console.log(
              `Deferred retry #${attempts} for ${site.url} at ${nextDate}`
            ); // Skriver ut at nettsiden blir forsøkt igjen senere
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err); // Henter feilmeldingen hvis det skjer en uventet feil

          console.error(`Unexpected error for ${site.url}: ${msg}`); // Skriver ut feilmelding
          await site.update({
            scraped: true,
            last_error: `unexpected error: ${msg}`,
          }); // Merker nettsiden som crawlet med feilbeskrivelse
        } finally {
          throttler.release(); // Frigjør throttleren når oppgaven er ferdig
        }
      })()
    );

    await Promise.all(tasks); // Venter på at alle crawling-oppgaver skal bli ferdig
  }
}
