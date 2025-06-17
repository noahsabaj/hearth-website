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
import CodeBlock from '../components/CodeBlock';

const Documentation: React.FC = () => {
  const sections = [
    { title: 'Getting Started', id: 'getting-started' },
    { title: 'Installation', id: 'installation' },
    { title: 'Basic Usage', id: 'basic-usage' },
    { title: 'Core Concepts', id: 'core-concepts' },
    { title: 'Cargo Commands', id: 'cargo-commands' },
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
                  <ListItem 
                    key={section.id} 
                    component="button"
                    onClick={() => {
                      const element = document.getElementById(section.id);
                      if (element) {
                        const headerHeight = 80; // AppBar height + some padding
                        const elementPosition = element.offsetTop - headerHeight;
                        window.scrollTo({
                          top: elementPosition,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
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

              <Box id="installation" sx={{ mb: 6 }}>
                <Typography variant="h3" gutterBottom>
                  Installation
                </Typography>
                <Typography variant="body1" paragraph>
                  Add Hearth Engine to your project's dependencies:
                </Typography>
                <CodeBlock language="toml">
{`# Cargo.toml
[dependencies]
hearth-engine = "0.35"`}
                </CodeBlock>
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

              <Box id="cargo-commands" sx={{ mb: 6 }}>
                <Typography variant="h3" gutterBottom>
                  Cargo Commands Reference
                </Typography>
                <Typography variant="body1" paragraph>
                  Cargo is Rust's build system and package manager. Here's a comprehensive guide
                  to Cargo commands you'll use when developing with Hearth Engine.
                </Typography>

                <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                  Essential Daily Commands
                </Typography>
                <CodeBlock language="bash">
{`cargo check      # Quick syntax/type check (no compilation)
cargo build      # Compile in debug mode
cargo run        # Build and run the default binary
cargo test       # Run all tests
cargo clippy     # Run linter for code quality
cargo fmt        # Auto-format code`}
                </CodeBlock>

                <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                  Build & Run Commands
                </Typography>
                <CodeBlock language="bash">
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

                <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                  Testing & Debugging
                </Typography>
                <CodeBlock language="bash">
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

                <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                  Package Management
                </Typography>
                <CodeBlock language="bash">
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

                <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                  Performance Analysis
                </Typography>
                <CodeBlock language="bash">
{`# Profiling (requires additional tools)
cargo flamegraph         # CPU profiling visualization
cargo bloat              # Analyze binary size
cargo asm <function>     # Show assembly code

# Development workflow
cargo watch -x check     # Auto-check on file changes
cargo watch -x test      # Auto-test on file changes
cargo watch -x run       # Auto-run on file changes`}
                </CodeBlock>

                <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                  Hearth Engine Specific Workflow
                </Typography>
                <CodeBlock language="bash">
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

                <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
                  Pro Tips
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Use cargo check frequently" 
                      secondary="It's 10x faster than cargo build for catching errors"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Run cargo clippy before commits" 
                      secondary="Catches common mistakes and suggests improvements"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Use --release for performance testing" 
                      secondary="Debug builds can be 100x slower than release builds"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Install cargo-watch" 
                      secondary="Greatly improves development experience with auto-rebuilds"
                    />
                  </ListItem>
                </List>

                <Typography variant="body1" paragraph sx={{ mt: 3 }}>
                  For a complete reference guide with advanced commands and troubleshooting, see the{' '}
                  <a 
                    href="https://github.com/noahsabaj/hearth-engine/blob/main/docs/guides/CARGO_COMMANDS_GUIDE.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ff4500', textDecoration: 'none' }}
                  >
                    full Cargo Commands Guide
                  </a>{' '}
                  in the engine documentation.
                </Typography>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box id="api-reference" sx={{ mb: 6 }}>
                <Typography variant="h3" gutterBottom>
                  API Reference
                </Typography>
                <Typography variant="body1" paragraph>
                  For detailed API documentation, see the{' '}
                  <a 
                    href="https://docs.rs/hearth-engine"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ff4500', textDecoration: 'none' }}
                  >
                    docs.rs page
                  </a>{' '}
                  or browse the source code on{' '}
                  <a 
                    href="https://github.com/noahsabaj/hearth-engine"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ff4500', textDecoration: 'none' }}
                  >
                    GitHub
                  </a>.
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