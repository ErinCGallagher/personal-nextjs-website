/**
 * Search input with Enter-to-search, autocomplete suggestions,
 * loading state, and clear button.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { apiFetch, routes } from "@/app/lib/api";

type Suggestion = { text: string; score: number };

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  initialValue?: string;
};

export function SearchBar({
  onSearch,
  placeholder = "Search posts…",
  isLoading = false,
  initialValue = "",
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete fetch (200ms)
  useEffect(() => {
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestTimerRef.current = setTimeout(async () => {
      try {
        const data = await apiFetch<{ suggestions: Suggestion[] }>(
          routes.search.suggest(value.trim())
        );
        setSuggestions(data.suggestions);
        setShowSuggestions(data.suggestions.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => { if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current); };
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(text: string) {
    setValue(text);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSearch(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    } else if (e.key === "Enter") {
      if (showSuggestions && activeIndex >= 0) {
        selectSuggestion(suggestions[activeIndex].text);
      } else {
        setShowSuggestions(false);
        onSearch(value.trim());
      }
    }
  }

  function handleClear() {
    setValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch("");
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <FaSearch className="absolute left-3 text-gray-400 text-sm pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-3 rounded-lg bg-gray-100 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--grey-blue)] text-sm"
        />
        <div className="absolute right-3 flex items-center">
          {isLoading ? (
            <ImSpinner2 className="text-gray-400 text-sm animate-spin" />
          ) : value ? (
            <button
              onClick={handleClear}
              aria-label="Clear search"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          ) : null}
        </div>
      </div>

      {showSuggestions && (
        <ul className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={s.text}>
              <button
                onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s.text); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  i === activeIndex
                    ? "bg-[var(--grey-blue)] text-white"
                    : "text-foreground hover:bg-gray-100"
                }`}
              >
                {s.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
