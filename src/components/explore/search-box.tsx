"use client";

import { useUsersSearch } from "@/hooks/fetch/use-users-search";
import { Autocomplete, AutocompleteItem, Avatar, Button, Spinner } from "@heroui/react";
import { SearchIcon } from "lucide-react";
import { useDebounceValue } from "usehooks-ts";

interface SearchBoxProps {
  onSearch?: (term: string) => void;
  placeholder?: string;
}

export function SearchBox({ onSearch, placeholder = "Search..." }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useDebounceValue("", 300);

  const {
    data: { data: users },
    isLoading,
    error,
  } = useUsersSearch(searchTerm);

  function handleSearch(term: string) {
    onSearch?.(term);
    setSearchTerm(term);
  }

  return (
    <Autocomplete
      aria-label='Select an employee'
      allowsEmptyCollection
      classNames={{
        listboxWrapper: "max-h-[320px]",
        selectorButton: "text-default-500",
      }}
      defaultInputValue={searchTerm}
      defaultItems={users}
      errorMessage='Error fetching users'
      inputProps={{
        classNames: {
          input: "ml-1",
          inputWrapper:
            "bg-default-100/50 dark:bg-content2/50 backdrop-blur-xl hover:bg-default-200/50 dark:hover:bg-content2 group-data-[focused=true]:bg-default-200/50 dark:group-data-[focused=true]:bg-content2 rounded-medium",
        },
      }}
      listboxProps={{
        emptyContent: "No users found",
        hideSelectedIcon: true,
        itemClasses: {
          base: [
            "rounded-medium",
            "text-default-500",
            "transition-opacity",
            "data-[hover=true]:text-foreground",
            "dark:data-[hover=true]:bg-default-50",
            "data-[pressed=true]:opacity-70",
            "data-[hover=true]:bg-default-200",
            "data-[selectable=true]:focus:bg-default-100",
            "data-[focus-visible=true]:ring-default-500",
          ],
        },
      }}
      placeholder={placeholder}
      popoverProps={{
        isOpen: true,
        offset: 10,
        classNames: {
          base: "rounded-large",
          content: "p-1 border-small border-default-100 bg-background",
        },
      }}
      radius='full'
      startContent={<SearchIcon className='text-default-400' size={20} strokeWidth={2.5} />}
      endContent={isLoading ? <Spinner size='sm' variant='dots' /> : undefined}
      variant='flat'
      onInputChange={handleSearch}
    >
      {(item) => (
        <AutocompleteItem key={item.id} textValue={item.display_name}>
          <div className='flex justify-between items-center'>
            <div className='flex gap-2 items-center'>
              <Avatar
                alt={item.display_name}
                className='shrink-0'
                size='sm'
                src={item.image_url ?? undefined}
              />
              <div className='flex flex-col'>
                <span className='text-small'>{item.display_name}</span>
                <span className='text-tiny text-default-400'>{item.username}</span>
              </div>
            </div>
            <Button
              className='border-small mr-0.5 font-medium shadow-small'
              radius='full'
              size='sm'
              variant='bordered'
            >
              Add
            </Button>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
