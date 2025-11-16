import { useState, useRef, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Paper,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ClearIcon from "@mui/icons-material/Clear";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import type { SearchType } from "../../services/hubApi/useSemanticTextSearch";

interface SearchInputProps {
  onTextSearch: (searchTerm: string, searchType: SearchType) => void;
  onImageSearch: (file: File) => void;
  onClear: () => void;
  isImageSearchLoading: boolean;
}

type SearchMode = "text" | "image";

const SearchInput = ({
  onTextSearch,
  onImageSearch,
  onClear,
  isImageSearchLoading,
}: SearchInputProps) => {
  const [inputText, setInputText] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("semantic");
  const [searchMode, setSearchMode] = useState<SearchMode>("text");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputText.trim() && searchMode === "text") {
      onTextSearch(inputText, searchType);
    }
  }, [searchType]);

  const handleTextSearch = () => {
    onTextSearch(inputText, searchType);
  };

  const handleClear = () => {
    setInputText("");
    setSearchType("semantic");
    setSelectedImageFile(null);
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTextSearch();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      onImageSearch(file);
    }
  };

  const handleImageSearchClick = () => {
    fileInputRef.current?.click();
  };

  const handleSearchTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newSearchType: SearchType | null
  ) => {
    if (newSearchType !== null) {
      setSearchType(newSearchType);
    }
  };

  const handleSearchModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: SearchMode | null
  ) => {
    if (newMode !== null) {
      setSearchMode(newMode);
      if (newMode === "text") {
        setSelectedImageFile(null);
      } else {
        setInputText("");
      }
    }
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%" }}
    >
      <ToggleButtonGroup
        color="primary"
        value={searchMode}
        exclusive
        onChange={handleSearchModeChange}
        aria-label="Search Mode"
        size="small"
        fullWidth
      >
        <ToggleButton value="text">
          <TextFieldsIcon sx={{ mr: 1 }} />
          Text Search
        </ToggleButton>
        <ToggleButton value="image">
          <PhotoCameraIcon sx={{ mr: 1 }} />
          Image Search
        </ToggleButton>
      </ToggleButtonGroup>

      {searchMode === "text" && (
        <>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              label="e.g., nature, city, animals..."
            />
            <IconButton
              onClick={handleClear}
              title="Clear search"
              sx={{
                margin: "auto",
              }}
            >
              <ClearIcon />
            </IconButton>
            <Button
              variant="contained"
              onClick={handleTextSearch}
              sx={{ whiteSpace: "nowrap" }}
            >
              Search
            </Button>
          </Box>

          <ToggleButtonGroup
            color="primary"
            value={searchType}
            exclusive
            onChange={handleSearchTypeChange}
            aria-label="Search Type"
            size="small"
            fullWidth
          >
            <ToggleButton value="semantic">Semantic</ToggleButton>
            <ToggleButton value="keyword">Keyword (Sparse)</ToggleButton>
            <ToggleButton value="hybrid">Hybrid</ToggleButton>
          </ToggleButtonGroup>
        </>
      )}

      {searchMode === "image" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
            fullWidth
            disabled={isImageSearchLoading}
            size="large"
          >
            {selectedImageFile ? selectedImageFile.name : "Select Image (.jpg)"}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/jpeg"
              onChange={handleImageFileChange}
            />
          </Button>

          {selectedImageFile && (
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <img
                src={URL.createObjectURL(selectedImageFile)}
                alt="Selected for search"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  gap: 1,
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={handleClear}
                >
                  Clear
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleImageSearchClick}
                >
                  Change Image
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchInput;