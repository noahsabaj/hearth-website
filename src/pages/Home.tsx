import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import {
  GitHub,
  Download,
  MenuBook,
  Speed,
  Terrain,
  Build,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
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
          <Button color="inherit" component={Link} to="/docs" startIcon={<MenuBook />}>
            Docs
          </Button>
          <Button color="inherit" component={Link} to="/downloads" startIcon={<Download />}>
            Downloads
          </Button>
          <IconButton color="inherit" href="https://github.com/noahsabaj/hearth-engine" target="_blank">
            <GitHub />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          pt: 8,
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  background: 'linear-gradient(135deg, #ff4500 0%, #ff6b35 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Hearth Engine
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
                Build worlds that feel real. Destroy them too.
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.7)' }}>
                A next-generation voxel engine with true physics simulation. 
                Every block has weight, heat, and purpose. Create emergent gameplay 
                from simple rules. Push the boundaries of what's possible.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/downloads"
                  startIcon={<Download />}
                >
                  Download v0.35
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/docs"
                  startIcon={<MenuBook />}
                >
                  Get Started
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={24}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: '#111',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    background: '#111',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <img 
                    src="/hearth-website/logo.png" 
                    alt="Hearth Engine Logo" 
                    style={{ 
                      width: 200, 
                      height: 200, 
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 40px #ff4500)',
                    }} 
                  />
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    display: 'flex', 
                    gap: 2,
                    width: '100%',
                    justifyContent: 'center',
                  }}>
                    <Chip label="60+ FPS" color="primary" />
                    <Chip label="1M+ Voxels" color="primary" />
                    <Chip label="Real Physics" color="primary" />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, background: '#1a1a1a' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ mb: 6 }}>
            Built for the Future
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: '#222' }}>
                <CardContent>
                  <Speed sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Blazing Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    GPU-first architecture with data-oriented design achieves 60+ FPS 
                    with millions of voxels. No compromises on scale or detail.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: '#222' }}>
                <CardContent>
                  <Terrain sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    True Voxel Physics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Every voxel simulates realistic physics - thermal, fluid, acoustic, 
                    and structural properties. Watch worlds come alive.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: '#222' }}>
                <CardContent>
                  <Build sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Emergent Gameplay
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complex behaviors emerge from simple rules. Build cities, 
                    destroy mountains, reshape worlds. Your imagination is the limit.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom>
            Ready to Build Something Amazing?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Join the growing community of developers pushing the boundaries of voxel gaming.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              href="https://github.com/noahsabaj/hearth-engine"
              target="_blank"
              startIcon={<GitHub />}
            >
              View on GitHub
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="https://discord.gg/hearth"
              target="_blank"
            >
              Join Discord
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Container>
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 Hearth Engine. Built with 🔥 in Rust.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;