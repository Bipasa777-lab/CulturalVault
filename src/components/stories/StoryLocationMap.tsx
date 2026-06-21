"use client";

import { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function StoryLocationMap({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title: string;
}) {
  // Reset Leaflet ID on all container DOM nodes in the document to prevent double-initialization
  if (typeof window !== "undefined") {
    const containers = document.querySelectorAll(".leaflet-container");
    containers.forEach((container: any) => {
      container._leaflet_id = null;
    });
  }

  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const node = mapRef.current;
    return () => {
      if (node) {
        const container = node.querySelector(".leaflet-container") as any;
        if (container) {
          container._leaflet_id = null;
        }
      }
    };
  }, []);

  if (!lat || !lng || mapKey === 0) {
    return (
      <div className="border rounded-2xl p-6 text-center">
        {!lat || !lng ? "No location available" : "Loading map..."}
      </div>
    );
  }

  return (
    <div 
      key={mapKey}
      ref={mapRef}
      className="rounded-2xl overflow-hidden border"
    >
      <MapContainer
        key={mapKey}
        center={[lat, lng]}
        zoom={12}
        style={{
          height: "450px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[lat, lng]}
          icon={markerIcon}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">
                🏛 {title}
              </h3>

              <p>
                📍 Story Location
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}