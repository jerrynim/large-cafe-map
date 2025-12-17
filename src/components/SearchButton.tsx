interface SearchButtonProps {
  onClick: () => void;
}

function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <div className="search-button-container">
      <button className="search-button" onClick={onClick}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className="search-button-text-full">현재 위치에서 검색하기</span>
        <span className="search-button-text-short">여기서 검색</span>
      </button>
    </div>
  );
}

export default SearchButton;
