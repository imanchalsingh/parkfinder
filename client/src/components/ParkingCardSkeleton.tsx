import * as React from "react";
import { useThemeClasses } from "../hooks/useThemeClasses";

export const ParkingCardSkeleton: React.FC = () => {
  const themeClasses = useThemeClasses();

  return (
    <div
      role="status"
      aria-label="Loading parking slot..."
      className={`group backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl overflow-hidden shadow-xl animate-pulse`}
    >
      {/* Status Header Skeleton */}
      <div className={`px-6 py-4 bg-gray-300 dark:bg-gray-800/50 border-b ${themeClasses.border} h-14`}>
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-3 w-1/3">
            <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-400 dark:bg-gray-700 rounded w-full"></div>
          </div>
          <div className="flex items-center gap-2 w-1/4">
            <div className="h-6 bg-gray-400 dark:bg-gray-700 rounded-full w-full"></div>
            <div className="w-6 h-6 bg-gray-400 dark:bg-gray-700 rounded-full shrink-0"></div>
          </div>
        </div>
      </div>

      {/* Image Carousel Skeleton */}
      <div className="h-48 bg-gray-300 dark:bg-gray-800/50 w-full"></div>

      <div className="p-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-6">
          <div className="w-1/2">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="flex items-center gap-2">
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right w-1/3">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 ml-auto"></div>
          </div>
        </div>

        {/* Location Skeleton */}
        <div className="mb-6 p-4 bg-gray-200 dark:bg-gray-800/50 rounded-xl border border-gray-300 dark:border-gray-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-300 dark:bg-gray-700 shrink-0"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${themeClasses.cardBgSecondary} border ${themeClasses.border} rounded-xl p-3 flex flex-col items-center bg-gray-200 dark:bg-gray-800/50`}>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
            </div>
          ))}
        </div>

        {/* Progress Bar Skeleton */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col gap-2">
          {/* Row 1: Utility Buttons */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex-1 h-9 rounded-lg border ${themeClasses.border} bg-gray-300 dark:bg-gray-700`}></div>
            ))}
          </div>

          {/* Row 2: Book Now Button */}
          <div className="w-full h-12 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
};

export default ParkingCardSkeleton;
