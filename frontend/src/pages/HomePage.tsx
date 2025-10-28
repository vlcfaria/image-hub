import { useState } from "react";
import { Fab, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ImageGrid from "../components/ImageGrid/ImageGrid";
import SearchInput from "../components/SearchInput/SearchInput";
import ImageModal from "../components/ImageModal/ImageModal";
import UploadImageModal from "../components/UploadImageModal/UploadImageModal";
import "./HomePage.css";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const handleSearch = (text: string) => {
    setSearchTerm(text);
  };

  const handleImageClick = (imageData: any) => {
    setSelectedImage(imageData);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const handleUploadSuccess = () => {
    setSearchTerm("");
  };

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
            mb: searchTerm ? 4 : 0,
            marginTop: searchTerm ? 4 : "calc(50vh)",
          }}
        >
          <SearchInput onSearch={handleSearch} />
        </Box>

        {searchTerm && (
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
            <ImageGrid searchTerm={searchTerm} onImageClick={handleImageClick} />
          </Box>
        )}
      </Box>

      <ImageModal
        open={modalOpen}
        onClose={handleCloseModal}
        imageData={selectedImage}
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