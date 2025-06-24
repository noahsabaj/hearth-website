import {
  Menu as MenuIcon,
  Close,
  ExpandMore,
  ExpandLess,
  Link as LinkIcon,
  KeyboardArrowUp,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  LinearProgress,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Collapse,
  Tooltip,
  Fade,
  Fab,
} from '@mui/material';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

import APIReferenceSearch from '../components/APIReferenceSearch';
import CodeBlock from '../components/CodeBlock';
import EditOnGitHub from '../components/EditOnGitHub';
import FeedbackWidget from '../components/FeedbackWidget';
import Footer from '../components/Footer';
import LastUpdated from '../components/LastUpdated';
import NavigationBar from '../components/NavigationBar';
import ReadingTime from '../components/ReadingTime';
import RelatedArticles from '../components/RelatedArticles';
import SEO from '../components/SEO';
import {
  COLORS,
  MISC,
  SPACING,
  ANIMATION,
  LAYOUT,
  Z_INDEX,
  LOADING,
  TYPOGRAPHY,
} from '../constants';
import { useKeyboardShortcutsContext } from '../contexts/KeyboardShortcutsContext';

// Last updated dates for each documentation section
// In a real application, these could be fetched from Git history or a CMS
const SECTION_UPDATES = {
  gettingStarted: new Date('2025-06-18T10:30:00'),
  installation: new Date('2025-06-18T14:45:00'),
  basicUsage: new Date('2025-06-18T09:15:00'),
  coreConcepts: new Date('2025-06-18T16:20:00'),
  architecture: new Date('2025-06-18T11:00:00'),
  cargoCommands: new Date('2025-01-16T11:00:00'),
  apiReference: new Date('2025-06-18T13:30:00'),
};

// GitHub edit history URLs for each section
const GITHUB_EDIT_URLS = {
  gettingStarted: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/getting-started.md',
  installation: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/installation.md',
  basicUsage: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/basic-usage.md',
  coreConcepts: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/core-concepts.md',
  architecture:
    'https://github.com/noahsabaj/hearth-engine/commits/main/docs/architecture/GPU_DRIVEN_ARCHITECTURE.md',
  cargoCommands:
    'https://github.com/noahsabaj/hearth-engine/commits/main/docs/guides/CARGO_COMMANDS_GUIDE.md',
  apiReference: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/api-reference.md',
};

