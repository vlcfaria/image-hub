import { useEffect } from "react";
import { Modal, Box, Typography, IconButton, Divider, ImageList, ImageListItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import useRelatedImages from "../../services/hubApi/useRelatedImages";
import type { ImageData } from "../../types/Image";

interface ImageModalProps {
  open: boolean;
  onClose: () => void;
  imageData: ImageData | null;
  onImageClick?: (imageData: ImageData) => void;
  allImages?: ImageData[];
}

const ImageModal = ({ open, onClose, imageData, onImageClick, allImages }: ImageModalProps) => {
  const { data: relatedImages } = useRelatedImages(imageData?._id);

  useEffect(() => {
    if (!open || !allImages || !imageData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = allImages.findIndex(img => img._id === imageData._id);
      
      if (e.key === "ArrowRight" && currentIndex < allImages.length - 1) {
        onImageClick?.(allImages[currentIndex + 1]);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        onImageClick?.(allImages[currentIndex - 1]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, allImages, imageData, onImageClick, onClose]);

  if (!imageData) return null;

  const currentIndex = allImages?.findIndex(img => img._id === imageData._id) ?? -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = allImages && currentIndex < allImages.length - 1;

  const handleRelatedImageClick = (relatedImage: ImageData) => {
    if (onImageClick) {
      onImageClick(relatedImage);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious && allImages) {
      onImageClick?.(allImages[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && allImages) {
      onImageClick?.(allImages[currentIndex + 1]);
    }
  };

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
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box sx={{ flex: 1, pr: 2, minWidth: 0 }}>
            <Typography
              id="image-modal-title"
              variant="h6"
              component="h2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {imageData.title || "Image Details"}
            </Typography>
            {imageData.author && (
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {imageData.author}
                {imageData.born_died && ` (${imageData.born_died})`}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            p: 2,
            overflow: "auto",
            flex: 1,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
            }}
          >
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

          <Box sx={{ overflow: { xs: "visible", md: "auto" }, maxHeight: { xs: "none", md: "70vh" } }}>
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
                    {(imageData.score * 100).toFixed(1)}
                  </Typography>
                </Box>
              )}
            </Box>

            {relatedImages && relatedImages.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Related Images
                  </Typography>
                  <ImageList 
                    cols={3} 
                    gap={8} 
                    variant='standard' 
                    rowHeight={200}
                    sx={{
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr) !important',
                        sm: 'repeat(2, 1fr) !important',
                        md: 'repeat(2, 1fr) !important',
                        lg: 'repeat(3, 1fr) !important',
                      }
                    }}
                  >
                    {relatedImages.map((item) => (
                      <ImageListItem 
                        key={item._id}
                        onClick={() => handleRelatedImageClick(item)}
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
                          alt={item.title || "Related Image"}
                          loading="lazy"
                          style={{ borderRadius: "4px" }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              </>
            )}

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
      </Box>
    </Modal>
  );
};

export default ImageModal;
