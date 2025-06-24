import {
  Search,
  Close,
  Code,
  MenuBook,
  Download,
  HelpOutline,
  History,
  TrendingUp,
  ChevronRight,
  Terminal,
  Palette,
  NavigateNext,
  QuestionMark,
  Category,
  Api,
  Description,
  Analytics,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Fade,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
  ClickAwayListener,
} from '@mui/material';
import Fuse from 'fuse.js';
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { COLORS, ANIMATION, Z_INDEX, LAYOUT, TYPOGRAPHY } from '../constants';
import { useKeyboardShortcutsContext } from '../contexts/KeyboardShortcutsContext';

interface SearchItem {
  title: string;
  path: string;
  content: string;
  type: 'page' | 'section' | 'code' | 'faq' | 'docs' | 'api';
  keywords: string[];
  priority: number;
  category?: 'Pages' | 'Docs' | 'API' | 'FAQ';
}

interface Command {
  id: string;
  title: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  keywords: string[];
}

interface SearchAnalytics {
  query: string;
  timestamp: number;
  resultCount: number;
  selectedResult?: string;
}

type SearchMode = 'search' | 'command' | 'help';

export interface SearchBarRef {
  focus: () => void;
}

// Search data for all pages
const searchData: SearchItem[] = [
  // Main pages
  {
    title: 'Home',
    path: '/',
    content:
      'Hearth Engine homepage. Build worlds that feel real. Destroy them too. A next-generation voxel engine with true physics simulation.',
    type: 'page',
    keywords: ['home', 'main', 'start', 'hearth', 'engine', 'voxel'],
    priority: 100,
    category: 'Pages',
  },
  {
    title: 'Documentation',
    path: '/docs',
    content:
      'Complete documentation for Hearth Engine. Getting started, installation, API reference, core concepts, and usage examples.',
    type: 'page',
    keywords: ['docs', 'documentation', 'guide', 'tutorial', 'reference', 'api'],
    priority: 90,
    category: 'Docs',
  },
  {
    title: 'Engine',
    path: '/engine',
    content:
      'Explore Hearth Engine technology. GPU-first architecture, data-oriented design, performance metrics, and technical deep dive.',
    type: 'page',
    keywords: ['engine', 'gpu', 'architecture', 'technology', 'performance', 'features'],
    priority: 95,
    category: 'Pages',
  },
  {
    title: 'Downloads',
    path: '/downloads',
    content:
      'Download Hearth Engine for Windows, macOS, and Linux. Latest releases, installation instructions, and system requirements.',
    type: 'page',
    keywords: ['download', 'install', 'releases', 'binaries', 'setup'],
    priority: 90,
    category: 'Pages',
  },
  {
    title: 'FAQ',
    path: '/faq',
    content:
      'Frequently asked questions about Hearth Engine. System requirements, performance, development, and general questions.',
    type: 'faq',
    keywords: ['faq', 'questions', 'help', 'support', 'answers'],
    priority: 80,
    category: 'FAQ',
  },
  {
    title: 'Benchmarks',
    path: '/benchmarks',
    content:
      'Performance benchmarks and comparisons. FPS tests, voxel count tests, physics simulation performance across different hardware.',
    type: 'page',
    keywords: ['benchmarks', 'performance', 'fps', 'tests', 'comparison', 'metrics'],
    priority: 85,
    category: 'Pages',
  },
  {
    title: 'Showcase',
    path: '/showcase',
    content:
      'Games and projects built with Hearth Engine. Community creations, demos, examples, and featured projects.',
    type: 'page',
    keywords: ['showcase', 'examples', 'games', 'projects', 'demos', 'community'],
    priority: 75,
    category: 'Pages',
  },
  {
    title: 'Updates',
    path: '/updates',
    content:
      'Latest news and updates about Hearth Engine. Release notes, changelog, roadmap, and development progress.',
    type: 'page',
    keywords: ['updates', 'news', 'releases', 'changelog', 'roadmap', 'progress'],
    priority: 70,
    category: 'Pages',
  },

  // Documentation sections
  {
    title: 'Getting Started',
    path: '/docs#getting-started',
    content:
      'Quick introduction to Hearth Engine. Learn the basics of creating voxel worlds with realistic physics and emergent gameplay.',
    type: 'docs',
    keywords: ['getting started', 'introduction', 'basics', 'begin', 'tutorial'],
    priority: 85,
    category: 'Docs',
  },
  {
    title: 'Installation',
    path: '/docs#installation',
    content:
      'How to install Hearth Engine. Add to Cargo.toml, system requirements, GPU support for Vulkan, DirectX 12, or Metal.',
    type: 'docs',
    keywords: ['install', 'installation', 'cargo', 'toml', 'dependencies', 'setup'],
    priority: 85,
    category: 'Docs',
  },
  {
    title: 'Basic Usage',
    path: '/docs#basic-usage',
    content:
      'Creating voxel worlds, terrain generation, placing voxels, applying physics simulation. Code examples and tutorials.',
    type: 'docs',
    keywords: ['usage', 'examples', 'code', 'terrain', 'voxels', 'physics'],
    priority: 80,
    category: 'Docs',
  },
  {
    title: 'Core Concepts',
    path: '/docs#core-concepts',
    content:
      'Data-oriented design, GPU-first architecture, stateless systems, parallel processing, and engine architecture.',
    type: 'docs',
    keywords: ['concepts', 'architecture', 'design', 'gpu', 'data-oriented', 'parallel'],
    priority: 75,
    category: 'Docs',
  },
  {
    title: 'Cargo Commands',
    path: '/docs#cargo-commands',
    content:
      'Complete reference for Cargo commands. Build, run, test, debug, profile, and manage dependencies for Hearth Engine projects.',
    type: 'docs',
    keywords: ['cargo', 'commands', 'build', 'run', 'test', 'clippy', 'fmt'],
    priority: 75,
    category: 'Docs',
  },
  {
    title: 'API Reference',
    path: '/docs#api-reference',
    content:
      'Complete API documentation for Hearth Engine. Structs, traits, functions, and modules reference.',
    type: 'api',
    keywords: ['api', 'reference', 'docs', 'functions', 'traits', 'modules'],
    priority: 70,
    category: 'API',
  },

  // Code examples
  {
    title: 'Basic Game Example',
    path: '/docs#getting-started',
    content: 'use hearth_engine::{Engine, Game, World}; impl Game for MyGame',
    type: 'code',
    keywords: ['example', 'game', 'code', 'rust', 'impl', 'trait'],
    priority: 60,
    category: 'API',
  },
  {
    title: 'Terrain Generation',
    path: '/docs#basic-usage',
    content: 'world.generate_terrain(TerrainParams { seed: 42, scale: 0.1, octaves: 4 });',
    type: 'code',
    keywords: ['terrain', 'generate', 'world', 'seed', 'procedural'],
    priority: 55,
    category: 'API',
  },
  {
    title: 'Place Voxel',
    path: '/docs#basic-usage',
    content: 'world.set_voxel(vec3(10, 20, 30), VoxelType::Stone);',
    type: 'code',
    keywords: ['voxel', 'place', 'set', 'stone', 'block'],
    priority: 55,
    category: 'API',
  },
  {
    title: 'Physics Simulation',
    path: '/docs#basic-usage',
    content: 'world.simulate_physics(dt);',
    type: 'code',
    keywords: ['physics', 'simulate', 'simulation', 'dt', 'delta'],
    priority: 55,
    category: 'API',
  },

  // FAQ items
  {
    title: 'What is Hearth Engine?',
    path: '/faq',
    content:
      'Next-generation voxel game engine built in Rust with true physics simulation and GPU-first architecture.',
    type: 'faq',
    keywords: ['what', 'hearth', 'engine', 'about', 'description'],
    priority: 65,
    category: 'FAQ',
  },
  {
    title: 'System Requirements',
    path: '/faq',
    content: 'Rust 1.70+, GPU with Vulkan/DirectX 12/Metal support, 8GB RAM recommended.',
    type: 'faq',
    keywords: ['requirements', 'system', 'hardware', 'gpu', 'ram'],
    priority: 65,
    category: 'FAQ',
  },
  {
    title: 'Performance',
    path: '/faq',
    content: '60+ FPS with 1M+ voxels, GPU-accelerated physics, data-oriented design.',
    type: 'faq',
    keywords: ['performance', 'fps', 'speed', 'optimization', 'gpu'],
    priority: 60,
    category: 'FAQ',
  },
];

