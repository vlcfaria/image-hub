import { useQuery } from "@tanstack/react-query";
import hubApiClient from "./utils/hubApiClient";
import type { ImageData } from "../../types/Image";

interface RelatedImageData extends ImageData {
  score: number;
}

function useRelatedImages(imageId: string | null | undefined) {
  return useQuery<RelatedImageData[]>({
    queryKey: ["useRelatedImages", imageId],
    queryFn: async () => {
      if (!imageId) return [];
      const response = await hubApiClient.get(`/images/related/${imageId}?n=6`);
      return response.data;
    },
    enabled: !!imageId,
  });
}

export default useRelatedImages;
