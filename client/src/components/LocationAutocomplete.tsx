import React, { useState, useEffect, useRef } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { MapPin, Loader2, Search } from "lucide-react";
import { useThemeClasses } from "../hooks/useThemeClasses";

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter location...",
  className = "",
  icon
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const themeClasses = useThemeClasses();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Debounce the input value by 500ms to respect API rate limits
  const debouncedSearchTerm = useDebounce(value, 500);

  useEffect(() => {
    // Close dropdown if clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            debouncedSearchTerm
          )}&format=json&addressdetails=1&limit=5`,
          {
            headers: {
              // Nominatim requires a User-Agent
              "Accept-Language": "en-US,en;q=0.9",
            },
          }
        );
        const data = await response.json();
        
        if (isMounted) {
          setSuggestions(data);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearchTerm]);

  const handleSelect = (suggestion: Suggestion) => {
    onChange(suggestion.display_name);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className={className}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-[#FF2F6C] animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className={`absolute z-50 w-full mt-2 rounded-xl border shadow-xl max-h-60 overflow-y-auto ${themeClasses.cardBgSecondary} ${themeClasses.border}`}>
          <ul className="py-2">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSelect(suggestion)}
                className={`px-4 py-3 cursor-pointer flex items-start gap-3 transition-colors ${themeClasses.hover} border-b last:border-b-0 ${themeClasses.border}`}
              >
                <MapPin className={`w-4 h-4 mt-1 flex-shrink-0 ${themeClasses.textSecondary}`} />
                <span className={`text-sm ${themeClasses.text} truncate whitespace-normal`}>
                  {suggestion.display_name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
