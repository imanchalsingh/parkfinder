import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export interface Favorite {
  _id: string;
  userId?: string;
  parkingId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useFavorites = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const favoriteIds = data.data.map((fav: Favorite) => fav._id);
        setFavorites(favoriteIds);
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    }
  }, [token]);

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent, locationId: string) => {
      e.stopPropagation();

      if (!token || !user) {
        toast.error("Please login to save favorite locations");
        navigate("/login");
        return;
      }

      try {
        // Optimistic update
        setFavorites((prev) =>
          prev.includes(locationId)
            ? prev.filter((id) => id !== locationId)
            : [...prev, locationId]
        );

        const res = await fetch(`/api/favorites/${locationId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!data.success) {
          // Revert on failure
          fetchFavorites();
          console.error("Failed to toggle favorite:", data.message);
          toast.error("Failed to update favorites");
        } else {
          toast.success(prev.includes(locationId) ? "Removed from favorites" : "Added to favorites");
        }
      } catch (err) {
        console.error("Error toggling favorite:", err);
        toast.error("Failed to update favorites");
        fetchFavorites(); // Revert on failure
      }
    },
    [token, user, navigate, fetchFavorites]
  );

  useEffect(() => {
    if (token) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [token, fetchFavorites]);

  return {
    favorites,
    toggleFavorite,
    fetchFavorites,
  };
};
