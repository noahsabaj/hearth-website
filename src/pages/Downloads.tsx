import { Computer, Apple, Window, Refresh, Warning } from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Grid,
} from '@mui/material';
import React, { useState, useEffect, memo } from 'react';

import DownloadButton from '../components/DownloadButton';
import EditOnGitHub from '../components/EditOnGitHub';
import LoadingProgress from '../components/LoadingProgress';
import NavigationBar from '../components/NavigationBar';
import ReadingTime from '../components/ReadingTime';
import SkeletonLoader from '../components/SkeletonLoader';

/**
 * Interface for GitHub release data
 */
interface Release {
  /** Git tag name for the release */
  tag_name: string;
  /** Human-readable release name */
  name: string;
  /** ISO date string when release was published */
  published_at: string;
  /** Release notes/description in markdown */
  body: string;
  /** Array of downloadable assets */
  assets: {
    /** Asset filename */
    name: string;
    /** Direct download URL */
    browser_download_url: string;
    /** File size in bytes */
    size: number;
  }[];
}

/**
 * Downloads page component - Displays latest Hearth Engine releases
 *
 * Features:
 * - Fetches release data from GitHub API
 * - Platform-specific download detection
 * - Error handling with retry functionality
 * - Loading states and skeleton placeholders
 * - Formatted release notes and file sizes
 * - Responsive grid layout
 *
 * @returns Downloads page with release listings and download links
 */
