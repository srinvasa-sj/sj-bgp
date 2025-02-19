import React, { useState, useEffect, useRef } from 'react';

interface ImageDimensions {
  width: number;
  height: number;
}

export const getOptimalImageSize = (
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): ImageDimensions => {
  const containerAspectRatio = containerWidth / containerHeight;
  const imageAspectRatio = imageWidth / imageHeight;

  let width: number;
  let height: number;

  if (containerAspectRatio > imageAspectRatio) {
    height = containerHeight;
    width = height * imageAspectRatio;
  } else {
    width = containerWidth;
    height = width / imageAspectRatio;
  }

  return { width, height };
};

// Image cache for faster subsequent loads
const imageCache = new Map<string, string>();

export const useProgressiveImage = (lowQualitySrc: string, highQualitySrc: string) => {
  const [src, setSrc] = useState(lowQualitySrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check cache first
    if (imageCache.has(highQualitySrc)) {
      setSrc(imageCache.get(highQualitySrc)!);
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = highQualitySrc;
    
    img.onload = () => {
      imageCache.set(highQualitySrc, highQualitySrc);
      setSrc(highQualitySrc);
      setIsLoading(false);
    };
  }, [highQualitySrc, lowQualitySrc]);

  return { src, isLoading };
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = reject;
  });
};

export const preloadImages = async (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.map(preloadImage));
};

export const generateBlurDataURL = async (src: string): Promise<string> => {
  if (imageCache.has(`blur-${src}`)) {
    return imageCache.get(`blur-${src}`)!;
  }

  try {
    const response = await fetch(src);
    const buffer = await response.arrayBuffer();
    
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    const blurDataURL = `data:image/jpeg;base64,${base64}`;
    imageCache.set(`blur-${src}`, blurDataURL);
    
    return blurDataURL;
  } catch (error) {
    console.error('Error generating blur data URL:', error);
    return src;
  }
};

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  priority = false,
  placeholder = 'empty',
  quality = 75
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');

  useEffect(() => {
    if (placeholder === 'blur') {
      generateBlurDataURL(src).then(setBlurDataUrl);
    }
  }, [src, placeholder]);

  useEffect(() => {
    if (!priority && imageRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting);
        },
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      );

      observer.observe(imageRef.current);

      return () => {
        if (imageRef.current) {
          observer.unobserve(imageRef.current);
        }
      };
    } else {
      setIsIntersecting(true);
    }
  }, [priority]);

  useEffect(() => {
    if (priority || isIntersecting) {
      const img = new Image();
      img.src = src;
      imageCache.set(src, src);
    }
  }, [src, priority, isIntersecting]);

  if (error) {
    return null;
  }

  const optimizedSrc = `${src}${src.includes('?') ? '&' : '?'}q=${quality}`;

  return React.createElement('img', {
    ref: imageRef,
    src: (isIntersecting || priority) ? optimizedSrc : blurDataUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    alt,
    width,
    height,
    className: `${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`,
    onLoad: () => setIsLoaded(true),
    onError: () => setError(true),
    loading: priority ? 'eager' : 'lazy',
    style: {
      backgroundColor: placeholder === 'blur' ? '#f3f4f6' : undefined,
      objectFit: 'cover',
    }
  });
}; 
