import { useState } from "react";
import ImageGrid from "../components/ImageGrid/ImageGrid";

const HomePage = () => {
    const [inputText, setInputText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault(); // Prevent form from reloading the page
        setSearchTerm(inputText); // Trigger the query in ImageGrid
    };

    return (
        <>
            <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., nature, city, animals..."
            />
            <button
              type="submit"
            >
              Search
            </button>
          </form>

          <ImageGrid searchTerm={searchTerm} />
        </>
    )
}

export default HomePage;