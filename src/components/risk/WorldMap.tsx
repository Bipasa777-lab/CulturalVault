"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import * as L from "leaflet";
import { useRiskSites } from "@/hooks/useRiskSites";
import { Search, MapPin, Navigation, Star, ExternalLink, Compass } from "lucide-react";

// Haversine formula to compute distance in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Compass bearing calculation
const getCompassDirection = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  const directions = [
    "North",
    "North-East",
    "East",
    "South-East",
    "South",
    "South-West",
    "West",
    "North-West",
  ];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

// Local Geolocation Coordinates Database for fast offline search
const LOCAL_GEO_DB: Record<string, { lat: number; lng: number }> = {
  "karnataka": { lat: 15.3173, lng: 75.7139 },
  "maharashtra": { lat: 19.7515, lng: 75.7139 },
  "uttar pradesh": { lat: 26.8467, lng: 80.9462 },
  "delhi": { lat: 28.7041, lng: 77.1025 },
  "rajasthan": { lat: 27.0238, lng: 74.2179 },
  "west bengal": { lat: 22.9868, lng: 87.8550 },
  "odisha": { lat: 20.9517, lng: 85.0985 },
  "tamil nadu": { lat: 11.1271, lng: 78.6569 },
  "madhya pradesh": { lat: 22.9734, lng: 78.6569 },
  "bihar": { lat: 25.0961, lng: 85.3131 },
  "kerala": { lat: 10.8505, lng: 76.2711 },
  "andhra pradesh": { lat: 15.9129, lng: 79.7400 },
  "telangana": { lat: 18.1124, lng: 79.0193 },
  "gujarat": { lat: 22.2587, lng: 71.1924 },
  "punjab": { lat: 31.1471, lng: 75.3412 },
  "haryana": { lat: 29.0588, lng: 76.0856 },
  "himachal pradesh": { lat: 31.1048, lng: 77.1734 },
  "uttarakhand": { lat: 30.0668, lng: 79.0193 },
  "jammu and kashmir": { lat: 33.7782, lng: 76.5762 },
  "assam": { lat: 26.2006, lng: 92.9376 },
  "agra": { lat: 27.1767, lng: 78.0081 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "patna": { lat: 25.5941, lng: 85.1376 },
  "bhopal": { lat: 23.2599, lng: 77.4126 },
  "bhubaneswar": { lat: 20.2961, lng: 85.8245 },
  "aurangabad": { lat: 19.8762, lng: 75.3433 },
  "kochi": { lat: 9.9312, lng: 76.2673 },
  "india": { lat: 20.5937, lng: 78.9629 }
};

// Map center modifier helper
function MapControl({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, zoom, map]);
  return null;
}

interface WorldMapProps {
  selectedSite?: any;
  setSelectedSite?: (site: any) => void;
  userLocation?: [number, number] | null;
  setUserLocation?: (loc: [number, number] | null) => void;
  searchLocation?: [number, number] | null;
  setSearchLocation?: (loc: [number, number] | null) => void;
  onSearch?: (query: string, lat: number, lng: number) => void;
}

