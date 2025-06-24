import { GitHub, Download, MenuBook } from '@mui/icons-material';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import React, { memo } from 'react';
import { Link } from 'react-router-dom';

import { COLORS, SPACING, MISC } from '../constants';

const Footer: React.FC = memo(() => {
  return (
    <Box
      component='footer'
      role='contentinfo'
      sx={{
        py: SPACING.xxl / SPACING.unit, // 48 / 8 = 6
        borderTop: `1px solid ${COLORS.utils.border}`,
      }}
    >
      <Container>
        <Grid container spacing={4} justifyContent='center' sx={{ mb: SPACING.lg / SPACING.unit }}>
          <Grid item>
            <Button
              color='inherit'
              component='a'
              href={MISC.github.repoUrl}
              target='_blank'
              rel='noopener noreferrer'
              startIcon={<GitHub />}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { color: COLORS.primary.main },
              }}
            >
              GitHub
            </Button>
          </Grid>
          <Grid item>
            <Button
              color='inherit'
              component={Link}
              to='/docs'
              startIcon={<MenuBook />}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { color: COLORS.primary.main },
              }}
            >
              Documentation
            </Button>
          </Grid>
          <Grid item>
            <Button
              color='inherit'
              component={Link}
              to='/downloads'
              startIcon={<Download />}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { color: COLORS.primary.main },
              }}
            >
              Downloads
            </Button>
          </Grid>
        </Grid>
        <Typography variant='body2' color='text.secondary' align='center' component='p'>
          © 2025 Hearth Engine. Built with <span aria-label='fire'>🔥</span> in Rust.
        </Typography>
      </Container>
    </Box>
  );
});

Footer.displayName = 'Footer';

export default Footer;
