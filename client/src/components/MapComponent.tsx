import * as React from "react";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { useRouteNavigation } from "../hooks/useRouteNavigation";
import { Navigation, Loader2, X } from "lucide-react";
import { getUserLocation } from "../utils/geolocation";
import { toast } from "react-hot-toast";
import MarkerClusterGroup from "react-leaflet-cluster";

// Fix for default icons
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom parking icon
const createParkingIcon = (status: string, availableSlots: number = 0) => {
  const statusLower = (status || "unknown").toLowerCase();
  return new L.Icon({
    iconUrl:
      statusLower === "available"
        ? "https://cdn-icons-png.flaticon.com/512/3178/3178283.png" // Green parking icon
        : "https://cdn-icons-png.flaticon.com/512/3178/3178295.png", // Red parking icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `parking-marker status-${statusLower} avail-${availableSlots}`,
  });
};

// User location icon
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

// Custom Cluster Icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers();
  
  let totalAvailable = 0;
  let hasAvailable = false;
  
  markers.forEach((m: any) => {
    const className = m.options.icon?.options?.className || '';
    if (className.includes('status-available')) hasAvailable = true;
    const match = className.match(/avail-(\d+)/);
    if (match) {
      totalAvailable += parseInt(match[1], 10);
    }
  });
  
  // Dynamic sizing
  let size = 48;
  let textClass = "text-sm";
  if (count > 10 && count <= 50) {
    size = 56;
    textClass = "text-base";
  } else if (count > 50) {
    size = 64;
    textClass = "text-lg";
  }

  // Dynamic gradient based on availability
  // Green if there are available slots, red if completely full
  const gradientClass = hasAvailable 
    ? "from-[#10b981] to-[#059669]" 
    : "from-[#ef4444] to-[#b91c1c]";
    
  const pingColor = hasAvailable ? "bg-[#10b981]" : "bg-[#ef4444]";
  const shadowColor = hasAvailable ? "rgba(16,185,129,0.6)" : "rgba(239,68,68,0.6)";

  return new L.DivIcon({
    html: `
      <div class="relative flex items-center justify-center w-full h-full group cursor-pointer transition-transform duration-300 hover:scale-110" title="${totalAvailable} slots available here">
        <!-- Outer pulsating glow -->
        <div class="absolute inset-0 rounded-full ${pingColor} animate-ping opacity-25 group-hover:opacity-40"></div>
        <!-- Inner glowing container with premium gradient -->
        <div class="relative z-10 flex flex-col items-center justify-center w-full h-full rounded-full bg-linear-to-br ${gradientClass} text-white shadow-[0_4px_20px_${shadowColor}] border-[3px] border-white/80 backdrop-blur-md transition-all">
          <span class="${textClass} font-bold drop-shadow-md tracking-tight leading-none">${count}</span>
          ${totalAvailable > 0 ? `<span class="text-[9px] font-semibold opacity-90 mt-0.5 leading-none">${totalAvailable} left</span>` : '<span class="text-[9px] font-semibold opacity-90 mt-0.5 leading-none">Full</span>'}
        </div>
      </div>
    `,
    className: "custom-cluster-marker bg-transparent",
    iconSize: new L.Point(size, size),
  });
};

