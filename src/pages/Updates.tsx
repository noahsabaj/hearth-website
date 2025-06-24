import {
  RssFeed,
  Search,
  FilterList,
  Clear,
  Email,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  TextField,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Fade,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useMemo } from 'react';

import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import SEO from '../components/SEO';
import { COLORS, ANIMATION, LAYOUT, TYPOGRAPHY } from '../constants';

// Update categories
type UpdateCategory = 'Feature' | 'Bugfix' | 'Breaking' | 'Performance';

interface Update {
  id: string;
  title: string;
  date: Date;
  author: string;
  category: UpdateCategory;
  content: string;
  summary: string;
}

// Sample updates data
const UPDATES: Update[] = [
  {
    id: 'update-6',
    title: 'GPU-Driven Voxel Meshing System',
    date: new Date('2025-01-20'),
    author: 'Noah Sabaj',
    category: 'Feature',
    summary: 'Revolutionary GPU-based mesh generation for massive performance gains',
    content: `We're excited to announce our new GPU-driven voxel meshing system that processes millions of voxels in real-time!

Key improvements:
- **100x faster mesh generation** - All meshing now happens on GPU
- **Zero CPU-GPU transfer** - Meshes generated directly in GPU memory
- **Adaptive LOD system** - Automatic level-of-detail based on distance
- **Greedy meshing algorithm** - Reduces triangle count by up to 95%

The new system uses compute shaders to generate optimized meshes directly on the GPU, eliminating the bottleneck of CPU mesh generation and data transfer. This allows for real-time modification of massive voxel worlds without any frame drops.

Technical details:
- Implemented using WGSL compute shaders
- Supports up to 10 million voxels per frame
- Automatic occlusion culling
- Smart caching for static geometry

This update is part of our ongoing effort to make Hearth Engine the most performant voxel engine available.`,
  },
  {
    id: 'update-5',
    title: 'Structural Integrity System Overhaul',
    date: new Date('2025-01-15'),
    author: 'Alex Chen',
    category: 'Breaking',
    summary: 'Major improvements to physics simulation with breaking API changes',
    content: `The structural integrity system has been completely rewritten for better performance and accuracy.

**Breaking Changes:**
- \`StructuralIntegrity\` trait now requires \`PhysicsBody\` implementation
- Changed \`calculate_stress()\` signature to accept \`&mut StressBuffer\`
- Removed deprecated \`set_material_strength()\` - use \`MaterialProperties\` instead

**New Features:**
- Real-time stress visualization
- Support for composite materials
- Fracture pattern prediction
- Dynamic load distribution

**Migration Guide:**
\`\`\`rust
// Old API
world.set_material_strength(pos, 100.0);

// New API
let mut props = MaterialProperties::new();
props.tensile_strength = 100.0;
props.compressive_strength = 150.0;
world.set_material_properties(pos, props);
\`\`\`

The new system provides much more realistic structural failures and better performance through GPU acceleration.`,
  },
  {
    id: 'update-4',
    title: 'Fluid Simulation Performance Boost',
    date: new Date('2025-01-10'),
    author: 'Sarah Martinez',
    category: 'Performance',
    summary: '3x performance improvement in fluid dynamics calculations',
    content: `Massive performance improvements to our fluid simulation system!

**Performance Gains:**
- 3x faster fluid updates
- 50% reduction in memory usage
- Improved cache coherency
- Better GPU utilization

**Technical Improvements:**
- Switched to lattice Boltzmann method
- Implemented sparse voxel octree for fluid storage
- GPU-accelerated pressure solving
- Adaptive timestep for stability

**Benchmarks:**
- 100k fluid voxels: 120 FPS → 360 FPS
- 1M fluid voxels: 30 FPS → 90 FPS
- Memory usage: 2GB → 1GB for 1M voxels

The new implementation maintains the same high-quality fluid behavior while dramatically improving performance, especially for large bodies of water.`,
  },
  {
    id: 'update-3',
    title: 'Fixed Memory Leak in Chunk Loading',
    date: new Date('2025-01-05'),
    author: 'Mike Thompson',
    category: 'Bugfix',
    summary: 'Resolved critical memory leak affecting long play sessions',
    content: `Fixed a critical memory leak that occurred during chunk loading and unloading.

**Issue:**
Chunks were not being properly deallocated when moving out of render distance, causing memory usage to continuously grow during gameplay.

**Impact:**
- Memory usage would increase by ~100MB per hour
- Eventually led to out-of-memory crashes
- Affected all versions since 0.8.0

**Fix:**
Properly implemented Drop trait for ChunkData and ensured GPU buffers are released when chunks are unloaded.

**Verification:**
- Automated tests added to prevent regression
- 24-hour stress test shows stable memory usage
- Community testing confirms fix

Thanks to user @VoxelBuilder for the detailed bug report that helped us track this down!`,
  },
  {
    id: 'update-2',
    title: 'New Terrain Generation Pipeline',
    date: new Date('2024-12-28'),
    author: 'Emma Wilson',
    category: 'Feature',
    summary: 'Introducing biome-aware procedural terrain with realistic geology',
    content: `Hearth Engine now features a completely new terrain generation pipeline with realistic geological formations!

**New Features:**
- **Biome system** - Desert, forest, tundra, ocean, and more
- **Geological layers** - Realistic stratification with different materials
- **Cave systems** - Interconnected 3D cave networks
- **Ore distribution** - Realistic mineral veins based on geology

**Technical Details:**
- GPU-accelerated noise generation
- Multi-octave Perlin and Simplex noise
- Hydraulic erosion simulation
- Temperature and moisture maps

**API Example:**
\`\`\`rust
let terrain_params = TerrainParams::builder()
    .seed(12345)
    .biome_scale(0.005)
    .enable_caves(true)
    .geological_layers(vec![
        Layer::new(Material::Granite, 0.0, 10.0),
        Layer::new(Material::Limestone, 10.0, 30.0),
        Layer::new(Material::Sandstone, 30.0, 50.0),
    ])
    .build();

world.generate_terrain(terrain_params);
\`\`\`

This update makes world generation much more interesting and realistic!`,
  },
  {
    id: 'update-1',
    title: 'Hearth Engine 0.9.0 Released!',
    date: new Date('2024-12-20'),
    author: 'Noah Sabaj',
    category: 'Feature',
    summary: 'Major release with thermal dynamics, improved lighting, and WebGPU support',
    content: `We're thrilled to announce the release of Hearth Engine 0.9.0!

**Major Features:**
- **Thermal Dynamics** - Full heat simulation with conduction, convection, and radiation
- **Volumetric Lighting** - Beautiful god rays and atmospheric scattering
- **WebGPU Support** - Run Hearth games in the browser!
- **Improved Editor** - New tools for faster world building

**Performance Improvements:**
- 25% faster chunk generation
- 40% reduction in GPU memory usage
- Optimized physics pipeline

**Bug Fixes:**
- Fixed lighting artifacts at chunk boundaries
- Resolved audio propagation issues
- Improved stability on AMD GPUs

**Breaking Changes:**
- See migration guide for v0.8 → v0.9

Download now and start building amazing voxel worlds with realistic physics!`,
  },
];

