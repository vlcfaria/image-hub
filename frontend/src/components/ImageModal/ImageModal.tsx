import { Modal, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface ImageData {
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
  uploadDate?: string;
}

interface ImageModalProps {
  open: boolean;
  onClose: () => void;
  imageData: ImageData | null;
}

const ImageModal = ({ open, onClose, imageData }: ImageModalProps) => {
  if (!imageData) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="image-modal-title"
      aria-describedby="image-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: 800,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <img
          src={`${imageData.url}`}
          alt={imageData.title || "Image"}
          style={{
            width: "100%",
            maxHeight: "500px",
            objectFit: "contain",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        />

        {imageData.title && (
          <Typography id="image-modal-title" variant="h5" component="h2" mb={2}>
            {imageData.title}
          </Typography>
        )}

        {imageData.description && (
          <Typography id="image-modal-description" mb={2}>
            {imageData.description}
          </Typography>
        )}

        {imageData.tags && imageData.tags.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Tags:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              {imageData.tags.map((tag, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {tag}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {imageData.uploadDate && (
          <Typography variant="caption" color="text.secondary">
            Uploaded: {new Date(imageData.uploadDate).toLocaleDateString()}
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default ImageModal;