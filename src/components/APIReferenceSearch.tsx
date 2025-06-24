import {
  Search,
  Clear,
  ContentCopy,
  Code,
  Functions,
  DataObject,
  Extension,
} from '@mui/icons-material';
import {
  Box,
  TextField,
  Paper,
  Typography,
  List,
  ListItem,
  IconButton,
  InputAdornment,
  Chip,
  Tooltip,
  Fade,
  Grid,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import React, { useState, useMemo, useCallback } from 'react';

import CodeBlock from './CodeBlock';
import { COLORS, ANIMATION, TYPOGRAPHY } from '../constants';

// API item types
type APIItemType = 'function' | 'struct' | 'trait' | 'enum' | 'type';

interface APIParameter {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
}

interface APIItem {
  id: string;
  name: string;
  type: APIItemType;
  signature: string;
  description: string;
  parameters?: APIParameter[];
  returnType?: string;
  example?: string;
  module: string;
}

// Sample API data
const API_DATA: APIItem[] = [
  // Core Engine Functions
  {
    id: 'engine-new',
    name: 'Engine::new',
    type: 'function',
    signature: 'pub fn new() -> Self',
    description: 'Creates a new instance of the Hearth Engine with default configuration.',
    returnType: 'Engine',
    module: 'hearth_engine',
    example: `let mut engine = Engine::new();`,
  },
  {
    id: 'engine-run',
    name: 'Engine::run',
    type: 'function',
    signature: 'pub fn run<G: Game>(&mut self, game: G)',
    description: 'Starts the game loop with the provided Game implementation.',
    parameters: [
      {
        name: 'game',
        type: 'G: Game',
        description: 'The game instance implementing the Game trait',
      },
    ],
    module: 'hearth_engine',
    example: `engine.run(MyGame::new());`,
  },
  {
    id: 'engine-configure',
    name: 'Engine::configure',
    type: 'function',
    signature: 'pub fn configure(&mut self, config: EngineConfig) -> &mut Self',
    description: 'Configures the engine with custom settings.',
    parameters: [
      {
        name: 'config',
        type: 'EngineConfig',
        description: 'Configuration struct with engine settings',
      },
    ],
    returnType: '&mut Engine',
    module: 'hearth_engine',
  },

  // World Functions
  {
    id: 'world-set-voxel',
    name: 'set_voxel',
    type: 'function',
    signature: 'pub fn set_voxel(buffer: &mut WorldBuffer, pos: Vec3<i32>, voxel_type: VoxelType)',
    description: 'Sets a voxel at the specified position in the world buffer.',
    parameters: [
      {
        name: 'buffer',
        type: '&mut WorldBuffer',
        description: 'Mutable reference to the world buffer',
      },
      {
        name: 'pos',
        type: 'Vec3<i32>',
        description: '3D position in world coordinates',
      },
      {
        name: 'voxel_type',
        type: 'VoxelType',
        description: 'Type of voxel to place',
      },
    ],
    module: 'world_unified',
    example: `set_voxel(&mut world_buffer, vec3(10, 20, 30), VoxelType::Stone);`,
  },
  {
    id: 'world-get-voxel',
    name: 'get_voxel',
    type: 'function',
    signature: 'pub fn get_voxel(buffer: &WorldBuffer, pos: Vec3<i32>) -> Option<VoxelType>',
    description: 'Retrieves the voxel type at the specified position.',
    parameters: [
      {
        name: 'buffer',
        type: '&WorldBuffer',
        description: 'Reference to the world buffer',
      },
      {
        name: 'pos',
        type: 'Vec3<i32>',
        description: '3D position in world coordinates',
      },
    ],
    returnType: 'Option<VoxelType>',
    module: 'world_unified',
  },
  {
    id: 'world-generate-terrain',
    name: 'generate_terrain',
    type: 'function',
    signature: 'pub fn generate_terrain(buffer: &mut WorldBuffer, params: TerrainParams)',
    description: 'Generates procedural terrain using the specified parameters.',
    parameters: [
      {
        name: 'buffer',
        type: '&mut WorldBuffer',
        description: 'Mutable reference to the world buffer',
      },
      {
        name: 'params',
        type: 'TerrainParams',
        description: 'Terrain generation parameters',
      },
    ],
    module: 'world_unified::generation',
  },

  // Core Structs
  {
    id: 'struct-engine',
    name: 'Engine',
    type: 'struct',
    signature: 'pub struct Engine { ... }',
    description: 'The main engine struct that manages the game loop, rendering, and systems.',
    module: 'hearth_engine',
  },
  {
    id: 'struct-world-buffer',
    name: 'WorldBuffer',
    type: 'struct',
    signature: 'pub struct WorldBuffer { ... }',
    description: 'GPU-resident buffer containing all voxel data for the world.',
    module: 'world_unified',
  },
  {
    id: 'struct-voxel',
    name: 'Voxel',
    type: 'struct',
    signature: `pub struct Voxel {
    pub voxel_type: VoxelType,
    pub temperature: f32,
    pub pressure: f32,
    pub material_state: MaterialState,
}`,
    description: 'Represents a single voxel with physics properties.',
    module: 'world_unified::core',
  },
  {
    id: 'struct-terrain-params',
    name: 'TerrainParams',
    type: 'struct',
    signature: `pub struct TerrainParams {
    pub seed: u64,
    pub scale: f32,
    pub octaves: u32,
    pub biome_scale: f32,
}`,
    description: 'Parameters for procedural terrain generation.',
    module: 'world_unified::generation',
  },

  // Traits
  {
    id: 'trait-game',
    name: 'Game',
    type: 'trait',
    signature: `pub trait Game {
    fn init(&mut self, world: &mut World);
    fn update(&mut self, world: &mut World, input: &Input, dt: f32);
    fn render(&mut self, world: &World, renderer: &mut Renderer);
}`,
    description: 'Core trait that all games must implement to work with Hearth Engine.',
    module: 'hearth_engine',
  },
  {
    id: 'trait-component',
    name: 'Component',
    type: 'trait',
    signature: `pub trait Component: Send + Sync + 'static {
    type Storage: ComponentStorage<Self>;
}`,
    description: 'Trait for data components in the ECS system.',
    module: 'hearth_engine::ecs',
  },
  {
    id: 'trait-system',
    name: 'System',
    type: 'trait',
    signature: `pub trait System {
    fn run(&mut self, world: &mut World, dt: f32);
}`,
    description: 'Trait for systems that process entities and components.',
    module: 'hearth_engine::ecs',
  },

  // Enums
  {
    id: 'enum-voxel-type',
    name: 'VoxelType',
    type: 'enum',
    signature: `pub enum VoxelType {
    Air,
    Stone,
    Dirt,
    Water,
    Lava,
    // ... more variants
}`,
    description: 'Enumeration of all voxel types available in the engine.',
    module: 'world_unified::core',
  },
  {
    id: 'enum-material-state',
    name: 'MaterialState',
    type: 'enum',
    signature: `pub enum MaterialState {
    Solid,
    Liquid,
    Gas,
    Plasma,
}`,
    description: 'Physical state of a material.',
    module: 'world_unified::physics',
  },

  // GPU Functions
  {
    id: 'gpu-create-kernel',
    name: 'create_compute_kernel',
    type: 'function',
    signature: 'pub fn create_compute_kernel<T: GPUType>(name: &str) -> ComputeKernel<T>',
    description: 'Creates a new GPU compute kernel with automatic WGSL generation.',
    parameters: [
      {
        name: 'name',
        type: '&str',
        description: 'Name identifier for the kernel',
      },
    ],
    returnType: 'ComputeKernel<T>',
    module: 'gpu::automation',
  },
  {
    id: 'gpu-dispatch',
    name: 'dispatch_kernel',
    type: 'function',
    signature: 'pub fn dispatch_kernel<T>(kernel: &ComputeKernel<T>, workgroups: [u32; 3])',
    description: 'Dispatches a compute kernel to the GPU with specified workgroup dimensions.',
    parameters: [
      {
        name: 'kernel',
        type: '&ComputeKernel<T>',
        description: 'The kernel to dispatch',
      },
      {
        name: 'workgroups',
        type: '[u32; 3]',
        description: 'Number of workgroups in each dimension',
      },
    ],
    module: 'gpu::automation',
  },

  // Physics
  {
    id: 'physics-kernel-new',
    name: 'PhysicsKernel::new',
    type: 'function',
    signature: 'pub fn new() -> Self',
    description: 'Creates a new physics simulation kernel.',
    returnType: 'PhysicsKernel',
    module: 'world_unified::compute::physics',
  },
  {
    id: 'physics-kernel-execute',
    name: 'PhysicsKernel::execute',
    type: 'function',
    signature: 'pub fn execute(&self, buffer: &mut WorldBuffer, dt: f32)',
    description: 'Executes one physics simulation step on the GPU.',
    parameters: [
      {
        name: 'buffer',
        type: '&mut WorldBuffer',
        description: 'World buffer to simulate',
      },
      {
        name: 'dt',
        type: 'f32',
        description: 'Delta time in seconds',
      },
    ],
    module: 'world_unified::compute::physics',
  },

  // Type Aliases
  {
    id: 'type-vec3',
    name: 'Vec3',
    type: 'type',
    signature: 'pub type Vec3<T> = [T; 3]',
    description: 'Type alias for 3D vectors.',
    module: 'hearth_engine::math',
  },
  {
    id: 'type-chunk-coord',
    name: 'ChunkCoord',
    type: 'type',
    signature: 'pub type ChunkCoord = Vec3<i32>',
    description: 'Type alias for chunk coordinates in world space.',
    module: 'world_unified::core',
  },
];

const APIReferenceSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<APIItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(API_DATA, {
        keys: ['name', 'description', 'module'],
        threshold: 0.3,
        includeScore: true,
      }),
    []
  );

  // Perform fuzzy search
  const searchResults = useMemo(() => {
    if (!searchQuery) return API_DATA.slice(0, 10); // Show first 10 items when no search
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse]);

  const handleCopySignature = useCallback((item: APIItem) => {
    navigator.clipboard.writeText(item.signature);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const getItemIcon = (type: APIItemType) => {
    switch (type) {
      case 'function':
        return <Functions fontSize='small' />;
      case 'struct':
        return <DataObject fontSize='small' />;
      case 'trait':
        return <Extension fontSize='small' />;
      case 'enum':
        return <Code fontSize='small' />;
      case 'type':
        return <Code fontSize='small' />;
    }
  };

  const getItemColor = (type: APIItemType) => {
    switch (type) {
      case 'function':
        return COLORS.status.info;
      case 'struct':
        return COLORS.status.success;
      case 'trait':
        return COLORS.primary.main;
      case 'enum':
        return COLORS.status.warning;
      case 'type':
        return COLORS.text.secondary;
    }
  };

  return (
    <Box>
      <Typography variant='h4' gutterBottom sx={{ fontWeight: TYPOGRAPHY.fontWeight.bold }}>
        API Reference Search
      </Typography>

      <Grid container spacing={3}>
        {/* Search Input */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            placeholder='Search API functions, structs, traits...'
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

        {/* Search Results */}
        <Grid item xs={12} md={selectedItem ? 6 : 12}>
          <Paper
            sx={{
              maxHeight: 600,
              overflow: 'auto',
              border: `1px solid ${COLORS.utils.border}`,
            }}
          >
            <List>
              <AnimatePresence mode='popLayout'>
                {searchResults.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <ListItem
                      button
                      selected={selectedItem?.id === item.id}
                      onClick={() => setSelectedItem(item)}
                      sx={{
                        borderBottom: `1px solid ${COLORS.utils.divider}`,
                        transition: ANIMATION.transition.fast,
                        '&:hover': {
                          backgroundColor: COLORS.utils.shimmer,
                        },
                        '&.Mui-selected': {
                          backgroundColor: `${COLORS.primary.main}1A`,
                          borderLeft: `3px solid ${COLORS.primary.main}`,
                          '&:hover': {
                            backgroundColor: `${COLORS.primary.main}26`,
                          },
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Box
                          sx={{
                            color: getItemColor(item.type),
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {getItemIcon(item.type)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant='body1'
                            sx={{ fontWeight: TYPOGRAPHY.fontWeight.semibold }}
                          >
                            {item.name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {item.module}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.type}
                          size='small'
                          sx={{
                            backgroundColor: `${getItemColor(item.type)}20`,
                            color: getItemColor(item.type),
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                    </ListItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          </Paper>
        </Grid>

        {/* Preview Panel */}
        {selectedItem && (
          <Grid item xs={12} md={6}>
            <Fade in={!!selectedItem}>
              <Paper
                sx={{
                  p: 3,
                  height: 600,
                  overflow: 'auto',
                  border: `1px solid ${COLORS.utils.border}`,
                  backgroundColor: COLORS.background.elevated,
                }}
              >
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ color: getItemColor(selectedItem.type) }}>
                      {getItemIcon(selectedItem.type)}
                    </Box>
                    <Typography variant='h5' sx={{ fontWeight: TYPOGRAPHY.fontWeight.bold }}>
                      {selectedItem.name}
                    </Typography>
                    <Chip
                      label={selectedItem.type}
                      size='small'
                      sx={{
                        backgroundColor: `${getItemColor(selectedItem.type)}20`,
                        color: getItemColor(selectedItem.type),
                      }}
                    />
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    {selectedItem.module}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography variant='body1' paragraph>
                  {selectedItem.description}
                </Typography>

                {/* Signature */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: TYPOGRAPHY.fontWeight.semibold }}
                    >
                      Signature
                    </Typography>
                    <Tooltip title={copiedId === selectedItem.id ? 'Copied!' : 'Copy signature'}>
                      <IconButton
                        size='small'
                        onClick={() => handleCopySignature(selectedItem)}
                        sx={{ color: COLORS.text.secondary }}
                      >
                        <ContentCopy fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <CodeBlock language='rust' showLineNumbers={false}>
                    {selectedItem.signature}
                  </CodeBlock>
                </Box>

                {/* Parameters */}
                {selectedItem.parameters && selectedItem.parameters.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: TYPOGRAPHY.fontWeight.semibold, mb: 2 }}
                    >
                      Parameters
                    </Typography>
                    {selectedItem.parameters.map((param, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant='body2'
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: TYPOGRAPHY.fontWeight.semibold,
                              color: COLORS.primary.main,
                            }}
                          >
                            {param.name}
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{ fontFamily: 'monospace', color: COLORS.text.secondary }}
                          >
                            : {param.type}
                          </Typography>
                          {param.optional && (
                            <Chip label='optional' size='small' sx={{ height: 16 }} />
                          )}
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          {param.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Return Type */}
                {selectedItem.returnType && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: TYPOGRAPHY.fontWeight.semibold, mb: 1 }}
                    >
                      Returns
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ fontFamily: 'monospace', color: COLORS.text.secondary }}
                    >
                      {selectedItem.returnType}
                    </Typography>
                  </Box>
                )}

                {/* Example */}
                {selectedItem.example && (
                  <Box>
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: TYPOGRAPHY.fontWeight.semibold, mb: 1 }}
                    >
                      Example
                    </Typography>
                    <CodeBlock language='rust' showLineNumbers={false}>
                      {selectedItem.example}
                    </CodeBlock>
                  </Box>
                )}
              </Paper>
            </Fade>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default APIReferenceSearch;