const Downloads: React.FC = memo(() => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Connecting to GitHub...');

  const fetchReleases = async () => {
    const startTime = Date.now();

    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingMessage('Connecting to GitHub...');

      // Add timeout for better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Simulate progress for connection
      setLoadingProgress(20);
      setLoadingMessage('Fetching latest releases...');

      const response = await fetch(
        'https://api.github.com/repos/noahsabaj/hearth-engine/releases',
        {
          signal: controller.signal,
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setLoadingProgress(50);
      setLoadingMessage('Processing release data...');

      const data = await response.json();

      setLoadingProgress(80);
      setLoadingMessage('Finalizing...');

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setReleases(data.slice(0, 3)); // Show only latest 3 releases
      setRetryCount(0);
      setLoadingProgress(100);
      setLoadingMessage('Complete!');

      // Brief delay to show completion
      setTimeout(() => setLoading(false), 300);
    } catch (err) {
      console.error('Failed to fetch releases:', err);
      let errorMessage = 'Failed to fetch releases';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (err.message.includes('HTTP error')) {
          errorMessage = `GitHub API error: ${err.message}`;
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      // Ensure minimum loading time for better perceived performance
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 500; // 500ms minimum loading time

      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchReleases();
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const getOSIcon = (filename: string) => {
    if (filename.includes('windows')) return <Window />;
    if (filename.includes('macos')) return <Apple />;
    return <Computer />; // Linux
  };

  return (
    <Box component='main' role='main'>
      {/* Navigation */}
      <NavigationBar variant='downloads' />

      <Container maxWidth='lg' sx={{ mt: 10, pb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant='h1' gutterBottom component='h1' id='main-content' sx={{ mb: 0 }}>
            Downloads
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <EditOnGitHub filePath='src/pages/Downloads.tsx' />
        </Box>
        <Typography variant='body1' color='text.secondary' paragraph>
          Download the latest version of Hearth Engine for your platform. All releases include the
          core engine, examples, and documentation.
        </Typography>

        {/* Quick Download Section */}
        <Paper
          sx={{ p: 4, mb: 6, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}
        >
          <Typography variant='h4' gutterBottom component='h2' id='quick-install-heading'>
            Quick Install
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' gutterBottom component='h3'>
                Using Cargo (Recommended)
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#0a0a0a' }}>
                <Typography variant='body2' component='pre' sx={{ fontFamily: 'monospace' }}>
                  cargo install hearth-engine
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' gutterBottom component='h3'>
                From Source
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#0a0a0a' }}>
                <Typography variant='body2' component='pre' sx={{ fontFamily: 'monospace' }}>
                  {`git clone https://github.com/noahsabaj/hearth-engine
cd hearth-engine
cargo build --release`}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* Releases Section */}
        <Typography variant='h4' gutterBottom sx={{ mt: 6, mb: 3 }}>
          Binary Releases
        </Typography>

        {error && (
          <Alert
            severity='error'
            sx={{
              mb: 3,
              '& .MuiAlert-message': { width: '100%' },
            }}
            action={
              <Button
                color='inherit'
                size='small'
                onClick={handleRetry}
                startIcon={<Refresh />}
                disabled={loading}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {retryCount > 0 ? `Retry (${retryCount})` : 'Retry'}
              </Button>
            }
            icon={<Warning />}
          >
            <Box>
              <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                Unable to load releases
              </Typography>
              <Typography variant='body2'>{error}</Typography>
              {retryCount > 2 && (
                <Typography variant='body2' sx={{ mt: 1, fontStyle: 'italic' }}>
                  Having trouble? Try refreshing the page or check your internet connection.
                </Typography>
              )}
            </Box>
          </Alert>
        )}

        {loading && (
          <Box sx={{ mt: 3 }}>
            <LoadingProgress
              variant='linear'
              progress={loadingProgress}
              indeterminate={loadingProgress === 0}
              showPercentage
              showTimeRemaining
              estimatedTime={3}
              message={loadingMessage}
              tips={[
                'Hearth Engine uses Vulkan for high-performance graphics',
                'Check out our documentation for getting started guides',
                'Join our community Discord for support and updates',
                'All releases include example projects to help you begin',
                'Our engine supports both 2D and 3D voxel games',
              ]}
              tipInterval={3000}
              color='primary'
              size='medium'
              sx={{ mb: 4 }}
            />
            <SkeletonLoader variant='release' count={3} animation='wave' />
          </Box>
        )}

        {!loading && !error && releases.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant='body1' color='text.secondary'>
              No releases available yet. Please build from source using the instructions above.
            </Typography>
          </Paper>
        )}

        {releases.map((release, index) => (
          <Card
            key={release.tag_name}
            sx={{
              mb: 3,
              bgcolor: index === 0 ? '#1a1a1a' : '#0a0a0a',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow:
                  index === 0
                    ? '0 16px 32px rgba(255, 69, 0, 0.3)'
                    : '0 16px 32px rgba(0, 0, 0, 0.5)',
                bgcolor: index === 0 ? '#2a2a2a' : '#1a1a1a',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant='h5' sx={{ flexGrow: 1 }}>
                  {release.name || release.tag_name}
                </Typography>
                <ReadingTime text={release.body || 'Release notes and download information'} />
                {index === 0 && <Chip label='Latest' color='primary' size='small' />}
              </Box>
              <Typography variant='body2' color='text.secondary' paragraph>
                Released on {new Date(release.published_at).toLocaleDateString()}
              </Typography>
              <Typography variant='body2' paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {release.body.split('\n').slice(0, 3).join('\n')}...
              </Typography>

              {release.assets.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {release.assets.map(asset => (
                    <Grid item xs={12} sm={6} md={4} key={asset.name}>
                      <DownloadButton
                        url={asset.browser_download_url}
                        filename={asset.name}
                        size={asset.size}
                        icon={getOSIcon(asset.name)}
                        onDownloadStart={() => console.log(`Downloading ${asset.name}...`)}
                        onDownloadComplete={() =>
                          console.log(`Downloaded ${asset.name} successfully!`)
                        }
                        onDownloadError={error =>
                          console.error(`Failed to download ${asset.name}:`, error)
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
            <CardActions>
              <Button
                size='small'
                href={`https://github.com/noahsabaj/hearth-engine/releases/tag/${release.tag_name}`}
                target='_blank'
              >
                View Release Notes
              </Button>
            </CardActions>
          </Card>
        ))}

        {/* System Requirements */}
        <Paper sx={{ p: 4, mt: 6 }}>
          <Typography variant='h4' gutterBottom>
            System Requirements
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' gutterBottom>
                Minimum
              </Typography>
              <Typography variant='body2' component='ul'>
                <li>OS: Windows 10, macOS 10.15, or Linux (Ubuntu 20.04+)</li>
                <li>Processor: Dual-core 2.5 GHz</li>
                <li>Memory: 4 GB RAM</li>
                <li>Graphics: GPU with Vulkan 1.2 support</li>
                <li>Storage: 500 MB available space</li>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' gutterBottom>
                Recommended
              </Typography>
              <Typography variant='body2' component='ul'>
                <li>OS: Latest version of Windows, macOS, or Linux</li>
                <li>Processor: Quad-core 3.5 GHz</li>
                <li>Memory: 16 GB RAM</li>
                <li>Graphics: GTX 1060 / RX 580 or better</li>
                <li>Storage: 2 GB available space</li>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
});

Downloads.displayName = 'Downloads';

export default Downloads;
