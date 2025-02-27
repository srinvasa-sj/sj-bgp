import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LazyImage } from "@/components/ui/LazyImage";

interface ImageGalleryProps {
  mainImage: string;
  images?: string[];
}

const ImageGallery = ({ mainImage, images = [] }: ImageGalleryProps) => {
  // Filter out duplicates and empty strings, ensuring mainImage is included only once
  const allImages = useMemo(() => 
    Array.from(new Set([mainImage, ...(images || [])])).filter(Boolean),
    [mainImage, images]
  );
  
  const [selectedImage, setSelectedImage] = useState(allImages[0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Get the next images to preload based on the current selected image
  const getPreloadUrls = (currentImage: string): string[] => {
    const currentIndex = allImages.indexOf(currentImage);
    const nextImages = allImages.slice(currentIndex + 1);
    const previousImages = allImages.slice(0, currentIndex);
    return [...nextImages, ...previousImages];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setMousePosition({ x, y });
  };

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "relative overflow-hidden rounded-lg bg-gray-100 cursor-zoom-in",
          isZoomed && "cursor-zoom-out"
        )}
        style={{ height: "500px" }}
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={handleMouseMove}
      >
        <LazyImage
          src={selectedImage}
          alt="Product"
          className={cn(
            "w-full h-full object-cover transition-transform duration-200",
            isZoomed && "scale-150"
          )}
          style={
            isZoomed
              ? {
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }
              : undefined
          }
          preloadUrls={getPreloadUrls(selectedImage)}
        />
      </div>
      
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md",
                selectedImage === image && "ring-2 ring-primary"
              )}
            >
              <LazyImage
                src={image}
                alt={`Product view ${index + 1}`}
                className="w-full h-full object-cover transition-all hover:scale-110"
                preloadUrls={[selectedImage]}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;