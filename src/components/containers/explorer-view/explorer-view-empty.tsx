import { Button } from "@/components/ui/button";
import { FilesIcon, PaperclipIcon, User2Icon } from "lucide-react";
import Link from "next/link";

const SEARCH_BY_MAP = {
  all: "content",
  users: "users",
  posts: "posts",
};

function getIconBySearchType(searchType: keyof typeof SEARCH_BY_MAP) {
  if (searchType === "all") {
    return FilesIcon;
  }
  if (searchType === "users") {
    return PaperclipIcon;
  }
  if (searchType === "posts") {
    return User2Icon;
  }
}

export function ExplorerViewEmpty({
  searchedBy,
  searchTerm,
}: {
  searchedBy: keyof typeof SEARCH_BY_MAP;
  searchTerm?: string;
}) {
  const Icon = getIconBySearchType(searchedBy);
  return (
    <div className='w-full max-w-5xl mx-auto px-4 py-8 flex flex-col justify-center'>
      <div className='text-center py-12'>
        <div className='flex justify-center mb-6'>
          {Icon && <Icon className='w-16 h-16 text-muted-foreground/50' />}
        </div>
        <h3 className='text-xl font-semibold text-foreground mb-2'>
          {searchTerm ? `No content found for "${searchTerm}"` : "No content found"}
        </h3>
        <p className='text-muted-foreground'>Try adjusting your search terms or explore other content</p>
        <Button asChild variant='secondary' className='mt-6'>
          <Link href='/explore'>
            Explore all content
          </Link>
        </Button>
      </div>
    </div>
  );
}
