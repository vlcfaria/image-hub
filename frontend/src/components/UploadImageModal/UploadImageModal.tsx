import { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import hubApiClient from "../../services/hubApi/utils/hubApiClient";

interface UploadImageModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const UploadImageModal = ({
  open,
  onClose,
  onSuccess,
}: UploadImageModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    born_died: "",
    date: "",
    technique: "",
    location: "",
    form: "",
    type: "",
    school: "",
    timeline: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/jpeg")) {
        setError("Only JPEG images are supported");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedFile) {
      setError("Please select an image file");
      return;
    }

    if (!formData.title) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("file", selectedFile);
      submitData.append("image_data", JSON.stringify(formData));

      await hubApiClient.post("/images/", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to upload image. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      author: "",
      born_died: "",
      date: "",
      technique: "",
      location: "",
      form: "",
      type: "",
      school: "",
      timeline: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="upload-modal-title"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
          disabled={isSubmitting}
        >
          <CloseIcon />
        </IconButton>

        <Typography id="upload-modal-title" variant="h5" component="h2" mb={3}>
          Upload Image
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
              disabled={isSubmitting}
            >
              {selectedFile ? selectedFile.name : "Select Image (.jpg)"}
              <input
                type="file"
                hidden
                accept="image/jpeg"
                onChange={handleFileChange}
              />
            </Button>

            {previewUrl && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              </Box>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Image uploaded successfully!
            </Alert>
          )}

          <TextField
            fullWidth
            required
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Born-Died"
            name="born_died"
            value={formData.born_died}
            onChange={handleInputChange}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Technique"
            name="technique"
            value={formData.technique}
            onChange={handleInputChange}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Form"
            name="form"
            value={formData.form}
            onChange={handleInputChange}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="School"
            name="school"
            value={formData.school}
            onChange={handleInputChange}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleInputChange}
            disabled={isSubmitting}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Upload Image"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default UploadImageModal;
