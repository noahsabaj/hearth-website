import { ArrowForward, Timer } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import React from 'react';

interface RelatedArticleProps {
  id: string;
  title: string;
  description: string;
  readingTime: string;
  tags?: string[];
}

interface RelatedArticlesProps {
  currentSection: string;
  onNavigate: (sectionId: string) => void;
}

// Define related articles for each section
const RELATED_ARTICLES_MAP: Record<string, RelatedArticleProps[]> = {
  'getting-started': [
    {
      id: 'installation',
      title: 'Installation',
      description: 'Learn how to set up Hearth Engine in your Rust project with dependencies and system requirements.',
      readingTime: '2 min read',
      tags: ['Setup', 'Dependencies']
    },
    {
      id: 'basic-usage',
      title: 'Basic Usage',
      description: 'Create your first voxel world with terrain generation and physics simulation.',
      readingTime: '3 min read',
      tags: ['Tutorial', 'Code']
    },
    {
      id: 'core-concepts',
      title: 'Core Concepts',
      description: 'Understand data-oriented design and GPU-first architecture principles.',
      readingTime: '4 min read',
      tags: ['Architecture', 'Theory']
    }
  ],
  'installation': [
    {
      id: 'basic-usage',
      title: 'Basic Usage',
      description: 'Now that you have Hearth Engine installed, create your first voxel world.',
      readingTime: '3 min read',
      tags: ['Tutorial', 'Next Steps']
    },
    {
      id: 'cargo-commands',
      title: 'Cargo Commands',
      description: 'Master essential Cargo commands for building and running your Hearth Engine project.',
      readingTime: '8 min read',
      tags: ['Tools', 'Reference']
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Review the quick example and basic structure of a Hearth Engine game.',
      readingTime: '5 min read',
      tags: ['Overview', 'Examples']
    }
  ],
  'basic-usage': [
    {
      id: 'core-concepts',
      title: 'Core Concepts',
      description: 'Dive deeper into the architecture and design principles behind Hearth Engine.',
      readingTime: '4 min read',
      tags: ['Architecture', 'Advanced']
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Explore the complete API documentation for advanced features and customization.',
      readingTime: '2 min read',
      tags: ['Reference', 'Documentation']
    },
    {
      id: 'cargo-commands',
      title: 'Cargo Commands',
      description: 'Learn helpful commands for testing, debugging, and optimizing your game.',
      readingTime: '8 min read',
      tags: ['Tools', 'Development']
    }
  ],
  'core-concepts': [
    {
      id: 'basic-usage',
      title: 'Basic Usage',
      description: 'See these concepts in action with practical code examples.',
      readingTime: '3 min read',
      tags: ['Examples', 'Practice']
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Explore the full API that implements these core architectural patterns.',
      readingTime: '2 min read',
      tags: ['Reference', 'Deep Dive']
    },
    {
      id: 'cargo-commands',
      title: 'Performance Commands',
      description: 'Use profiling and optimization commands to leverage GPU-first architecture.',
      readingTime: '8 min read',
      tags: ['Performance', 'Tools']
    }
  ],
  'cargo-commands': [
    {
      id: 'basic-usage',
      title: 'Basic Usage',
      description: 'Apply these commands to build and run your first Hearth Engine project.',
      readingTime: '3 min read',
      tags: ['Practice', 'Examples']
    },
    {
      id: 'installation',
      title: 'Installation',
      description: 'Review project setup and dependency management with Cargo.',
      readingTime: '2 min read',
      tags: ['Setup', 'Dependencies']
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Generate and explore API documentation with cargo doc commands.',
      readingTime: '2 min read',
      tags: ['Documentation', 'Reference']
    }
  ],
  'api-reference': [
    {
      id: 'basic-usage',
      title: 'Basic Usage',
      description: 'See practical examples of the API in action with simple voxel operations.',
      readingTime: '3 min read',
      tags: ['Examples', 'Tutorial']
    },
    {
      id: 'core-concepts',
      title: 'Core Concepts',
      description: 'Understand the architectural principles that shape the API design.',
      readingTime: '4 min read',
      tags: ['Architecture', 'Design']
    },
    {
      id: 'cargo-commands',
      title: 'Documentation Commands',
      description: 'Generate local API docs and explore crate documentation with Cargo.',
      readingTime: '8 min read',
      tags: ['Tools', 'Documentation']
    }
  ]
};

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ currentSection, onNavigate }) => {
  const relatedArticles = RELATED_ARTICLES_MAP[currentSection] || [];

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Related Topics
      </Typography>
      
      <Grid container spacing={3}>
        {relatedArticles.map((article) => (
          <Grid item xs={12} md={4} key={article.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: '#ff4500',
                  boxShadow: '0 8px 24px rgba(255, 69, 0, 0.2)',
                  '& .arrow-icon': {
                    transform: 'translateX(4px)',
                  }
                }
              }}
              onClick={() => onNavigate(article.id)}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="h6" 
                    component="h4" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      color: '#ff4500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    {article.title}
                    <ArrowForward 
                      className="arrow-icon" 
                      sx={{ 
                        fontSize: 20, 
                        transition: 'transform 0.2s ease',
                      }} 
                    />
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{ mb: 2 }}
                  >
                    {article.description}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {article.readingTime}
                    </Typography>
                  </Box>
                  
                  {article.tags && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {article.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            backgroundColor: 'rgba(255, 69, 0, 0.1)',
                            color: '#ff4500',
                            border: '1px solid rgba(255, 69, 0, 0.3)',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RelatedArticles;