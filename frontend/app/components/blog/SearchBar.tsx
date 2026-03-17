/**
 * Search input with debounced query emission, loading state, and clear button.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref so the debounce effect doesn't re-fire when the callback identity changes.
  const onSearchRef = useRef(onSearch);
  useEffect(() => { onSearchRef.current = onSearch; });

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearchRef.current(value.trim());
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value]);

  function handleClear() {
    setValue("");
    onSearch("");
  }

  return (
    <div className="relative flex items-center w-full">
      <FaSearch className="absolute left-3 text-gray-400 text-sm pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
  );
}