interface ParkingSlot {
  _id?: string;
  name: string;
  location: string;
  pricePerHour: number;
  status: string;
  distance: string;
  capacity: number;
  availableSlots: number;
  isCovered: boolean;
  securityLevel: string;
  rating: number;
  openingTime: string;
  closingTime: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface MapComponentProps {
  parkingSlots: ParkingSlot[];
  loading?: boolean;
}

// FitBounds component to auto-adjust map viewport to route bounds
interface FitBoundsProps {
  coords: [number, number][];
}

const FitBounds: React.FC<FitBoundsProps> = ({ coords }: FitBoundsProps) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 1) {
      map.fitBounds(coords, { padding: [30, 30] });
    }
  }, [coords, map]);
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  parkingSlots,
  loading = false,
}: MapComponentProps) => {
  // Default center (Delhi)
  const defaultCenter: [number, number] = [28.6139, 77.209];

  // Routing states
  const { routeCoords, loading: routingLoading, error: routingError, calculateRoute, clearRoute } = useRouteNavigation();
  const [geoError, setGeoError] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  // Try to locate user on map initialization
  useEffect(() => {
    getUserLocation()
      .then((loc) => {
        setUserLoc([loc.lat, loc.lng]);
      })
      .catch((err) => {
        console.warn("Initial user location fetch failed:", err);
      });
  }, []);

  const handleNavigate = (slot: ParkingSlot) => {
    if (!slot.coordinates || typeof slot.coordinates.lat !== "number" || typeof slot.coordinates.lng !== "number") {
      toast.error("Error: Parking slot coordinates are missing or invalid.");
      return;
    }

    setGeoError(null);

    getUserLocation()
      .then((loc) => {
        setUserLoc([loc.lat, loc.lng]);
        calculateRoute(loc.lat, loc.lng, slot.coordinates.lat, slot.coordinates.lng);
      })
      .catch((err) => {
        console.warn("MapComponent geolocation failed:", err);
        setGeoError(err.message);
      });
  };

  const handleClearRoute = () => {
    clearRoute();
    setGeoError(null);
  };

  if (loading) {
    return (
      <div className="flex-1">
        <div className="relative">
          <div className="backdrop-blur-xl bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 border border-[#1B42CB]/30 rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-[#EEECF6]">Live Map</div>
                <div className="text-xs px-3 py-1 bg-[#191919]/50 rounded-full text-[#EEECF6]">
                  Loading...
                </div>
              </div>
              <div className="h-48 bg-[#191919]/50 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter out slots with invalid coordinates
  const validParkingSlots = parkingSlots.filter(
    (slot: ParkingSlot) => 
      slot.coordinates && 
      typeof slot.coordinates.lat === 'number' && 
      typeof slot.coordinates.lng === 'number' &&
      !isNaN(slot.coordinates.lat) && 
      !isNaN(slot.coordinates.lng)
  );

  return (
    <div className="flex-1">
      <div className="relative">
        <div className="backdrop-blur-xl bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 border border-[#1B42CB]/30 rounded-2xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-[#EEECF6]">Live Map</div>
              <div className="text-xs px-3 py-1 bg-[#191919]/50 rounded-full text-[#EEECF6]">
                {validParkingSlots.length} Spots
              </div>
            </div>

            <div className="h-48 bg-[#191919]/50 rounded-xl overflow-hidden relative">
              {/* Routing overlays */}
              {routingLoading && (
                <div className="absolute inset-0 bg-black/60 z-[1000] flex items-center justify-center gap-2 text-[#EEECF6] text-sm font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  Generating route...
                </div>
              )}

              {(geoError || routingError) && (
                <div className="absolute inset-x-0 top-0 bg-red-600/90 text-white px-3 py-2 text-xs font-semibold z-[1000] flex justify-between items-center">
                  <span className="truncate pr-2">Error: {geoError || routingError}</span>
                  <button onClick={handleClearRoute} className="hover:opacity-80 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {routeCoords.length > 0 && (
                <button
                  onClick={handleClearRoute}
                  className="absolute bottom-2 left-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold z-[1000] flex items-center gap-1 shadow-md transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear Route
                </button>
              )}

              <MapContainer
                center={userLoc || defaultCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location marker */}
                <Marker position={userLoc || defaultCenter} icon={userIcon}>
                  <Popup>
                    <div className="font-semibold text-gray-800">Your Location</div>
                  </Popup>
                </Marker>

                {/* Parking slots markers */}
                <MarkerClusterGroup 
                  chunkedLoading
                  iconCreateFunction={createClusterCustomIcon}
                  maxClusterRadius={50}
                  spiderfyOnMaxZoom={true}
                  disableClusteringAtZoom={16}
                  showCoverageOnHover={true}
                  polygonOptions={{
                    fillColor: '#1B42CB',
                    color: '#FF2F6C',
                    weight: 2,
                    opacity: 0.6,
                    fillOpacity: 0.15
                  }}
                >
                {validParkingSlots.map((slot: ParkingSlot) => {
                  const status = slot.status || "unknown";
                  const statusFormatted = status.charAt(0).toUpperCase() + status.slice(1);
                  
                  return (
                    <Marker
                      key={slot._id || slot.name}
                      position={[slot.coordinates.lat, slot.coordinates.lng]}
                      icon={createParkingIcon(status, slot.availableSlots || 0)}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px] text-gray-800">
                          <h3 className="font-bold text-lg text-gray-800">
                            {slot.name || "Unknown Parking"}
                          </h3>
                          <p className="text-gray-600 text-sm">{slot.location || "Location not specified"}</p>

                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-700">Status:</span>
                              <span
                                className={`font-semibold ${
                                  status.toLowerCase() === "available"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {statusFormatted}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-700">Price:</span>
                              <span className="font-semibold">
                                ₹{slot.pricePerHour || 0}/hr
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-700">Available:</span>
                              <span className="font-semibold">
                                {(slot.availableSlots || 0)}/{(slot.capacity || 0)}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-700">Distance:</span>
                              <span className="font-semibold">
                                {slot.distance || "N/A"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-700">Rating:</span>
                              <span className="font-semibold">
                                {(slot.rating || 0).toFixed(1)} ★
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-700">Security:</span>
                              <span className="font-semibold">
                                {slot.securityLevel || "N/A"}
                              </span>
                            </div>
                          </div>

                          {slot.isCovered && (
                            <div className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              Covered Parking
                            </div>
                          )}

                          <div className="mt-3 text-xs text-gray-500 mb-2">
                            Timings: {slot.openingTime || "N/A"} - {slot.closingTime || "N/A"}
                          </div>

                          <button
                            onClick={() => handleNavigate(slot)}
                            disabled={routingLoading}
                            className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Navigate to this parking spot"
                          >
                            <Navigation className="w-3 h-3" />
                            Navigate
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                </MarkerClusterGroup>

                {/* Route drawing */}
                {routeCoords.length > 0 && (
                  <>
                    <Polyline
                      {...{
                        positions: routeCoords,
                        pathOptions: { color: "#1B42CB", weight: 5 },
                        color: "#1B42CB",
                        weight: 5
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      } as any}
                    />
                    <FitBounds coords={routeCoords} />
                  </>
                )}
              </MapContainer>
            </div>

            <div className="flex items-center justify-between text-sm text-[#EEECF6]/60">
              <span>Interactive map showing available parking spots</span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-xs">Full</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;