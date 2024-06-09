"use client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Command, CommandInput } from "./ui/command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Prisma, Subreddit } from "@prisma/client";
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "cmdk";
import { usePathname, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
  const router = useRouter();
  const [searchBar, setSearchBar] = useState<string>("");
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    data: queryResult,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!searchBar) {
        return [];
      }
      const { data } = await axios.get(`api/search/?q=${searchBar}`);
      return data as (Subreddit & {
        _countValue: Prisma.SubredditCountOutputType;
      })[];
    },
    queryKey: ["search-communities"],
    enabled: false,
  });

  const request = debounce(() => {
    refetch();
  });
  const debounceRequest = useCallback(() => {
    request();
  }, []);

  useOnClickOutside(searchRef, () => {
    setSearchBar("");
  });
  const pathname = usePathname();
  useEffect(() => {
    setSearchBar("");
  }, [pathname]);

  return (
    <Command
      ref={searchRef}
      className="relative rounded-lg border max-w-lg z-50 overflow-visible"
    >
      <CommandInput
        value={searchBar}
        onValueChange={(e) => {
          setSearchBar(e);
          debounceRequest();
        }}
        placeholder="Search Communities"
        className="outline-none border-none focus:ring-2 focus:ring-blue-500 p-2"
      />
      {searchBar.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow-lg rounded-b-md mt-1 z-50">
          {isFetched && <CommandEmpty>No results found</CommandEmpty>}
          {(queryResult?.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities">
              {queryResult?.map((subreddit) => (
                <CommandItem
                  onSelect={() => {
                    router.push(`/r/${subreddit.name}`);
                    router.refresh();
                  }}
                  key={subreddit.id}
                  value={subreddit.name}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;
