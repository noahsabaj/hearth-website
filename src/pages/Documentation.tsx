import { GitHub, Home, Download } from '@mui/icons-material';
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
  LinearProgress,
} from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import CodeBlock from '../components/CodeBlock';
import ReadingTime from '../components/ReadingTime';

const Documentation: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = useMemo(
    () => [
      { title: 'Getting Started', id: 'getting-started' },
      { title: 'Installation', id: 'installation' },
      { title: 'Basic Usage', id: 'basic-usage' },
      { title: 'Core Concepts', id: 'core-concepts' },
      { title: 'Cargo Commands', id: 'cargo-commands' },
      { title: 'API Reference', id: 'api-reference' },
    ],
    []
  );

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Calculate scroll progress - more responsive
          const scrollTop = window.pageYOffset;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = Math.min((scrollTop / docHeight) * 100, 100);
          setScrollProgress(progress);

          // Find active section with better detection
          const sectionElements = sections.map(section => ({
            id: section.id,
            element: document.getElementById(section.id),
          }));

          const headerOffset = 120;
          const isAtBottom =
            window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 10;

          if (isAtBottom && sections.length > 0) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) {
              setActiveSection(lastSection.id);
            }
          } else {
            // Find the section currently in view
            let currentSection = sectionElements.find(({ element }) => {
              if (!element) return false;
              const rect = element.getBoundingClientRect();
              return rect.top <= headerOffset && rect.bottom > headerOffset;
            });

            // Fallback: find the last section that has passed the threshold
            if (!currentSection) {
              const visibleSections = sectionElements
                .filter(
                  ({ element }) => element && element.getBoundingClientRect().top <= headerOffset
                )
                .reverse();

              if (visibleSections.length > 0) {
                currentSection = visibleSections[0];
              }
            }

            if (currentSection) {
              setActiveSection(currentSection.id);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Call once to set initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <Box component='main' role='main'>
      {/* Navigation */}
      <AppBar
        position='fixed'
        sx={{ background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(10px)' }}
        component='nav'
        role='navigation'
        aria-label='Main navigation'
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img
              src={`/hearth-website/logo.png?v=${Date.now()}`}
              alt='Hearth Engine - Next-generation voxel game engine logo'
              style={{ height: 40, marginRight: 12, backgroundColor: 'transparent' }}
            />
            <Typography variant='h6' sx={{ fontWeight: 700 }} component='div'>
              Hearth Engine
            </Typography>
          </Box>
          <Box component='nav' role='navigation' aria-label='Page navigation'>
            <Button
              color='inherit'
              component={Link}
              to='/'
              startIcon={<Home aria-hidden='true' />}
              aria-label='Go to home page'
            >
              Home
            </Button>
            <Button
              color='inherit'
              component={Link}
              to='/downloads'
              startIcon={<Download aria-hidden='true' />}
              aria-label='Go to downloads page'
            >
              Downloads
            </Button>
            <IconButton
              color='inherit'
              href='https://github.com/noahsabaj/hearth-engine'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='View Hearth Engine on GitHub (opens in new tab)'
            >
              <GitHub />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Reading Progress Bar */}
      <LinearProgress
        variant='determinate'
        value={scrollProgress}
        aria-label={`Reading progress: ${Math.round(scrollProgress)}% complete`}
        sx={{
          position: 'fixed',
          top: 64, // Below AppBar
          left: 0,
          right: 0,
          zIndex: 1200,
          height: 3,
          backgroundColor: 'transparent',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#ff4500',
          },
        }}
      />

      <Container maxWidth='lg' sx={{ mt: 10 }}>
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper
              component='nav'
              role='navigation'
              aria-label='Documentation sections'
              sx={{ p: 2, position: 'sticky', top: 80 }}
            >
              <Typography variant='h6' gutterBottom component='h2'>
                Documentation
              </Typography>
              <List role='list'>
                {sections.map(section => (
                  <ListItem
                    key={section.id}
                    component='button'
                    onClick={() => {
                      const element = document.getElementById(section.id);
                      if (element) {
                        const headerHeight = 80; // AppBar height + some padding
                        const elementPosition = element.offsetTop - headerHeight;
                        window.scrollTo({
                          top: elementPosition,
                          behavior: 'smooth',
                        });
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 1,
                      mb: 0.5,
                      transition: 'all 0.2s ease',
                      backgroundColor:
                        activeSection === section.id ? 'rgba(255, 69, 0, 0.1)' : 'transparent',
                      borderLeft:
                        activeSection === section.id
                          ? '3px solid #ff4500'
                          : '3px solid transparent',
                      '&:hover': {
                        backgroundColor:
                          activeSection === section.id
                            ? 'rgba(255, 69, 0, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={section.title}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: activeSection === section.id ? 600 : 400,
                          color:
                            activeSection === section.id ? '#ff4500' : 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Box component='article' role='main' id='main-content' sx={{ pb: 6 }}>
              <Typography variant='h1' gutterBottom component='h1'>
                Hearth Engine Documentation
              </Typography>
              <Typography variant='body1' color='text.secondary' paragraph>
                Welcome to the Hearth Engine documentation. This guide will help you get started
                with building voxel-based games using our powerful physics engine.
              </Typography>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='getting-started'
                aria-labelledby='getting-started-heading'
                sx={{ mb: 6 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant='h3' id='getting-started-heading' component='h2'>
                    Getting Started
                  </Typography>
                  <ReadingTime text='Hearth Engine is a next-generation voxel game engine built with Rust. It provides a data-oriented, GPU-first architecture for creating games with realistic physics and emergent gameplay. Quick example use hearth_engine Engine Game World struct MyGame impl Game for MyGame fn init mut self world mut World world set_render_distance sixteen fn update mut self world mut World input Input dt f32 Game logic here fn main let mut engine Engine new engine run MyGame This demonstrates basic structure for creating game with Hearth Engine including Game trait implementation world initialization and main engine loop setup. The Engine struct provides core functionality while Game trait defines your application behavior.' />
                </Box>
                <Typography variant='body1' paragraph>
                  Hearth Engine is a next-generation voxel game engine built with Rust. It provides
                  a data-oriented, GPU-first architecture for creating games with realistic physics
                  and emergent gameplay.
                </Typography>
                <CodeBlock>
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
                </CodeBlock>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='installation'
                aria-labelledby='installation-heading'
                sx={{ mb: 6 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant='h3' id='installation-heading' component='h2'>
                    Installation
                  </Typography>
                  <ReadingTime text='Installation guide for Hearth Engine. Add Hearth Engine to your project dependencies Cargo.toml dependencies hearth-engine version zero point thirty five Make sure you have Rust installed one point seventy plus. The engine requires GPU with Vulkan DirectX twelve or Metal support for hardware acceleration and graphics rendering. Cross platform compatibility across Windows macOS and Linux distributions with proper graphics drivers installed.' />
                </Box>
                <Typography variant='body1' paragraph>
                  Add Hearth Engine to your project's dependencies:
                </Typography>
                <CodeBlock language='toml'>
                  {`# Cargo.toml
[dependencies]
hearth-engine = "0.35"`}
                </CodeBlock>
                <Typography variant='body1' paragraph>
                  Make sure you have Rust 1.70+ installed. The engine requires a GPU with Vulkan,
                  DirectX 12, or Metal support.
                </Typography>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='basic-usage'
                aria-labelledby='basic-usage-heading'
                sx={{ mb: 6 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant='h3' id='basic-usage-heading' component='h2'>
                    Basic Usage
                  </Typography>
                  <ReadingTime text='Creating simple voxel world with Hearth Engine is straightforward. Create world with terrain generation world generate_terrain TerrainParams seed forty two scale zero point one octaves four Place voxel world set_voxel vec3 ten twenty thirty VoxelType Stone Apply physics simulation world simulate_physics dt. This covers world creation voxel placement and physics simulation basics for getting started with voxel manipulation and terrain generation in your games.' />
                </Box>
                <Typography variant='body1' paragraph>
                  Creating a simple voxel world with Hearth Engine is straightforward:
                </Typography>
                <CodeBlock>
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
                </CodeBlock>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='core-concepts'
                aria-labelledby='core-concepts-heading'
                sx={{ mb: 6 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant='h3' id='core-concepts-heading' component='h2'>
                    Core Concepts
                  </Typography>
                  <ReadingTime text='Core Concepts Data Oriented Design Hearth Engine follows strict data-oriented programming principles All data lives in shared buffers and systems are stateless kernels that transform data GPU First Architecture Computations are performed on GPU whenever possible allowing for massive parallelization and scale. This architectural approach enables high performance voxel simulation with millions of blocks processed simultaneously using modern graphics hardware acceleration techniques.' />
                </Box>
                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  Data-Oriented Design
                </Typography>
                <Typography variant='body1' paragraph>
                  Hearth Engine follows strict data-oriented programming principles. All data lives
                  in shared buffers, and systems are stateless kernels that transform data.
                </Typography>
                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  GPU-First Architecture
                </Typography>
                <Typography variant='body1' paragraph>
                  Computations are performed on the GPU whenever possible, allowing for massive
                  parallelization and scale.
                </Typography>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='cargo-commands'
                aria-labelledby='cargo-commands-heading'
                sx={{ mb: 6 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant='h3' id='cargo-commands-heading' component='h2'>
                    Cargo Commands Reference
                  </Typography>
                  <ReadingTime text='Cargo is Rust build system and package manager comprehensive guide to Cargo commands you will use when developing with Hearth Engine Essential Daily Commands cargo check cargo build cargo run cargo test cargo clippy cargo fmt Build Run Commands cargo build release cargo clean cargo run bin example args Testing Debugging cargo test pattern nocapture bench cargo check clippy fmt tree audit outdated Package Management cargo add crate version features remove update search doc open Performance Analysis cargo flamegraph bloat asm watch Development workflow cargo check test run Hearth Engine Specific Workflow cargo build features vulkan debug-ui profiler. This section covers all essential Cargo commands for Rust development including building testing debugging package management performance analysis and Hearth Engine specific workflows with feature flags and optimization techniques for game development.' />
                </Box>
                <Typography variant='body1' paragraph>
                  Cargo is Rust's build system and package manager. Here's a comprehensive guide to
                  Cargo commands you'll use when developing with Hearth Engine.
                </Typography>

                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  Essential Daily Commands
                </Typography>
                <CodeBlock language='bash'>
                  {`cargo check      # Quick syntax/type check (no compilation)
cargo build      # Compile in debug mode
cargo run        # Build and run the default binary
cargo test       # Run all tests
cargo clippy     # Run linter for code quality
cargo fmt        # Auto-format code`}
                </CodeBlock>

                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  Build & Run Commands
                </Typography>
                <CodeBlock language='bash'>
                  {`# Building
cargo build              # Debug build (fast compile, slow runtime)
cargo build --release    # Release build (slow compile, fast runtime)
cargo clean              # Remove build artifacts

# Running
cargo run                      # Run default binary
cargo run --bin <name>         # Run specific binary
cargo run --example <name>     # Run example
cargo run -- <args>            # Pass arguments to program
cargo run --release            # Run optimized version`}
                </CodeBlock>

                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  Testing & Debugging
                </Typography>
                <CodeBlock language='bash'>
                  {`# Testing
cargo test                     # Run all tests
cargo test <pattern>           # Run tests matching pattern
cargo test -- --nocapture      # Show println! output
cargo test --release           # Test in release mode
cargo bench                    # Run benchmarks

# Debugging & Inspection
cargo check              # Fast syntax check
cargo clippy             # Advanced linting
cargo fmt                # Format code
cargo tree               # Show dependency tree
cargo audit              # Security vulnerability check
cargo outdated           # Check for updates`}
                </CodeBlock>

                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  Package Management
                </Typography>
                <CodeBlock language='bash'>
                  {`# Dependencies
cargo add <crate>              # Add dependency
cargo add <crate>@<version>    # Add specific version
cargo add <crate> --features "feat1,feat2"
cargo remove <crate>           # Remove dependency
cargo update                   # Update all dependencies
cargo search <term>            # Search crates.io

# Documentation
cargo doc                # Generate docs
cargo doc --open         # Generate and open docs`}
                </CodeBlock>

                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  Performance Analysis
                </Typography>
                <CodeBlock language='bash'>
                  {`# Profiling (requires additional tools)
cargo flamegraph         # CPU profiling visualization
cargo bloat              # Analyze binary size
cargo asm <function>     # Show assembly code

# Development workflow
cargo watch -x check     # Auto-check on file changes
cargo watch -x test      # Auto-test on file changes
cargo watch -x run       # Auto-run on file changes`}
                </CodeBlock>

                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  Hearth Engine Specific Workflow
                </Typography>
                <CodeBlock language='bash'>
                  {`# Quick development cycle
cargo check && cargo clippy && cargo test

# Performance testing
cargo build --release && cargo run --release

# Before committing
cargo fmt && cargo clippy && cargo test

# Build with specific features
cargo build --features "vulkan"
cargo build --features "debug-ui,profiler"`}
                </CodeBlock>

                <Typography variant='h5' gutterBottom sx={{ mt: 3 }}>
                  Pro Tips
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary='Use cargo check frequently'
                      secondary="It's 10x faster than cargo build for catching errors"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Run cargo clippy before commits'
                      secondary='Catches common mistakes and suggests improvements'
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Use --release for performance testing'
                      secondary='Debug builds can be 100x slower than release builds'
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Install cargo-watch'
                      secondary='Greatly improves development experience with auto-rebuilds'
                    />
                  </ListItem>
                </List>

                <Typography variant='body1' paragraph sx={{ mt: 3 }}>
                  For a complete reference guide with advanced commands and troubleshooting, see the{' '}
                  <a
                    href='https://github.com/noahsabaj/hearth-engine/blob/main/docs/guides/CARGO_COMMANDS_GUIDE.md'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#ff4500', textDecoration: 'none' }}
                  >
                    full Cargo Commands Guide
                  </a>{' '}
                  in the engine documentation.
                </Typography>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='api-reference'
                aria-labelledby='api-reference-heading'
                sx={{ mb: 6 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant='h3' id='api-reference-heading' component='h2'>
                    API Reference
                  </Typography>
                  <ReadingTime text='For detailed API documentation see the docs rs page or browse the source code on GitHub repository for comprehensive function signatures type definitions and usage examples.' />
                </Box>
                <Typography variant='body1' paragraph>
                  For detailed API documentation, see the{' '}
                  <a
                    href='https://docs.rs/hearth-engine'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#ff4500', textDecoration: 'none' }}
                  >
                    docs.rs page
                  </a>{' '}
                  or browse the source code on{' '}
                  <a
                    href='https://github.com/noahsabaj/hearth-engine'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#ff4500', textDecoration: 'none' }}
                  >
                    GitHub
                  </a>
                  .
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