// Commands for command palette mode
const getCommands = (navigate: any, showToast: any): Command[] => [
  {
    id: 'navigate-home',
    title: 'Go to Home',
    description: 'Navigate to the homepage',
    action: () => navigate('/'),
    icon: <NavigateNext />,
    keywords: ['home', 'navigate', 'go'],
  },
  {
    id: 'navigate-docs',
    title: 'Go to Documentation',
    description: 'Navigate to the documentation',
    action: () => navigate('/docs'),
    icon: <Description />,
    keywords: ['docs', 'documentation', 'navigate'],
  },
  {
    id: 'navigate-engine',
    title: 'Go to Engine',
    description: 'Navigate to the engine page',
    action: () => navigate('/engine'),
    icon: <NavigateNext />,
    keywords: ['engine', 'navigate', 'technology'],
  },
  {
    id: 'navigate-downloads',
    title: 'Go to Downloads',
    description: 'Navigate to the downloads page',
    action: () => navigate('/downloads'),
    icon: <Download />,
    keywords: ['downloads', 'navigate', 'install'],
  },
  {
    id: 'navigate-benchmarks',
    title: 'Go to Benchmarks',
    description: 'Navigate to the benchmarks page',
    action: () => navigate('/benchmarks'),
    icon: <Analytics />,
    keywords: ['benchmarks', 'performance', 'navigate'],
  },
  {
    id: 'toggle-theme',
    title: 'Toggle Theme',
    description: 'Switch between light and dark theme',
    action: () => {
      // This would need to be connected to your theme context
      showToast('Theme toggle functionality to be implemented');
    },
    icon: <Palette />,
    keywords: ['theme', 'dark', 'light', 'toggle'],
  },
  {
    id: 'copy-install',
    title: 'Copy Installation Command',
    description: 'Copy cargo add hearth_engine to clipboard',
    action: () => {
      navigator.clipboard.writeText('cargo add hearth_engine');
      showToast('Installation command copied to clipboard!');
    },
    icon: <Terminal />,
    keywords: ['copy', 'install', 'cargo', 'clipboard'],
  },
];

