/**
 * Central constants file for the Hearth Website
 * Contains all theme-related values, spacing, animations, and other constants
 */

// ========================================
// COLORS
// ========================================
export const COLORS = {
  // Primary brand colors
  primary: {
    main: '#ff4500',
    light: '#ff6b35',
    dark: '#e63900',
    hover: '#ff6500',
  },

  // Success, error, warning, info colors
  status: {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  },

  // Background colors
  background: {
    default: '#0a0a0a',
    paper: '#1a1a1a',
    elevated: '#222',
    overlay: 'rgba(10, 10, 10, 0.95)',
    overlayLight: 'rgba(10, 10, 10, 0.9)',
  },

  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#d4d4d4',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },

  // Utility colors
  utils: {
    divider: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowHeavy: 'rgba(0, 0, 0, 0.4)',
    shimmer: 'rgba(255, 255, 255, 0.05)',
    shimmerLight: 'rgba(255, 255, 255, 0.08)',
    ripple: 'rgba(255, 255, 255, 0.6)',
    transparent: 'transparent',
  },
} as const;

// ========================================
// SPACING
// ========================================
export const SPACING = {
  // Base unit (in pixels)
  unit: 8,

  // Common spacing values
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Component-specific spacing
  button: {
    paddingX: 24,
    paddingY: 10,
  },

  navbar: {
    height: 64,
    logoHeight: 40,
    logoMargin: 12,
  },

  card: {
    padding: 24,
  },

  fab: {
    bottom: 24,
    right: 24,
  },
} as const;

// ========================================
// TYPOGRAPHY
// ========================================
export const TYPOGRAPHY = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': '3rem',
    '5xl': '4rem',
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeight: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

// ========================================
// ANIMATION
// ========================================
export const ANIMATION = {
  // Durations (in milliseconds)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 400,
    slower: 600,
    slowest: 1000,
    // Specific durations
    ripple: 600,
    pageTransition: 400,
    sectionTransition: 600,
    toastAutoHide: 2000,
    feedbackToastAutoHide: 4000,
    tipRotation: 3000,
    shimmer: 1500,
    staggerDelay: 100,
  },

  // Animation offsets (in pixels)
  offset: {
    slideSmall: 60,
    slideMedium: 100,
    slideUp: 20,
    fadeUp: 60,
  },

  // Animation scale values
  scale: {
    small: 0.8,
    normal: 1,
    tap: 0.98,
    active: 0.95,
    hover: 1.1,
    hoverSmall: 1.02,
    large: 1.2,
    shadowHover: 1.5,
    ripple: 4,
  },

  // Spring animation config
  spring: {
    default: { damping: 25, stiffness: 400 },
    soft: { damping: 30, stiffness: 300 },
    bouncy: { damping: 15, stiffness: 500 },
  },

  // 3D transforms
  transform: {
    tiltIntensity: 15,
    translateZ: 20,
  },

  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
  },

  // Transition strings
  transition: {
    all: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ========================================
// LAYOUT
// ========================================
export const LAYOUT = {
  // Border radius values
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: '50%',
    pill: 9999,
  },

  // Common widths
  width: {
    minToast: 300,
    maxLoadingProgress: 400,
    minLoadingProgress: 200,
  },

  // Common heights
  height: {
    navbar: 64,
    divider: 1,
    progress: {
      small: 4,
      medium: 6,
      large: 8,
    },
  },

  // Backdrop filter
  backdropFilter: {
    blur: 'blur(10px)',
    blurLight: 'blur(5px)',
  },
} as const;

// ========================================
// Z-INDEX
// ========================================
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 50,
  fixed: 100,
  modalBackdrop: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
  fab: 1000,
  skipLink: 9999,
  loadingOverlay: 9999,
} as const;

// ========================================
// BREAKPOINTS
// ========================================
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

