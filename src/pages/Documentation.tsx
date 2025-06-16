import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Grid,
} from '@mui/material';
import { GitHub, Home, Download } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Documentation: React.FC = () => {
  const sections = [
    { title: 'Getting Started', id: 'getting-started' },
    { title: 'Installation', id: 'installation' },
    { title: 'Basic Usage', id: 'basic-usage' },
    { title: 'Core Concepts', id: 'core-concepts' },
    { title: 'API Reference', id: 'api-reference' },
  ];

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="fixed" sx={{ background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src={`/hearth-website/logo.png?v=${Date.now()}`} alt="Hearth Engine" style={{ height: 40, marginRight: 12, backgroundColor: 'transparent' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Hearth Engine
            </Typography>
          </Box>
          <Button color="inherit" component={Link} to="/" startIcon={<Home />}>
            Home
          </Button>
          <Button color="inherit" component={Link} to="/downloads" startIcon={<Download />}>
            Downloads
          </Button>
          <IconButton color="inherit" href="https://github.com/noahsabaj/hearth-engine" target="_blank">
            <GitHub />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 80 }}>
              <Typography variant="h6" gutterBottom>
                Documentation
              </Typography>
              <List>
                {sections.map((section) => (
                  <ListItem key={section.id} component="a" href={`#${section.id}`}>
                    <ListItemText primary={section.title} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Box sx={{ pb: 6 }}>
              <Typography variant="h2" gutterBottom>
                Hearth Engine Documentation
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Welcome to the Hearth Engine documentation. This guide will help you get started
                with building voxel-based games using our powerful physics engine.
              </Typography>

              <Divider sx={{ my: 4 }} />

              <Box id="getting-started" sx={{ mb: 6 }}>
                <Typography variant="h3" gutterBottom>
                  Getting Started
                </Typography>
                <Typography variant="body1" paragraph>
                  Hearth Engine is a next-generation voxel game engine built with Rust. It provides
                  a data-oriented, GPU-first architecture for creating games with realistic physics
                  and emergent gameplay.
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#1a1a1a', my: 2 }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
{`// Quick example
use hearth_engine::{Engine, Game, World};

struct MyGame;

impl Game for MyGame {
    fn init(&mut self, world: &mut World) {
        world.set_render_distance(16);
    }
    
    fn update(&mut self, world: &mut World, input: &Input, dt: f32) {
        // Game logic here
    }
}

fn main() {
    let mut engine = Engine::new();
    engine.run(MyGame);
}`}
                  </Typography>
                </Paper>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box id="installation" sx={{ mb: 6 }}>
                <Typography variant="h3" gutterBottom>
                  Installation
                </Typography>
                <Typography variant="body1" paragraph>
                  Add Hearth Engine to your project's dependencies:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#1a1a1a', my: 2 }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
{`# Cargo.toml
[dependencies]
hearth-engine = "0.35"`}
                  </Typography>
                </Paper>
                <Typography variant="body1" paragraph>
                  Make sure you have Rust 1.70+ installed. The engine requires a GPU with 
                  Vulkan, DirectX 12, or Metal support.
                </Typography>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box id="basic-usage" sx={{ mb: 6 }}>
                <Typography variant="h3" gutterBottom>
                  Basic Usage
                </Typography>
                <Typography variant="body1" paragraph>
                  Creating a simple voxel world with Hearth Engine is straightforward:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#1a1a1a', my: 2 }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
{`// Create a world with terrain generation
world.generate_terrain(TerrainParams {
    seed: 42,
    scale: 0.1,
    octaves: 4,
});

// Place a voxel
world.set_voxel(vec3(10, 20, 30), VoxelType::Stone);

// Apply physics simulation
world.simulate_physics(dt);`}
                  </Typography>
                </Paper>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box id="core-concepts" sx={{ mb: 6 }}>
                <Typography variant="h3" gutterBottom>
                  Core Concepts
                </Typography>
                <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                  Data-Oriented Design
                </Typography>
                <Typography variant="body1" paragraph>
                  Hearth Engine follows strict data-oriented programming principles. All data
                  lives in shared buffers, and systems are stateless kernels that transform data.
                </Typography>
                <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                  GPU-First Architecture
                </Typography>
                <Typography variant="body1" paragraph>
                  Computations are performed on the GPU whenever possible, allowing for massive
                  parallelization and scale.
                </Typography>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box id="api-reference" sx={{ mb: 6 }}>
                <Typography variant="h3" gutterBottom>
                  API Reference
                </Typography>
                <Typography variant="body1" paragraph>
                  For detailed API documentation, see the{' '}
                  <Link to="https://docs.rs/hearth-engine">
                    docs.rs page
                  </Link>{' '}
                  or browse the source code on{' '}
                  <Link to="https://github.com/noahsabaj/hearth-engine">
                    GitHub
                  </Link>.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Documentation;