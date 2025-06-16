import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  GitHub,
  Home,
  MenuBook,
  Download,
  Computer,
  Apple,
  Window,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  assets: {
    name: string;
    browser_download_url: string;
    size: number;
  }[];
}

const Downloads: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch releases from GitHub API
    fetch('https://api.github.com/repos/noahsabaj/hearth-engine/releases')
      .then((res) => res.json())
      .then((data) => {
        setReleases(data.slice(0, 3)); // Show only latest 3 releases
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch releases');
        setLoading(false);
      });
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getOSIcon = (filename: string) => {
    if (filename.includes('windows')) return <Window />;
    if (filename.includes('macos')) return <Apple />;
    return <Computer />; // Linux
  };

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="fixed" sx={{ background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src="/hearth-website/logo.png" alt="Hearth Engine" style={{ height: 40, marginRight: 12 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Hearth Engine
            </Typography>
          </Box>
          <Button color="inherit" component={Link} to="/" startIcon={<Home />}>
            Home
          </Button>
          <Button color="inherit" component={Link} to="/docs" startIcon={<MenuBook />}>
            Docs
          </Button>
          <IconButton color="inherit" href="https://github.com/noahsabaj/hearth-engine" target="_blank">
            <GitHub />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 10, pb: 6 }}>
        <Typography variant="h2" gutterBottom>
          Downloads
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Download the latest version of Hearth Engine for your platform. All releases include
          the core engine, examples, and documentation.
        </Typography>

        {/* Quick Download Section */}
        <Paper sx={{ p: 4, mb: 6, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}>
          <Typography variant="h4" gutterBottom>
            Quick Install
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Using Cargo (Recommended)
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#0a0a0a' }}>
                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                  cargo install hearth-engine
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                From Source
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#0a0a0a' }}>
                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
{`git clone https://github.com/noahsabaj/hearth-engine
cd hearth-engine
cargo build --release`}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* Releases Section */}
        <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
          Binary Releases
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && releases.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No releases available yet. Please build from source using the instructions above.
            </Typography>
          </Paper>
        )}

        {releases.map((release, index) => (
          <Card key={release.tag_name} sx={{ mb: 3, bgcolor: index === 0 ? '#1a1a1a' : '#0a0a0a' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>
                  {release.name || release.tag_name}
                </Typography>
                {index === 0 && <Chip label="Latest" color="primary" size="small" />}
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Released on {new Date(release.published_at).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {release.body.split('\n').slice(0, 3).join('\n')}...
              </Typography>
              
              {release.assets.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {release.assets.map((asset) => (
                    <Grid item xs={12} sm={6} md={4} key={asset.name}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={getOSIcon(asset.name)}
                        endIcon={<Download />}
                        href={asset.browser_download_url}
                        sx={{ justifyContent: 'space-between' }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="body2">{asset.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatBytes(asset.size)}
                          </Typography>
                        </Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
            <CardActions>
              <Button
                size="small"
                href={`https://github.com/noahsabaj/hearth-engine/releases/tag/${release.tag_name}`}
                target="_blank"
              >
                View Release Notes
              </Button>
            </CardActions>
          </Card>
        ))}

        {/* System Requirements */}
        <Paper sx={{ p: 4, mt: 6 }}>
          <Typography variant="h4" gutterBottom>
            System Requirements
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Minimum
              </Typography>
              <Typography variant="body2" component="ul">
                <li>OS: Windows 10, macOS 10.15, or Linux (Ubuntu 20.04+)</li>
                <li>Processor: Dual-core 2.5 GHz</li>
                <li>Memory: 4 GB RAM</li>
                <li>Graphics: GPU with Vulkan 1.2 support</li>
                <li>Storage: 500 MB available space</li>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Recommended
              </Typography>
              <Typography variant="body2" component="ul">
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
};

export default Downloads;