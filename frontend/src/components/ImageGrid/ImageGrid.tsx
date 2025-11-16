import { useEffect, useRef } from "react";
import { ImageList, ImageListItem, Box, Typography, CircularProgress } from "@mui/material";
import type { ImageData } from "../../types/Image";

interface ImageGridProps {
  data: ImageData[][] | undefined;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: Error | null;
  onImageClick: (imageData: ImageData) => void;
  onLoadMore: () => void;
}

const ImageGrid = ({ 
  data, 
  isLoading, 
  isFetchingNextPage,
  hasNextPage,
  error, 
  onImageClick,
  onLoadMore 
}: ImageGridProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <Typography color="error">Error loading images.</Typography>
      </Box>
    );
  }

  const allImages = data?.flatMap(page => page) || [];

  if (allImages.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <Typography>No results found.</Typography>
      </Box>
    );
  }

  return (
    <>
      <ImageList cols={5} gap={8} rowHeight={500}>
        {allImages.map((item: ImageData, index: number) => (
          <ImageListItem
            key={item._id || index}
            onClick={() => onImageClick(item)}
            sx={{
              cursor: "pointer",
              overflow: "hidden",
              "&:hover": {
                opacity: 0.8,
                transition: "opacity 0.2s",
              },
            }}
          >
            <img
              src={`${item.url}`}
              alt={item.title || `Image ${index}`}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Box 
        ref={loadMoreRef} 
        sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
      >
        {isFetchingNextPage && <CircularProgress />}
        {!hasNextPage && allImages.length > 0 && (
          <Typography color="text.secondary">No more results</Typography>
        )}
      </Box>
    </>
  );
};

export default ImageGrid;