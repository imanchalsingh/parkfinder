import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MapComponent from "./MapComponent";

// Mock the geolocation utility
vi.mock("../utils/geolocation", () => ({
  getUserLocation: vi.fn().mockResolvedValue({ lat: 28.6139, lng: 77.209 }),
}));

// Mock useRouteNavigation
vi.mock("../hooks/useRouteNavigation", () => ({
  useRouteNavigation: () => ({
    routeCoords: [],
    loading: false,
    error: null,
    calculateRoute: vi.fn(),
    clearRoute: vi.fn(),
  }),
}));

// Mock react-leaflet and react-leaflet-cluster since they require a real DOM with Leaflet
vi.mock("react-leaflet", () => {
  return {
    MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children }: any) => <div data-testid="map-marker">{children}</div>,
    Popup: ({ children }: any) => <div data-testid="map-popup">{children}</div>,
    Polyline: () => <div data-testid="map-polyline" />,
    useMap: () => ({ fitBounds: vi.fn() }),
  };
});

vi.mock("react-leaflet-cluster", () => ({
  default: ({ children }: any) => <div data-testid="marker-cluster-group">{children}</div>,
}));

const mockParkingSlots = [
  {
    _id: "1",
    name: "CP Parking",
    location: "Connaught Place",
    pricePerHour: 50,
    status: "available",
    distance: "2 km",
    capacity: 100,
    availableSlots: 40,
    isCovered: true,
    securityLevel: "High",
    rating: 4.5,
    openingTime: "08:00 AM",
    closingTime: "11:00 PM",
    coordinates: { lat: 28.6304, lng: 77.2177 },
  },
  {
    _id: "2",
    name: "India Gate Parking",
    location: "India Gate",
    pricePerHour: 30,
    status: "full",
    distance: "3 km",
    capacity: 50,
    availableSlots: 0,
    isCovered: false,
    securityLevel: "Medium",
    rating: 4.0,
    openingTime: "06:00 AM",
    closingTime: "10:00 PM",
    coordinates: { lat: 28.6129, lng: 77.2295 },
  },
];

describe("MapComponent", () => {
  it("renders loading state correctly", () => {
    render(<MapComponent parkingSlots={[]} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders map container with clusters and markers", () => {
    render(<MapComponent parkingSlots={mockParkingSlots} loading={false} />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    
    // Check if cluster group is rendered
    expect(screen.getByTestId("marker-cluster-group")).toBeInTheDocument();
    
    // Check if markers are rendered inside the cluster
    const markers = screen.getAllByTestId("map-marker");
    // 2 parking slots + 1 user location marker = 3 markers
    expect(markers.length).toBe(3);
  });

  it("filters out invalid coordinates", () => {
    const invalidSlots = [
      ...mockParkingSlots,
      {
        ...mockParkingSlots[0],
        _id: "3",
        coordinates: { lat: NaN, lng: 77.2177 },
      },
      {
        ...mockParkingSlots[0],
        _id: "4",
        coordinates: { lat: "28.5" as any, lng: 77.2177 }, // String coordinate edge case
      },
      {
        ...mockParkingSlots[0],
        _id: "5",
        coordinates: undefined as any, // Missing coordinate edge case
      }
    ];
    
    render(<MapComponent parkingSlots={invalidSlots} loading={false} />);
    const markers = screen.getAllByTestId("map-marker");
    
    // The 3 invalid markers should not be rendered (still 3 total markers with user location)
    expect(markers.length).toBe(3);
  });

  it("handles empty parking slot lists gracefully", () => {
    render(<MapComponent parkingSlots={[]} loading={false} />);
    const markers = screen.getAllByTestId("map-marker");
    // Only the user location marker should exist
    expect(markers.length).toBe(1);
    expect(screen.getByText("0 Spots")).toBeInTheDocument();
  });

  it("handles missing status and availableSlots gracefully", () => {
    const missingDataSlots = [
      {
        _id: "missing-data-1",
        name: "Mystery Parking",
        location: "Unknown Location",
        pricePerHour: 0,
        status: undefined as any,
        distance: "0 km",
        capacity: 10,
        availableSlots: undefined as any,
        isCovered: false,
        securityLevel: "Low",
        rating: 0,
        openingTime: "N/A",
        closingTime: "N/A",
        coordinates: { lat: 28.5, lng: 77.1 },
      }
    ];
    render(<MapComponent parkingSlots={missingDataSlots} loading={false} />);
    const markers = screen.getAllByTestId("map-marker");
    
    // 1 slot + 1 user loc = 2 markers
    expect(markers.length).toBe(2);
    // Spot count should say 1
    expect(screen.getByText("1 Spots")).toBeInTheDocument();
  });
});
