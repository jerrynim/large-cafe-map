import { useCallback, useEffect, useRef, useState } from "react";
import cafesData from "../data/cafes.json";
import { Cafe } from "../types";
import { filterByDistance } from "../utils/geo";

const RADIUS_KM = 10;
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울시청

interface NaverMapProps {
  onDragEnd: () => void;
  onCafeClick: (cafe: Cafe) => void;
  searchTrigger: number;
}

function NaverMap({ onDragEnd, onCafeClick, searchTrigger }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const initialLoadDoneRef = useRef(false);

  // 네이버 지도 스크립트 로드
  useEffect(() => {
    const naverMapsId = import.meta.env.VITE_NAVER_MAPS_ID;
    if (!naverMapsId) {
      console.error("VITE_NAVER_MAPS_ID 환경변수가 설정되지 않았습니다.");
      return;
    }

    if (window.naver?.maps) {
      setIsMapReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverMapsId}`;
    script.async = true;
    script.onload = () => {
      setIsMapReady(true);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstanceRef.current) return;

    const map = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom: 13,
    });

    mapInstanceRef.current = map;

    // 드래그 종료 이벤트
    map.addListener("dragend", () => {
      onDragEnd();
    });

    // 사용자 위치 획득
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userCenter);
          map.setCenter(new naver.maps.LatLng(userCenter.lat, userCenter.lng));
        },
        () => {
          // 위치 권한 거부 시 기본 위치(서울시청) 사용
          console.log("위치 권한이 거부되어 기본 위치를 사용합니다.");
        }
      );
    }
  }, [isMapReady, onDragEnd]);

  // 마커 렌더링 함수
  const renderMarkers = useCallback(
    (centerLat: number, centerLng: number) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // 기존 마커 제거
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // 거리 필터링
      const cafes = cafesData as Cafe[];
      const filteredCafes = filterByDistance(
        cafes,
        centerLat,
        centerLng,
        RADIUS_KM
      );

      // 마커 생성
      filteredCafes.forEach((cafe) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(cafe.lat, cafe.lng),
          map,
          icon: {
            content: `<div style="
              background: #fff;
              border: 2px solid #03c75a;
              border-radius: 8px;
              padding: 4px 8px;
              font-size: 12px;
              font-weight: 500;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">${cafe.name}</div>`,
            anchor: new naver.maps.Point(0, 0),
          },
        });

        marker.addListener("click", () => {
          onCafeClick(cafe);
        });

        markersRef.current.push(marker);
      });
    },
    [onCafeClick]
  );

  // 초기 로드 시 마커 렌더링
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || initialLoadDoneRef.current)
      return;

    initialLoadDoneRef.current = true;
    renderMarkers(center.lat, center.lng);
  }, [isMapReady, center, renderMarkers]);

  // searchTrigger 변경 시 현재 지도 중심으로 재검색
  useEffect(() => {
    if (searchTrigger === 0 || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const currentCenter = map.getCenter();
    const newCenter = {
      lat: currentCenter.lat(),
      lng: currentCenter.lng(),
    };
    setCenter(newCenter);
    renderMarkers(newCenter.lat, newCenter.lng);
  }, [searchTrigger, renderMarkers]);

  return <div ref={mapRef} className="map-container" />;
}

export default NaverMap;