export default function WorldMap({
  selectedSite: parentSelectedSite,
  setSelectedSite: parentSetSelectedSite,
  userLocation: parentUserLocation,
  setUserLocation: parentSetUserLocation,
  searchLocation: parentSearchLocation,
  setSearchLocation: parentSetSearchLocation,
  onSearch,
}: WorldMapProps) {
  const { sites, loading } = useRiskSites();

  // Reset Leaflet ID on all container DOM nodes in the document to prevent double-initialization
  if (typeof window !== "undefined") {
    const containers = document.querySelectorAll(".leaflet-container");
    containers.forEach((container: any) => {
      container._leaflet_id = null;
    });
  }

  // Dynamic mapKey state to force remount on client-side double mount (Strict Mode)
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, []);

  const mapRef = useRef<HTMLDivElement>(null);

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
  
  // Local states as fallbacks
  const [localUserLocation, setLocalUserLocation] = useState<[number, number] | null>(null);
  const [localSearchLocation, setLocalSearchLocation] = useState<[number, number] | null>(null);
  const [localSelectedSite, setLocalSelectedSite] = useState<any | null>(null);

  // Sync props or local state
  const userLocation = parentUserLocation !== undefined ? parentUserLocation : localUserLocation;
  const setUserLocation = parentSetUserLocation || setLocalUserLocation;

  const searchLocation = parentSearchLocation !== undefined ? parentSearchLocation : localSearchLocation;
  const setSearchLocation = parentSetSearchLocation || setLocalSearchLocation;

  const selectedSite = parentSelectedSite !== undefined ? parentSelectedSite : localSelectedSite;
  const setSelectedSite = parentSetSelectedSite || setLocalSelectedSite;

  const [searchQuery, setSearchQuery] = useState("");
  const [nearestSite, setNearestSite] = useState<any | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Centered on India
  const [mapZoom, setMapZoom] = useState(5);

  // Sync with parent selected site changes
  useEffect(() => {
    if (parentSelectedSite) {
      setMapCenter([parentSelectedSite.lat, parentSelectedSite.lng]);
      setMapZoom(7);
      
      // Update nearest site list for parent's site
      const activeOrig = searchLocation || userLocation;
      if (activeOrig) {
        const nearest = findNearestSite(activeOrig[0], activeOrig[1]);
        setNearestSite(nearest);
      }
    }
  }, [parentSelectedSite]);

  // Custom Markers styled with HTML and Tailwind CSS
  const createUserLocationIcon = () => {
    if (typeof window === "undefined") return undefined;
    return L.divIcon({
      className: "custom-user-icon",
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="absolute w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const createFamousSiteIcon = () => {
    if (typeof window === "undefined") return undefined;
    return L.divIcon({
      className: "custom-famous-icon",
      html: `
        <div class="relative flex items-center justify-center w-10 h-10">
          <div class="absolute w-8 h-8 rounded-full bg-amber-500/20 animate-pulse"></div>
          <div class="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm">
            ★
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  const createRegularSiteIcon = (risk: string) => {
    if (typeof window === "undefined") return undefined;
    const colorClass =
      risk === "High"
        ? "from-red-500 to-red-700"
        : risk === "Medium"
        ? "from-yellow-400 to-yellow-600"
        : "from-green-400 to-green-600";
    return L.divIcon({
      className: "custom-regular-icon",
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="w-6 h-6 rounded-full bg-gradient-to-br ${colorClass} border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold">
            🏛
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const findNearestSite = (lat: number, lng: number) => {
    if (!sites || sites.length === 0) return null;
    let minDistance = Infinity;
    let nearest = null;
    sites.forEach((site) => {
      const dist = getDistance(lat, lng, site.lat, site.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...site, distance: dist };
      }
    });
    return nearest;
  };

  const detectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);
        setMapCenter([lat, lng]);
        setMapZoom(8);

        // Find nearest site
        const nearest = findNearestSite(lat, lng);
        setNearestSite(nearest);
        if (nearest) {
          setSelectedSite(nearest);
          setShowRoute(true);
        }
        if (onSearch) {
          onSearch("GPS Location", lat, lng);
        }
        setDetecting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Check browser location permissions.");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || searchQuery;
    const query = queryToUse.trim().toLowerCase();
    if (!query) return;

    if (!customQuery) {
      setSearching(true);
    }
    
    // 1. Check local coordinates DB first
    if (LOCAL_GEO_DB[query]) {
      const coords = LOCAL_GEO_DB[query];
      setSearchLocation([coords.lat, coords.lng]);
      setMapCenter([coords.lat, coords.lng]);
      setMapZoom(7);

      const nearest = findNearestSite(coords.lat, coords.lng);
      setNearestSite(nearest);
      if (nearest) {
        setSelectedSite(nearest);
        setShowRoute(true);
      }
      if (onSearch) {
        onSearch(queryToUse, coords.lat, coords.lng);
      }
      setSearching(false);
      return;
    }

    // 2. Fetch from OpenStreetMap Nominatim API
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryToUse
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setSearchLocation([lat, lng]);
        setMapCenter([lat, lng]);
        setMapZoom(7);

        const nearest = findNearestSite(lat, lng);
        setNearestSite(nearest);
        if (nearest) {
          setSelectedSite(nearest);
          setShowRoute(true);
        }
        if (onSearch) {
          onSearch(queryToUse, lat, lng);
        }
      } else {
        // Fallback: search within site names
        const matched = sites.find(
          (s: any) =>
            s.name.toLowerCase().includes(query) ||
            (s.state && s.state.toLowerCase().includes(query))
        );
        if (matched) {
          setSearchLocation([matched.lat, matched.lng]);
          setMapCenter([matched.lat, matched.lng]);
          setMapZoom(8);
          setSelectedSite(matched);
          setNearestSite(matched);
          setShowRoute(true);
          if (onSearch) {
            onSearch(queryToUse, matched.lat, matched.lng);
          }
        } else {
          alert("Location not found. Try searching for an Indian state or city.");
        }
      }
    } catch (err) {
      console.error(err);
      // fallback matching
      const matched = sites.find(
        (s: any) =>
          s.name.toLowerCase().includes(query) ||
          (s.state && s.state.toLowerCase().includes(query))
      );
      if (matched) {
        setSearchLocation([matched.lat, matched.lng]);
        setMapCenter([matched.lat, matched.lng]);
        setMapZoom(8);
        setSelectedSite(matched);
        setNearestSite(matched);
        setShowRoute(true);
        if (onSearch) {
          onSearch(queryToUse, matched.lat, matched.lng);
        }
      } else {
        alert("Search failed. Check your connection or search for an Indian state.");
      }
    } finally {
      setSearching(false);
    }
  };

  const activeOrigin = searchLocation || userLocation;
  const distanceToSelected =
    activeOrigin && selectedSite
      ? getDistance(activeOrigin[0], activeOrigin[1], selectedSite.lat, selectedSite.lng)
      : null;

  const compassDirectionToSelected =
    activeOrigin && selectedSite
      ? getCompassDirection(activeOrigin[0], activeOrigin[1], selectedSite.lat, selectedSite.lng)
      : null;

  if (loading || mapKey === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center border rounded-2xl bg-card">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground text-sm font-medium">Loading map details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Side Control and Information Panel */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
        
        {/* Search and GPS controls */}
        <div className="border rounded-2xl p-5 bg-card flex flex-col gap-4 shadow-sm">
          <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">
            Map Navigation & Controls
          </h3>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search state, city or place..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-xl bg-background text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
              />
              <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              {searching ? "..." : "Search"}
            </button>
          </form>

          <button
            onClick={detectLocation}
            disabled={detecting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold bg-secondary/40 border-border hover:bg-secondary/70 transition text-foreground"
          >
            <Compass className={detecting ? "animate-spin text-primary" : "text-primary"} size={18} />
            {detecting ? "Detecting location..." : "Detect My Location"}
          </button>
        </div>

        {/* Selected / Nearest Site Details Card */}
        <div className="border rounded-2xl p-5 bg-card flex-1 shadow-sm flex flex-col gap-4">
          {!selectedSite ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <MapPin className="text-muted-foreground/40 mb-3 animate-bounce" size={36} />
              <h4 className="font-semibold text-foreground text-sm">No Site Selected</h4>
              <p className="text-xs mt-1 leading-relaxed">
                Click any heritage marker on the map, use the search bar, or detect your location to calculate distances, find nearest sites, and fetch routing directions.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {selectedSite.state ? `${selectedSite.state}, ${selectedSite.country}` : selectedSite.country}
                  </span>
                  {selectedSite.famous && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 shadow-sm shrink-0">
                      <Star size={10} fill="currentColor" /> FAMOUS
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-foreground mt-1 leading-tight">
                  {selectedSite.name}
                </h3>
              </div>

              {/* Risk Level Bar */}
              <div className="p-3.5 bg-secondary/30 border rounded-xl flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">AI Risk Rating</span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                    selectedSite.risk === "High"
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : selectedSite.risk === "Medium"
                      ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      : "bg-green-500/10 text-green-500 border border-green-500/20"
                  }`}
                >
                  {selectedSite.risk} ({selectedSite.score}%)
                </span>
              </div>

              <div className="text-xs text-muted-foreground flex flex-col gap-2">
                <div>
                  <h5 className="font-semibold text-foreground mb-0.5">Threat Cause</h5>
                  <p className="leading-relaxed">{selectedSite.reason}</p>
                </div>
                {selectedSite.description && (
                  <div>
                    <h5 className="font-semibold text-foreground mb-0.5">About</h5>
                    <p className="leading-relaxed">{selectedSite.description}</p>
                  </div>
                )}
              </div>

              {/* Distance & Directions Section */}
              {activeOrigin && (
                <div className="border-t border-border/50 pt-4 mt-auto flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                      <Navigation size={13} className="text-primary" /> Distance calculations
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {distanceToSelected !== null
                        ? distanceToSelected < 1
                          ? `${Math.round(distanceToSelected * 1000)} meters away`
                          : `${distanceToSelected.toFixed(1)} km away`
                        : "Calculating..."}
                      {nearestSite?.id === selectedSite.id && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 font-bold px-1.5 py-0.5 rounded ml-2">
                          NEAREST
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Direction instructions */}
                  <div className="bg-secondary/20 p-3 rounded-xl border border-border/30 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Compass Directions
                    </span>
                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside leading-normal">
                      <li>Start at your origin coordinates.</li>
                      <li>
                        Head <span className="font-bold text-foreground">{compassDirectionToSelected}</span> for approx.{" "}
                        <span className="font-bold text-foreground">
                          {distanceToSelected !== null ? `${distanceToSelected.toFixed(1)} km` : "..."}
                        </span>
                        .
                      </li>
                      <li>Arrive at the entrance of <span className="font-semibold text-foreground">{selectedSite.name}</span>.</li>
                    </ol>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRoute(!showRoute)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                        showRoute
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-border text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {showRoute ? "Hide Direction Line" : "Draw Route Line"}
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${activeOrigin[0]},${activeOrigin[1]}&destination=${selectedSite.lat},${selectedSite.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2 border border-border hover:bg-secondary/40 transition rounded-xl text-foreground text-xs"
                      title="Open in Google Maps for turn-by-turn navigation"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div 
        key={mapKey}
        ref={mapRef}
        className="flex-1 rounded-2xl overflow-hidden border border-border relative h-[600px] bg-card shadow-sm"
      >
        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={mapZoom}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            attribution="OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Dynamic pan controller */}
          <MapControl center={mapCenter} zoom={mapZoom} />

          {/* User Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={createUserLocationIcon()}>
              <Popup>
                <div className="text-center font-medium">
                  <h4 className="text-xs font-bold text-primary">Your Location</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Lat: {userLocation[0].toFixed(4)}, Lng: {userLocation[1].toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Search Location Marker */}
          {searchLocation && (
            <Marker position={searchLocation} icon={createUserLocationIcon()}>
              <Popup>
                <div className="text-center font-medium">
                  <h4 className="text-xs font-bold text-primary">Searched Center</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Lat: {searchLocation[0].toFixed(4)}, Lng: {searchLocation[1].toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Heritage Sites Markers */}
          {sites.map((site: any) => {
            const isFamous = site.famous === true;
            const customIcon = isFamous ? createFamousSiteIcon() : createRegularSiteIcon(site.risk);

            return (
              <Marker
                key={site.id}
                position={[site.lat, site.lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedSite(site);
                    setMapCenter([site.lat, site.lng]);
                    setMapZoom(7);
                  },
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {site.name}
                      {isFamous && <Star size={12} className="text-amber-500" fill="currentColor" />}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {site.state ? `${site.state}, ${site.country}` : site.country}
                    </p>
                    <div className="flex gap-2 mt-2 pt-1.5 border-t border-border/50 text-[10px]">
                      <span className="font-semibold">Risk:</span>
                      <span
                        className={
                          site.risk === "High"
                            ? "text-red-500 font-bold"
                            : site.risk === "Medium"
                            ? "text-yellow-600 font-bold"
                            : "text-green-600 font-bold"
                        }
                      >
                        {site.risk} ({site.score}%)
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Direction Route Polyline */}
          {showRoute && activeOrigin && selectedSite && (
            <Polyline
              positions={[activeOrigin, [selectedSite.lat, selectedSite.lng]]}
              pathOptions={{
                color: "#f59e0b",
                weight: 4,
                dashArray: "8, 8",
                lineCap: "round",
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}