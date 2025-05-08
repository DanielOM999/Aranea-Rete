"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "./search-bar";
import SearchResults, { SearchResult } from "./search-results";
import Link from "next/link";

interface ApiResponse {
  executionSeconds: number;
  results: Array<{
    title: string;
    description: string;
    url: string;
    rank: number;
  }>;
}

// Håndterer søk, API-kall og visning av resultater
export default function SearchContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(paramQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!paramQuery.trim()) {
      setResults([]);
      setQuery("");
      return;
    }

    setIsLoading(true);
    setQuery(paramQuery);

    fetch("http://localhost:5000/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: paramQuery }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<ApiResponse>;
      })
      .then((data) => {
        setResults(
          data.results.map((w) => ({
            title: w.title,
            description: w.description,
            url: w.url,
            rank: w.rank,
          }))
        );
      })
      .catch((err) => {
        console.error("Search API error:", err);
        setResults([]);
      })
      .finally(() => setIsLoading(false));
  }, [paramQuery]);

  const handleSearch = (q: string) => {
    router.push(`/?q=${encodeURIComponent(q)}`, { scroll: false });
  };

  // Når det finnes et søkespørsmål – vis søkeresultater
  if (query) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-800">
        <header className="w-full bg-gray-900 px-4 py-3 flex items-center shadow-md">
          {query ? (
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-semibold text-blue-400 mr-8 whitespace-nowrap">
                Aranea Rete
              </h1>
            </Link>
          ) : (
            <h1 className="text-xl font-semibold text-blue-400 mr-8 whitespace-nowrap">
              Aranea Rete
            </h1>
          )}
          <div className="flex-1">
            <SearchBar initialValue={paramQuery} onSearch={handleSearch} />
          </div>
        </header>

        <main className="flex-1 px-4 pt-6">
          {query ? (
            <>
              <p className="text-sm text-gray-400 mb-4">
                {isLoading
                  ? `Searching for "${query}"…`
                  : `About ${results.length} results for "${query}"`}
              </p>
              <SearchResults results={results} isLoading={isLoading} />
            </>
          ) : (
            <p className="text-center text-gray-500 mt-20">
              Enter something above to search…
            </p>
          )}
        </main>
      </div>
    );
  }

  // Når ingen søk er gjort – vis introduksjon og søkefelt
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center mb-12 mt-24">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
          Aranea Rete
        </h1>
        <p className="text-gray-400 text-lg">Discover the web efficiently</p>
      </div>

      <div className="w-full max-w-3xl mb-12 px-4">
        <SearchBar onSearch={handleSearch} />
      </div>

      {query && (
        <div className="w-full max-w-3xl px-4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-400 font-medium">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-pulse">Searching</span>
                  <span className="loading-dots"></span>
                </span>
              ) : (
                `About ${results.length} results for "${query}"`
              )}
            </p>
          </div>
          <SearchResults results={results} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
