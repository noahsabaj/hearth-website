import { Box, Skeleton, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  srcSet?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: number | string;
  placeholder?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  threshold?: number;
  rootMargin?: string;
  animate?: boolean;
  animationDuration?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  className,
  style,
  sizes,
  srcSet,
  objectFit = 'cover',
  borderRadius = 0,
  placeholder,
  fallback,
  onLoad,
  onError,
  loading = 'lazy',
  threshold = 0.1,
  rootMargin = '50px',
  animate = true,
  animationDuration = 0.6,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');
  const [loadProgress, setLoadProgress] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  const { ref: inViewRef, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  // Combine refs
  const setRefs = (element: HTMLImageElement | null) => {
    imageRef.current = element;
    inViewRef(element);
  };

  useEffect(() => {
    if (inView && !shouldLoad) {
      setShouldLoad(true);
      // Simulate initial loading progress
      setLoadProgress(30);
    }
  }, [inView, shouldLoad]);

  // Simulate loading progress
  useEffect(() => {
    if (shouldLoad && !imageLoaded && !imageError) {
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) {
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [shouldLoad, imageLoaded, imageError]);

  const handleImageLoad = () => {
    setLoadProgress(100);
    setTimeout(() => {
      setImageLoaded(true);
      if (onLoad) {
        onLoad();
      }
    }, 100);
  };

  const handleImageError = () => {
    setImageError(true);
    if (onError) {
      onError();
    }
  };

  const containerSx = {
    width,
    height,
    position: 'relative',
    overflow: 'hidden',
    borderRadius,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    display: 'block',
  };

  if (imageError) {
    return (
      <Box sx={containerSx} style={style} className={className}>
        {fallback || (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.875rem',
            }}
          >
            Failed to load image
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={containerSx} style={style} className={className}>
      <AnimatePresence mode='wait'>
        {!imageLoaded && (
          <motion.div
            key='skeleton'
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
            }}
          >
            {placeholder ? (
              <img
                src={placeholder}
                alt=''
                style={{
                  ...imageStyle,
                  filter: 'blur(5px)',
                  transform: 'scale(1.1)',
                }}
              />
            ) : (
              <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                <Skeleton
                  variant='rectangular'
                  width='100%'
                  height='100%'
                  animation='wave'
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius:
                      typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
                  }}
                />
                {/* Shimmer effect overlay */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
                    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
                  }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                {/* Progress indicator for larger images */}
                {(width === '100%' || (typeof width === 'number' && width > 200)) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      overflow: 'hidden',
                      borderBottomLeftRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
                      borderBottomRightRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
                    }}
                  >
                    <LinearProgress
                      variant='determinate'
                      value={loadProgress}
                      sx={{
                        height: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'rgba(255, 69, 0, 0.5)',
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {shouldLoad && (
        <motion.img
          ref={setRefs}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            display: 'block',
            opacity: imageLoaded ? 1 : 0,
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          initial={animate ? { opacity: 0, scale: 1.1 } : false}
          animate={
            animate && imageLoaded ? { opacity: 1, scale: 1 } : imageLoaded ? { opacity: 1 } : false
          }
          {...(animate && {
            transition: {
              duration: animationDuration,
              ease: 'easeOut',
            },
          })}
        />
      )}
    </Box>
  );
};

export default LazyImage;