// Full section content for accurate reading time calculation
const SECTION_CONTENT = {
  gettingStarted: `Hearth Engine is a next-generation voxel game engine built with Rust. It provides a data-oriented, GPU-first architecture for creating games with realistic physics and emergent gameplay.

Key Features:
- GPU-driven architecture with 60+ FPS at millions of voxels
- Zero manual GPU operations through 8-phase automation system
- Data-Oriented Programming (DOP) - no classes or OOP
- 1dcm³ voxels (10cm cubes) for realistic physics
- Full per-voxel physics simulation (thermal, fluid, acoustic, structural)
- Unified world system with GPU-first computation

// Quick example - Data-Oriented Style
use hearth_engine::{Engine, Game, World};

struct MyGame {
    // Data only - no methods!
    player_data: PlayerData,
    world_buffer: WorldBuffer,
}

impl Game for MyGame {
    fn init(&mut self, world: &mut World) {
        world.set_render_distance(16);
        // Initialize data buffers
    }
    
    fn update(&mut self, world: &mut World, input: &Input, dt: f32) {
        // Transform data through stateless functions
        update_player_position(&mut self.player_data, input, dt);
        simulate_physics(&mut self.world_buffer, dt);
    }
}

fn main() {
    let mut engine = Engine::new();
    engine.run(MyGame);
}

This demonstrates the data-oriented approach - structs contain only data, and functions transform that data. No methods, no self references in game logic.`,

  installation: `Add Hearth Engine to your project's dependencies:

# Cargo.toml
[dependencies]
hearth-engine = { git = "https://github.com/noahsabaj/hearth-engine" }

# Or use a specific branch/tag
hearth-engine = { git = "https://github.com/noahsabaj/hearth-engine", branch = "main" }

Requirements:
- Rust 1.70+ (latest stable recommended)
- GPU with Vulkan, DirectX 12, or Metal support
- 8GB+ RAM for development
- Windows, macOS, or Linux

For development, clone the repository:
git clone https://github.com/noahsabaj/hearth-engine
cd hearth-engine
cargo run --example engine_testbed`,

  basicUsage: `Creating a voxel world follows data-oriented principles:

// Initialize world buffers
let mut world_buffer = WorldBuffer::new();
let mut render_buffer = RenderBuffer::new();

// Generate terrain using stateless functions
generate_terrain(&mut world_buffer, TerrainParams {
    seed: 42,
    scale: 0.1,
    octaves: 4,
});

// Transform voxel data
set_voxel(&mut world_buffer, vec3(10, 20, 30), VoxelType::Stone);

// Run physics kernel on GPU
let physics_kernel = PhysicsKernel::new();
physics_kernel.execute(&mut world_buffer, dt);

// Sync to render buffer
sync_render_data(&world_buffer, &mut render_buffer);`,

  coreConcepts: `Data-Oriented Design (DOP)

Hearth Engine follows STRICT data-oriented programming principles:
- ❌ NO classes, objects, or OOP patterns  
- ❌ NO methods - only functions that transform data
- ✅ Data lives in shared buffers (WorldBuffer, RenderBuffer, etc.)
- ✅ Systems are stateless kernels that read/write buffers
- ✅ GPU-first architecture - data lives where it's processed
- ✅ If you're writing self.method(), you're doing it wrong

GPU-First Architecture

Everything runs on GPU when possible:
- Unified GPU Type System - Rust types as single source of truth
- 8-Phase GPU Automation eliminates ALL manual GPU operations
- Automatic WGSL generation from Rust types
- Structure of Arrays (SOA) memory layout
- Zero-copy GPU pipeline creation
- Type-safe bind groups with compile-time validation

Physics-First World

Every voxel is 1dcm³ (10cm cube) with full physics:
- Thermal dynamics - heat spreads, materials melt
- Fluid dynamics - water flows, pressure matters
- Acoustic simulation - sound propagates realistically
- Structural integrity - buildings can collapse
- Material properties - density, conductivity, elasticity

Unified World System

GPU-driven world management:
- Single world_unified module (no CPU/GPU split)
- GPU kernels for all operations
- CPU fallbacks only when necessary
- Automatic memory synchronization
- Lock-free concurrent access`,

  cargoCommands: `Cargo is Rust's build system and package manager. Here's a comprehensive guide to Cargo commands you'll use when developing with Hearth Engine.

Essential Daily Commands

cargo check      # Quick syntax/type check (no compilation)
cargo build      # Compile in debug mode
cargo run        # Build and run the default binary
cargo test       # Run all tests
cargo clippy     # Run linter for code quality
cargo fmt        # Auto-format code

Build & Run Commands

# Building
cargo build              # Debug build (fast compile, slow runtime)
cargo build --release    # Release build (slow compile, fast runtime)
cargo clean              # Remove build artifacts

# Running
cargo run                      # Run default binary
cargo run --bin <name>         # Run specific binary
cargo run --example <name>     # Run example
cargo run -- <args>            # Pass arguments to program
cargo run --release            # Run optimized version

Testing & Debugging

# Testing
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
cargo outdated           # Check for updates

Package Management

# Dependencies
cargo add <crate>              # Add dependency
cargo add <crate>@<version>    # Add specific version
cargo add <crate> --features "feat1,feat2"
cargo remove <crate>           # Remove dependency
cargo update                   # Update all dependencies
cargo search <term>            # Search crates.io

# Documentation
cargo doc                # Generate docs
cargo doc --open         # Generate and open docs

Performance Analysis

# Profiling (requires additional tools)
cargo flamegraph         # CPU profiling visualization
cargo bloat              # Analyze binary size
cargo asm <function>     # Show assembly code

# Development workflow
cargo watch -x check     # Auto-check on file changes
cargo watch -x test      # Auto-test on file changes
cargo watch -x run       # Auto-run on file changes

Hearth Engine Specific Workflow

# Quick development cycle
cargo check && cargo clippy && cargo test

# Performance testing
cargo build --release && cargo run --release

# Before committing
cargo fmt && cargo clippy && cargo test

# Build with specific features
cargo build --features "vulkan"
cargo build --features "debug-ui,profiler"

Pro Tips

Use cargo check frequently - It's 10x faster than cargo build for catching errors
Run cargo clippy before commits - Catches common mistakes and suggests improvements
Use --release for performance testing - Debug builds can be 100x slower than release builds
Install cargo-watch - Greatly improves development experience with auto-rebuilds

For a complete reference guide with advanced commands and troubleshooting, see the full Cargo Commands Guide in the engine documentation.`,

  architecture: `GPU-Driven Architecture

Hearth Engine is built from the ground up for GPU-first computation:

8-Phase GPU Automation System

Phase 1: Type Registration
- Rust types automatically registered with GPU system
- Zero manual struct definitions in WGSL

Phase 2: Layout Analysis
- Automatic memory layout calculation
- Padding and alignment handled by encase

Phase 3: WGSL Generation
- Automatic shader code generation from Rust types
- Type-safe bindings with no manual writing

Phase 4: Buffer Management
- Automatic buffer creation and updates
- Smart caching and reuse

Phase 5: Pipeline Creation
- Zero-code pipeline setup
- Automatic bind group layouts

Phase 6: Bind Group Management
- Type-safe resource binding
- Compile-time validation

Phase 7: Dispatch Orchestration
- Automatic workgroup sizing
- Dependency tracking

Phase 8: Validation
- Runtime type checking
- Memory safety guarantees

Module Structure

src/
├── gpu/
│   ├── automation/      # 8-phase GPU automation
│   ├── soa/            # Structure of Arrays types
│   └── kernels/        # GPU compute shaders
├── world_unified/      # Unified world system
│   ├── core/          # Core data structures
│   ├── storage/       # GPU storage management
│   ├── generation/    # World generation kernels
│   ├── compute/       # Physics & simulation
│   └── interfaces/    # CPU/GPU sync
└── render/            # Rendering pipeline

Performance Architecture

- Lock-free concurrent access patterns
- Zero-copy GPU memory transfers
- Structure of Arrays (SOA) for cache efficiency
- Batch operations minimize GPU dispatch overhead
- Unified memory model reduces synchronization

The architecture prioritizes GPU residence - data lives where it&apos;s processed, eliminating costly CPU-GPU transfers.`,

  apiReference: `Search through Hearth Engine's API reference to find functions, structs, traits, and more. Use the interactive search above to explore the API with instant previews, parameter details, and code examples. The search supports fuzzy matching to help you find what you need quickly.

For complete API documentation, see the docs.rs page or browse the source code on GitHub.`,
};

