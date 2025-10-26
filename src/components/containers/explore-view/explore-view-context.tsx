import type { postService } from "@/lib/db/services/post.service";
import type { userService } from "@/lib/db/services/user.service";
import { cn } from "@/lib/utils";
import { createContext, useContext } from "react";

export type ExploreViewContextType = {
  searchType: "all" | "users" | "posts";
  usersPromise?:
    | ReturnType<typeof userService.searchUsers>
    | ReturnType<typeof userService.getTrendingUsers>;
  postsPromise?:
    | ReturnType<typeof postService.searchPosts>
    | ReturnType<typeof postService.getTrendingPosts>;
  searchTerm?: string;
  showExploreAllButton: boolean;
};

type ExploreViewContextProviderProps = ExploreViewContextType & {
  children?: React.ReactNode;
};

const ExploreViewContext = createContext<ExploreViewContextType>({
  searchType: "all",
  usersPromise: undefined,
  postsPromise: undefined,
  showExploreAllButton: true,
  searchTerm: "",
});

export function useExplorerViewContext() {
  const context = useContext(ExploreViewContext);
  if (!context) {
    throw new Error("useExploreViewContext must be used within a ExplorerViewProvider");
  }
  return context;
}

export function ExploreViewProvider({
  children,
  usersPromise,
  postsPromise,
  searchType: activeSearchType,
  searchTerm = "",
  showExploreAllButton,
}: ExploreViewContextProviderProps) {
  return (
    <ExploreViewContext.Provider
      value={{
        searchType: activeSearchType,
        usersPromise,
        postsPromise,
        showExploreAllButton,
        searchTerm,
      }}
    >
      <div
        className={cn({
          "space-y-4": usersPromise && postsPromise,
        })}
      >
        {children}
      </div>
    </ExploreViewContext.Provider>
  );
}
