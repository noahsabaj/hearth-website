import { Home, Search, ArrowBack } from '@mui/icons-material';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AnimatedSection } from '../components/PageTransition';

const NotFound: React.FC = memo(() => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Container maxWidth='md'>
        <AnimatedSection delay={0.2}>
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'rgba(30, 30, 30, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 69, 0, 0.2)',
              borderRadius: 3,
            }}
          >
            <Typography
              variant='h1'
              sx={{
                fontSize: { xs: '6rem', md: '8rem' },
                fontWeight: 900,
                background: 'linear-gradient(45deg, #ff4500 30%, #ff6b35 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              404
            </Typography>

            <Typography variant='h4' gutterBottom sx={{ color: '#fff', mb: 2 }}>
              Page Not Found
            </Typography>

            <Typography variant='body1' color='text.secondary' paragraph sx={{ mb: 4 }}>
              The page you're looking for doesn't exist or has been moved. Don't worry, even the
              best engines sometimes take a wrong turn!
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <Button
                component={Link}
                to='/'
                variant='contained'
                startIcon={<Home />}
                sx={{
                  bgcolor: '#ff4500',
                  px: 3,
                  py: 1,
                  '&:hover': { bgcolor: '#ff6b35' },
                }}
              >
                Go Home
              </Button>

              <Button
                onClick={handleGoBack}
                variant='outlined'
                startIcon={<ArrowBack />}
                sx={{
                  borderColor: '#ff4500',
                  color: '#ff4500',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    borderColor: '#ff6b35',
                    color: '#ff6b35',
                    bgcolor: 'rgba(255, 69, 0, 0.1)',
                  },
                }}
              >
                Go Back
              </Button>

              <Button
                component={Link}
                to='/docs'
                variant='text'
                startIcon={<Search />}
                sx={{
                  color: '#ff4500',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    color: '#ff6b35',
                    bgcolor: 'rgba(255, 69, 0, 0.1)',
                  },
                }}
              >
                Browse Docs
              </Button>
            </Box>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
              <Typography variant='h6' gutterBottom sx={{ color: '#ff4500' }}>
                Looking for something specific?
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                •{' '}
                <Link to='/' style={{ color: '#ff4500', textDecoration: 'none' }}>
                  Home
                </Link>{' '}
                - Main page with engine overview
                <br />•{' '}
                <Link to='/docs' style={{ color: '#ff4500', textDecoration: 'none' }}>
                  Documentation
                </Link>{' '}
                - Getting started and API reference
                <br />•{' '}
                <Link to='/downloads' style={{ color: '#ff4500', textDecoration: 'none' }}>
                  Downloads
                </Link>{' '}
                - Latest releases and installers
              </Typography>
            </Box>
          </Paper>
        </AnimatedSection>
      </Container>
    </Box>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