const Documentation: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('getting-started');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem('docSidebarCollapsed');
    return saved ? JSON.parse(saved) : {};
  });
  const { setSidebarToggleCallback, setNavigationCallbacks, showToast } =
    useKeyboardShortcutsContext();

  const handleNavigateToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = SPACING.navbar.height + SPACING.md; // AppBar height + some padding
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  const toggleSectionCollapse = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newState = { ...prev, [sectionId]: !prev[sectionId] };
      localStorage.setItem('docSidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const handleCopyLink = useCallback(
    (sectionId: string) => {
      const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
      navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard');
    },
    [showToast],
  );

  const sections = useMemo(
    () => [
      { title: 'Getting Started', id: 'getting-started' },
      { title: 'Installation', id: 'installation' },
      { title: 'Basic Usage', id: 'basic-usage' },
      { title: 'Core Concepts', id: 'core-concepts' },
      { title: 'Architecture', id: 'architecture' },
      { title: 'Cargo Commands', id: 'cargo-commands' },
      { title: 'API Reference', id: 'api-reference' },
    ],
    []
  );

  // Grouped sections for collapsible sidebar
  const sectionGroups = useMemo(
    () => [
      {
        title: 'Getting Started',
        id: 'getting-started-group',
        sections: [
          { title: 'Getting Started', id: 'getting-started' },
          { title: 'Installation', id: 'installation' },
          { title: 'Basic Usage', id: 'basic-usage' },
        ],
      },
      {
        title: 'Advanced Topics',
        id: 'advanced-group',
        sections: [
          { title: 'Core Concepts', id: 'core-concepts' },
          { title: 'Architecture', id: 'architecture' },
        ],
      },
      {
        title: 'Reference',
        id: 'reference-group',
        sections: [
          { title: 'Cargo Commands', id: 'cargo-commands' },
          { title: 'API Reference', id: 'api-reference' },
        ],
      },
    ],
    []
  );

  // Set up keyboard navigation
  useEffect(() => {
    setSidebarToggleCallback(() => {
      setSidebarOpen(prev => !prev);
    });

    const navigateUp = () => {
      const currentIndex = sections.findIndex(s => s.id === activeSection);
      if (currentIndex > 0) {
        const [newSection] = [sections[currentIndex - 1]];
        if (newSection) {
          handleNavigateToSection(newSection.id);
          setActiveSection(newSection.id);
          showToast(`Navigated to ${newSection.title}`);
        }
      }
    };

    const navigateDown = () => {
      const currentIndex = sections.findIndex(s => s.id === activeSection);
      if (currentIndex < sections.length - 1) {
        const [newSection] = [sections[currentIndex + 1]];
        if (newSection) {
          handleNavigateToSection(newSection.id);
          setActiveSection(newSection.id);
          showToast(`Navigated to ${newSection.title}`);
        }
      }
    };

    setNavigationCallbacks(navigateUp, navigateDown);
  }, [
    setSidebarToggleCallback,
    setNavigationCallbacks,
    sections,
    activeSection,
    handleNavigateToSection,
    showToast,
  ]);

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

          // Show back to top button when scrolled down
          setShowBackToTop(scrollTop > LOADING.scrollThreshold);

          // Find active section with better detection
          const sectionElements = sections.map(section => ({
            id: section.id,
            element: document.getElementById(section.id),
          }));

          const headerOffset = SPACING.navbar.height + SPACING.xl + SPACING.md;
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
                [currentSection] = visibleSections;
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
      <SEO
        title='Documentation'
        description='Comprehensive documentation for Hearth Engine. Learn how to install, configure, and use Hearth Engine to build amazing games.'
        keywords='hearth engine documentation, game engine docs, hearth tutorial, game development guide, hearth API reference'
        pathname='/documentation'
      />
      {/* Navigation */}
      <NavigationBar variant='docs' />

      {/* Reading Progress Bar */}
      <LinearProgress
        variant='determinate'
        value={scrollProgress}
        aria-label={`Reading progress: ${Math.round(scrollProgress)}% complete`}
        sx={{
          position: 'fixed',
          top: SPACING.navbar.height,
          left: 0,
          right: 0,
          zIndex: Z_INDEX.sticky + 50,
          height: LAYOUT.height.progress.small,
          backgroundColor: COLORS.utils.transparent,
          '& .MuiLinearProgress-bar': {
            backgroundColor: COLORS.primary.main,
            transition: ANIMATION.transition.fast,
          },
        }}
      />

      <Container maxWidth='lg' sx={{ mt: 10 }}>
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{
              position: 'fixed',
              left: 16,
              top: 80,
              zIndex: 1201,
              backgroundColor: theme.palette.background.paper,
              boxShadow: 2,
              '&:hover': {
                backgroundColor: theme.palette.background.paper,
              },
            }}
            aria-label='Toggle documentation sidebar'
          >
            {sidebarOpen ? <Close /> : <MenuIcon />}
          </IconButton>
        )}

        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper
              component='nav'
              role='navigation'
              aria-label='Documentation sections'
              sx={{
                p: 2,
                position: 'sticky',
                top: SPACING.navbar.height + SPACING.md,
                border: `1px solid ${COLORS.utils.border}`,
              }}
            >
              <Typography variant='h6' gutterBottom component='h2'>
                Documentation
              </Typography>
              <List role='list'>
                {sectionGroups.map(group => (
                  <Box key={group.id} sx={{ mb: 1 }}>
                    <ListItem
                      component='button'
                      onClick={() => toggleSectionCollapse(group.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: LAYOUT.borderRadius.sm,
                        mb: 0.5,
                        transition: ANIMATION.transition.fast,
                        backgroundColor: COLORS.utils.shimmer,
                        border: `1px solid ${COLORS.utils.border}`,
                        '&:hover': {
                          backgroundColor: COLORS.utils.shimmerLight,
                          borderColor: `${COLORS.text.primary}1F`,
                        },
                      }}
                    >
                      <ListItemText
                        primary={group.title}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: TYPOGRAPHY.fontWeight.semibold,
                            color: COLORS.text.primary,
                          },
                        }}
                      />
                      {collapsedSections[group.id] ? <ExpandMore /> : <ExpandLess />}
                    </ListItem>
                    <Collapse
                      in={!collapsedSections[group.id]}
                      timeout={ANIMATION.duration.normal}
                      unmountOnExit
                    >
                      <List sx={{ pl: 2 }}>
                        {group.sections.map(section => (
                          <ListItem
                            key={section.id}
                            component='button'
                            onClick={() => handleNavigateToSection(section.id)}
                            sx={{
                              cursor: 'pointer',
                              borderRadius: LAYOUT.borderRadius.sm,
                              mb: 0.5,
                              transition: ANIMATION.transition.fast,
                              position: 'relative',
                              backgroundColor:
                                activeSection === section.id
                                  ? `${COLORS.primary.main}1A`
                                  : COLORS.utils.transparent,
                              border: `1px solid ${COLORS.utils.border}`,
                              borderLeft:
                                activeSection === section.id
                                  ? `3px solid ${COLORS.primary.main}`
                                  : `1px solid ${COLORS.utils.border}`,
                              '&:hover': {
                                backgroundColor:
                                  activeSection === section.id
                                    ? `${COLORS.primary.main}26`
                                    : COLORS.utils.shimmer,
                                borderColor: `${COLORS.text.primary}1F`,
                                borderLeftColor:
                                  activeSection === section.id
                                    ? COLORS.primary.main
                                    : `${COLORS.text.primary}1F`,
                              },
                            }}
                          >
                            <ListItemText
                              primary={section.title}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontWeight:
                                    activeSection === section.id
                                      ? TYPOGRAPHY.fontWeight.semibold
                                      : TYPOGRAPHY.fontWeight.normal,
                                  color:
                                    activeSection === section.id
                                      ? COLORS.primary.main
                                      : COLORS.text.secondary,
                                },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Mobile Sidebar Drawer */}
          <Drawer
            anchor='left'
            open={isMobile && sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: 280,
                backgroundColor: theme.palette.background.paper,
                top: SPACING.navbar.height,
                border: `1px solid ${COLORS.utils.border}`,
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant='h6' gutterBottom component='h2'>
                Documentation
              </Typography>
              <List role='list'>
                {sectionGroups.map(group => (
                  <Box key={group.id} sx={{ mb: 1 }}>
                    <ListItem
                      component='button'
                      onClick={() => toggleSectionCollapse(group.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: LAYOUT.borderRadius.sm,
                        mb: 0.5,
                        transition: ANIMATION.transition.fast,
                        backgroundColor: COLORS.utils.shimmer,
                        border: `1px solid ${COLORS.utils.border}`,
                        '&:hover': {
                          backgroundColor: COLORS.utils.shimmerLight,
                          borderColor: `${COLORS.text.primary}1F`,
                        },
                      }}
                    >
                      <ListItemText
                        primary={group.title}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: TYPOGRAPHY.fontWeight.semibold,
                            color: COLORS.text.primary,
                          },
                        }}
                      />
                      {collapsedSections[group.id] ? <ExpandMore /> : <ExpandLess />}
                    </ListItem>
                    <Collapse
                      in={!collapsedSections[group.id]}
                      timeout={ANIMATION.duration.normal}
                      unmountOnExit
                    >
                      <List sx={{ pl: 2 }}>
                        {group.sections.map(section => (
                          <ListItem
                            key={section.id}
                            component='button'
                            onClick={() => {
                              handleNavigateToSection(section.id);
                              setSidebarOpen(false);
                            }}
                            sx={{
                              cursor: 'pointer',
                              borderRadius: LAYOUT.borderRadius.sm,
                              mb: 0.5,
                              transition: ANIMATION.transition.fast,
                              position: 'relative',
                              backgroundColor:
                                activeSection === section.id
                                  ? `${COLORS.primary.main}1A`
                                  : COLORS.utils.transparent,
                              border: `1px solid ${COLORS.utils.border}`,
                              borderLeft:
                                activeSection === section.id
                                  ? `3px solid ${COLORS.primary.main}`
                                  : `1px solid ${COLORS.utils.border}`,
                              '&:hover': {
                                backgroundColor:
                                  activeSection === section.id
                                    ? `${COLORS.primary.main}26`
                                    : COLORS.utils.shimmer,
                                borderColor: `${COLORS.text.primary}1F`,
                                borderLeftColor:
                                  activeSection === section.id
                                    ? COLORS.primary.main
                                    : `${COLORS.text.primary}1F`,
                              },
                            }}
                          >
                            <ListItemText
                              primary={section.title}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontWeight:
                                    activeSection === section.id
                                      ? TYPOGRAPHY.fontWeight.semibold
                                      : TYPOGRAPHY.fontWeight.normal,
                                  color:
                                    activeSection === section.id
                                      ? COLORS.primary.main
                                      : COLORS.text.secondary,
                                },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                ))}
              </List>
            </Box>
          </Drawer>

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
                sx={{ mb: 6, position: 'relative' }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}
                >
                  <Typography variant='h3' id='getting-started-heading' component='h2'>
                    Getting Started
                  </Typography>
                  <Tooltip title='Copy link to section'>
                    <IconButton
                      size='small'
                      onClick={() => handleCopyLink('getting-started')}
                      sx={{
                        color: COLORS.text.secondary,
                        '&:hover': { color: COLORS.primary.main },
                      }}
                    >
                      <LinkIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <ReadingTime text={SECTION_CONTENT.gettingStarted} />
                  <LastUpdated
                    date={SECTION_UPDATES.gettingStarted}
                    githubEditUrl={GITHUB_EDIT_URLS.gettingStarted}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <EditOnGitHub filePath='src/pages/Documentation.tsx' />
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
                <RelatedArticles
                  currentSection='getting-started'
                  onNavigate={handleNavigateToSection}
                />
                <FeedbackWidget sectionId='getting-started' sectionTitle='Getting Started' />
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='installation'
                aria-labelledby='installation-heading'
                sx={{ mb: 6, position: 'relative' }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}
                >
                  <Typography variant='h3' id='installation-heading' component='h2'>
                    Installation
                  </Typography>
                  <Tooltip title='Copy link to section'>
                    <IconButton
                      size='small'
                      onClick={() => handleCopyLink('installation')}
                      sx={{
                        color: COLORS.text.secondary,
                        '&:hover': { color: COLORS.primary.main },
                      }}
                    >
                      <LinkIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <ReadingTime text={SECTION_CONTENT.installation} />
                  <LastUpdated
                    date={SECTION_UPDATES.installation}
                    githubEditUrl={GITHUB_EDIT_URLS.installation}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <EditOnGitHub filePath='src/pages/Documentation.tsx' />
                </Box>
                <Typography variant='body1' paragraph>
                  Add Hearth Engine to your project&apos;s dependencies:
                </Typography>
                <CodeBlock language='toml'>
                  {`# Cargo.toml
[dependencies]
hearth-engine = { git = "https://github.com/noahsabaj/hearth-engine" }

# Or use a specific branch/tag
hearth-engine = { git = "https://github.com/noahsabaj/hearth-engine", branch = "main" }`}
                </CodeBlock>
                <Typography variant='body1' paragraph>
                  Requirements: Rust 1.70+, GPU with Vulkan/DirectX 12/Metal, 8GB+ RAM
                </Typography>
                <Typography variant='body1' paragraph>
                  For development, clone the repository:
                </Typography>
                <CodeBlock language='bash'>
                  {`git clone https://github.com/noahsabaj/hearth-engine
cd hearth-engine
cargo run --example engine_testbed`}
                </CodeBlock>
                <RelatedArticles
                  currentSection='installation'
                  onNavigate={handleNavigateToSection}
                />
                <FeedbackWidget sectionId='installation' sectionTitle='Installation' />
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='basic-usage'
                aria-labelledby='basic-usage-heading'
                sx={{ mb: 6, position: 'relative' }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}
                >
                  <Typography variant='h3' id='basic-usage-heading' component='h2'>
                    Basic Usage
                  </Typography>
                  <Tooltip title='Copy link to section'>
                    <IconButton
                      size='small'
                      onClick={() => handleCopyLink('basic-usage')}
                      sx={{
                        color: COLORS.text.secondary,
                        '&:hover': { color: COLORS.primary.main },
                      }}
                    >
                      <LinkIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <ReadingTime text={SECTION_CONTENT.basicUsage} />
                  <LastUpdated
                    date={SECTION_UPDATES.basicUsage}
                    githubEditUrl={GITHUB_EDIT_URLS.basicUsage}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <EditOnGitHub filePath='src/pages/Documentation.tsx' />
                </Box>
                <Typography variant='body1' paragraph>
                  Creating a voxel world follows data-oriented principles:
                </Typography>
                <CodeBlock>
                  {`// Initialize world buffers
let mut world_buffer = WorldBuffer::new();
let mut render_buffer = RenderBuffer::new();

// Generate terrain using stateless functions
generate_terrain(&mut world_buffer, TerrainParams {
    seed: 42,
    scale: 0.1,
    octaves: 4,
});

// Transform voxel data
set_voxel(&mut world_buffer, vec3(10, 20, 30), VoxelType::Stone);

// Run physics kernel on GPU
let physics_kernel = PhysicsKernel::new();
physics_kernel.execute(&mut world_buffer, dt);

// Sync to render buffer
sync_render_data(&world_buffer, &mut render_buffer);`}
                </CodeBlock>
                <RelatedArticles
                  currentSection='basic-usage'
                  onNavigate={handleNavigateToSection}
                />
                <FeedbackWidget sectionId='basic-usage' sectionTitle='Basic Usage' />
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='core-concepts'
                aria-labelledby='core-concepts-heading'
                sx={{ mb: 6, position: 'relative' }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}
                >
                  <Typography variant='h3' id='core-concepts-heading' component='h2'>
                    Core Concepts
                  </Typography>
                  <Tooltip title='Copy link to section'>
                    <IconButton
                      size='small'
                      onClick={() => handleCopyLink('core-concepts')}
                      sx={{
                        color: COLORS.text.secondary,
                        '&:hover': { color: COLORS.primary.main },
                      }}
                    >
                      <LinkIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <ReadingTime text={SECTION_CONTENT.coreConcepts} />
                  <LastUpdated
                    date={SECTION_UPDATES.coreConcepts}
                    githubEditUrl={GITHUB_EDIT_URLS.coreConcepts}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <EditOnGitHub filePath='src/pages/Documentation.tsx' />
                </Box>
                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  Data-Oriented Design (DOP)
                </Typography>
                <Typography variant='body1' paragraph>
                  Hearth Engine follows STRICT data-oriented programming principles:
                </Typography>
                <List>
                  <ListItem>❌ NO classes, objects, or OOP patterns</ListItem>
                  <ListItem>❌ NO methods - only functions that transform data</ListItem>
                  <ListItem>
                    ✅ Data lives in shared buffers (WorldBuffer, RenderBuffer, etc.)
                  </ListItem>
                  <ListItem>✅ Systems are stateless kernels that read/write buffers</ListItem>
                  <ListItem>
                    ✅ GPU-first architecture - data lives where it&apos;s processed
                  </ListItem>
                </List>
                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  GPU-First Architecture
                </Typography>
                <Typography variant='body1' paragraph>
                  Everything runs on GPU when possible with automatic WGSL generation, Structure of
                  Arrays (SOA) memory layout, and zero-copy pipeline creation.
                </Typography>
                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  Physics-First World
                </Typography>
                <Typography variant='body1' paragraph>
                  Every voxel is 1dcm³ (10cm cube) with full physics simulation including thermal
                  dynamics, fluid dynamics, acoustic simulation, and structural integrity.
                </Typography>
                <RelatedArticles
                  currentSection='core-concepts'
                  onNavigate={handleNavigateToSection}
                />
                <FeedbackWidget sectionId='core-concepts' sectionTitle='Core Concepts' />
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='architecture'
                aria-labelledby='architecture-heading'
                sx={{ mb: 6, position: 'relative' }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}
                >
                  <Typography variant='h3' id='architecture-heading' component='h2'>
                    Architecture
                  </Typography>
                  <Tooltip title='Copy link to section'>
                    <IconButton
                      size='small'
                      onClick={() => handleCopyLink('architecture')}
                      sx={{
                        color: COLORS.text.secondary,
                        '&:hover': { color: COLORS.primary.main },
                      }}
                    >
                      <LinkIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <ReadingTime text={SECTION_CONTENT.architecture} />
                  <LastUpdated
                    date={SECTION_UPDATES.architecture}
                    githubEditUrl={GITHUB_EDIT_URLS.architecture}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <EditOnGitHub filePath='src/pages/Documentation.tsx' />
                </Box>
                <Typography variant='body1' paragraph>
                  Hearth Engine is built from the ground up for GPU-first computation with an
                  innovative 8-phase automation system.
                </Typography>
                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  8-Phase GPU Automation System
                </Typography>
                <Typography variant='body1' paragraph>
                  The engine eliminates all manual GPU operations through a sophisticated automation
                  pipeline:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary='Phase 1: Type Registration'
                      secondary='Rust types automatically registered with GPU system'
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Phase 2: Layout Analysis'
                      secondary='Automatic memory layout calculation with encase'
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Phase 3: WGSL Generation'
                      secondary='Automatic shader code generation from Rust types'
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Phase 4: Buffer Management'
                      secondary='Automatic buffer creation and updates'
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Phase 5: Pipeline Creation'
                      secondary='Zero-code pipeline setup'
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Phase 6: Bind Group Management'
                      secondary='Type-safe resource binding'
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Phase 7: Dispatch Orchestration'
                      secondary='Automatic workgroup sizing'
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Phase 8: Validation'
                      secondary='Runtime type checking and memory safety'
                    />
                  </ListItem>
                </List>
                <Typography variant='h4' gutterBottom sx={{ mt: 3 }}>
                  Module Structure
                </Typography>
                <CodeBlock language='bash'>
                  {`src/
├── gpu/
│   ├── automation/      # 8-phase GPU automation
│   ├── soa/            # Structure of Arrays types
│   └── kernels/        # GPU compute shaders
├── world_unified/      # Unified world system
│   ├── core/          # Core data structures
│   ├── storage/       # GPU storage management
│   ├── generation/    # World generation kernels
│   ├── compute/       # Physics & simulation
│   └── interfaces/    # CPU/GPU sync
└── render/            # Rendering pipeline`}
                </CodeBlock>
                <RelatedArticles
                  currentSection='architecture'
                  onNavigate={handleNavigateToSection}
                />
                <FeedbackWidget sectionId='architecture' sectionTitle='Architecture' />
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='cargo-commands'
                aria-labelledby='cargo-commands-heading'
                sx={{ mb: 6, position: 'relative' }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}
                >
                  <Typography variant='h3' id='cargo-commands-heading' component='h2'>
                    Cargo Commands Reference
                  </Typography>
                  <Tooltip title='Copy link to section'>
                    <IconButton
                      size='small'
                      onClick={() => handleCopyLink('cargo-commands')}
                      sx={{
                        color: COLORS.text.secondary,
                        '&:hover': { color: COLORS.primary.main },
                      }}
                    >
                      <LinkIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <ReadingTime text={SECTION_CONTENT.cargoCommands} />
                  <LastUpdated
                    date={SECTION_UPDATES.cargoCommands}
                    githubEditUrl={GITHUB_EDIT_URLS.cargoCommands}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <EditOnGitHub filePath='src/pages/Documentation.tsx' />
                </Box>
                <Typography variant='body1' paragraph>
                  Cargo is Rust&apos;s build system and package manager. Here&apos;s a comprehensive
                  guide to Cargo commands you&apos;ll use when developing with Hearth Engine.
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
                    href={`${MISC.github.repoUrl}/blob/main/docs/guides/CARGO_COMMANDS_GUIDE.md`}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: COLORS.primary.main, textDecoration: 'none' }}
                  >
                    full Cargo Commands Guide
                  </a>{' '}
                  in the engine documentation.
                </Typography>
                <RelatedArticles
                  currentSection='cargo-commands'
                  onNavigate={handleNavigateToSection}
                />
                <FeedbackWidget sectionId='cargo-commands' sectionTitle='Cargo Commands' />
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box
                component='section'
                id='api-reference'
                aria-labelledby='api-reference-heading'
                sx={{ mb: 6, position: 'relative' }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}
                >
                  <Typography variant='h3' id='api-reference-heading' component='h2'>
                    API Reference
                  </Typography>
                  <Tooltip title='Copy link to section'>
                    <IconButton
                      size='small'
                      onClick={() => handleCopyLink('api-reference')}
                      sx={{
                        color: COLORS.text.secondary,
                        '&:hover': { color: COLORS.primary.main },
                      }}
                    >
                      <LinkIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <ReadingTime text={SECTION_CONTENT.apiReference} />
                  <LastUpdated
                    date={SECTION_UPDATES.apiReference}
                    githubEditUrl={GITHUB_EDIT_URLS.apiReference}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <EditOnGitHub filePath='src/pages/Documentation.tsx' />
                </Box>
                <APIReferenceSearch />

                <Typography variant='body1' paragraph sx={{ mt: 4 }}>
                  For complete API documentation, see the{' '}
                  <a
                    href='https://docs.rs/hearth-engine'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: COLORS.primary.main, textDecoration: 'none' }}
                  >
                    docs.rs page
                  </a>{' '}
                  or browse the source code on{' '}
                  <a
                    href={MISC.github.repoUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: COLORS.primary.main, textDecoration: 'none' }}
                  >
                    GitHub
                  </a>
                  .
                </Typography>
                <RelatedArticles
                  currentSection='api-reference'
                  onNavigate={handleNavigateToSection}
                />
                <FeedbackWidget sectionId='api-reference' sectionTitle='API Reference' />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Back to Top Button */}
      <Fade in={showBackToTop}>
        <Fab
          color='primary'
          size='medium'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label='Back to top'
          sx={{
            position: 'fixed',
            bottom: SPACING.fab.bottom,
            right: SPACING.fab.right,
            zIndex: Z_INDEX.fab,
            backgroundColor: COLORS.primary.main,
            '&:hover': {
              backgroundColor: COLORS.primary.dark,
              transform: `scale(${ANIMATION.scale.hoverSmall})`,
            },
            transition: ANIMATION.transition.fast,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Fade>

      <Footer />
    </Box>
  );
};

export default Documentation;
