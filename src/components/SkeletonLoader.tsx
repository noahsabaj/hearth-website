import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'feature' | 'release' | 'documentation';
  count?: number;
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  count = 1,
  width = '100%',
  height = 'auto',
  animation = 'pulse',
}) => {
  const renderTextSkeleton = () => (
    <Box sx={{ mb: 2 }}>
      <Skeleton
        animation={animation}
        variant='text'
        width={width}
        height={height || 40}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 1,
        }}
      />
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
            animation={animation}
            variant='circular'
            width={48}
            height={48}
            sx={{
              bgcolor: 'rgba(255, 69, 0, 0.1)',
              mb: 2,
            }}
          />
          <Skeleton
            animation={animation}
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
            animation={animation}
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
            animation={animation}
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
            animation={animation}
            variant='text'
            width='60%'
            height={32}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1,
            }}
          />
          <Skeleton
            animation={animation}
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
          animation={animation}
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
          animation={animation}
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
                animation={animation}
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
        animation={animation}
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
        animation={animation}
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
        animation={animation}
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
        animation={animation}
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
          animation={animation}
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
      default:
        return renderTextSkeleton();
    }
  };

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
