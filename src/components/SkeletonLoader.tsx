import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'feature' | 'release' | 'documentation' | 'image' | 'table' | 'list';
  count?: number;
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'shimmer' | false;
  speed?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  count = 1,
  width = '100%',
  height = 'auto',
  animation = 'pulse',
  speed = 1,
}) => {
  const renderTextSkeleton = () => (
    <Box sx={{ mb: 2, position: 'relative' }}>
      <Skeleton
        animation={animation === 'shimmer' ? 'wave' : animation}
        variant='text'
        width={width}
        height={height || 40}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 1,
          animationDuration: `${1.5 / speed}s`,
        }}
      />
      {animation === 'shimmer' && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
            pointerEvents: 'none',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 1.5 / speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </Box>
  );

  const renderCardSkeleton = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        sx={{
          height: '100%',
          background: '#222',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Skeleton
            animation={animation === 'shimmer' ? 'wave' : animation}
            variant='circular'
            width={48}
            height={48}
            sx={{
              bgcolor: 'rgba(255, 69, 0, 0.1)',
              mb: 2,
            }}
          />
          <Skeleton
            animation={animation === 'shimmer' ? 'wave' : animation}
            variant='text'
            width='70%'
            height={32}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              mb: 1,
              borderRadius: 1,
            }}
          />
          <Skeleton
            animation={animation === 'shimmer' ? 'wave' : animation}
            variant='text'
            width='90%'
            height={20}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              mb: 1,
              borderRadius: 1,
            }}
          />
          <Skeleton
            animation={animation === 'shimmer' ? 'wave' : animation}
            variant='text'
            width='80%'
            height={20}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 1,
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderFeatureSkeleton = () => (
    <Grid container spacing={4}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} md={4} key={index}>
          {renderCardSkeleton()}
        </Grid>
      ))}
    </Grid>
  );

  const renderReleaseSkeleton = () => (
    <Card
      sx={{
        mb: 3,
        bgcolor: '#1a1a1a',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Skeleton
            animation={animation === 'shimmer' ? 'wave' : animation}
            variant='text'
            width='60%'
            height={32}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1,
            }}
          />
          <Skeleton
            animation={animation === 'shimmer' ? 'wave' : animation}
            variant='rectangular'
            width={80}
            height={24}
            sx={{
              bgcolor: 'rgba(255, 69, 0, 0.1)',
              borderRadius: 3,
            }}
          />
        </Box>
        <Skeleton
          animation={animation === 'shimmer' ? 'wave' : animation}
          variant='text'
          width='40%'
          height={20}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            mb: 2,
            borderRadius: 1,
          }}
        />
        <Skeleton
          animation={animation === 'shimmer' ? 'wave' : animation}
          variant='rectangular'
          width='100%'
          height={80}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 1,
            mb: 2,
          }}
        />
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Skeleton
                animation={animation === 'shimmer' ? 'wave' : animation}
                variant='rectangular'
                width='100%'
                height={40}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 1,
                }}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderDocumentationSkeleton = () => (
    <Box sx={{ pb: 6 }}>
      <Skeleton
        animation={animation === 'shimmer' ? 'wave' : animation}
        variant='text'
        width='70%'
        height={48}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          mb: 2,
          borderRadius: 1,
        }}
      />
      <Skeleton
        animation={animation === 'shimmer' ? 'wave' : animation}
        variant='text'
        width='90%'
        height={20}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.08)',
          mb: 1,
          borderRadius: 1,
        }}
      />
      <Skeleton
        animation={animation === 'shimmer' ? 'wave' : animation}
        variant='text'
        width='85%'
        height={20}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.08)',
          mb: 3,
          borderRadius: 1,
        }}
      />
      <Skeleton
        animation={animation === 'shimmer' ? 'wave' : animation}
        variant='rectangular'
        width='100%'
        height={200}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          mb: 3,
        }}
      />
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton
          key={index}
          animation={animation === 'shimmer' ? 'wave' : animation}
          variant='text'
          width={`${90 - index * 5}%`}
          height={20}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            mb: 1,
            borderRadius: 1,
          }}
        />
      ))}
    </Box>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return renderCardSkeleton();
      case 'feature':
        return renderFeatureSkeleton();
      case 'release':
        return renderReleaseSkeleton();
      case 'documentation':
        return renderDocumentationSkeleton();
      case 'image':
        return renderImageSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'list':
        return renderListSkeleton();
      default:
        return renderTextSkeleton();
    }
  };

  const renderImageSkeleton = () => (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <Skeleton
        animation={animation === 'shimmer' ? 'wave' : animation}
        variant='rectangular'
        width={width}
        height={height || 200}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2 / speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        </motion.div>
      </Box>
    </Box>
  );

  const renderTableSkeleton = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          pb: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            animation={animation === 'shimmer' ? 'wave' : animation}
            variant='text'
            width={i === 0 ? '30%' : '23%'}
            height={24}
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)' }}
          />
        ))}
      </Box>
      {/* Rows */}
      {[...Array(5)].map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
          {[...Array(4)].map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              animation={animation === 'shimmer' ? 'wave' : animation}
              variant='text'
              width={colIndex === 0 ? '30%' : '23%'}
              height={20}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );

  const renderListSkeleton = () => (
    <Box>
      {[...Array(count)].map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Skeleton
            animation={animation === 'shimmer' ? 'wave' : animation}
            variant='circular'
            width={40}
            height={40}
            sx={{ bgcolor: 'rgba(255, 69, 0, 0.1)', flexShrink: 0 }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton
              animation={animation === 'shimmer' ? 'wave' : animation}
              variant='text'
              width='70%'
              height={24}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mb: 0.5 }}
            />
            <Skeleton
              animation={animation === 'shimmer' ? 'wave' : animation}
              variant='text'
              width='90%'
              height={16}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );

  if (count > 1 && variant === 'text') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {renderSkeleton()}
          </motion.div>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </Box>
  );
};

export default SkeletonLoader;
