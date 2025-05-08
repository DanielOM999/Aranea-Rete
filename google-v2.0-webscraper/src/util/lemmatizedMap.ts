import { readFile } from 'fs/promises';

type LemmatizedMap = Record<string, string>;  // Definerer en type 'LemmatizedMap' som er et objekt der nøklene og verdiene er strenger
let lemmatizedMap: LemmatizedMap | null = null;  // Variabel for å lagre lemmatized ord, initialisert som null

// Funksjon for å hente lemmatized versjon av et ord
export async function loadLemmatizedWord(word: string): Promise<string> {
  // Hvis 'lemmatizedMap' er null, leser vi filen og parser innholdet
  if (!lemmatizedMap) {
    const raw = await readFile('./lemmatizedMap.json', 'utf-8');  // Leser filen './lemmatizedMap.json' asynkront
    lemmatizedMap = JSON.parse(raw);  // Parser JSON-dataene og lagrer dem i lemmatizedMap
  }

  // Returnerer lemmatized ord hvis det finnes, ellers returneres originalt ord
  return lemmatizedMap![word.toLowerCase()] || word;
}
