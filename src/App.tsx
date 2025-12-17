import { useCallback, useState } from "react";
import CafeDetail from "./components/CafeDetail";
import NaverMap from "./components/NaverMap";
import SearchButton from "./components/SearchButton";
import { Cafe } from "./types";

function App() {
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const handleMapDragEnd = useCallback(() => {
    setShowSearchButton(true);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchTrigger((prev) => prev + 1);
    setShowSearchButton(false);
  }, []);

  const handleCafeClick = useCallback((cafe: Cafe) => {
    setSelectedCafe(cafe);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedCafe(null);
  }, []);

  return (
    <div className="app">
      <NaverMap
        onDragEnd={handleMapDragEnd}
        onCafeClick={handleCafeClick}
        searchTrigger={searchTrigger}
      />
      {showSearchButton && <SearchButton onClick={handleSearch} />}
      {selectedCafe && (
        <CafeDetail cafe={selectedCafe} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

export default App;
