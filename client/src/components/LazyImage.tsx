import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = "",
  fallbackIcon = <Icons.Image className="w-6 h-6 text-white/40" />,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setHasError(false);
    
    // Fallback if IntersectionObserver is not supported
    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Load slightly before it enters the viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-[#111] flex items-center justify-center ${className}`}
      ref={imgRef}
    >
      {/* Skeleton / Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
          <div className="w-8 h-8 rounded-full border-2 border-[#1B42CB] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error / Fallback State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
              {fallbackIcon}
            </div>
            <span className="text-white/40 text-sm">Failed to load</span>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
