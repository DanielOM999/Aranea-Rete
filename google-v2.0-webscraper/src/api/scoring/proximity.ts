import type { Website } from "../../models/index.js";

// Funksjon for å beregne proximities (nærhetspoeng)
export function getProximities(
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
): number[] {
  const proximities: number[] = [];

  // Iterer gjennom gruppene med søkeord
  for (const { keywords } of grouped) {
    const clusters: Array<Set<string>> = [];
    const current = new Set<string>();
    let fulfillmentTotal = 0;
    const positions: number[] = [];

    // Behandler hvert søkeord
    for (const kw of keywords) {
      positions.push(kw.position);

      // Hvis ordet er allerede i nåværende gruppe, lagre den
      if (current.has(kw.word)) {
        fulfillmentTotal += current.size / lemmatizedQuery.length;
        clusters.push(new Set(current));
        current.clear();
      }
      current.add(kw.word);
    }

    // Legg til siste gruppe om den finnes
    if (current.size) {
      fulfillmentTotal += current.size / lemmatizedQuery.length;
      clusters.push(current);
    }

    // Beregn oppfyllelsespoeng for hver gruppe
    const clusterFulfill = clusters.length
      ? fulfillmentTotal / clusters.length
      : 0;

    let totalDist = 0;
    // Beregn avstanden mellom posisjonene til søkeordene
    for (let i = 0; i + 1 < positions.length; i++) {
      const dist = positions[i + 1] - positions[i] - 1;
      if (dist <= lemmatizedQuery.length) {
        totalDist += dist;
      }
    }

    // Beregn sluttpoeng for proximities
    const proximityScore =
      clusters.length && keywords.length
        ? (1 - totalDist / keywords.length) * clusterFulfill
        : 0;

    proximities.push(proximityScore);
  }

  return proximities;
}
