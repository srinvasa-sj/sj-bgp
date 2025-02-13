//------------------------------------------------------------//
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Maximize } from "lucide-react";

interface GalleryImage {
  imageUrl: string;
  timestamp: any;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Number of thumbnails visible in the thumbnail carousel
  const visibleThumbnails = 8;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const docRef = doc(db, "imageData", "v7l44PuRudnQjGs5jQjf");
        const docSnap = await getDoc(docRef);
        console.log("Fetching images...");
        if (docSnap.exists() && docSnap.data().images) {
          const imageData = docSnap.data().images;
          // Sort images by timestamp descending
          const sortedImages = [...imageData].sort(
            (a: GalleryImage, b: GalleryImage) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setImages(sortedImages);
          console.log("Images fetched successfully:", sortedImages);
        } else {
          console.log("No images found in document");
          toast.error("No images found in gallery");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Error loading gallery images");
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
          <section className="page-header-margin">
            <h1 className="text-2xl text-center sm:text-left sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4 leading-tight">
              Gallery
            </h1>
            <div className="relative w-full h-[600px] flex justify-center items-center">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
          <section className="page-header-margin">
            <h1 className="text-2xl text-center sm:text-left sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4 leading-tight">
              Gallery
            </h1>
            <p className="text-gray-900 text-center">No images available in the gallery.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <section className="page-header-margin">
          <h1 className="text-2xl text-center sm:text-left sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4 leading-tight">
            Gallery
          </h1>
          {/* Main Image Carousel */}
          <div className="relative w-full h-[600px] overflow-hidden rounded-lg shadow-lg">
            <img
              src={images[currentImageIndex].imageUrl}
              alt={`Gallery image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain transition-transform duration-500 ease-in-out hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
                toast.error("Error loading image");
              }}
            />
            <button
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
              onClick={prevImage}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
              onClick={nextImage}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              className="absolute top-4 right-16 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
              onClick={() => setIsFullScreen(true)}
            >
              <Maximize className="w-6 h-6" />
            </button>
          </div>

          {/* Full-Screen Lightbox View */}
          {isFullScreen && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <img
                src={images[currentImageIndex].imageUrl}
                alt="Full-screen"
                className="max-w-full max-h-full rounded-lg shadow-lg"
              />
              <button
                className="absolute top-4 right-4 bg-white text-black p-2 rounded-full hover:bg-gray-300"
                onClick={() => setIsFullScreen(false)}
              >
                ✖
              </button>
            </div>
          )}

          {/* Thumbnail Preview with Navigation */}
          <div className="mt-6 flex items-center justify-center relative">
            {/* Left Navigation Arrow */}
            <button
              className="absolute left-0 z-10 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 disabled:opacity-50"
              onClick={() =>
                setThumbStartIndex((prev) => Math.max(prev - visibleThumbnails, 0))
              }
              disabled={thumbStartIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex overflow-hidden">
              {images.slice(thumbStartIndex, thumbStartIndex + visibleThumbnails).map((img, index) => {
                const globalIndex = thumbStartIndex + index;
                return (
                  <img
                    key={globalIndex}
                    src={img.imageUrl}
                    alt={`Thumbnail ${globalIndex + 1}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer mx-1 transition-all duration-300 ${
                      globalIndex === currentImageIndex
                        ? "border-4 border-primary scale-110"
                        : "border border-gray-300"
                    }`}
                    onClick={() => setCurrentImageIndex(globalIndex)}
                  />
                );
              })}
            </div>

            {/* Right Navigation Arrow */}
            <button
              className="absolute right-0 z-10 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 disabled:opacity-50"
              onClick={() =>
                setThumbStartIndex((prev) =>
                  Math.min(prev + visibleThumbnails, images.length - visibleThumbnails)
                )
              }
              disabled={thumbStartIndex + visibleThumbnails >= images.length}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Gallery;

