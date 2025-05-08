import type { Website } from "../../models/index.js";

// Funksjon for å beregne TF-IDF-scorer
export async function getTfIdfScores(
  documentCount: number,
  lemmatizedQuery: string[],
  grouped: Array<{
    keywords: Array<{
      word: string;
      occurrences: number;
      documentsContaining: number;
      position: number;
    }>;
    website: Website;
  }>
): Promise<Array<[number, Website]>> {
  const queryTermCounts = new Map<string, number>();

  // Telle forekomster av hvert ord i den lemmatiserte spørringen
  lemmatizedQuery.forEach((w) => {
    queryTermCounts.set(w, (queryTermCounts.get(w) || 0) + 1);
  });

  // Beregn TF (Term Frequency) for hvert ord i spørringen
  const queryTfs = new Map<string, number>();
  for (const [w, cnt] of queryTermCounts.entries()) {
    queryTfs.set(w, cnt / lemmatizedQuery.length);
  }

  const sims: Array<[number, Website]> = [];

  // Beregn TF-IDF-scorer for hvert nettsted basert på søkeordene
  for (const { keywords, website } of grouped) {
    let dot = 0,
      sumQ = 0,
      sumD = 0;

    // Beregn dot-produkt, sumQ og sumD for TF-IDF
    for (const kw of keywords) {
      const tf = kw.occurrences / website.word_count;
      const idf = 1 + Math.log(documentCount / kw.documentsContaining);
      const docWeight = tf * idf;
      const qryTf = (queryTfs.get(kw.word) || 0) * idf;

      dot += qryTf * docWeight;
      sumQ += qryTf ** 2;
      sumD += docWeight ** 2;
    }

    // Beregn den endelige likhetskoeffisienten (cosine similarity)
    const denom = Math.sqrt(sumQ) * Math.sqrt(sumD);
    const similarity = denom > 0 ? dot / denom : 0;

    sims.push([similarity, website]);
  }

  return sims;
}