// Search analytics functions
const trackSearch = (analytics: SearchAnalytics) => {
  const existingAnalytics = localStorage.getItem('searchAnalytics');
  const data = existingAnalytics ? JSON.parse(existingAnalytics) : [];
  data.push(analytics);

  // Keep only last 100 searches
  if (data.length > 100) {
    data.shift();
  }

  localStorage.setItem('searchAnalytics', JSON.stringify(data));
};

const getPopularSearches = (): string[] => {
  const existingAnalytics = localStorage.getItem('searchAnalytics');
  if (!existingAnalytics)
    return ['getting started', 'cargo commands', 'installation', 'performance'];

  const data: SearchAnalytics[] = JSON.parse(existingAnalytics);
  const searchCounts: Record<string, number> = {};

  data.forEach(item => {
    if (item.query) {
      searchCounts[item.query] = (searchCounts[item.query] || 0) + 1;
    }
  });

  return Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([query]) => query);
};

const SearchBar = forwardRef<SearchBarRef>((_, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { showToast } = useKeyboardShortcutsContext();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode>('search');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [commands, setCommands] = useState<Command[]>([]);
  const [commandResults, setCommandResults] = useState<Command[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);

  // Expose focus method to parent components
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        setOpen(true);
        // Increased timeout and added requestAnimationFrame for more reliable focus
        requestAnimationFrame(() => {
          setTimeout(() => {
            searchInputRef.current?.focus();
            searchInputRef.current?.select();
          }, 150);
        });
      },
    }),
    [],
  );

  // Focus input when modal opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 150);
      });
    }
  }, [open]);

  // Initialize Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(searchData, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'content', weight: 0.3 },
          { name: 'keywords', weight: 0.3 },
        ],
        threshold: 0.4,
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 2,
        ignoreLocation: true,
      }),
    []
  );

  // Initialize commands
  useEffect(() => {
    setCommands(getCommands(navigate, showToast));
  }, [navigate, showToast]);

  // Initialize Fuse.js for commands
  const commandFuse = useMemo(
    () =>
      new Fuse(commands, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'keywords', weight: 0.3 },
        ],
        threshold: 0.4,
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 2,
        ignoreLocation: true,
      }),
    [commands]
  );

  // Load search history and popular searches from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    setPopularSearches(getPopularSearches());
  }, []);

  // Save search history
  const saveToHistory = useCallback((term: string) => {
    if (!term.trim()) return;

    setSearchHistory(prev => {
      const newHistory = [term, ...prev.filter(h => h !== term)].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Handle search
  const handleSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);

      // Detect search mode based on first character
      if (searchQuery.startsWith('>')) {
        setSearchMode('command');
        const commandQuery = searchQuery.slice(1).trim();

        if (!commandQuery) {
          setCommandResults(commands);
        } else {
          const results = commandFuse.search(commandQuery);
          setCommandResults(results.map(r => r.item));
        }
        setResults([]);
        setSelectedIndex(-1);
        return;
      }
      if (searchQuery === '?') {
        setSearchMode('help');
        setResults([]);
        setCommandResults([]);
        setSelectedIndex(-1);
        return;
      }
      setSearchMode('search');
      setCommandResults([]);

      if (!searchQuery.trim()) {
        setResults([]);
        setSelectedIndex(-1);
        return;
      }

      let searchResults = fuse.search(searchQuery);

      // Apply category filter if selected
      if (selectedCategory) {
        searchResults = searchResults.filter(result => result.item.category === selectedCategory);
      }

      const sortedResults = searchResults
        .map(result => ({
          ...result.item,
          score: result.score || 0,
        }))
        .sort((a, b) => {
          // Sort by priority first, then by score
          const priorityDiff = b.priority - a.priority;
          if (priorityDiff !== 0) return priorityDiff;
          return (a.score || 0) - (b.score || 0);
        })
        .slice(0, 12); // Increased limit for better results

      setResults(sortedResults);
      setSelectedIndex(-1);
    },
    [fuse, commandFuse, commands, selectedCategory]
  );

  // Handle navigation
  const handleNavigate = useCallback(
    (item: SearchItem) => {
      saveToHistory(query);

      // Track search analytics
      trackSearch({
        query,
        timestamp: Date.now(),
        resultCount: results.length,
        selectedResult: item.title,
      });

      setOpen(false);
      setQuery('');
      setResults([]);
      setSearchMode('search');
      setSelectedCategory(null);

      // Navigate to the path
      if (item.path.includes('#')) {
        const [path, hash] = item.path.split('#');
        if (path) {
          navigate(path);
        }

        // Scroll to section after navigation
        setTimeout(() => {
          if (hash) {
            const element = document.getElementById(hash);
            if (element) {
              const headerHeight = 80;
              const elementPosition = element.offsetTop - headerHeight;
              window.scrollTo({
                top: elementPosition,
                behavior: 'smooth',
              });
            }
          }
        }, 100);
      } else {
        navigate(item.path);
      }
    },
    [navigate, query, saveToHistory, results]
  );

  // Handle command execution
  const handleCommandExecute = useCallback((command: Command) => {
    command.action();
    setOpen(false);
    setQuery('');
    setCommandResults([]);
    setSearchMode('search');
  }, []);

  // Keyboard navigation within search modal only
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const totalItems = searchMode === 'command' ? commandResults.length : results.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (
            searchMode === 'command' &&
            selectedIndex >= 0 &&
            selectedIndex < commandResults.length
          ) {
            const selectedCommand = commandResults[selectedIndex];
            if (selectedCommand) {
              handleCommandExecute(selectedCommand);
            }
          } else if (
            searchMode === 'search' &&
            selectedIndex >= 0 &&
            selectedIndex < results.length
          ) {
            const selectedItem = results[selectedIndex];
            if (selectedItem) {
              handleNavigate(selectedItem);
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          if (searchMode !== 'search' || selectedCategory) {
            setSearchMode('search');
            setSelectedCategory(null);
            setQuery('');
            handleSearch('');
          } else {
            setOpen(false);
            setQuery('');
            setResults([]);
            setCommandResults([]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    open,
    results,
    commandResults,
    selectedIndex,
    handleNavigate,
    handleCommandExecute,
    searchMode,
    selectedCategory,
    handleSearch,
  ]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Get icon for search item type
  const getIcon = (type: SearchItem['type']) => {
    switch (type) {
      case 'section':
        return <MenuBook sx={{ fontSize: 20 }} />;
      case 'code':
        return <Code sx={{ fontSize: 20 }} />;
      case 'faq':
        return <HelpOutline sx={{ fontSize: 20 }} />;
      case 'page':
      default:
        return <Download sx={{ fontSize: 20 }} />;
    }
  };

  // Get type label
  const getTypeLabel = (type: SearchItem['type']) => {
    switch (type) {
      case 'section':
        return 'Section';
      case 'code':
        return 'Code';
      case 'faq':
        return 'FAQ';
      case 'page':
      default:
        return 'Page';
    }
  };

  return (
    <>
      {/* Search Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          ml: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: isMobile ? 1 : 2,
            py: 0.5,
            backgroundColor: alpha(COLORS.background.paper, 0.6),
            border: `1px solid ${alpha(COLORS.utils.divider, 0.2)}`,
            borderRadius: LAYOUT.borderRadius.md,
            cursor: 'pointer',
            transition: ANIMATION.transition.fast,
            '&:hover': {
              backgroundColor: alpha(COLORS.background.paper, 0.8),
              borderColor: COLORS.primary.main,
              transform: 'none !important', // Override global Paper hover transform
            },
          }}
          onClick={() => {
            setOpen(true);
            // Use the same focus logic as the keyboard shortcut
            requestAnimationFrame(() => {
              setTimeout(() => {
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
              }, 150);
            });
          }}
        >
          <Search sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
          {!isMobile && (
            <>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  mr: 2,
                  minWidth: 100,
                }}
              >
                Search...
              </Typography>
              <Chip
                label='Ctrl+K'
                size='small'
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  backgroundColor: alpha(COLORS.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              />
            </>
          )}
        </Paper>
      </Box>

      {/* Search Modal */}
      <Fade in={open}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(COLORS.background.default, 0.9),
            backdropFilter: LAYOUT.backdropFilter.blur,
            zIndex: Z_INDEX.modal,
            display: open ? 'flex' : 'none',
            alignItems: 'flex-start',
            justifyContent: 'center',
            pt: isMobile ? 4 : 10,
          }}
          onClick={() => setOpen(false)}
        >
          <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Paper
              elevation={24}
              onClick={e => e.stopPropagation()}
              sx={{
                width: '90%',
                maxWidth: 600,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: LAYOUT.borderRadius.lg,
                overflow: 'hidden',
                backgroundColor: COLORS.background.paper,
              }}
            >
              {/* Search Input */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: `1px solid ${COLORS.utils.divider}`,
                  }}
                >
                  {searchMode === 'command' ? (
                    <Terminal sx={{ mr: 2, color: 'text.secondary' }} />
                  ) : searchMode === 'help' ? (
                    <QuestionMark sx={{ mr: 2, color: 'text.secondary' }} />
                  ) : (
                    <Search sx={{ mr: 2, color: 'text.secondary' }} />
                  )}
                  <InputBase
                    ref={searchInputRef}
                    fullWidth
                    placeholder={
                      searchMode === 'command'
                        ? 'Type a command...'
                        : searchMode === 'help'
                        ? 'Help mode - Press Esc to exit'
                        : 'Search documentation, commands, FAQ...'
                    }
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                    sx={{
                      fontSize: TYPOGRAPHY.fontSize.lg,
                      '& input': {
                        padding: 0,
                      },
                    }}
                  />
                  <IconButton
                    size='small'
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                      setResults([]);
                      setCommandResults([]);
                      setSearchMode('search');
                      setSelectedCategory(null);
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>

                {/* Category Filters */}
                {searchMode === 'search' && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      p: 2,
                      borderBottom: `1px solid ${COLORS.utils.divider}`,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip
                      label='All'
                      onClick={() => setSelectedCategory(null)}
                      color={selectedCategory === null ? 'primary' : 'default'}
                      sx={{
                        transition: ANIMATION.transition.fast,
                        '&:hover': {
                          transform: `scale(${ANIMATION.scale.hoverSmall})`,
                        },
                      }}
                    />
                    {['Pages', 'Docs', 'API', 'FAQ'].map(category => (
                      <Chip
                        key={category}
                        label={category}
                        icon={
                          category === 'Pages' ? (
                            <Category />
                          ) : category === 'Docs' ? (
                            <Description />
                          ) : category === 'API' ? (
                            <Api />
                          ) : (
                            <HelpOutline />
                          )
                        }
                        onClick={() => setSelectedCategory(category as any)}
                        color={selectedCategory === category ? 'primary' : 'default'}
                        sx={{
                          transition: ANIMATION.transition.fast,
                          '&:hover': {
                            transform: `scale(${ANIMATION.scale.hoverSmall})`,
                          },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* Search Results */}
              <Box
                ref={resultsRef}
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  maxHeight: 'calc(80vh - 80px)',
                }}
              >
                {/* Help Mode */}
                {searchMode === 'help' && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant='h6' gutterBottom>
                      Search Modes
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Search />
                        </ListItemIcon>
                        <ListItemText
                          primary='Search Mode (default)'
                          secondary='Type to search through pages, docs, API, and FAQ'
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Terminal />
                        </ListItemIcon>
                        <ListItemText
                          primary='Command Mode (start with ">")'
                          secondary='Execute commands like navigation, theme toggle, etc.'
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <QuestionMark />
                        </ListItemIcon>
                        <ListItemText
                          primary='Help Mode (type "?")'
                          secondary='View this help information'
                        />
                      </ListItem>
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant='body2' color='text.secondary'>
                      Press <strong>Esc</strong> to exit help mode
                    </Typography>
                  </Box>
                )}

                {/* Command Results */}
                {searchMode === 'command' && commandResults.length > 0 && (
                  <List>
                    {commandResults.map((command, index) => (
                      <ListItem
                        key={command.id}
                        button
                        data-index={index}
                        selected={selectedIndex === index}
                        onClick={() => handleCommandExecute(command)}
                        sx={{
                          borderLeft:
                            selectedIndex === index
                              ? `3px solid ${COLORS.primary.main}`
                              : '3px solid transparent',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.primary.main, 0.08),
                          },
                          '&.Mui-selected': {
                            backgroundColor: alpha(COLORS.primary.main, 0.12),
                            '&:hover': {
                              backgroundColor: alpha(COLORS.primary.main, 0.16),
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>{command.icon}</ListItemIcon>
                        <ListItemText primary={command.title} secondary={command.description} />
                        <ChevronRight sx={{ color: 'text.secondary' }} />
                      </ListItem>
                    ))}
                  </List>
                )}

                {/* Show search history when no query */}
                {searchMode === 'search' && !query && searchHistory.length > 0 && (
                  <>
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        px: 2,
                        pt: 2,
                        pb: 1,
                        color: 'text.secondary',
                      }}
                    >
                      Recent Searches
                    </Typography>
                    <List dense>
                      {searchHistory.map((term, index) => (
                        <ListItem
                          key={index}
                          button
                          onClick={() => handleSearch(term)}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(COLORS.primary.main, 0.08),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <History sx={{ fontSize: 20, color: 'text.secondary' }} />
                          </ListItemIcon>
                          <ListItemText primary={term} />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 1 }} />
                  </>
                )}

                {/* Show trending searches when no query */}
                {searchMode === 'search' && !query && (
                  <>
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        px: 2,
                        pt: 2,
                        pb: 1,
                        color: 'text.secondary',
                      }}
                    >
                      Popular Searches
                    </Typography>
                    <List dense>
                      {popularSearches.map((term, index) => (
                        <ListItem
                          key={index}
                          button
                          onClick={() => handleSearch(term)}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(COLORS.primary.main, 0.08),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <TrendingUp sx={{ fontSize: 20, color: 'text.secondary' }} />
                          </ListItemIcon>
                          <ListItemText primary={term} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {/* Search results */}
                {searchMode === 'search' &&
                  query &&
                  results.length > 0 &&
                  (() => {
                    // Group results by category
                    const groupedResults = results.reduce((acc, result) => {
                      const category = result.category || 'Other';
                      if (!acc[category]) acc[category] = [];
                      acc[category]!.push(result);
                      return acc;
                    }, {} as Record<string, typeof results>);

                    return (
                      <Box>
                        {Object.entries(groupedResults).map(([category, categoryResults]) => (
                          <Box key={category}>
                            <Typography
                              variant='caption'
                              sx={{
                                display: 'block',
                                px: 2,
                                pt: 2,
                                pb: 1,
                                color: 'text.secondary',
                                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                              }}
                            >
                              {category}
                            </Typography>
                            <List dense>
                              {categoryResults.map((result, index) => {
                                const globalIndex = results.indexOf(result);
                                return (
                                  <ListItem
                                    key={`${category}-${index}`}
                                    button
                                    data-index={globalIndex}
                                    selected={selectedIndex === globalIndex}
                                    onClick={() => handleNavigate(result)}
                                    sx={{
                                      borderLeft:
                                        selectedIndex === globalIndex
                                          ? `3px solid ${COLORS.primary.main}`
                                          : '3px solid transparent',
                                      '&:hover': {
                                        backgroundColor: alpha(COLORS.primary.main, 0.08),
                                      },
                                      '&.Mui-selected': {
                                        backgroundColor: alpha(COLORS.primary.main, 0.12),
                                        '&:hover': {
                                          backgroundColor: alpha(COLORS.primary.main, 0.16),
                                        },
                                      },
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                      {getIcon(result.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography variant='body1'>{result.title}</Typography>
                                          <Chip
                                            label={getTypeLabel(result.type)}
                                            size='small'
                                            sx={{
                                              height: 18,
                                              fontSize: TYPOGRAPHY.fontSize.xs,
                                              backgroundColor: alpha(COLORS.primary.main, 0.1),
                                            }}
                                          />
                                        </Box>
                                      }
                                      secondary={
                                        <Typography
                                          variant='caption'
                                          sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            color: 'text.secondary',
                                          }}
                                        >
                                          {result.content}
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                          </Box>
                        ))}
                      </Box>
                    );
                  })()}

                {/* No results */}
                {searchMode === 'search' && query && results.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant='body1' color='text.secondary'>
                      No results found for "{query}"{selectedCategory && ` in ${selectedCategory}`}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {selectedCategory
                        ? 'Try removing the category filter or search in a different category'
                        : 'Try searching for "getting started", "installation", or "cargo commands"'}
                    </Typography>
                  </Box>
                )}

                {/* No command results */}
                {searchMode === 'command' && query.length > 1 && commandResults.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant='body1' color='text.secondary'>
                      No commands found matching "{query.slice(1)}"
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Available commands: navigate, toggle theme, copy install
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  p: 1,
                  borderTop: `1px solid ${COLORS.utils.divider}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, px: 1, flexWrap: 'wrap' }}>
                  <Typography variant='caption' color='text.secondary'>
                    <strong>↑↓</strong> Navigate
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    <strong>Enter</strong> Select
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    <strong>Esc</strong>{' '}
                    {searchMode !== 'search' || selectedCategory ? 'Back' : 'Close'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    <strong>/</strong> Search
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    <strong>&gt;</strong> Commands
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    <strong>?</strong> Help
                  </Typography>
                </Box>
                <Typography variant='caption' color='text.secondary' sx={{ px: 1 }}>
                  Powered by Fuse.js
                </Typography>
              </Box>
            </Paper>
          </ClickAwayListener>
        </Box>
      </Fade>
    </>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
