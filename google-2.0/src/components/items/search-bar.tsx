"use client"

import { useState, useRef, type FormEvent } from "react"
import { Search } from "lucide-react"
import { Input } from "@/src/components/ui/input"

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void
}

// Søkefelt med innebygd ikon og animasjon
export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
    inputRef.current?.blur();
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl">
      <div className="relative flex items-center group">
        <Input
          type="search"
          enterKeyHint="search"
          placeholder="Search the web..."
          ref={inputRef}
          className="search-clear w-full pl-12 pr-8 sm:pl-14 sm:pr-10 py-6 sm:py-7 text-base sm:text-lg rounded-full border border-gray-800 hover:border-gray-700 focus:border-blue-500/80 focus-visible:ring-0 shadow-lg bg-gray-900/50 backdrop-blur-sm text-gray-100 placeholder-gray-500 transition-all duration-200 ease-in-out"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-4 sm:left-5 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
      </div>
    </form>
  );
}