import { useState } from "react";
import { Fab, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ImageGrid from "../components/ImageGrid/ImageGrid";
import SearchInput from "../components/SearchInput/SearchInput";
import ImageModal from "../components/ImageModal/ImageModal";
import UploadImageModal from "../components/UploadImageModal/UploadImageModal";
import useSemanticTextSearch from "../services/hubApi/useSemanticTextSearch";
import type { SearchType } from "../services/hubApi/useSemanticTextSearch";
import useSemanticImageSearch from "../services/hubApi/useSemanticImageSearch";
import type { ImageData } from "../types/Image";

const HomePage = () => {
  const [textSearchTerm, setTextSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("semantic");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [imageSearchFile, setImageSearchFile] = useState<File | null>(null);

  const textSearch = useSemanticTextSearch(textSearchTerm, searchType);
  const imageSearch = useSemanticImageSearch(imageSearchFile);

  const handleTextSearch = (text: string, type: SearchType) => {
    setImageSearchFile(null);
    setSearchType(type);
    setTextSearchTerm(text);
    setIsSearchActive(!!text);
  };

  const handleImageSearch = (file: File) => {
    setTextSearchTerm("");
    setIsSearchActive(true);
    setImageSearchFile(file);
  };

  const handleClearSearch = () => {
    setTextSearchTerm("");
    setSearchType("semantic");
    setImageSearchFile(null);
    setIsSearchActive(false);
  };

  const handleImageClick = (imageData: ImageData) => {
    setSelectedImage(imageData);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const handleUploadSuccess = () => {
    setIsSearchActive(false);
    setTextSearchTerm("");
    setImageSearchFile(null);
  };

  const activeSearch = textSearchTerm ? textSearch : imageSearch;
  const isSearchLoading = activeSearch.isLoading;
  const searchError = activeSearch.error;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          minHeight: "100vh",
          px: 2,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "600px",
            transition: "all 0.4s ease-in-out",
            mb: isSearchActive ? 4 : 0,
            marginTop: isSearchActive ? 4 : "calc(40vh)",
          }}
        >
          <SearchInput
            onTextSearch={handleTextSearch}
            onImageSearch={handleImageSearch}
            onClear={handleClearSearch}
            isImageSearchLoading={imageSearch.isFetching}
          />
        </Box>

        {isSearchActive && (
          <Box
            sx={{
              width: "100%",
              opacity: 0,
              animation: "fadeIn 0.6s ease-in forwards",
              animationDelay: "0.2s",
              "@keyframes fadeIn": {
                from: {
                  opacity: 0,
                  transform: "translateY(20px)",
                },
                to: {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            <ImageGrid
              data={activeSearch.data?.pages}
              isLoading={isSearchLoading}
              isFetchingNextPage={activeSearch.isFetchingNextPage}
              hasNextPage={activeSearch.hasNextPage ?? false}
              error={searchError}
              onImageClick={handleImageClick}
              onLoadMore={() => activeSearch.fetchNextPage()}
            />
          </Box>
        )}
      </Box>

      <ImageModal
        open={modalOpen}
        onClose={handleCloseModal}
        imageData={selectedImage}
        onImageClick={handleImageClick}
      />

      <UploadImageModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <Fab
        color="primary"
        aria-label="upload"
        onClick={() => setUploadModalOpen(true)}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default HomePage;