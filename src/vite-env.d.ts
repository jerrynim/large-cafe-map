/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NAVER_MAPS_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace naver {
  namespace maps {
    class Map {
      constructor(element: HTMLElement | string, options?: MapOptions);
      getCenter(): LatLng;
      setCenter(center: LatLng): void;
      addListener(eventName: string, handler: () => void): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: () => void): void;
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions);
      open(map: Map, marker: Marker): void;
      close(): void;
    }

    interface MapOptions {
      center?: LatLng;
      zoom?: number;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
      icon?: MarkerIcon;
    }

    interface MarkerIcon {
      content: string;
      anchor?: Point;
    }

    interface InfoWindowOptions {
      content: string;
      borderWidth?: number;
      backgroundColor?: string;
      borderColor?: string;
      anchorSize?: Size;
      anchorSkew?: boolean;
    }

    class Point {
      constructor(x: number, y: number);
    }

    class Size {
      constructor(width: number, height: number);
    }

    const Event: {
      addListener(target: object, eventName: string, handler: () => void): void;
    };
  }
}
