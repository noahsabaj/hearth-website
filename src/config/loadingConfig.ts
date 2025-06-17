export const loadingConfig = {
  // Default loading messages for different sections
  messages: {
    github: {
      connecting: 'Connecting to GitHub...',
      fetching: 'Fetching latest releases...',
      processing: 'Processing release data...',
      finalizing: 'Finalizing...',
      complete: 'Complete!',
    },
    page: {
      initializing: 'Initializing page...',
      loadingAssets: 'Loading assets...',
      preparingContent: 'Preparing content...',
      almostReady: 'Almost ready...',
    },
    images: {
      loading: 'Loading image...',
      processing: 'Processing...',
      optimizing: 'Optimizing for display...',
    },
  },

  // Loading tips for different contexts
  tips: {
    general: [
      'Hearth Engine uses Vulkan for cutting-edge graphics performance',
      'Our physics system can simulate millions of particles in real-time',
      'Check out our example projects to get started quickly',
      'Join our Discord community for support and updates',
      'All releases include comprehensive documentation',
    ],
    technical: [
      'Hearth Engine supports multithreaded physics simulation',
      'GPU compute shaders accelerate voxel processing',
      'Our engine uses a modern ECS architecture',
      'Real-time global illumination is supported out of the box',
      'Custom shaders can be written in WGSL',
    ],
    performance: [
      'Enable GPU instancing for better performance',
      'Use LOD systems to optimize distant voxels',
      'Profile your game with our built-in tools',
      'Batch similar voxels for improved rendering',
      'Consider using occlusion culling for complex scenes',
    ],
  },

  // Timing configurations
  timing: {
    tipRotationInterval: 3000,
    minimumLoadingTime: 300,
    progressUpdateInterval: 100,
    shimmerAnimationDuration: 1500,
  },

  // Visual configurations
  visuals: {
    colors: {
      primary: '#ff4500',
      secondary: '#ff6b35',
      progressBackground: 'rgba(255, 255, 255, 0.1)',
      progressBar: '#ff4500',
      shimmer: 'rgba(255, 255, 255, 0.08)',
    },
    sizes: {
      small: { circular: 24, linear: 4, dots: 8 },
      medium: { circular: 40, linear: 6, dots: 12 },
      large: { circular: 60, linear: 8, dots: 16 },
    },
  },

  // Accessibility configurations
  accessibility: {
    announceInterval: 10, // Announce every 10% progress
    ariaLabels: {
      loading: 'Loading content',
      progress: 'Loading progress',
      complete: 'Loading complete',
    },
  },
};