import { useQuery } from "@tanstack/react-query";
import hubApiClient from "./utils/hubApiClient";

function useSemanticTextSearch(query: string) {
    return useQuery({
        queryKey: ['useSemanticTextSearch', query],
        queryFn: () => hubApiClient.get(
            `/search/?query=${query}`
        ),
        enabled: query !== ''
    })
}

export default useSemanticTextSearch;