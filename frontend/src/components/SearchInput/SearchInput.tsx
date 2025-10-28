import "./SearchInput.css";
import { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

interface SearchInputProps {
  onSearch: (searchTerm: string) => void;
}

const SearchInput = ({ onSearch }: SearchInputProps) => {
  const [inputText, setInputText] = useState("");

  const handleSearch = () => {
    onSearch(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
      <TextField
        fullWidth
        variant="outlined"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        label="e.g., nature, city, animals..."
      />
      <Button 
        variant="contained" 
        onClick={handleSearch}
        sx={{ whiteSpace: "nowrap" }}
      >
        Search
      </Button>
    </Box>
  );
};

export default SearchInput;