"use client";

import { SearchBoxEmpty } from "@/components/explore/search-box-empty";
import { SearchBoxItem } from "@/components/explore/search-box-item";
import { useUsersSearch } from "@/hooks/fetch/use-users-search";
import { Autocomplete, AutocompleteItem, Card, CardBody, Spinner } from "@heroui/react";
import type { Database } from "database.types";
import { SearchIcon, UsersIcon } from "lucide-react";
import { useDebounceValue } from "usehooks-ts";

type User = Database["public"]["Functions"]["search_users"]["Returns"][0];
type SearchItem = { id: string; type: "search"; term: string };
type CombinedItem = User | SearchItem;

interface SearchBoxProps {
  onSearch?: (term: string) => void;
  placeholder?: string;
}

export function SearchBox({ onSearch, placeholder = "Search..." }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useDebounceValue("", 300);

  const {
    data: { data: users },
    isLoading,
  } = useUsersSearch(searchTerm);

  function handleSearch(term: string) {
    onSearch?.(term);
    setSearchTerm(term);
  }

  function handleExactSearch() {
    onSearch?.(searchTerm);
  }

  // Create combined items with search item first if there's a search term
  const combinedItems: CombinedItem[] =
    searchTerm && searchTerm.trim() !== ""
      ? [{ id: "search-exact", type: "search", term: searchTerm }, ...users]
      : users;

  return (
    <Autocomplete
      aria-label='Select an employee'
      allowsEmptyCollection
      classNames={{
        listboxWrapper: "max-h-[320px]",
        selectorButton: "text-default-500",
      }}
      defaultInputValue={searchTerm}
      defaultItems={combinedItems}
      items={combinedItems}
      isLoading={isLoading}
      errorMessage='Error fetching content'
      inputProps={{
        classNames: {
          input: "ml-1",
          inputWrapper:
            "bg-default-100/50 dark:bg-content2/50 backdrop-blur-xl hover:bg-default-200/50 dark:hover:bg-content2 group-data-[focused=true]:bg-default-200/50 dark:group-data-[focused=true]:bg-content2 rounded-medium",
        },
      }}
      selectorIcon={null}
      listboxProps={{
        emptyContent: <SearchBoxEmpty searchTerm={searchTerm} />,
        hideSelectedIcon: true,
        itemClasses: {
          base: [
            "rounded-large",
            "text-default-500",
            "transition-all",
            "duration-200",
            "data-[hover=true]:text-foreground",
            "data-[hover=true]:bg-default-100/80",
            "dark:data-[hover=true]:bg-default-50/50",
            "data-[pressed=true]:opacity-70",
            "data-[pressed=true]:scale-[0.98]",
            "data-[selectable=true]:focus:bg-default-100",
            "data-[focus-visible=true]:ring-2",
            "data-[focus-visible=true]:ring-primary-200",
            "dark:data-[focus-visible=true]:ring-primary-800",
          ],
        },
      }}
      placeholder={placeholder}
      popoverProps={{
        isOpen: true,
        offset: 10,
        classNames: {
          base: "rounded-large",
          content:
            "p-2 border-small border-default-100 bg-background/95 backdrop-blur-xl shadow-large",
        },
      }}
      radius='full'
      startContent={<SearchIcon className='text-default-400' size={20} strokeWidth={2.5} />}
      endContent={isLoading ? <Spinner size='sm' variant='dots' /> : undefined}
      variant='flat'
      onInputChange={handleSearch}
    >
      {(item) => {
        const textValue =
          typeof item === "object" && "display_name" in item ? item.display_name : item.term;
        return (
          <AutocompleteItem
            key={item.id}
            textValue={textValue}
            className='data-[hover=true]:bg-default-200 dark:data-[hover=true]:bg-default-100'
          >
            <SearchBoxItem item={item} onExactSearch={handleExactSearch} />
          </AutocompleteItem>
        );
      }}
    </Autocomplete>
  );
}
