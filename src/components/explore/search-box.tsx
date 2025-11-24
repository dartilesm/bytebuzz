"use client";

import { SearchBoxEmpty } from "@/components/explore/search-box-empty";
import { SearchBoxItem } from "@/components/explore/search-box-item";
import { useUsersSearch } from "@/hooks/queries/use-users-search";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
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
    >
      <div className="flex items-center border rounded-full px-3 bg-background focus-within:ring-2 focus-within:ring-ring ring-offset-background relative">
        <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <AutocompleteInput
          ref={inputRef}
          placeholder={placeholder}
          className="border-none focus:ring-0 shadow-none h-9 px-0"
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
          <button onClick={handleClear} className="ml-2 text-muted-foreground hover:text-foreground">
            <span className="sr-only">Clear</span>
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>
      <AutocompleteContent>
        {isLoading && <AutocompleteEmpty>Loading...</AutocompleteEmpty>}
        {!isLoading && combinedItems.length === 0 && (
          <AutocompleteEmpty>
            <SearchBoxEmpty searchTerm={debouncedSearchTerm} />
          </AutocompleteEmpty>
        )}
        <AutocompleteList>
          {combinedItems.map((item) => {
            const textValue = "display_name" in item ? item.display_name : (item as SearchItem).term;
            const key = "id" in item ? item.id : (item as SearchItem).term;
            return (
              <AutocompleteItem
                key={key}
                value={textValue ?? ""}
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
