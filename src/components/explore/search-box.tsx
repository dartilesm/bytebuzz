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

  function handleItemSelect(item: CombinedItem) {
    if ("type" in item && item.type === "search") {
      handleExactSearch();
    }
    setOpen(false);
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
      openOnInputClick={combinedItems.length > 0}
      variant="flat"
      itemToStringValue={(item: unknown) => {
        const val = item as CombinedItem;
        if ("display_name" in val) return val.display_name || "";
        return val.term;
      }}
      value={searchTerm}
      onValueChange={handleInputChange}
      filter={null}
    >
      <label className="flex items-center rounded-full px-3 relative w-full">
        <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50 absolute left-2 z-10" />
        <AutocompleteInput
          ref={inputRef}
          placeholder={placeholder}
          className="absolute left-0 h-9 px-8"
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
          {(item: CombinedItem) => <AutocompleteItem
            key={item.id}
            value={item}
            onSelect={() => handleItemSelect(item)}
          >
            <SearchBoxItem item={item} onExactSearch={handleExactSearch} />
          </AutocompleteItem>
          }
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
