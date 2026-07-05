import * as React from "react";
import { useState } from "react";
import * as Icons from "lucide-react";
import LazyImage from "./LazyImage";

interface ImageCarouselProps {
  images: string[];
  name: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  name,
}) => {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
            <Icons.Image className="w-6 h-6 text-white/40" />
          </div>
          <span className="text-white/40 text-sm">No photos available</span>
        </div>
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % images.length);
  };

  return (
    <div className="relative w-full h-48 overflow-hidden bg-[#111] group">
      <LazyImage
        src={images[current]}
        alt={`${name} photo ${current + 1}`}
        className="w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Icons.ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Icons.ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  i === current ? "bg-white w-3" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs flex items-center gap-1">
        <Icons.Camera className="w-3 h-3" />
        {current + 1}/{images.length}
      </div>
    </div>
  );
};

export default ImageCarousel;
