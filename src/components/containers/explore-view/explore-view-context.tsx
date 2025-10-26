import { createContext, useContext } from "react";

export type ExploreViewContextType = {
  searchType: "all" | "users" | "posts";
  searchTerm?: string;
  showExploreAllButton: boolean;
};

type ExploreViewContextProviderProps = ExploreViewContextType & {
  children?: React.ReactNode;
};

const ExploreViewContext = createContext<ExploreViewContextType>({
  searchType: "all",
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
  searchType: activeSearchType,
  searchTerm = "",
  showExploreAllButton,
}: ExploreViewContextProviderProps) {
  return (
    <ExploreViewContext.Provider
      value={{
        searchType: activeSearchType,
        showExploreAllButton,
        searchTerm,
      }}
    >
      {children}
    </ExploreViewContext.Provider>
  );
}
