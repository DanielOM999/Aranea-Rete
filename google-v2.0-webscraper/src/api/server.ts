import "dotenv/config";
import express from "express";
import cors from "cors";
import { Website, Keyword, WebsiteKeyword } from "../models/index.js";
import { loadLemmatizedWord } from "../util/lemmatizedMap.js";
import { getTfIdfScores } from "./scoring/tfIdf.js";
import { getProximities } from "./scoring/proximity.js";
import { pathToFileURL } from "url";

// Funksjon for å opprette API-server
export function createApiServer(): Promise<void> {
  console.log("Starting API server...");

  // Initialiser express-app og sett port
  const app = express();
  const port = Number(process.env.PORT) || 3001;
  app.use(cors()); // Tillater CORS
  app.use(express.json()); // Parser JSON i forespørsler

  // Helse-sjekk endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Hent antall dokumenter (nettsteder)
  async function getDocumentCount(): Promise<number> {
    return await Website.count();
  }

  // Hent søkeord for den lemmatiserte spørringen
  async function fetchKeywords(lemmatizedQuery: string[]): Promise<Array<any>> {
    return await WebsiteKeyword.findAll({
      where: { "$Keyword.word$": lemmatizedQuery },
      include: [
        {
          model: Keyword,
          as: "Keyword",
          attributes: ["word", "documents_containing_word"],
        },
        {
          model: Website,
          as: "Website",
          attributes: ["url", "title", "description", "word_count", "rank"],
        },
      ],
      order: [["position", "ASC"]],
    });
  }

  // Hoved-API-rute for å håndtere spørringer
  app.post(
    "/api/query",
    async (req: express.Request, res: express.Response): Promise<void> => {
      try {
        const start = Date.now();
        const queryText: string = req.body.query;

        // Bearbeider spørringen (fjerner spesialtegn, lemmatiserer ord)
        const words = queryText
          .toLowerCase()
          .replace(/[^\w\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length > 1);
        const lemmatized = await Promise.all(words.map(loadLemmatizedWord));

        // Hent søkeordene knyttet til spørringen
        const raw = await fetchKeywords(lemmatized);
        if (!raw.length) {
          res.json({ executionSeconds: 0, results: [] });
          return;
        }

        // Organiser dataene etter nettside
        const siteMap = new Map<string, { keywords: any[]; website: any }>();
        raw.forEach((row) => {
          const key = row.Website.url;
          if (!siteMap.has(key)) {
            siteMap.set(key, { keywords: [], website: row.Website });
          }
          siteMap.get(key)!.keywords.push({
            word: row.Keyword.word,
            occurrences: row.occurrences,
            position: row.position,
            documentsContaining: row.Keyword.documents_containing_word,
          });
        });

        // Hent antall dokumenter (nettsteder)
        const documentCount = await getDocumentCount();
        const grouped = Array.from(siteMap.values());

        // Beregn TF-IDF og proximities (nærhetspoeng)
        const tfidf = await getTfIdfScores(documentCount, lemmatized, grouped);
        const proximities = getProximities(lemmatized, grouped);

        // Beregn rangering og score for hvert nettsted
        const maxRank = Math.max(...grouped.map((g) => g.website.rank));
        const scored = tfidf
          .map(([, website], i) => {
            const tf = tfidf[i][0];
            const prox = proximities[i] * 0.2;
            const rankScore = (1 - website.rank / maxRank) * 0.35;
            const final = (tf + prox + rankScore) / 3;
            return { website, score: final };
          })
          .sort((a, b) => b.score - a.score);

        // Returner resultater
        const results = scored.map((s) => s.website);
        const elapsed = (Date.now() - start) / 1000;

        res.json({ executionSeconds: elapsed, results });
      } catch (err) {
        console.error("API error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  // Start serveren og lytt på porten
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`API listening on http://0.0.0.0:${port}`);
      resolve();
    });
    server.on("error", reject);
  });
}

// Start serveren hvis filen kjøres direkte
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  createApiServer().catch((err) => {
    console.error("Failed to start API:", err);
    process.exit(1);
  });
}
