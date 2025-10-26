import "./SearchInput.css";
import { useState } from "react";
import { TextField, Button } from "@mui/material";

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
    <>
      <TextField
        variant="outlined"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        label="e.g., nature, city, animals..."
      />
      <Button variant="contained" onClick={handleSearch}>
        Search
      </Button>
    </>
  );
};

export default SearchInput;
