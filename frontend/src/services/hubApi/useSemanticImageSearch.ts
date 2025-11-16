import { useInfiniteQuery } from "@tanstack/react-query";
import hubApiClient from "./utils/hubApiClient";
import type { ImageData } from "../../types/Image";

function useSemanticImageSearch(file: File | null, pageSize: number = 20) {
  return useInfiniteQuery<ImageData[]>({
    queryKey: ["useSemanticImageSearch", file?.name, pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      if (!file) return [];
      
      const formData = new FormData();
      formData.append("file", file);

      const response = await hubApiClient.post(
        `/search/by-image?n=${pageSize}&page=${pageParam}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
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
    enabled: !!file,
  });
}

export default useSemanticImageSearch;