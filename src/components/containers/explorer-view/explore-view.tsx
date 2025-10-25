"use client";

import type { ExplorerPageSearchParams } from "@/app/(social)/explore/page";
import { ExplorerViewAll } from "@/components/containers/explorer-view/explorer-view-all";
import { ExplorerMixedView } from "@/components/containers/explorer-view/explorer-mixed-view";
import { ExplorerViewPosts } from "@/components/containers/explorer-view/explorer-view-posts";
import { ExplorerViewUsers } from "@/components/containers/explorer-view/explorer-view-users";
import { SearchBox } from "@/components/explore/search-box";
import { PageHeader } from "@/components/ui/page-header";
import type { DbResult } from "@/lib/db/repositories";
import type { getCachedTrendingUsers } from "@/lib/db/calls/get-trending-users";
import type { getCachedUsers } from "@/lib/db/calls/get-users";
import { Tab, Tabs } from "@heroui/react";
import { parseAsInteger, parseAsString, type Parser, useQueryStates } from "nuqs";
import { useRef } from "react";

type SearchType = "all" | "users" | "posts";

interface ExploreViewProps {
  users?:
    | Awaited<ReturnType<typeof getCachedUsers>>
    | Awaited<ReturnType<typeof getCachedTrendingUsers>>;
  posts?: DbResult<any>;
}

function getInitialSearchType(searchOptions: ExplorerPageSearchParams): SearchType {
  const searchOptionEntries = Object.entries(searchOptions);
  const searchOptionEntry = searchOptionEntries.find(
    ([key]) => key !== "page" && !!searchOptions[key as keyof ExplorerPageSearchParams]
  );
  const [searchType] = searchOptionEntry ?? [];
  return searchType as SearchType;
}

export function ExploreView({ users, posts }: ExploreViewProps) {
  const [searchOptions, setSearchOptions] = useQueryStates(
    {
      all: parseAsString.withDefault(""),
      users: parseAsString.withDefault(""),
      posts: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(0),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } satisfies Record<keyof ExplorerPageSearchParams, Parser<any>>,
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
            <ExplorerViewAll users={users} posts={posts} allSearchTerm={searchOptions.all} />
          </Tab>
          <Tab key='users' title='Users'>
            <ExplorerViewUsers
              users={users}
              usersSearchTerm={searchOptions.users}
              onExploreAll={() => handleSearchTypeChange("all")}
            />
          </Tab>
          <Tab key='posts' title='Posts'>
            <ExplorerViewPosts
              posts={posts}
              onExploreAll={() => handleSearchTypeChange("all")}
              postsSearchTerm={searchOptions.posts}
            />
          </Tab>
        </Tabs>
      )}
      {!activeSearchTypeRef.current && <ExplorerMixedView users={users} posts={posts} />}
    </>
  );
}
