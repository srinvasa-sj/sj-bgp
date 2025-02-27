import { useState, useEffect } from 'react';

// Create a cache to store preloaded images
const imageCache = new Map<string, HTMLImageElement>();

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  preloadUrls?: string[]; // Optional array of image URLs to preload
}

export const LazyImage = ({ src, alt, className, style, preloadUrls = [] }: LazyImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState('');
  const [error, setError] = useState(false);

  // Function to preload a single image
  const preloadImage = (url: string) => {
    if (!imageCache.has(url)) {
      const img = new Image();
      img.src = url;
      imageCache.set(url, img);
      
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    }
    return Promise.resolve();
  };

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Load the main image
        await preloadImage(src);
        
        if (isMounted) {
          setCurrentSrc(src);
          setIsLoading(false);
        }

        // Preload additional images in the background
        Promise.all(preloadUrls.map(url => preloadImage(url)))
          .catch(err => console.warn('Error preloading additional images:', err));

      } catch (err) {
        if (isMounted) {
          console.error('Error loading image:', err);
          setError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src, ...preloadUrls]);

  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md" />
      )}
      {error ? (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500">
          Error loading image
        </div>
      ) : (
        <img
          src={currentSrc || src}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
          style={style}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}; 