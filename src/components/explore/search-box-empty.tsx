"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UsersIcon } from "lucide-react";

interface SearchBoxEmptyProps {
  searchTerm: string;
}

export function SearchBoxEmpty({ searchTerm }: SearchBoxEmptyProps) {
  const hasSearchTerm = searchTerm && searchTerm.trim() !== "";

  return (
    <Card className='border-0 shadow-none bg-transparent'>
      <CardContent className='flex flex-col items-center justify-center p-0'>
        <div className='flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-2'>
          <UsersIcon className='w-5 h-5 text-muted-foreground' />
        </div>
        <h3 className='text-sm font-semibold text-foreground mb-1'>
          {hasSearchTerm ? `No users found for "${searchTerm}"` : "Search for users"}
        </h3>
        <p className='text-xs text-muted-foreground text-center max-w-xs'>
          {hasSearchTerm
            ? "Try searching with a different term or check your spelling"
            : "Start typing to discover amazing developers and connect with the community"}
        </p>
      </CardContent>
    </Card>
  );
}
