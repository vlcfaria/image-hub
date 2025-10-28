import { Modal, Box, Typography, IconButton, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface ImageData {
  url: string;
  title?: string;
  author?: string;
  born_died?: string;
  date?: string;
  technique?: string;
  location?: string;
  form?: string;
  type?: string;
  school?: string;
  timeline?: string;
  score?: number;
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
          width: "90%",
          maxWidth: 1200,
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
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          {/* Left side - Image */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={`${imageData.url}`}
              alt={imageData.title || "Image"}
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </Box>

          {/* Right side - Information */}
          <Box sx={{ overflow: "auto", maxHeight: "70vh" }}>
            {imageData.title && (
              <Typography
                id="image-modal-title"
                variant="h5"
                component="h2"
                mb={2}
              >
                {imageData.title}
              </Typography>
            )}

            {imageData.author && (
              <Typography variant="h6" color="text.secondary" mb={2}>
                {imageData.author}
                {imageData.born_died && ` (${imageData.born_died})`}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "grid", gap: 2 }}>
              {imageData.date && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">{imageData.date}</Typography>
                </Box>
              )}

              {imageData.technique && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Technique
                  </Typography>
                  <Typography variant="body1">{imageData.technique}</Typography>
                </Box>
              )}

              {imageData.location && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">{imageData.location}</Typography>
                </Box>
              )}

              {imageData.form && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Form
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {imageData.form}
                  </Typography>
                </Box>
              )}

              {imageData.type && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {imageData.type}
                  </Typography>
                </Box>
              )}

              {imageData.school && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    School
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {imageData.school}
                  </Typography>
                </Box>
              )}

              {imageData.timeline && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Timeline
                  </Typography>
                  <Typography variant="body1">{imageData.timeline}</Typography>
                </Box>
              )}

              {imageData.score !== undefined && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Relevance Score
                  </Typography>
                  <Typography variant="body1">
                    {(imageData.score * 100).toFixed(1)}%
                  </Typography>
                </Box>
              )}
            </Box>

            {imageData.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Description
                  </Typography>
                  <Typography id="image-modal-description" variant="body2">
                    {imageData.description}
                  </Typography>
                </Box>
              </>
            )}

            {imageData.tags && imageData.tags.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Tags
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
              </>
            )}

            {imageData.uploadDate && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Uploaded:{" "}
                  {new Date(imageData.uploadDate).toLocaleDateString()}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImageModal;