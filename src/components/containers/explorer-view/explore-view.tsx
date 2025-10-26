"use client";

import type { ExplorerPageSearchParams } from "@/app/(social)/explore/page";
import { ExplorerViewEmpty } from "@/components/containers/explorer-view/explorer-view-empty";
import { SearchBox } from "@/components/explore/search-box";
import { PageHeader } from "@/components/ui/page-header";
import { Tab, Tabs } from "@heroui/react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { ReactNode, useRef } from "react";

type SearchType = "all" | "users" | "posts";

interface ExploreViewProps {
  usersResult?: ReactNode;
  postsResult?: ReactNode;
}

function getInitialSearchType(searchOptions: ExplorerPageSearchParams): SearchType {
  const searchOptionEntries = Object.entries(searchOptions);
  const searchOptionEntry = searchOptionEntries.find(
    ([key]) => key !== "page" && !!searchOptions[key as keyof ExplorerPageSearchParams]
  );
  const [searchType] = searchOptionEntry ?? [];
  return searchType as SearchType;
}

export function ExploreView({ usersResult, postsResult }: ExploreViewProps) {
  const [searchOptions, setSearchOptions] = useQueryStates(
    {
      all: parseAsString.withDefault(""),
      users: parseAsString.withDefault(""),
      posts: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(0),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } satisfies Record<keyof ExplorerPageSearchParams, any>,
    {
      shallow: false,
      clearOnDefault: true,
    }
  );

  const activeSearchTypeRef = useRef<SearchType>(getInitialSearchType(searchOptions));

  function handleSearch(term: string) {
    const activeSearchType = activeSearchTypeRef.current || "all";
    activeSearchTypeRef.current = activeSearchType;
    setSearchOptions({ [activeSearchType]: term });
  }

  function handleSearchTypeChange(type: SearchType) {
    const newSearchOptions = {
      all: "",
      users: "",
      posts: "",
      page: searchOptions.page,
      [type]: searchOptions[activeSearchTypeRef.current],
    };

    setSearchOptions(newSearchOptions);
    activeSearchTypeRef.current = type;
  }

  return (
    <>
      <PageHeader title='Explore' className='pr-4'>
        <SearchBox
          placeholder='Search users or posts...'
          onSearch={handleSearch}
          initialSearchTerm={searchOptions[activeSearchTypeRef.current]}
        />
      </PageHeader>
      {activeSearchTypeRef.current && (
        <Tabs
          aria-label='Explore sections'
          variant='underlined'
          color='primary'
          className='sticky top-16 z-30 backdrop-blur-xl bg-background/70'
          classNames={{
            tabList: "w-full",
          }}
          selectedKey={activeSearchTypeRef.current}
          onSelectionChange={(key) => handleSearchTypeChange(key as SearchType)}
        >
          <Tab key='all' title='All'>
            {usersResult}
            {postsResult}
          </Tab>
          <Tab key='users' title='Users'>
            {!usersResult && (
              <ExplorerViewEmpty searchedBy='users' searchTerm={searchOptions.users} />
            )}
            {usersResult}
          </Tab>
          <Tab key='posts' title='Posts'>
            {!postsResult && (
              <ExplorerViewEmpty searchedBy='posts' searchTerm={searchOptions.posts} />
            )}
            {postsResult}
          </Tab>
        </Tabs>
      )}
      {!activeSearchTypeRef.current && (
        <>
          {usersResult}
          {postsResult}
        </>
      )}
    </>
  );
}
