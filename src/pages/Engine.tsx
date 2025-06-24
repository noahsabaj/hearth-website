import {
  Speed,
  Memory,
  Code,
  Terrain,
  Architecture,
  CloudQueue,
  CheckCircle,
  Bolt,
  Storage,
  Public,
  Layers,
  ViewInAr,
  Psychology,
  RocketLaunch,
  Engineering,
  Science,
  Build,
  Devices,
  GpsFixed,
  MenuBook,
  Check,
  Close,
  RemoveCircleOutline,
  ExpandMore,
  FileDownload,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Grid,
  CardContent,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Collapse,
  IconButton,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useState, useMemo } from 'react';

import Footer from '../components/Footer';
import InteractiveCard from '../components/InteractiveCard';
import NavigationBar from '../components/NavigationBar';
import SEO from '../components/SEO';
import { SHADOWS, MISC, COLORS } from '../constants';

const Engine: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const features = [
    {
      icon: <Bolt />,
      title: 'GPU-First Architecture',
      description:
        'Entire world lives on GPU. Compute shaders handle generation, physics, and rendering with zero CPU overhead.',
      stats: ['60+ FPS with 1M+ voxels', 'GPU-accelerated physics', 'Zero-copy architecture'],
    },
    {
      icon: <Architecture />,
      title: 'Data-Oriented Design',
      description:
        'Pure functions, no OOP. Data transformations over shared memory buffers for cache-friendly access patterns.',
      stats: ['4x performance improvement', 'Near-linear core scaling', 'Minimal allocations'],
    },
    {
      icon: <Memory />,
      title: 'Unified World System',
      description:
        'All game data in GPU buffers. Voxels, entities, physics, and lighting updated in a single compute dispatch.',
      stats: ['Planet-scale worlds', 'Coherent GPU-CPU data', 'Efficient streaming'],
    },
    {
      icon: <ViewInAr />,
      title: 'True Physics Simulation',
      description:
        'Realistic physics with structural integrity, fluid dynamics, and emergent behavior patterns.',
      stats: ['Parallel collision detection', 'Fluid simulation', 'Structural collapse'],
    },
    {
      icon: <Terrain />,
      title: 'Advanced World Generation',
      description:
        'GPU-driven procedural generation with caves, ores, and biomes. Infinite worlds with deterministic generation.',
      stats: ['Perlin noise terrain', 'Cave systems', 'Resource distribution'],
    },
    {
      icon: <CloudQueue />,
      title: 'Modern Rendering',
      description:
        'GPU-driven culling, indirect rendering, and automatic LOD. Powered by wgpu for cross-platform support.',
      stats: ['Frustum culling', 'HZ-buffer occlusion', 'Multi-threaded mesh building'],
    },
  ];

  const techStack = [
    { name: 'Rust', description: 'Core engine language', icon: <Code /> },
    { name: 'WGSL', description: 'Shader programming', icon: <Engineering /> },
    { name: 'wgpu', description: 'Graphics abstraction', icon: <Devices /> },
    { name: 'Compute Shaders', description: 'GPU computation', icon: <Memory /> },
    { name: 'Data-Oriented', description: 'Architecture pattern', icon: <Architecture /> },
    { name: 'Morton Encoding', description: 'Spatial indexing', icon: <GpsFixed /> },
  ];

  const performanceMetrics = [
    { label: 'Chunk Generation', before: '12ms', after: '3ms', improvement: '4x faster' },
    { label: 'Mesh Building', before: '8ms', after: '2ms', improvement: '4x faster' },
    { label: 'Physics Update', before: '5ms', after: '1.2ms', improvement: '4.2x faster' },
    { label: 'Rendering', before: '16ms', after: '4ms', improvement: '4x faster' },
    {
      label: 'Memory Bandwidth',
      before: '156 MB/s',
      after: '624 MB/s',
      improvement: '4x throughput',
    },
    { label: 'L1 Cache Hit Rate', before: '27%', after: '89%', improvement: '3.3x better' },
  ];

  const architectureHighlights = [
    {
      phase: 'Foundation',
      title: 'GPU-First Design',
      description: 'Built from ground up for GPU computation',
      icon: <RocketLaunch />,
    },
    {
      phase: 'Data Layout',
      title: 'Structure of Arrays',
      description: 'Cache-efficient memory access patterns',
      icon: <Storage />,
    },
    {
      phase: 'Computation',
      title: 'Unified Kernel',
      description: 'Single dispatch updates entire world',
      icon: <Psychology />,
    },
    {
      phase: 'Rendering',
      title: 'Indirect Drawing',
      description: 'GPU decides what to render',
      icon: <Layers />,
    },
    {
      phase: 'Future',
      title: 'Mesh Shaders',
      description: 'Next-gen GPU features ready',
      icon: <Science />,
    },
  ];

  // Engine Comparison Component
  const EngineComparison = () => {
    const [orderBy, setOrderBy] = useState<string>('category');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    // Comparison data
    const comparisonData = [
      // Core Features
      {
        category: 'Core Features',
        feature: 'Open Source',
        hearth: { value: true, detail: 'MIT License, full source access' },
        unity: { value: 'partial', detail: 'Core closed, some packages open' },
        unreal: { value: 'partial', detail: 'Source available with EULA' },
        godot: { value: true, detail: 'MIT License' },
      },
      {
        category: 'Core Features',
        feature: 'Voxel Native',
        hearth: { value: true, detail: 'Built specifically for voxels' },
        unity: { value: false, detail: 'Requires third-party assets' },
        unreal: { value: false, detail: 'Requires plugins or custom implementation' },
        godot: { value: false, detail: 'Community modules available' },
      },
      {
        category: 'Core Features',
        feature: 'GPU-First Architecture',
        hearth: { value: true, detail: 'Entire world lives on GPU' },
        unity: { value: false, detail: 'CPU-based with GPU rendering' },
        unreal: { value: 'partial', detail: 'Some GPU compute features' },
        godot: { value: false, detail: 'Traditional CPU architecture' },
      },
      {
        category: 'Core Features',
        feature: 'ECS/Data-Oriented',
        hearth: { value: true, detail: 'Pure data transformations' },
        unity: { value: 'partial', detail: 'DOTS available but not default' },
        unreal: { value: false, detail: 'Object-oriented by design' },
        godot: { value: false, detail: 'Node-based OOP' },
      },
      // Performance
      {
        category: 'Performance',
        feature: 'Max Voxels (60 FPS)',
        hearth: { value: '2M+', detail: 'GPU-limited, scales with hardware' },
        unity: { value: '100K', detail: 'CPU bottlenecked' },
        unreal: { value: '150K', detail: 'Memory and CPU limited' },
        godot: { value: '50K', detail: 'Performance varies by implementation' },
      },
      {
        category: 'Performance',
        feature: 'Physics Objects',
        hearth: { value: '100K+', detail: 'GPU-parallel physics' },
        unity: { value: '5K', detail: 'PhysX CPU limited' },
        unreal: { value: '10K', detail: 'Chaos physics CPU bound' },
        godot: { value: '3K', detail: 'Bullet physics limitations' },
      },
      {
        category: 'Performance',
        feature: 'Draw Calls',
        hearth: { value: '< 100', detail: 'GPU-driven indirect rendering' },
        unity: { value: '1000+', detail: 'Per-chunk draw calls' },
        unreal: { value: '800+', detail: 'Instanced rendering helps' },
        godot: { value: '1500+', detail: 'Limited batching' },
      },
      // Development
      {
        category: 'Development',
        feature: 'Language',
        hearth: { value: 'Rust/WGSL', detail: 'Memory safe, modern tooling' },
        unity: { value: 'C#', detail: 'Managed runtime, GC pauses' },
        unreal: { value: 'C++', detail: 'Complex but powerful' },
        godot: { value: 'GDScript/C#', detail: 'Multiple language support' },
      },
      {
        category: 'Development',
        feature: 'Hot Reload',
        hearth: { value: true, detail: 'Shader and asset hot reload' },
        unity: { value: 'partial', detail: 'Script compilation required' },
        unreal: { value: 'partial', detail: 'Live coding available' },
        godot: { value: true, detail: 'GDScript hot reload' },
      },
      {
        category: 'Development',
        feature: 'Compile Time',
        hearth: { value: '< 30s', detail: 'Incremental Rust compilation' },
        unity: { value: 'Instant', detail: 'JIT compilation' },
        unreal: { value: '5-30min', detail: 'C++ compilation overhead' },
        godot: { value: 'Instant', detail: 'Interpreted scripts' },
      },
      // Platform Support
      {
        category: 'Platform Support',
        feature: 'Windows',
        hearth: { value: true, detail: 'Native WGPU support' },
        unity: { value: true, detail: 'Full support' },
        unreal: { value: true, detail: 'Primary platform' },
        godot: { value: true, detail: 'Full support' },
      },
      {
        category: 'Platform Support',
        feature: 'Linux',
        hearth: { value: true, detail: 'First-class support' },
        unity: { value: true, detail: 'Good support' },
        unreal: { value: true, detail: 'Requires setup' },
        godot: { value: true, detail: 'Native development' },
      },
      {
        category: 'Platform Support',
        feature: 'macOS',
        hearth: { value: true, detail: 'Metal backend' },
        unity: { value: true, detail: 'Full support' },
        unreal: { value: true, detail: 'Metal support' },
        godot: { value: true, detail: 'Full support' },
      },
      {
        category: 'Platform Support',
        feature: 'Web (WASM)',
        hearth: { value: false, detail: 'Planned for the future' },
        unity: { value: 'partial', detail: 'Limited features' },
        unreal: { value: false, detail: 'Experimental only' },
        godot: { value: true, detail: 'HTML5 export' },
      },
      // Licensing
      {
        category: 'Licensing',
        feature: 'License Type',
        hearth: { value: 'MIT', detail: 'Permissive open source' },
        unity: { value: 'Proprietary', detail: 'Per-seat licensing' },
        unreal: { value: 'Proprietary', detail: 'Source available' },
        godot: { value: 'MIT', detail: 'Free and open source' },
      },
      {
        category: 'Licensing',
        feature: 'Royalties',
        hearth: { value: 'None', detail: '100% royalty free' },
        unity: { value: 'Revenue cap', detail: 'Free under $100K/year' },
        unreal: { value: '5%', detail: 'After $1M gross revenue' },
        godot: { value: 'None', detail: 'Completely free' },
      },
      {
        category: 'Licensing',
        feature: 'Source Access',
        hearth: { value: 'Full', detail: 'Complete engine source' },
        unity: { value: 'None', detail: 'Closed source' },
        unreal: { value: 'Full', detail: 'With license agreement' },
        godot: { value: 'Full', detail: 'Open development' },
      },
    ];

    // Handle sorting
    const handleRequestSort = (property: string) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    // Sort data
    const sortedData = useMemo(() => {
      return [...comparisonData].sort((a, b) => {
        let compareValue = 0;

        if (orderBy === 'category') {
          compareValue = a.category.localeCompare(b.category);
        } else if (orderBy === 'feature') {
          compareValue = a.feature.localeCompare(b.feature);
        }

        return order === 'asc' ? compareValue : -compareValue;
      });
    }, [comparisonData, order, orderBy]);

    // Toggle row expansion
    const handleExpandRow = (feature: string) => {
      setExpandedRows(prev =>
        prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
      );
    };

    // Export functions
    const exportToCSV = () => {
      const headers = ['Category', 'Feature', 'Hearth', 'Unity', 'Unreal', 'Godot'];
      const rows = comparisonData.map(row => [
        row.category,
        row.feature,
        typeof row.hearth.value === 'boolean'
          ? row.hearth.value
            ? 'Yes'
            : 'No'
          : row.hearth.value,
        typeof row.unity.value === 'boolean' ? (row.unity.value ? 'Yes' : 'No') : row.unity.value,
        typeof row.unreal.value === 'boolean'
          ? row.unreal.value
            ? 'Yes'
            : 'No'
          : row.unreal.value,
        typeof row.godot.value === 'boolean' ? (row.godot.value ? 'Yes' : 'No') : row.godot.value,
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hearth-engine-comparison.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const exportToJSON = () => {
      const jsonData = comparisonData.map(row => ({
        category: row.category,
        feature: row.feature,
        engines: {
          hearth: row.hearth,
          unity: row.unity,
          unreal: row.unreal,
          godot: row.godot,
        },
      }));

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hearth-engine-comparison.json';
      a.click();
      window.URL.revokeObjectURL(url);
    };

    // Render value cell
    const renderValueCell = (value: any, engineName: string) => {
      const isHearth = engineName === 'hearth';

      if (typeof value.value === 'boolean') {
        return (
          <Box
            component={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: isHearth ? 0.2 : 0 }}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            {value.value ? (
              <Check sx={{ color: COLORS.status.success }} />
            ) : (
              <Close sx={{ color: COLORS.status.error }} />
            )}
          </Box>
        );
      }
      if (value.value === 'partial') {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <RemoveCircleOutline sx={{ color: COLORS.status.warning }} />
          </Box>
        );
      }
      return (
        <Typography
          variant='body2'
          sx={{
            fontWeight: isHearth ? 700 : 400,
            color: isHearth ? COLORS.primary.main : 'text.primary',
          }}
        >
          {value.value}
        </Typography>
      );
    };

    return (
      <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.4), py: 8 }}>
        <Container maxWidth='lg'>
          <Typography
            variant='h3'
            align='center'
            sx={{ mb: 2, fontWeight: 700 }}
            component={motion.h3}
            initial='hidden'
            animate='visible'
            variants={fadeInUp}
          >
            Engine Comparison
          </Typography>
          <Typography
            variant='h6'
            align='center'
            color='text.secondary'
            sx={{ mb: 4 }}
            component={motion.p}
            initial='hidden'
            animate='visible'
            variants={fadeInUp}
          >
            See how Hearth stacks up against other popular game engines
          </Typography>

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant='outlined'
              size='small'
              startIcon={<FileDownload />}
              onClick={exportToCSV}
            >
              Export CSV
            </Button>
            <Button
              variant='outlined'
              size='small'
              startIcon={<FileDownload />}
              onClick={exportToJSON}
            >
              Export JSON
            </Button>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              background: alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              overflowX: 'auto',
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label='engine comparison table'>
              <TableHead>
                <TableRow>
                  <TableCell width='40' />
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'category'}
                      direction={orderBy === 'category' ? order : 'asc'}
                      onClick={() => handleRequestSort('category')}
                    >
                      Category
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'feature'}
                      direction={orderBy === 'feature' ? order : 'asc'}
                      onClick={() => handleRequestSort('feature')}
                    >
                      Feature
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, color: COLORS.primary.main }}>
                    Hearth Engine
                  </TableCell>
                  <TableCell align='center'>Unity</TableCell>
                  <TableCell align='center'>Unreal Engine</TableCell>
                  <TableCell align='center'>Godot</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map(row => {
                  const isExpanded = expandedRows.includes(row.feature);
                  const isHearthBetter =
                    (typeof row.hearth.value === 'boolean' && row.hearth.value === true) ||
                    row.hearth.value === 'MIT' ||
                    row.hearth.value === 'None' ||
                    row.hearth.value === 'Full' ||
                    row.hearth.value === 'Rust/WGSL' ||
                    row.hearth.value === '< 30s' ||
                    row.hearth.value === '2M+' ||
                    row.hearth.value === '100K+' ||
                    row.hearth.value === '< 100';

                  return (
                    <React.Fragment key={`${row.category}-${row.feature}`}>
                      <TableRow
                        sx={{
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                          ...(isHearthBetter && {
                            animation: `${isMobile ? 'none' : 'pulse 3s ease-in-out infinite'}`,
                            '@keyframes pulse': {
                              '0%': {
                                backgroundColor: 'transparent',
                              },
                              '50%': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                              },
                              '100%': {
                                backgroundColor: 'transparent',
                              },
                            },
                          }),
                        }}
                      >
                        <TableCell>
                          <IconButton size='small' onClick={() => handleExpandRow(row.feature)}>
                            <ExpandMore
                              sx={{
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                              }}
                            />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' color='text.secondary'>
                            {row.category}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' fontWeight={500}>
                            {row.feature}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          {renderValueCell(row.hearth, 'hearth')}
                        </TableCell>
                        <TableCell align='center'>{renderValueCell(row.unity, 'unity')}</TableCell>
                        <TableCell align='center'>
                          {renderValueCell(row.unreal, 'unreal')}
                        </TableCell>
                        <TableCell align='center'>{renderValueCell(row.godot, 'godot')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0, border: 'none' }}>
                          <Collapse in={isExpanded}>
                            <Box
                              sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}
                            >
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant='subtitle2' color='primary' gutterBottom>
                                    Hearth Engine
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {row.hearth.detail}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant='subtitle2' gutterBottom>
                                    Unity
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {row.unity.detail}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant='subtitle2' gutterBottom>
                                    Unreal Engine
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {row.unreal.detail}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant='subtitle2' gutterBottom>
                                    Godot
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {row.godot.detail}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              <strong>Legend:</strong>{' '}
              <Check sx={{ color: COLORS.status.success, fontSize: 16, verticalAlign: 'middle' }} />{' '}
              = Full Support,{' '}
              <RemoveCircleOutline
                sx={{ color: COLORS.status.warning, fontSize: 16, verticalAlign: 'middle' }}
              />{' '}
              = Partial Support,{' '}
              <Close sx={{ color: COLORS.status.error, fontSize: 16, verticalAlign: 'middle' }} /> =
              Not Supported
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  };

  return (
    <>
      <SEO
        title='Engine Technology - Hearth Engine'
        description='Explore the cutting-edge GPU-first architecture behind Hearth Engine. Data-oriented design, true physics simulation, and planet-scale voxel worlds.'
        keywords='hearth engine, gpu architecture, voxel engine, data oriented programming, game engine technology, rust game engine, wgpu, compute shaders'
        pathname='/engine'
      />
      <NavigationBar variant='home' />

      {/* Hero Section */}
      <Box
        component={motion.div}
        initial='hidden'
        animate='visible'
        variants={fadeInUp}
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1,
          )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          pt: 16,
          pb: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={4} alignItems='center'>
            <Grid item xs={12} md={6}>
              <Typography
                variant='h1'
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '3rem', md: '4rem' },
                  mb: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Hearth Engine
              </Typography>
              <Typography variant='h5' color='text.secondary' sx={{ mb: 4 }}>
                Next-generation voxel engine built for the GPU era
              </Typography>
              <Stack direction='row' spacing={2} flexWrap='wrap' sx={{ mb: 3 }}>
                <Chip icon={<Speed />} label='GPU-First' color='primary' />
                <Chip icon={<Architecture />} label='Data-Oriented' />
                <Chip icon={<Public />} label='Planet-Scale' />
                <Chip icon={<Build />} label='True Physics' />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  background: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant='h6' gutterBottom>
                  Core Philosophy
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  Hearth Engine represents a paradigm shift in voxel engine design. By treating the
                  entire game as transformations over shared GPU memory, we achieve unprecedented
                  performance and scale.
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color='primary' />
                    </ListItemIcon>
                    <ListItemText primary='100% GPU-resident world data' />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color='primary' />
                    </ListItemIcon>
                    <ListItemText primary='Zero-allocation hot paths' />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color='primary' />
                    </ListItemIcon>
                    <ListItemText primary='Emergent civilization simulation' />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Grid */}
      <Container maxWidth='lg' sx={{ py: 8 }}>
        <Typography
          variant='h2'
          align='center'
          sx={{ mb: 2, fontWeight: 800 }}
          component={motion.h2}
          initial='hidden'
          animate='visible'
          variants={fadeInUp}
        >
          Engine Features
        </Typography>
        <Typography
          variant='h6'
          align='center'
          color='text.secondary'
          sx={{ mb: 6 }}
          component={motion.p}
          initial='hidden'
          animate='visible'
          variants={fadeInUp}
        >
          Built from the ground up for modern GPU architectures
        </Typography>

        <Grid
          container
          spacing={3}
          component={motion.div}
          variants={stagger}
          initial='hidden'
          animate='visible'
        >
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <InteractiveCard
                sx={{
                  height: '100%',
                  background: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mr: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant='h6' fontWeight={700}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    {feature.description}
                  </Typography>
                  <Stack spacing={1}>
                    {feature.stats.map((stat, idx) => (
                      <Typography
                        key={idx}
                        variant='caption'
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          '&:before': {
                            content: '"→"',
                            mr: 1,
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        {stat}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </InteractiveCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Performance Metrics */}
      <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.4), py: 8 }}>
        <Container maxWidth='lg'>
          <Typography variant='h3' align='center' sx={{ mb: 2, fontWeight: 700 }}>
            Performance Results
          </Typography>
          <Typography variant='h6' align='center' color='text.secondary' sx={{ mb: 6 }}>
            Data-oriented architecture delivers real-world improvements
          </Typography>

          <Grid container spacing={3}>
            {performanceMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: alpha(theme.palette.background.paper, 0.8),
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  }}
                >
                  <Typography variant='h6' gutterBottom>
                    {metric.label}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'baseline',
                      mb: 1,
                    }}
                  >
                    <Typography variant='body2' color='text.secondary' sx={{ mr: 1 }}>
                      {metric.before}
                    </Typography>
                    <Typography variant='h5' color='primary'>
                      →
                    </Typography>
                    <Typography variant='body2' color='primary' sx={{ ml: 1, fontWeight: 700 }}>
                      {metric.after}
                    </Typography>
                  </Box>
                  <Chip
                    label={metric.improvement}
                    size='small'
                    color='primary'
                    sx={{ fontWeight: 600 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Architecture Timeline */}
      <Container maxWidth='lg' sx={{ py: 8 }}>
        <Typography variant='h3' align='center' sx={{ mb: 2, fontWeight: 700 }}>
          Architecture Evolution
        </Typography>
        <Typography variant='h6' align='center' color='text.secondary' sx={{ mb: 6 }}>
          From traditional design to GPU-first future
        </Typography>

        {!isMobile ? (
          <Box sx={{ position: 'relative' }}>
            {architectureHighlights.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 4,
                  flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                  gap: 3,
                }}
              >
                <Box sx={{ flex: 1, textAlign: index % 2 === 0 ? 'right' : 'left' }}>
                  <Typography variant='overline' color='text.secondary'>
                    {item.phase}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      zIndex: 1,
                    }}
                  >
                    {item.icon}
                  </Box>
                  {index < architectureHighlights.length - 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        width: 2,
                        height: 60,
                        bgcolor: theme.palette.primary.main,
                        opacity: 0.3,
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      background: alpha(theme.palette.background.paper, 0.6),
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }}
                  >
                    <Typography variant='h6' component='h3'>
                      {item.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {item.description}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Stack spacing={2}>
            {architectureHighlights.map((item, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 3,
                  background: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      background: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mr: 2,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant='overline' color='text.secondary'>
                      {item.phase}
                    </Typography>
                    <Typography variant='h6'>{item.title}</Typography>
                  </Box>
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  {item.description}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>

      {/* Tech Stack */}
      <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.4), py: 8 }}>
        <Container maxWidth='lg'>
          <Typography variant='h3' align='center' sx={{ mb: 2, fontWeight: 700 }}>
            Technology Stack
          </Typography>
          <Typography variant='h6' align='center' color='text.secondary' sx={{ mb: 6 }}>
            Modern tools for next-generation performance
          </Typography>

          <Grid container spacing={2} justifyContent='center'>
            {techStack.map((tech, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: alpha(theme.palette.background.paper, 0.8),
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Box
                    sx={{
                      mb: 1,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {tech.icon}
                  </Box>
                  <Typography variant='subtitle2' fontWeight={700}>
                    {tech.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {tech.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Engine Comparison Section */}
      <EngineComparison />

      {/* Call to Action */}
      <Container maxWidth='md' sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant='h3' sx={{ mb: 2, fontWeight: 700 }}>
          Ready to Build?
        </Typography>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 4 }}>
          Start creating worlds with Hearth Engine today
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center'>
          <Box
            component='a'
            href='/docs'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: SHADOWS.button,
              },
            }}
          >
            <MenuBook sx={{ mr: 1 }} />
            Read Documentation
          </Box>
          <Box
            component='a'
            href={MISC.github.repoUrl}
            target='_blank'
            rel='noopener noreferrer'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              border: `2px solid ${theme.palette.primary.main}`,
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <Code sx={{ mr: 1 }} />
            View Source
          </Box>
        </Stack>
      </Container>
      <Footer />
    </>
  );
};

export default Engine;
