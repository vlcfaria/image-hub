import { useQuery } from "@tanstack/react-query";
import useSemanticTextSearch from "../../services/hubApi/useSemanticTextSearch";

const ImageGrid = ({ searchTerm }) => {
  console.log(import.meta.env.VITE_API_URL)
  const {
    data: images,
    error,
    isLoading,
    isFetching,
  } = useSemanticTextSearch(searchTerm);

  if (isLoading) {
    return (
      <div>
        Loading images...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mt-6 text-center text-red-500">
        An error occurred: {error.message}
      </div>
    );
  }

  if (!images || !Array.isArray(images?.data)) {
    return null;
  }

  // Handle no results
  if (images?.data.length === 0) {
    return (
        <div className="p-4 mt-6 text-center text-gray-500">
            No images found for "{searchTerm}".
        </div>
    );
  }

  // Handle success state
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Results {isFetching ? '(Updating...)' : ''}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images?.data.map((image) => (
          <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md">
            <img
              src={`/api${image.url}`}
              alt="Search result"
              className="w-full h-full object-cover"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src="https://placehold.co/150x150/e0e0e0/707070?text=Error"; 
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageGrid;