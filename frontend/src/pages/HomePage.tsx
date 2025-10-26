import { useState } from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ImageGrid from "../components/ImageGrid/ImageGrid";
import SearchInput from "../components/SearchInput/SearchInput";
import ImageModal from "../components/ImageModal/ImageModal";
import UploadImageModal from "../components/UploadImageModal/UploadImageModal";
import './HomePage.css';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    setHasSearched(true);
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
    // Optionally refresh the image grid or show a success message
    setSearchTerm(""); // This will trigger a refresh if needed
  };

  return (
    <>
      <SearchInput onSearch={handleSearch} />
      <ImageGrid searchTerm={searchTerm} onImageClick={handleImageClick} />
      
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