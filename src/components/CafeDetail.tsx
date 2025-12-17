import { Cafe } from "../types";

interface CafeDetailProps {
  cafe: Cafe;
  onClose: () => void;
}

function CafeDetail({ cafe, onClose }: CafeDetailProps) {
  const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(
    cafe.name
  )}`;

  return (
    <>
      <div className="cafe-detail-backdrop" onClick={onClose} />
      <div className="cafe-detail-popup">
        <div className="cafe-detail-header">
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cafe-detail-name"
          >
            {cafe.name}
          </a>
          <button className="cafe-detail-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="cafe-detail-info">
          <div className="cafe-detail-row">
            <span className="cafe-detail-label">면적</span>
            <span className="cafe-detail-value">{cafe.area.toFixed(2)}㎡</span>
          </div>
          <div className="cafe-detail-row">
            <span className="cafe-detail-label">업태</span>
            <span className="cafe-detail-value">{cafe.type}</span>
          </div>
          <div className="cafe-detail-row">
            <span className="cafe-detail-label">지역</span>
            <span className="cafe-detail-value">{cafe.region}</span>
          </div>
        </div>
        <a
          href={naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="naver-link"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm9-2h8v8h-8V3zm2 2v4h4V5h-4zM3 14h8v8H3v-8zm2 2v4h4v-4H5zm11.5-2L14 16.5l1.5 1.5 2-2v6h3v-6l2 2 1.5-1.5L19.5 12z" />
          </svg>
          네이버 지도에서 보기
        </a>
      </div>
    </>
  );
}

export default CafeDetail;
