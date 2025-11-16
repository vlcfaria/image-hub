import { useInfiniteQuery } from "@tanstack/react-query";
import hubApiClient from "./utils/hubApiClient";
import type { ImageData } from "../../types/Image";

export type SearchType = "semantic" | "keyword" | "hybrid";

function useSemanticTextSearch(query: string, type: SearchType, pageSize: number = 20) {
  return useInfiniteQuery<ImageData[]>({
    queryKey: ["useSemanticTextSearch", query, type, pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await hubApiClient.get(
        `/search/?query=${query}&type=${type}&n=${pageSize}&page=${pageParam}`
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) {
        return undefined;
      }
      return allPages.length + 1;
    },
    enabled: query !== "",
  });
}

export default useSemanticTextSearch;