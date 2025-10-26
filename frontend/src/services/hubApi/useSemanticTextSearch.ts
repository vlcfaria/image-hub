import { useQuery } from "@tanstack/react-query";
import hubApiClient from "./utils/hubApiClient";

interface ImageData {
  _id: string;
  url: string;
  title?: string;
  author?: string;
  date?: string;
  technique?: string;
  location?: string;
  form?: string;
  type?: string;
  school?: string;
  timeline?: string;
  score: number;
}

function useSemanticTextSearch(query: string) {
  return useQuery<ImageData[]>({
    queryKey: ["useSemanticTextSearch", query],
    queryFn: async () => {
      const response = await hubApiClient.get(`/search/?query=${query}`);
      return response.data; // Extract the data array from axios response
    },
    enabled: query !== "",
  });
}

export default useSemanticTextSearch;