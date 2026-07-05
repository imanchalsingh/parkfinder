import * as React from "react";
import * as Icons from "lucide-react";
import { useThemeClasses } from "../hooks/useThemeClasses";

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  viewMode: "list" | "map";
  setViewMode: (mode: "list" | "map") => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  evFilter: boolean;
  setEvFilter: (ev: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  evFilter,
  setEvFilter,
}) => {
  const themeClasses = useThemeClasses();

  return (
    <div
      className={`mb-8 backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl p-6 shadow-xl`}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Icons.Search className="w-5 h-5 text-[#1B42CB]" />
          </div>
          <input
            type="text"
            aria-label="Search location or parking name"
            placeholder="Search location or parking name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-4 ${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-xl ${themeClasses.text} focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300`}
          />
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* EV Toggle */}
          <button
            type="button"
            onClick={() => setEvFilter(!evFilter)}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all duration-300 font-medium ${
              evFilter
                ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/20"
                : `${themeClasses.cardBgSecondary} ${themeClasses.border} ${themeClasses.textSecondary} ${themeClasses.hover}`
            }`}
          >
            <Icons.Zap className={`w-4 h-4 ${evFilter ? "text-white" : "text-green-500"}`} />
            <span>{evFilter ? "EV Only" : "All Slots"}</span>
          </button>

          {/* List/Map View Toggle */}
          <div
            className={`flex ${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-xl overflow-hidden`}
          >
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-3 flex items-center gap-2 transition-all duration-300 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white"
                  : `${themeClasses.textSecondary} ${themeClasses.hover}`
              }`}
            >
              <Icons.List className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-3 flex items-center gap-2 transition-all duration-300 ${
                viewMode === "map"
                  ? "bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white"
                  : `${themeClasses.textSecondary} ${themeClasses.hover}`
              }`}
            >
              <Icons.Map className="w-4 h-4" />
              <span>Map</span>
            </button>
          </div>

          {/* Status Filter */}
          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-4 ${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-xl ${themeClasses.text} focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300`}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Sort By */}
          <select
            aria-label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-4 ${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-xl ${themeClasses.text} focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300`}
          >
            <option value="">Sort by</option>
            <option value="price">Price: Low to High</option>
            <option value="distance">Distance</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
