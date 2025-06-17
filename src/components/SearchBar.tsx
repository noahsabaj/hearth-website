import {
  Search,
  Close,
  Code,
  MenuBook,
  Download,
  HelpOutline,
  History,
  TrendingUp,
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
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchItem {
  title: string;
  path: string;
  content: string;
  type: 'page' | 'section' | 'code' | 'faq';
  keywords: string[];
  priority: number;
}

// Search data for all pages
const searchData: SearchItem[] = [
  // Main pages
  {
    title: 'Home',
    path: '/',
    content: 'Hearth Engine homepage. Build worlds that feel real. Destroy them too. A next-generation voxel engine with true physics simulation.',
    type: 'page',
    keywords: ['home', 'main', 'start', 'hearth', 'engine', 'voxel'],
    priority: 100,
  },
  {
    title: 'Documentation',
    path: '/docs',
    content: 'Complete documentation for Hearth Engine. Getting started, installation, API reference, core concepts, and usage examples.',
    type: 'page',
    keywords: ['docs', 'documentation', 'guide', 'tutorial', 'reference', 'api'],
    priority: 90,
  },
  {
    title: 'Downloads',
    path: '/downloads',
    content: 'Download Hearth Engine for Windows, macOS, and Linux. Latest releases, installation instructions, and system requirements.',
    type: 'page',
    keywords: ['download', 'install', 'releases', 'binaries', 'setup'],
    priority: 90,
  },
  {
    title: 'FAQ',
    path: '/faq',
    content: 'Frequently asked questions about Hearth Engine. System requirements, performance, development, and general questions.',
    type: 'page',
    keywords: ['faq', 'questions', 'help', 'support', 'answers'],
    priority: 80,
  },

  // Documentation sections
  {
    title: 'Getting Started',
    path: '/docs#getting-started',
    content: 'Quick introduction to Hearth Engine. Learn the basics of creating voxel worlds with realistic physics and emergent gameplay.',
    type: 'section',
    keywords: ['getting started', 'introduction', 'basics', 'begin', 'tutorial'],
    priority: 85,
  },
  {
    title: 'Installation',
    path: '/docs#installation',
    content: 'How to install Hearth Engine. Add to Cargo.toml, system requirements, GPU support for Vulkan, DirectX 12, or Metal.',
    type: 'section',
    keywords: ['install', 'installation', 'cargo', 'toml', 'dependencies', 'setup'],
    priority: 85,
  },
  {
    title: 'Basic Usage',
    path: '/docs#basic-usage',
    content: 'Creating voxel worlds, terrain generation, placing voxels, applying physics simulation. Code examples and tutorials.',
    type: 'section',
    keywords: ['usage', 'examples', 'code', 'terrain', 'voxels', 'physics'],
    priority: 80,
  },
  {
    title: 'Core Concepts',
    path: '/docs#core-concepts',
    content: 'Data-oriented design, GPU-first architecture, stateless systems, parallel processing, and engine architecture.',
    type: 'section',
    keywords: ['concepts', 'architecture', 'design', 'gpu', 'data-oriented', 'parallel'],
    priority: 75,
  },
  {
    title: 'Cargo Commands',
    path: '/docs#cargo-commands',
    content: 'Complete reference for Cargo commands. Build, run, test, debug, profile, and manage dependencies for Hearth Engine projects.',
    type: 'section',
    keywords: ['cargo', 'commands', 'build', 'run', 'test', 'clippy', 'fmt'],
    priority: 75,
  },
  {
    title: 'API Reference',
    path: '/docs#api-reference',
    content: 'Complete API documentation for Hearth Engine. Structs, traits, functions, and modules reference.',
    type: 'section',
    keywords: ['api', 'reference', 'docs', 'functions', 'traits', 'modules'],
    priority: 70,
  },

  // Code examples
  {
    title: 'Basic Game Example',
    path: '/docs#getting-started',
    content: 'use hearth_engine::{Engine, Game, World}; impl Game for MyGame',
    type: 'code',
    keywords: ['example', 'game', 'code', 'rust', 'impl', 'trait'],
    priority: 60,
  },
  {
    title: 'Terrain Generation',
    path: '/docs#basic-usage',
    content: 'world.generate_terrain(TerrainParams { seed: 42, scale: 0.1, octaves: 4 });',
    type: 'code',
    keywords: ['terrain', 'generate', 'world', 'seed', 'procedural'],
    priority: 55,
  },
  {
    title: 'Place Voxel',
    path: '/docs#basic-usage',
    content: 'world.set_voxel(vec3(10, 20, 30), VoxelType::Stone);',
    type: 'code',
    keywords: ['voxel', 'place', 'set', 'stone', 'block'],
    priority: 55,
  },
  {
    title: 'Physics Simulation',
    path: '/docs#basic-usage',
    content: 'world.simulate_physics(dt);',
    type: 'code',
    keywords: ['physics', 'simulate', 'simulation', 'dt', 'delta'],
    priority: 55,
  },

  // FAQ items
  {
    title: 'What is Hearth Engine?',
    path: '/faq',
    content: 'Next-generation voxel game engine built in Rust with true physics simulation and GPU-first architecture.',
    type: 'faq',
    keywords: ['what', 'hearth', 'engine', 'about', 'description'],
    priority: 65,
  },
  {
    title: 'System Requirements',
    path: '/faq',
    content: 'Rust 1.70+, GPU with Vulkan/DirectX 12/Metal support, 8GB RAM recommended.',
    type: 'faq',
    keywords: ['requirements', 'system', 'hardware', 'gpu', 'ram'],
    priority: 65,
  },
  {
    title: 'Performance',
    path: '/faq',
    content: '60+ FPS with 1M+ voxels, GPU-accelerated physics, data-oriented design.',
    type: 'faq',
    keywords: ['performance', 'fps', 'speed', 'optimization', 'gpu'],
    priority: 60,
  },
];

const SearchBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
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
      
      if (!searchQuery.trim()) {
        setResults([]);
        setSelectedIndex(-1);
        return;
      }

      const searchResults = fuse.search(searchQuery);
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
        .slice(0, 8); // Limit to 8 results

      setResults(sortedResults);
      setSelectedIndex(-1);
    },
    [fuse]
  );

  // Handle navigation
  const handleNavigate = useCallback(
    (item: SearchItem) => {
      saveToHistory(query);
      setOpen(false);
      setQuery('');
      setResults([]);
      
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
    [navigate, query, saveToHistory]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global hotkey: Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
        return;
      }

      // If search is not open, don't handle other keys
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
          
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            const selectedItem = results[selectedIndex];
            if (selectedItem) {
              handleNavigate(selectedItem);
            }
          }
          break;
          
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setQuery('');
          setResults([]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, handleNavigate]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
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
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              borderColor: theme.palette.primary.main,
            },
          }}
          onClick={() => {
            setOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
        >
          <Search sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
          {!isMobile && (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mr: 2,
                  minWidth: 100,
                }}
              >
                Search...
              </Typography>
              <Chip
                label="Ctrl+K"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
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
            backgroundColor: alpha('#000', 0.8),
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
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
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: theme.palette.background.paper,
              }}
            >
              {/* Search Input */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Search sx={{ mr: 2, color: 'text.secondary' }} />
                <InputBase
                  ref={searchInputRef}
                  fullWidth
                  placeholder="Search documentation, commands, FAQ..."
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  sx={{
                    fontSize: '1.1rem',
                    '& input': {
                      padding: 0,
                    },
                  }}
                  autoFocus
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    setOpen(false);
                    setQuery('');
                    setResults([]);
                  }}
                >
                  <Close />
                </IconButton>
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
                {/* Show search history when no query */}
                {!query && searchHistory.length > 0 && (
                  <>
                    <Typography
                      variant="caption"
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
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
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
                {!query && (
                  <>
                    <Typography
                      variant="caption"
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
                      {['getting started', 'cargo commands', 'installation', 'performance'].map(
                        (term, index) => (
                          <ListItem
                            key={index}
                            button
                            onClick={() => handleSearch(term)}
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <TrendingUp sx={{ fontSize: 20, color: 'text.secondary' }} />
                            </ListItemIcon>
                            <ListItemText primary={term} />
                          </ListItem>
                        )
                      )}
                    </List>
                  </>
                )}

                {/* Search results */}
                {query && results.length > 0 && (
                  <List>
                    {results.map((result, index) => (
                      <ListItem
                        key={index}
                        button
                        data-index={index}
                        selected={selectedIndex === index}
                        onClick={() => handleNavigate(result)}
                        sx={{
                          borderLeft: selectedIndex === index ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          },
                          '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.16),
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
                              <Typography variant="body1">{result.title}</Typography>
                              <Chip
                                label={getTypeLabel(result.type)}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.7rem',
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
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
                    ))}
                  </List>
                )}

                {/* No results */}
                {query && results.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No results found for "{query}"
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Try searching for "getting started", "installation", or "cargo commands"
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  p: 1,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, px: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>↑↓</strong> Navigate
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Enter</strong> Select
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Esc</strong> Close
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  Powered by Fuse.js
                </Typography>
              </Box>
            </Paper>
          </ClickAwayListener>
        </Box>
      </Fade>
    </>
  );
};

export default SearchBar;