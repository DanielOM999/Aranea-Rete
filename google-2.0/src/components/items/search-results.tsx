import { Skeleton } from "@/src/components/ui/skeleton"

export interface SearchResult {
  url: string;
  title: string;
  description: string;
  rank: number;
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
}

// Hovedkomponenten som håndterer både loading state og visning av søkeresultater
export default function SearchResults({ results, isLoading }: SearchResultsProps) {
  // Viser skeleton placeholders hvis resultatene er under innlasting
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-2 rounded-xl bg-transparent animate-pulse">
            <div className="space-y-3">
              <Skeleton className="h-6 w-48 bg-gray-700 rounded-full" />
              <Skeleton className="h-5 w-64 bg-gray-700 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-gray-700 rounded-full" />
                <Skeleton className="h-4 w-5/6 bg-gray-700 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Hvis det ikke finnes noen resultater etter søk
  if (results.length === 0) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <p className="text-gray-400">No results found. Try a different search term.</p>
      </div>
    )
  }

  // Viser søkeresultater
  return (
    <div className="space-y-6 mb-15">
      {results.map((result, index) => (
        <div 
          key={result.url}
          className="group p-2 bg-transparent transition-all duration-300 animate-result-entry"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="block">
            <div className="mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-400">{new URL(result.url).hostname[0]}</span>
              </span>
              <span className="text-sm text-gray-400 font-mono truncate">
                {new URL(result.url).hostname}
              </span>
            </div>
            <h2 className="text-xl text-blue-400 font-medium mb-2 hover:underline">
              {result.title}
            </h2>
            <p className="text-gray-300 leading-relaxed text-opacity-90">
              {result.description}
            </p>
          </a>
        </div>
      ))}
    </div>
  );
}
