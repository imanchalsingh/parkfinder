import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullDownThreshold?: number;
  maxPullDown?: number;
}

const THEME_CLASSES = {
  light: {
    bg: "bg-white",
    text: "text-gray-900",
    border: "border-gray-200",
    accent: "text-blue-600",
    shadow: "shadow-md",
  },
  dark: {
    bg: "bg-[#191919]",
    text: "text-[#EEECF6]",
    border: "border-[#1B42CB]/20",
    accent: "text-[#1B42CB]",
    shadow: "shadow-[0_4px_15px_rgba(27,66,203,0.3)]",
  },
} as const;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDownThreshold = 80,
  maxPullDown = 120,
}) => {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme } = useTheme();

  const themeClasses =
    THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.light;

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-to-refresh when scrolled to the very top
    if (window.scrollY <= 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0 && window.scrollY <= 0) {
      // Apply some resistance
      const pull = Math.min(distance * 0.5, maxPullDown);
      setPullDistance(pull);
    } else {
      // User scrolling down normally
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullDistance >= pullDownThreshold) {
      setIsRefreshing(true);
      setPullDistance(pullDownThreshold);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  // Prevent overscroll behavior on body when pulling
  useEffect(() => {
    if (isPulling && pullDistance > 0) {
      document.body.style.overscrollBehaviorY = "none";
    } else {
      document.body.style.overscrollBehaviorY = "auto";
    }
    return () => {
      document.body.style.overscrollBehaviorY = "auto";
    };
  }, [isPulling, pullDistance]);

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`absolute top-0 left-0 w-full flex justify-center items-center overflow-hidden transition-all duration-300 z-50`}
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          opacity: pullDistance > 20 ? 1 : 0,
        }}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${themeClasses.bg} ${themeClasses.shadow} ${themeClasses.border} border`}
          style={{
            transform: `scale(${Math.min(pullDistance / pullDownThreshold, 1)})`,
            transition: isPulling ? "none" : "transform 0.3s ease-out",
          }}
        >
          <Icons.RefreshCw
            className={`w-5 h-5 ${themeClasses.accent} ${
              isRefreshing ? "animate-spin" : ""
            }`}
            style={{
              transform: isRefreshing
                ? "none"
                : `rotate(${pullDistance * 2}deg)`,
            }}
          />
        </div>
      </div>
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
