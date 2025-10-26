"use client";

import type { ExplorerPageSearchParams } from "@/app/(social)/explore/page";
import { ExploreViewProvider } from "@/components/containers/explore-view/explore-view-context";
import {
  type ExploreViewPostsProps,
  ExploreViewPosts,
} from "@/components/containers/explore-view/explore-view-posts";
import {
  type ExplorerViewUsersProps,
  ExploreViewUsers,
} from "@/components/containers/explore-view/explore-view-users";
import { ExplorerViewPostsLoading } from "@/components/containers/explore-view/loading/explore-view-posts.loading";
import { ExplorerViewUsersLoading } from "@/components/containers/explore-view/loading/explore-view-users.loading";
import { SearchBox } from "@/components/explore/search-box";
import { PageHeader } from "@/components/ui/page-header";
import { Tab, Tabs } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { Suspense, useRef } from "react";

type SearchType = "all" | "users" | "posts";

interface ExploreViewProps {
  postsPromise?: ExploreViewPostsProps["postsPromise"];
  usersPromise?: ExplorerViewUsersProps["usersPromise"];
}

function getInitialSearchType(searchParams: URLSearchParams): SearchType {
  const searchOptionEntries = searchParams.entries();
  const searchOptionEntry = searchOptionEntries.find(
    ([key]) => key !== "page" && !!searchParams.get(key)
  );
  const [searchType] = searchOptionEntry ?? [];
  return searchType as SearchType;
}

export function ExploreView({ postsPromise, usersPromise }: ExploreViewProps) {
  const searchParams = useSearchParams();
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

  const activeSearchTypeRef = useRef<SearchType>(getInitialSearchType(searchParams));

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
      <ExploreViewProvider
        searchType={activeSearchTypeRef.current}
        searchTerm={activeSearchTypeRef.current ? searchOptions[activeSearchTypeRef.current] : ""}
        showExploreAllButton={activeSearchTypeRef.current === "all" ? false : true}
      >
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
              <div className='space-y-4'>
                {usersPromise && (
                  <Suspense fallback={<ExplorerViewUsersLoading />}>
                    <ExploreViewUsers
                      usersPromise={usersPromise}
                      title='Trending Users'
                      variant='scroll'
                    />
                  </Suspense>
                )}
                {postsPromise && (
                  <Suspense fallback={<ExplorerViewPostsLoading />}>
                    <ExploreViewPosts postsPromise={postsPromise} title='Trending Posts' />
                  </Suspense>
                )}
              </div>
            </Tab>
            <Tab key='users' title='Users'>
              {usersPromise && (
                <Suspense fallback={<ExplorerViewUsersLoading />}>
                  <ExploreViewUsers usersPromise={usersPromise} />
                </Suspense>
              )}
            </Tab>
            <Tab key='posts' title='Posts'>
              {postsPromise && (
                <Suspense fallback={<ExplorerViewPostsLoading />}>
                  <ExploreViewPosts postsPromise={postsPromise} />
                </Suspense>
              )}
            </Tab>
          </Tabs>
        )}
        {!activeSearchTypeRef.current && (
          <div className='space-y-4'>
            {usersPromise && (
              <Suspense fallback={<ExplorerViewUsersLoading />}>
                <ExploreViewUsers
                  usersPromise={usersPromise}
                  title='Trending Users'
                  variant='scroll'
                />
              </Suspense>
            )}
            {postsPromise && (
              <Suspense fallback={<ExplorerViewPostsLoading />}>
                <ExploreViewPosts postsPromise={postsPromise} title='Trending Posts' />
              </Suspense>
            )}
          </div>
        )}
      </ExploreViewProvider>
    </>
  );
}