const categoryColors: Record<UpdateCategory, string> = {
  Feature: COLORS.primary.main,
  Bugfix: COLORS.status.success,
  Breaking: COLORS.status.error,
  Performance: COLORS.status.info,
};

const Updates: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<UpdateCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Filter updates based on selected categories and search
  const filteredUpdates = useMemo(() => {
    return UPDATES.filter(update => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(update.category);
      const matchesSearch =
        searchQuery === '' ||
        update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.summary.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategories, searchQuery]);

  const handleCategoryToggle = (
    _: React.MouseEvent<HTMLElement>,
    newCategories: UpdateCategory[],
  ) => {
    setSelectedCategories(newCategories);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      // In a real app, this would send to an API
      // Subscribe email logic would go here
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box component='main' role='main'>
      <SEO
        title='Updates'
        description='Stay up to date with the latest Hearth Engine updates, features, bug fixes, and improvements.'
        keywords='hearth engine updates, changelog, release notes, new features, bug fixes'
        pathname='/updates'
      />

      <NavigationBar />

      <Container maxWidth='lg' sx={{ mt: 10, mb: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant='h1'
            gutterBottom
            sx={{
              fontWeight: TYPOGRAPHY.fontWeight.black,
              fontSize: { xs: TYPOGRAPHY.fontSize['3xl'], md: TYPOGRAPHY.fontSize['5xl'] },
              background: `linear-gradient(135deg, ${COLORS.primary.main}, ${COLORS.primary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Engine Updates
          </Typography>
          <Typography variant='h6' color='text.secondary' sx={{ maxWidth: 600, mx: 'auto' }}>
            Stay informed about the latest features, improvements, and fixes in Hearth Engine
          </Typography>
        </Box>

        {/* Subscribe Section */}
        <Paper
          sx={{
            p: 4,
            mb: 6,
            background: `linear-gradient(135deg, ${COLORS.background.paper}, ${COLORS.background.elevated})`,
            border: `1px solid ${COLORS.utils.border}`,
          }}
        >
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Email sx={{ color: COLORS.primary.main }} />
                <Typography variant='h5' sx={{ fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
                  Subscribe to Updates
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary'>
                Get notified about new releases, features, and important announcements
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {subscribed ? (
                <Fade in>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant='h6' color='success.main'>
                      Thanks for subscribing!
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      You'll receive updates at {email}
                    </Typography>
                  </Box>
                </Fade>
              ) : (
                <form onSubmit={handleSubscribe}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      type='email'
                      placeholder='Enter your email'
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: COLORS.background.default,
                        },
                      }}
                    />
                    <Button
                      type='submit'
                      variant='contained'
                      sx={{
                        px: 4,
                        background: `linear-gradient(135deg, ${COLORS.primary.main}, ${COLORS.primary.light})`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${COLORS.primary.dark}, ${COLORS.primary.main})`,
                        },
                      }}
                    >
                      Subscribe
                    </Button>
                  </Box>
                </form>
              )}
            </Grid>
          </Grid>

          {/* RSS Feed Link */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              startIcon={<RssFeed />}
              href='/rss/updates.xml'
              target='_blank'
              sx={{ color: COLORS.text.secondary }}
            >
              RSS Feed
            </Button>
          </Box>
        </Paper>

        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder='Search updates...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search sx={{ color: COLORS.text.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position='end'>
                      <IconButton size='small' onClick={() => setSearchQuery('')}>
                        <Clear fontSize='small' />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: COLORS.background.paper,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FilterList sx={{ color: COLORS.text.secondary }} />
                <ToggleButtonGroup
                  value={selectedCategories}
                  onChange={handleCategoryToggle}
                  aria-label='filter by category'
                  size='small'
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      px: 2,
                    },
                  }}
                >
                  <ToggleButton value='Feature' aria-label='feature updates'>
                    Feature
                  </ToggleButton>
                  <ToggleButton value='Bugfix' aria-label='bug fixes'>
                    Bugfix
                  </ToggleButton>
                  <ToggleButton value='Breaking' aria-label='breaking changes'>
                    Breaking
                  </ToggleButton>
                  <ToggleButton value='Performance' aria-label='performance updates'>
                    Performance
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Updates List */}
        <AnimatePresence mode='popLayout'>
          {filteredUpdates.map((update, index) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Paper
                sx={{
                  p: 4,
                  mb: 3,
                  border: `1px solid ${COLORS.utils.border}`,
                  transition: ANIMATION.transition.all,
                  '&:hover': {
                    borderColor: categoryColors[update.category],
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${COLORS.utils.shadow}`,
                  },
                }}
              >
                {/* Update Header */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant='h4'
                        sx={{ fontWeight: TYPOGRAPHY.fontWeight.bold, mb: 1 }}
                      >
                        {update.title}
                      </Typography>
                      <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
                        {update.summary}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize='small' sx={{ color: COLORS.text.secondary }} />
                          <Typography variant='body2' color='text.secondary'>
                            {formatDate(update.date)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize='small' sx={{ color: COLORS.text.secondary }} />
                          <Typography variant='body2' color='text.secondary'>
                            {update.author}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Chip
                      label={update.category}
                      size='small'
                      sx={{
                        backgroundColor: `${categoryColors[update.category]}20`,
                        color: categoryColors[update.category],
                        borderColor: categoryColors[update.category],
                        border: '1px solid',
                        fontWeight: TYPOGRAPHY.fontWeight.semibold,
                      }}
                    />
                  </Box>
                </Box>

                {/* Update Content */}
                <Box
                  sx={{
                    '& p': { mb: 2 },
                    '& ul': { mb: 2, pl: 3 },
                    '& li': { mb: 1 },
                    '& code': {
                      backgroundColor: COLORS.background.elevated,
                      padding: '2px 6px',
                      borderRadius: LAYOUT.borderRadius.sm,
                      fontFamily: 'monospace',
                      fontSize: '0.9em',
                    },
                    '& pre': {
                      backgroundColor: COLORS.background.elevated,
                      p: 2,
                      borderRadius: LAYOUT.borderRadius.md,
                      overflow: 'auto',
                      mb: 2,
                    },
                    '& strong': {
                      color: COLORS.text.primary,
                      fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    },
                  }}
                >
                  <Typography
                    variant='body1'
                    component='div'
                    dangerouslySetInnerHTML={{
                      __html: update.content
                        .split('\n')
                        .map(line => {
                          // Convert markdown-style formatting
                          line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                          line = line.replace(/`(.*?)`/g, '<code>$1</code>');
                          line = line.replace(/^- (.*)/, '<li>$1</li>');
                          line = line.replace(/^#{1,6}\s+(.*)/, (match, p1) => {
                            const level = match.indexOf(' ');
                            return `<h${Math.min(level + 3, 6)}>${p1}</h${Math.min(level + 3, 6)}>`;
                          });

                          // Handle code blocks
                          if (line.startsWith('```')) {
                            return line === '```' ? '</pre>' : '<pre>';
                          }

                          return line === '' ? '<br/>' : `<p>${line}</p>`;
                        })
                        .join('')
                        .replace(/<li>/g, '<ul><li>')
                        .replace(/<\/li>(?!<li>)/g, '</li></ul>'),
                    }}
                  />
                </Box>
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredUpdates.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant='h6' color='text.secondary'>
              No updates found matching your criteria
            </Typography>
          </Paper>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default Updates;
