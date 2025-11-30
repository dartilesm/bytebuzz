import { FilesIcon, PaperclipIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { useExplorerViewContext } from "@/components/containers/explore-view/explore-view-context";
import { Button } from "@/components/ui/button";

type SearchType = "all" | "users" | "posts";

function getIconBySearchType(searchType: SearchType) {
  if (searchType === "all") {
    return FilesIcon;
  }
  if (searchType === "users") {
    return User2Icon;
  }
  if (searchType === "posts") {
    return PaperclipIcon;
  }
}

export function ExploreViewEmpty() {
  const { showExploreAllButton, searchType, searchTerm } = useExplorerViewContext();
  const Icon = getIconBySearchType(searchType);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col justify-center">
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          {Icon && <Icon className="w-16 h-16 text-muted-foreground" />}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {searchType !== "all" && searchTerm
            ? `No content found for "${searchTerm}"`
            : "No content found"}
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search terms or explore other content
        </p>
        {showExploreAllButton && (
          <Button asChild variant="outline" className="mt-6">
            <Link href="/explore">Explore all content</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
