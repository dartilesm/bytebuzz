"use client";

import { SearchBoxEmpty } from "@/components/explore/search-box-empty";
import { SearchBoxItem } from "@/components/explore/search-box-item";
import { useUsersSearch } from "@/hooks/queries/use-users-search";
import {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteStatus,
} from "@/components/ui/autocomplete";
import type { Database } from "database.types";
import { Loader2, SearchIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

type User = Database["public"]["Functions"]["search_users"]["Returns"][0];
type SearchItem = { id: string; type: "search"; term: string };
type CombinedItem = User | SearchItem;

interface SearchBoxProps {
  onSearch?: (term: string) => void;
  initialSearchTerm?: string;
  placeholder?: string;
}

export function SearchBox({
  onSearch,
  initialSearchTerm = "",
  placeholder = "Search...",
}: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebounceValue(searchTerm, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: { data: users },
    isLoading,
  } = useUsersSearch(debouncedSearchTerm);

  function handleInputChange(term: string) {
    setSearchTerm(term);
    setDebouncedSearchTerm(term);
  }

  function handleExactSearch() {
    onSearch?.(debouncedSearchTerm);
  }

  function handleClear() {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    onSearch?.("");
  }

  // Create combined items with search item first if there's a search term
  const combinedItems: CombinedItem[] =
    debouncedSearchTerm && debouncedSearchTerm.trim() !== ""
      ? [{ id: "search-exact", type: "search", term: debouncedSearchTerm }, ...users]
      : users;

  const [open, setOpen] = useState(false);

  return (
    <Autocomplete
      open={open}
      onOpenChange={setOpen}
      items={combinedItems}
      openOnInputClick
      itemToStringValue={(item) => {
        if ("display_name" in item) return item.display_name || "";
        return (item as SearchItem).term;
      }}
    >
      <label className="flex items-center border rounded-full px-3 bg-background relative w-full">
        <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50 absolute left-2 z-10" />
        <AutocompleteInput
          ref={inputRef}
          placeholder={placeholder}
          className="absolute left-0 h-9 px-8"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleExactSearch();
              setOpen(false);
            }
          }}
        />
        {isLoading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
        {searchTerm && (
          <AutocompleteClear onClick={handleClear} />
        )}
      </label>
      <AutocompleteContent>
        {isLoading && <AutocompleteStatus>Loading...</AutocompleteStatus>}
        {!isLoading && combinedItems.length === 0 && debouncedSearchTerm && (
          <AutocompleteStatus>
            <SearchBoxEmpty searchTerm={debouncedSearchTerm} />
          </AutocompleteStatus>
        )}
        <AutocompleteList>
          {combinedItems.map((item) => {
            const textValue = "display_name" in item ? item.display_name : (item as SearchItem).term;
            const key = "id" in item ? item.id : (item as SearchItem).term;
            return (
              <AutocompleteItem
                key={key}
                value={item}
                onSelect={() => {
                  if ("type" in item && item.type === "search") {
                    handleExactSearch();
                  }
                  setOpen(false);
                }}
              >
                <SearchBoxItem item={item} onExactSearch={handleExactSearch} />
              </AutocompleteItem>
            );
          })}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
