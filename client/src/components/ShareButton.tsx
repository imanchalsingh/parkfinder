import React from "react";
import { Share2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
  iconClassName?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url,
  className = "",
  iconClassName = "w-4 h-4",
}) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title,
      text,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error sharing:", err);
          fallbackShare();
        }
      }
    } else {
      // Fallback
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast.success("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Error copying to clipboard:", err);
          toast.error("Failed to copy link.");
        });
    } else {
      toast.error("Sharing is not supported on this browser.");
    }
  };

  return (
    <button
      onClick={handleShare}
      className={className}
      title="Share Parking Lot"
      aria-label="Share Parking Lot"
    >
      <Share2 className={iconClassName} />
    </button>
  );
};

export default ShareButton;
