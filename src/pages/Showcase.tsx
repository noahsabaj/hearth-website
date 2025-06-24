import { GitHub, Public, FilterList, Add, Star } from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import React, { useState, useMemo, memo } from 'react';

import EditOnGitHub from '../components/EditOnGitHub';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import SEO from '../components/SEO';
import { COLORS, SPACING, LAYOUT, ANIMATION, SHOWCASE, MISC, SHADOWS } from '../constants';
import { showcaseProjects } from '../data/showcaseData';

/**
 * Showcase Gallery page component
 * Displays community projects built with Hearth Engine
 */
const Showcase: React.FC = memo(() => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter projects based on selected category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') {
      return showcaseProjects;
    }
    return showcaseProjects.filter(project => project.categories.includes(selectedCategory));
  }, [selectedCategory]);

  // Sort to show featured projects first
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [filteredProjects]);

  const handleCategoryChange = (
    _event: React.MouseEvent<HTMLElement>,
    newCategory: string | null,
  ) => {
    if (newCategory !== null) {
      setSelectedCategory(newCategory);
    }
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'games':
        return SHOWCASE.categories.games;
      case 'techDemos':
        return SHOWCASE.categories.techDemos;
      case 'tools':
        return SHOWCASE.categories.tools;
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string): 'primary' | 'secondary' | 'default' => {
    switch (category) {
      case 'games':
        return 'primary';
      case 'techDemos':
        return 'secondary';
      case 'tools':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box component='main' role='main'>
      <SEO
        title='Community Showcase - Hearth Engine'
        description='Explore amazing projects built with Hearth Engine. Games, tech demos, and tools created by our vibrant community of developers.'
        keywords='hearth engine showcase, community projects, voxel games, game development showcase, indie games, tech demos'
        pathname='/showcase'
      />

      {/* Navigation */}
      <NavigationBar />

      <Container maxWidth='lg' sx={{ mt: 10, pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant='h1' gutterBottom component='h1' id='main-content' sx={{ mb: 0 }}>
            Community Showcase
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <EditOnGitHub filePath='src/pages/Showcase.tsx' />
        </Box>
        <Typography variant='body1' color='text.secondary' paragraph>
          Discover amazing projects built with Hearth Engine by our talented community of
          developers. From indie games to technical demonstrations, see what is possible with our
          engine.
        </Typography>

        {/* Submit Project Button */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant='contained'
            color='primary'
            startIcon={<Add />}
            href={MISC.github.submitProjectUrl}
            target='_blank'
            rel='noopener noreferrer'
            sx={{
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: SHADOWS.button,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: SHADOWS.primaryLight,
              },
            }}
          >
            Submit Your Project
          </Button>
        </Box>

        {/* Category Filter */}
        <Paper
          sx={{
            p: 2,
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            backgroundColor: COLORS.background.elevated,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              Filter by:
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={selectedCategory}
            exclusive
            onChange={handleCategoryChange}
            aria-label='project category filter'
            sx={{
              '& .MuiToggleButton-root': {
                px: 2,
                py: 0.5,
                textTransform: 'none',
                borderRadius: LAYOUT.borderRadius.md,
                border: `1px solid ${COLORS.utils.border}`,
                '&.Mui-selected': {
                  backgroundColor: COLORS.primary.main,
                  color: COLORS.text.primary,
                  '&:hover': {
                    backgroundColor: COLORS.primary.dark,
                  },
                },
              },
            }}
          >
            <ToggleButton value='all' aria-label='all projects'>
              {SHOWCASE.categories.all}
            </ToggleButton>
            <ToggleButton value='games' aria-label='games'>
              {SHOWCASE.categories.games}
            </ToggleButton>
            <ToggleButton value='techDemos' aria-label='tech demos'>
              {SHOWCASE.categories.techDemos}
            </ToggleButton>
            <ToggleButton value='tools' aria-label='tools'>
              {SHOWCASE.categories.tools}
            </ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant='body2' color='text.secondary'>
            {sortedProjects.length} {sortedProjects.length === 1 ? 'project' : 'projects'}
          </Typography>
        </Paper>

        {/* Projects Grid */}
        <Grid container spacing={SHOWCASE.grid.spacing}>
          {sortedProjects.map((project, index) => (
            <Grid
              item
              key={project.id}
              xs={12}
              sm={SHOWCASE.grid.columns.sm * 6}
              md={SHOWCASE.grid.columns.md * 4}
              lg={SHOWCASE.grid.columns.lg * 4}
            >
              <Fade in timeout={ANIMATION.duration.normal + index * 50}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: COLORS.background.paper,
                    transition: ANIMATION.transition.all,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: project.featured ? SHADOWS.primary : SHADOWS.card,
                      '& .MuiCardMedia-root': {
                        transform: 'scale(1.05)',
                      },
                    },
                    ...(project.featured && {
                      border: `2px solid ${COLORS.primary.main}`,
                    }),
                  }}
                >
                  {/* Featured Badge */}
                  {project.featured && (
                    <Chip
                      icon={<Star />}
                      label='Featured'
                      color='primary'
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: SPACING.sm,
                        right: SPACING.sm,
                        zIndex: 1,
                        fontWeight: 600,
                      }}
                    />
                  )}

                  {/* Project Image */}
                  <CardMedia
                    component='img'
                    sx={{
                      aspectRatio: SHOWCASE.imageAspectRatio,
                      objectFit: 'cover',
                      transition: ANIMATION.transition.slow,
                    }}
                    image={project.image}
                    alt={`${project.title} screenshot`}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = SHOWCASE.placeholderImage;
                    }}
                  />

                  {/* Project Content */}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant='h5' component='h2' gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      paragraph
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '3.6em',
                      }}
                    >
                      {project.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {project.categories.map(category => (
                        <Chip
                          key={category}
                          label={getCategoryLabel(category)}
                          size='small'
                          color={getCategoryColor(category)}
                          variant='outlined'
                        />
                      ))}
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                      by {project.author}
                    </Typography>
                  </CardContent>

                  {/* Project Actions */}
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    {project.githubUrl && (
                      <Tooltip title='View source on GitHub'>
                        <IconButton
                          href={project.githubUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          aria-label={`View ${project.title} source on GitHub`}
                          sx={{
                            '&:hover': {
                              backgroundColor: COLORS.utils.shimmer,
                            },
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <GitHub />
                        </IconButton>
                      </Tooltip>
                    )}
                    {project.liveUrl && (
                      <Tooltip title='View live demo'>
                        <IconButton
                          href={project.liveUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          aria-label={`View ${project.title} live demo`}
                          sx={{
                            '&:hover': {
                              backgroundColor: COLORS.utils.shimmer,
                            },
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <Public />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    {(project.githubUrl || project.liveUrl) && (
                      <Button
                        size='small'
                        href={project.githubUrl || project.liveUrl || '#'}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        Learn More
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {sortedProjects.length === 0 && (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: COLORS.background.elevated,
            }}
          >
            <Typography variant='h5' gutterBottom>
              No projects found
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              {selectedCategory === 'all'
                ? 'Be the first to submit a project to our showcase!'
                : `No ${getCategoryLabel(
                    selectedCategory,
                  ).toLowerCase()} projects yet. Be the first to submit one!`}
            </Typography>
            <Button
              variant='contained'
              color='primary'
              startIcon={<Add />}
              href={MISC.github.submitProjectUrl}
              target='_blank'
              rel='noopener noreferrer'
              sx={{ mt: 2 }}
            >
              Submit Your Project
            </Button>
          </Paper>
        )}

        {/* Call to Action */}
        <Paper
          sx={{
            p: 4,
            mt: 6,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${COLORS.background.paper} 0%, ${COLORS.background.elevated} 100%)`,
          }}
        >
          <Typography variant='h4' gutterBottom>
            Built Something Amazing?
          </Typography>
          <Typography variant='body1' color='text.secondary' paragraph>
            Share your Hearth Engine project with the community! Submit your game, tech demo, or
            tool to be featured in our showcase gallery.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button
              variant='contained'
              color='primary'
              startIcon={<Add />}
              href={MISC.github.submitProjectUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              Submit Project
            </Button>
            <Button
              variant='outlined'
              href='/docs'
              sx={{
                borderColor: COLORS.utils.border,
                '&:hover': {
                  borderColor: COLORS.primary.main,
                },
              }}
            >
              View Documentation
            </Button>
          </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
});

Showcase.displayName = 'Showcase';

export default Showcase;
