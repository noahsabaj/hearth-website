import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import React, { useState } from 'react';

import LazyImage from '../components/LazyImage';
import LoadingDots from '../components/LoadingDots';
import LoadingOverlay from '../components/LoadingOverlay';
import LoadingProgress from '../components/LoadingProgress';
import NavigationBar from '../components/NavigationBar';
import SkeletonLoader from '../components/SkeletonLoader';
import VoxelLoader from '../components/VoxelLoader';
import { loadingConfig } from '../config/loadingConfig';
import { useLoadingState } from '../hooks/useLoadingState';
import { loadingTips } from '../hooks/useLoadingTips';
import { useProgressSimulation } from '../hooks/useProgressSimulation';

const LoadingDemo: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<
    'linear' | 'circular' | 'dots' | 'spinner' | 'voxel'
  >('voxel');
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayVariant, setOverlayVariant] = useState<'full' | 'inline' | 'minimal'>('full');

  const progressSimulation = useProgressSimulation({
    duration: 3000,
    steps: [15, 35, 60, 85, 100],
    realistic: true,
  });

  const loadingState = useLoadingState({
    initialMessage: 'Loading demo content...',
    minimumDuration: 1000,
  });

  const handleSimulateLoading = () => {
    loadingState.start('Starting loading process...');
    progressSimulation.reset();
    progressSimulation.start();

    setTimeout(() => loadingState.updateMessage('Fetching data...'), 500);
    setTimeout(() => loadingState.updateProgress(30, 'Processing...'), 1000);
    setTimeout(() => loadingState.updateProgress(60, 'Almost there...'), 1500);
    setTimeout(() => loadingState.updateProgress(90, 'Finalizing...'), 2000);
    setTimeout(() => loadingState.complete('Loading complete!'), 2500);
  };

  const handleOverlayDemo = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  return (
    <Box component='main' role='main'>
      <NavigationBar />

      <Container maxWidth='lg' sx={{ mt: 10, pb: 6 }}>
        <Typography variant='h1' gutterBottom component='h1' id='main-content'>
          Loading State Demonstrations
        </Typography>
        <Typography variant='body1' color='text.secondary' paragraph>
          Explore all the enhanced loading components and states available in Hearth Website.
        </Typography>

        {/* Loading Progress Variants */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            Loading Progress Components
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Variant</InputLabel>
                <Select
                  value={selectedVariant}
                  label='Variant'
                  onChange={e => setSelectedVariant(e.target.value as any)}
                >
                  <MenuItem value='linear'>Linear</MenuItem>
                  <MenuItem value='circular'>Circular</MenuItem>
                  <MenuItem value='dots'>Dots</MenuItem>
                  <MenuItem value='spinner'>Spinner</MenuItem>
                  <MenuItem value='voxel'>Voxel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Size</InputLabel>
                <Select
                  value={selectedSize}
                  label='Size'
                  onChange={e => setSelectedSize(e.target.value as any)}
                >
                  <MenuItem value='small'>Small</MenuItem>
                  <MenuItem value='medium'>Medium</MenuItem>
                  <MenuItem value='large'>Large</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant='h6' gutterBottom>
              Live Demo
            </Typography>
            <LoadingProgress
              variant={selectedVariant}
              progress={progressSimulation.progress}
              indeterminate={false}
              size={selectedSize}
              showPercentage
              showTimeRemaining
              estimatedTime={3}
              message='Loading example content...'
              tips={loadingTips.general}
              color='primary'
            />
            <Button variant='contained' onClick={() => progressSimulation.reset()} sx={{ mt: 2 }}>
              Restart Animation
            </Button>
          </Box>
        </Paper>

        {/* Voxel Loader Showcase */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            Voxel Loader Showcase
          </Typography>
          <Typography variant='body2' color='text.secondary' paragraph>
            A 3D voxel-building animation that represents the engine's voxel-based nature.
          </Typography>

          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={12} md={4}>
              <Typography variant='h6' gutterBottom>
                Small
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VoxelLoader size='small' indeterminate showPercentage={false} showTips={false} />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant='h6' gutterBottom>
                Medium with Progress
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VoxelLoader
                  size='medium'
                  progress={progressSimulation.progress}
                  indeterminate={false}
                  showPercentage
                  showTips={false}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant='h6' gutterBottom>
                Large with Tips
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VoxelLoader
                  size='large'
                  indeterminate
                  showPercentage={false}
                  showTips
                  tips={loadingConfig.tips.voxel}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Skeleton Loaders */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            Skeleton Loaders
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' gutterBottom>
                Text Skeleton
              </Typography>
              <SkeletonLoader variant='text' count={3} animation='wave' />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' gutterBottom>
                Card Skeleton
              </Typography>
              <SkeletonLoader variant='card' animation='pulse' />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                Image Skeleton
              </Typography>
              <SkeletonLoader variant='image' height={200} animation='shimmer' />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                Table Skeleton
              </Typography>
              <SkeletonLoader variant='table' animation='wave' />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                List Skeleton
              </Typography>
              <SkeletonLoader variant='list' count={3} animation='pulse' />
            </Grid>
          </Grid>
        </Paper>

        {/* Loading Dots */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            Voxel Loading Dots
          </Typography>

          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={4}>
              <Typography variant='subtitle2' gutterBottom>
                Small
              </Typography>
              <LoadingDots size='small' />
            </Grid>
            <Grid item xs={4}>
              <Typography variant='subtitle2' gutterBottom>
                Medium
              </Typography>
              <LoadingDots size='medium' />
            </Grid>
            <Grid item xs={4}>
              <Typography variant='subtitle2' gutterBottom>
                Large
              </Typography>
              <LoadingDots size='large' />
            </Grid>
          </Grid>
        </Paper>

        {/* Loading Overlay */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            Loading Overlay
          </Typography>

          <FormControl fullWidth sx={{ mb: 2, maxWidth: 300 }}>
            <InputLabel>Overlay Variant</InputLabel>
            <Select
              value={overlayVariant}
              label='Overlay Variant'
              onChange={e => setOverlayVariant(e.target.value as any)}
            >
              <MenuItem value='full'>Full Screen</MenuItem>
              <MenuItem value='inline'>Inline</MenuItem>
              <MenuItem value='minimal'>Minimal</MenuItem>
            </Select>
          </FormControl>

          <Button variant='contained' onClick={handleOverlayDemo}>
            Show Loading Overlay
          </Button>

          <Box sx={{ position: 'relative', minHeight: 200, mt: 2 }}>
            <LoadingOverlay
              isLoading={showOverlay}
              progress={progressSimulation.progress}
              message='Loading overlay demonstration...'
              variant={overlayVariant}
              tips={loadingTips.general}
              showProgress
              blur={overlayVariant !== 'minimal'}
            />
          </Box>
        </Paper>

        {/* Lazy Image Loading */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            Enhanced Image Loading
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' gutterBottom>
                With Shimmer Effect
              </Typography>
              <LazyImage
                src='https://picsum.photos/400/300'
                alt='Demo image with shimmer'
                width='100%'
                height={300}
                borderRadius={2}
                animate
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' gutterBottom>
                With Placeholder
              </Typography>
              <LazyImage
                src='https://picsum.photos/401/301'
                alt='Demo image with placeholder'
                placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23333' width='400' height='300'/%3E%3C/svg%3E"
                width='100%'
                height={300}
                borderRadius={2}
                animate
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Loading State Hook Demo */}
        <Paper sx={{ p: 4 }}>
          <Typography variant='h4' gutterBottom>
            Loading State Management
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary' paragraph>
              Current State: {loadingState.isLoading ? 'Loading' : 'Idle'}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              Progress: {loadingState.progress}%
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              Message: {loadingState.message}
            </Typography>
          </Box>

          <LoadingProgress
            variant='linear'
            progress={loadingState.progress}
            indeterminate={loadingState.isLoading && loadingState.progress === 0}
            message={loadingState.message}
            showPercentage
            size='medium'
            color={loadingState.hasError ? 'error' : 'primary'}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant='contained'
              onClick={handleSimulateLoading}
              disabled={loadingState.isLoading}
            >
              Simulate Loading
            </Button>
            <Button
              variant='outlined'
              onClick={() => loadingState.error(new Error('Simulated error'))}
              disabled={loadingState.isLoading}
            >
              Simulate Error
            </Button>
            <Button variant='outlined' onClick={() => loadingState.reset()}>
              Reset
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoadingDemo;