// ========================================
// SHADOWS
// ========================================
export const SHADOWS = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px rgba(0, 0, 0, 0.2)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.3)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.4)',
  '2xl': '0 24px 48px rgba(0, 0, 0, 0.5)',

  // Specific shadows
  button: '0 8px 25px rgba(0, 0, 0, 0.3)',
  card: '0 12px 40px rgba(0, 0, 0, 0.4)',
  toast: '0 4px 20px rgba(0, 0, 0, 0.3)',
  primary: '0 8px 20px rgba(255, 69, 0, 0.4)',
  primaryLight: '0 0 20px rgba(255, 69, 0, 0.5)',
} as const;

// ========================================
// ICONS
// ========================================
export const ICON_SIZES = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 60,
  navbar: 40,
  alert: 26,
  loading: 80,
} as const;

// ========================================
// LOADING
// ========================================
export const LOADING = {
  // Progress thresholds
  scrollThreshold: 300,
  progressUpdateInterval: 100,
  minimumLoadingTime: 300,
  announceInterval: 10, // Announce every 10% progress

  // Sizes for loading components
  sizes: {
    dots: {
      small: 8,
      medium: 12,
      large: 16,
    },
    circular: {
      small: 24,
      medium: 40,
      large: 60,
    },
    voxel: {
      small: 12,
      medium: 20,
      large: 28,
    },
  },

  // Voxel loader specific
  voxel: {
    gridSize: 5, // 5x5x5 grid
    buildSpeed: 150, // ms per voxel
    fadeInDuration: 400,
    rotationSpeed: 20, // seconds for full rotation
    voxelGap: 4, // pixels between voxels
    colors: {
      primary: '#ff4500',
      secondary: '#ff6b35',
      tertiary: '#e63900',
      glow: 'rgba(255, 69, 0, 0.6)',
    },
  },
} as const;

// ========================================
// FORMS
// ========================================
export const FORMS = {
  input: {
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  feedback: {
    rows: 3,
  },
} as const;

// ========================================
// PERCENTAGES
// ========================================
export const PERCENTAGES = {
  skeleton: {
    short: '70%',
    medium: '80%',
    long: '90%',
    full: '100%',
  },
  viewport: {
    threshold: 0.1,
  },
} as const;

// ========================================
// SHOWCASE
// ========================================
export const SHOWCASE = {
  categories: {
    all: 'All Projects',
    games: 'Games',
    techDemos: 'Tech Demos',
    tools: 'Tools',
  },
  placeholderImage: '/hearth-website/showcase-placeholder.png',
  imageAspectRatio: '16/9',
  grid: {
    columns: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 3,
    },
    spacing: 3,
  },
} as const;

// ========================================
// MISC
// ========================================
export const MISC = {
  github: {
    repoUrl: 'https://github.com/noahsabaj/hearth-engine',
    submitProjectUrl:
      'https://github.com/noahsabaj/hearth-engine/issues/new?template=showcase_submission.md&title=Showcase%20Submission:%20[Your%20Project%20Name]',
  },
  logo: {
    path: '/hearth-website/logo.png',
  },
  focus: {
    outline: '3px solid #ff4500',
    outlineWhite: '3px solid #ffffff',
    offset: '2px',
  },
  opacity: {
    disabled: 0.5,
    hover: 0.1,
    overlay: 0.95,
    subtle: 0.05,
  },
  accessibility: {
    skipLinkLeft: '-9999px',
    skipLinkLeftVisible: '16px',
  },
} as const;

// ========================================
// HIGH CONTRAST COLORS
// ========================================
export const HIGH_CONTRAST_COLORS = {
  // Primary brand colors with higher contrast
  primary: {
    main: '#ff6b35',
    light: '#ff8c5a',
    dark: '#ff4500',
    hover: '#ff7a45',
  },

  // Higher contrast status colors
  status: {
    success: '#66ff66',
    error: '#ff6666',
    warning: '#ffaa00',
    info: '#66ccff',
  },

  // High contrast backgrounds
  background: {
    default: '#000000',
    paper: '#1a1a1a',
    elevated: '#2a2a2a',
    overlay: 'rgba(0, 0, 0, 0.98)',
    overlayLight: 'rgba(0, 0, 0, 0.95)',
  },

  // High contrast text colors
  text: {
    primary: '#ffffff',
    secondary: '#ffffff',
    disabled: 'rgba(255, 255, 255, 0.7)',
  },

  // High contrast utility colors
  utils: {
    divider: 'rgba(255, 255, 255, 0.3)',
    border: 'rgba(255, 255, 255, 0.4)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    shadowHeavy: 'rgba(0, 0, 0, 0.6)',
    shimmer: 'rgba(255, 255, 255, 0.1)',
    shimmerLight: 'rgba(255, 255, 255, 0.15)',
    ripple: 'rgba(255, 255, 255, 0.8)',
    transparent: 'transparent',
  },
} as const;

