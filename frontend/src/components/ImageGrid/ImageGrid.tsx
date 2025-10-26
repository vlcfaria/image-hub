import useSemanticTextSearch from "../../services/hubApi/useSemanticTextSearch";
import { ImageList, ImageListItem } from "@mui/material";

interface ImageGridProps {
  searchTerm: string;
  onImageClick: (imageData: any) => void;
}

const ImageGrid = ({ searchTerm, onImageClick }: ImageGridProps) => {
  const { data, isLoading, error } = useSemanticTextSearch(searchTerm);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading images</div>;
  if (!data || data.length === 0) return;

  return (
    <ImageList cols={3} gap={8} variant="masonry">
      {data.map((item: any, index: number) => (
        <ImageListItem
          key={item._id || index}
          onClick={() => onImageClick(item)}
        >
          <img
            src={`${import.meta.env.VITE_API_URL}${item.url}`}
            alt={item.title || `Image ${index}`}
            loading="lazy"
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default ImageGrid;
