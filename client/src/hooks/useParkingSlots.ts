import { useState, useEffect, useCallback } from "react";
import { getUserLocation } from "../utils/geolocation";

declare const process: {
  env: {
    NODE_ENV: string;
  };
};

export interface ParkingSlot {
  _id: string;
  name: string;
  description?: string;
  location: string;
  pricePerHour: number;
  status: string;
  availableSlots: number;
  capacity: number;
  distance: string;
  rating: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  emergencyContact?: {
    phone: string;
    supportEmail?: string;
    managerName?: string;
  };
  images?: string[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: ParkingSlot[];
}

const mockCoordinates = [
  { lat: 28.6139, lng: 77.209 },
  { lat: 28.5355, lng: 77.391 },
  { lat: 28.4595, lng: 77.0266 },
  { lat: 28.7041, lng: 77.1025 },
  { lat: 28.4089, lng: 77.3178 },
  { lat: 28.6692, lng: 77.4535 },
];

export const useParkingSlots = () => {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [evFilter, setEvFilter] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchParkingSlots = useCallback(async (isEV: boolean = false) => {
    try {
      const response = await fetch(`/api/parking${isEV ? "?isEV=true" : ""}`);
      const result: ApiResponse = await response.json();
      if (result.success) {
        const isDev = process.env.NODE_ENV === "development";
        const slotsWithCoordinates = result.data.map((slot, index) => {
          const defaultCoords = { lat: 28.6139, lng: 77.209 };
          const mockCoords = mockCoordinates[index % mockCoordinates.length] || defaultCoords;
          return {
            ...slot,
            status: slot.status ? slot.status.toLowerCase() : "available",
            coordinates: isDev
              ? mockCoords
              : (slot.coordinates || defaultCoords),
          };
        });
        setParkingSlots(slotsWithCoordinates);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    getUserLocation()
      .then((loc) => {
        setUserLocation(loc);
      })
      .catch((err) => {
        console.warn(
          "Initial user location fetch failed, using fallback Delhi coordinates:",
          err
        );
        setUserLocation({ lat: 28.6139, lng: 77.209 });
      });

    fetchParkingSlots(false);
  }, [fetchParkingSlots]);

  // Re-fetch when EV filter changes
  useEffect(() => {
    fetchParkingSlots(evFilter);
  }, [evFilter, fetchParkingSlots]);

  const refetch = useCallback(() => {
    return fetchParkingSlots(evFilter);
  }, [evFilter, fetchParkingSlots]);

  return {
    parkingSlots,
    loading,
    error,
    evFilter,
    setEvFilter,
    userLocation,
    setUserLocation,
    refetch,
  };
};
