import { GitHub, Download, MenuBook, Speed, Terrain, Build } from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Chip,
  Grid,
  Tooltip,
} from '@mui/material';
import React, { memo } from 'react';
import { Link } from 'react-router-dom';

import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import ReadingTime from '../components/ReadingTime';
import SEO from '../components/SEO';
import { COLORS, MISC } from '../constants';

const Home: React.FC = memo(() => {
  return (
    <Box>
      <SEO
        title='Home'
        description='Hearth Engine - A powerful and flexible game engine for creating amazing gaming experiences. Build your dream games with our cross-platform engine.'
        keywords='hearth engine, game engine, game development, 3D engine, 2D engine, cross-platform, indie game development, game creation'
      />
      {/* Navigation */}
      <NavigationBar variant='home' />

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          pt: 8,
          background: `linear-gradient(180deg, ${COLORS.background.default} 0%, ${COLORS.background.paper} 100%)`,
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={6} alignItems='center'>
            <Grid item xs={12} md={6}>
              <Typography
                variant='h1'
                sx={{
                  background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: COLORS.utils.transparent,
                  mb: 2,
                }}
              >
                Hearth Engine
              </Typography>
              <Typography variant='h5' color='text.secondary' sx={{ mb: 3 }}>
                Build worlds that feel real. Destroy them too.
              </Typography>
              <Typography variant='body1' sx={{ mb: 4, color: COLORS.text.secondary }}>
                A next-generation voxel engine with true physics simulation. Every block has weight,
                heat, and purpose. Create emergent gameplay from simple rules. Push the boundaries
                of what&apos;s possible.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant='contained'
                  size='large'
                  component={Link}
                  to='/downloads'
                  startIcon={<Download />}
                >
                  Download Latest
                </Button>
                <Button
                  variant='outlined'
                  size='large'
                  component={Link}
                  to='/docs'
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
                  background: COLORS.background.overlayLight,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    background: 'transparent',
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
                    src='/hearth-website/logo.png'
                    alt='Hearth Engine Logo'
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: 'contain',
                      filter: `drop-shadow(0 0 40px ${COLORS.primary.main})`,
                      backgroundColor: 'transparent',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      display: 'flex',
                      gap: 2,
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    <Tooltip title='Maintains 60+ FPS even with millions of active voxels' arrow>
                      <Chip label='60+ FPS' color='primary' />
                    </Tooltip>
                    <Tooltip title='Handle 1M+ active voxels with efficient GPU processing' arrow>
                      <Chip label='1M+ Voxels' color='primary' />
                    </Tooltip>
                    <Tooltip
                      title='Per-voxel physics simulation including thermal, fluid, and structural dynamics'
                      arrow
                    >
                      <Chip label='Real Physics' color='primary' />
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, background: COLORS.background.paper }}>
        <Container maxWidth='lg'>
          <Typography variant='h2' align='center' sx={{ mb: 6 }}>
            Built for the Future
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  background: COLORS.background.elevated,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${COLORS.primary.main}33`,
                    background: COLORS.background.elevated,
                  },
                }}
              >
                <CardContent>
                  <Speed
                    sx={{
                      fontSize: 48,
                      color: 'primary.main',
                      mb: 2,
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant='h5'>Blazing Performance</Typography>
                    <ReadingTime text='GPU-first architecture with data-oriented design achieves 60+ FPS with millions of voxels. No compromises on scale or detail.' />
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    GPU-first architecture with data-oriented design achieves 60+ FPS with millions
                    of voxels. No compromises on scale or detail.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  background: COLORS.background.elevated,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${COLORS.primary.main}33`,
                    background: COLORS.background.elevated,
                  },
                }}
              >
                <CardContent>
                  <Terrain
                    sx={{
                      fontSize: 48,
                      color: 'primary.main',
                      mb: 2,
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant='h5'>True Voxel Physics</Typography>
                    <ReadingTime text='Every voxel simulates realistic physics - thermal, fluid, acoustic, and structural properties. Watch worlds come alive.' />
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    Every voxel simulates realistic physics - thermal, fluid, acoustic, and
                    structural properties. Watch worlds come alive.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  background: COLORS.background.elevated,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${COLORS.primary.main}33`,
                    background: COLORS.background.elevated,
                  },
                }}
              >
                <CardContent>
                  <Build
                    sx={{
                      fontSize: 48,
                      color: 'primary.main',
                      mb: 2,
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant='h5'>Emergent Gameplay</Typography>
                    <ReadingTime text='Complex behaviors emerge from simple rules. Build cities, destroy mountains, reshape worlds. Your imagination is the limit.' />
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    Complex behaviors emerge from simple rules. Build cities, destroy mountains,
                    reshape worlds. Your imagination is the limit.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Container maxWidth='md'>
          <Typography variant='h3' gutterBottom>
            Ready to Build Something Amazing?
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
            Join the growing community of developers pushing the boundaries of voxel gaming.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant='contained'
              size='large'
              href={MISC.github.repoUrl}
              target='_blank'
              startIcon={<GitHub />}
            >
              View on GitHub
            </Button>
            <Button
              variant='outlined'
              size='large'
              href='https://discord.gg/hearth'
              target='_blank'
            >
              Join Discord
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
});

Home.displayName = 'Home';

export default Home;
