"use client";

import { Card, CardBody } from "@heroui/react";
import { UsersIcon } from "lucide-react";

interface SearchBoxEmptyProps {
  searchTerm: string;
}

export function SearchBoxEmpty({ searchTerm }: SearchBoxEmptyProps) {
  const hasSearchTerm = searchTerm && searchTerm.trim() !== "";

  return (
    <Card className='border-none shadow-none bg-transparent'>
      <CardBody className='flex flex-col items-center justify-center p-0'>
        <div className='flex items-center justify-center w-10 h-10 rounded-full bg-default-100 dark:bg-default-50 mb-2'>
          <UsersIcon className='w-5 h-5 text-default-400' />
        </div>
        <h3 className='text-sm font-semibold text-default-600 dark:text-default-400 mb-1'>
          {hasSearchTerm ? `No users found for "${searchTerm}"` : "Search for users"}
        </h3>
        <p className='text-xs text-default-400 text-center max-w-xs'>
          {hasSearchTerm
            ? "Try searching with a different term or check your spelling"
            : "Start typing to discover amazing developers and connect with the community"}
        </p>
      </CardBody>
    </Card>
  );
}