// ========================================
// BENCHMARKS
// ========================================
export const BENCHMARKS = {
  // FPS vs Voxel Count data
  fpsData: [
    { voxels: 10000, hearth: 120, unity: 110, unreal: 105, godot: 95 },
    { voxels: 50000, hearth: 118, unity: 95, unreal: 92, godot: 85 },
    { voxels: 100000, hearth: 115, unity: 85, unreal: 82, godot: 75 },
    { voxels: 250000, hearth: 110, unity: 72, unreal: 70, godot: 62 },
    { voxels: 500000, hearth: 102, unity: 58, unreal: 55, godot: 48 },
    { voxels: 750000, hearth: 92, unity: 45, unreal: 42, godot: 35 },
    { voxels: 1000000, hearth: 85, unity: 35, unreal: 32, godot: 25 },
    { voxels: 1500000, hearth: 72, unity: 25, unreal: 23, godot: 18 },
    { voxels: 2000000, hearth: 65, unity: 18, unreal: 16, godot: 12 },
  ],

  // Memory usage data (in MB)
  memoryData: [
    { feature: 'Base Engine', hearth: 45, unity: 220, unreal: 350, godot: 180 },
    { feature: '100k Voxels', hearth: 85, unity: 380, unreal: 520, godot: 320 },
    { feature: '1M Voxels', hearth: 245, unity: 890, unreal: 1200, godot: 780 },
    { feature: 'Physics System', hearth: 35, unity: 120, unreal: 180, godot: 95 },
    { feature: 'Lighting', hearth: 55, unity: 150, unreal: 200, godot: 110 },
  ],

  // Physics performance data (operations per second)
  physicsData: [
    { test: 'Collision Detection', hearth: 850000, unity: 320000, unreal: 380000, godot: 250000 },
    { test: 'Rigid Body Updates', hearth: 620000, unity: 180000, unreal: 220000, godot: 150000 },
    { test: 'Fluid Simulation', hearth: 450000, unity: 120000, unreal: 150000, godot: 95000 },
    { test: 'Structural Integrity', hearth: 380000, unity: 85000, unreal: 95000, godot: 65000 },
  ],

  // Chunk generation times (in ms)
  chunkGenData: [
    { size: '16x16x16', hearth: 0.8, unity: 3.2, unreal: 2.9, godot: 4.1 },
    { size: '32x32x32', hearth: 2.1, unity: 8.5, unreal: 7.8, godot: 10.2 },
    { size: '64x64x64', hearth: 5.2, unity: 22.1, unreal: 19.8, godot: 26.5 },
    { size: '128x128x128', hearth: 14.3, unity: 58.9, unreal: 52.3, godot: 68.7 },
  ],

  // Default slider values
  defaultValues: {
    voxelCount: 500000,
    chunkSize: 32,
    viewDistance: 16,
    physicsQuality: 'high',
  },

  // Engine colors for charts
  engineColors: {
    hearth: '#ff4500',
    unity: '#000000',
    unreal: '#0e1128',
    godot: '#478cbf',
  },

  // Performance metrics
  metrics: {
    maxVoxels: 2000000,
    targetFPS: 60,
    optimalChunkSize: 32,
    maxViewDistance: 32,
  },
} as const;

// Type exports for TypeScript
export type ColorKey = keyof typeof COLORS;
export type SpacingKey = keyof typeof SPACING;
export type AnimationKey = keyof typeof ANIMATION;
export type LayoutKey = keyof typeof LAYOUT;
export type ZIndexKey = keyof typeof Z_INDEX;
export type BenchmarkKey = keyof typeof BENCHMARKS;
