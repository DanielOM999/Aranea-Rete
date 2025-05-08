import { createApiServer } from "./api/server.js";
import runScraper from "./index.js";

// Hovedoppstart av både API-server og scraper
async function bootstrap() {
  try {
    // Starter API-server
    await createApiServer();
    console.log("API server started successfully");

    // Starter nettside-crawler i bakgrunnen
    runScraper();
    console.log("Scraper started successfully");
  } catch (err) {
    console.error("Bootstrap failed:", err);
    process.exit(1);
  }
}

// Kjører bootstrap-funksjonen
bootstrap();
