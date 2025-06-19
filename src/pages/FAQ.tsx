import {
  ExpandMore,
  Search,
  HelpOutline,
  Speed,
  Build,
  Download,
  GitHub,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Paper,
  Chip,
} from '@mui/material';
import React, { useState, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';

import EditOnGitHub from '../components/EditOnGitHub';
import NavigationBar from '../components/NavigationBar';
import { AnimatedSection } from '../components/PageTransition';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'technical' | 'performance' | 'development' | 'general';
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: 'what-is-hearth',
    question: 'What is Hearth Engine?',
    answer:
      'Hearth Engine is a next-generation voxel game engine built in Rust following strict Data-Oriented Programming (DOP) principles. It features GPU-first architecture with 8-phase automation eliminating all manual GPU operations, true per-voxel physics simulation (thermal, fluid, acoustic, structural), and emergent gameplay systems. Currently in Sprint 39 focusing on core system stabilization.',
    category: 'general',
    tags: ['voxel', 'physics', 'engine'],
  },
  {
    id: 'system-requirements',
    question: 'What are the system requirements?',
    answer:
      'Hearth Engine requires a GPU with Vulkan 1.2, DirectX 12, or Metal support. We recommend at least 8GB RAM and a modern multi-core processor. Most systems from 2018 onwards should work well.',
    category: 'technical',
    tags: ['requirements', 'hardware', 'compatibility'],
  },
  {
    id: 'getting-started',
    question: 'How do I get started with Hearth Engine?',
    answer:
      'Clone the repository and build from source: `git clone https://github.com/noahsabaj/hearth-engine && cd hearth-engine && cargo run --example engine_testbed`. Check our documentation for detailed setup instructions and examples.',
    category: 'getting-started',
    tags: ['install', 'setup', 'cargo'],
  },
  {
    id: 'performance-tips',
    question: 'How can I optimize performance in my voxel world?',
    answer:
      'Use LOD (Level of Detail) systems, implement efficient chunk loading, minimize physics calculations where possible, and leverage GPU compute shaders for bulk operations. Our documentation includes detailed performance optimization guides.',
    category: 'performance',
    tags: ['optimization', 'fps', 'chunks'],
  },
  {
    id: 'rust-learning',
    question: 'Do I need to know Rust to use Hearth Engine?',
    answer:
      'While Hearth Engine is built in Rust, you can start with basic Rust knowledge. We provide extensive examples and documentation. If you know C++ or similar languages, Rust concepts will be familiar.',
    category: 'development',
    tags: ['rust', 'learning', 'programming'],
  },
  {
    id: 'physics-simulation',
    question: 'How does the physics simulation work?',
    answer:
      'Hearth Engine uses a custom physics system designed specifically for voxels. It simulates real-world physics like gravity, momentum, and collision detection on individual voxels, enabling emergent behaviors like realistic destruction and fluid dynamics.',
    category: 'technical',
    tags: ['physics', 'simulation', 'collision'],
  },
  {
    id: 'modding-support',
    question: 'Does Hearth Engine support modding?',
    answer:
      'Yes! Hearth Engine is designed with modding in mind. You can create custom voxel types, physics behaviors, and game mechanics using Rust plugins. We also support scripting interfaces for easier mod development.',
    category: 'development',
    tags: ['modding', 'plugins', 'customization'],
  },
  {
    id: 'multiplayer',
    question: 'Can I create multiplayer games?',
    answer:
      'Hearth Engine includes networking primitives and deterministic physics simulation that make multiplayer possible. However, full multiplayer implementation depends on your specific use case and architecture.',
    category: 'development',
    tags: ['multiplayer', 'networking', 'sync'],
  },
];

const categories = {
  'getting-started': { label: 'Getting Started', icon: <Download />, color: '#4caf50' },
  technical: { label: 'Technical', icon: <Build />, color: '#ff9800' },
  performance: { label: 'Performance', icon: <Speed />, color: '#2196f3' },
  development: { label: 'Development', icon: <HelpOutline />, color: '#9c27b0' },
  general: { label: 'General', icon: <HelpOutline />, color: '#607d8b' },
};

const FAQ: React.FC = memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesSearch =
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === null || faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false);
    };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  return (
    <Box component='main' role='main'>
      {/* Navigation */}
      <NavigationBar variant='faq' />

      <Container maxWidth='lg' sx={{ mt: 10, pb: 6 }}>
        <AnimatedSection delay={0.2}>
          <Typography variant='h1' gutterBottom component='h1' id='main-content'>
            Frequently Asked Questions
          </Typography>
          <Typography variant='body1' color='text.secondary' paragraph>
            Find answers to common questions about Hearth Engine. Can&apos;t find what you&apos;re
            looking for?{' '}
            <a
              href='https://github.com/noahsabaj/hearth-engine/discussions'
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: '#ff4500', textDecoration: 'none' }}
            >
              Start a discussion
            </a>{' '}
            on GitHub.
          </Typography>
        </AnimatedSection>

        {/* Search and Filters */}
        <AnimatedSection delay={0.4}>
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(30, 30, 30, 0.8)' }}>
            <TextField
              fullWidth
              placeholder='Search FAQs...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 69, 0, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 69, 0, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff4500',
                  },
                },
              }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(categories).map(([key, category]) => (
                <Chip
                  key={key}
                  icon={category.icon}
                  label={category.label}
                  clickable
                  variant={selectedCategory === key ? 'filled' : 'outlined'}
                  onClick={() => handleCategoryFilter(key)}
                  sx={{
                    borderColor: category.color,
                    color: selectedCategory === key ? '#fff' : category.color,
                    bgcolor: selectedCategory === key ? category.color : 'transparent',
                    '&:hover': {
                      bgcolor: selectedCategory === key ? category.color : `${category.color}20`,
                    },
                  }}
                />
              ))}
            </Box>
          </Paper>
        </AnimatedSection>

        {/* FAQ List */}
        <Box>
          {filteredFAQs.length === 0 ? (
            <AnimatedSection delay={0.6}>
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(30, 30, 30, 0.8)' }}>
                <Typography variant='body1' color='text.secondary'>
                  No FAQs found matching your search criteria. Try adjusting your search or{' '}
                  <a
                    href='https://github.com/noahsabaj/hearth-engine/discussions'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#ff4500', textDecoration: 'none' }}
                  >
                    ask a new question
                  </a>
                  .
                </Typography>
              </Paper>
            </AnimatedSection>
          ) : (
            filteredFAQs.map((faq, index) => (
              <AnimatedSection key={faq.id} delay={0.6 + index * 0.1}>
                <Accordion
                  expanded={expandedAccordion === faq.id}
                  onChange={handleAccordionChange(faq.id)}
                  sx={{
                    bgcolor: 'rgba(30, 30, 30, 0.8)',
                    border: '1px solid rgba(255, 69, 0, 0.1)',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      borderColor: 'rgba(255, 69, 0, 0.3)',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#ff4500' }} />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center',
                        gap: 2,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                      <Typography variant='h6'>{faq.question}</Typography>
                      <Chip
                        size='small'
                        label={categories[faq.category].label}
                        icon={categories[faq.category].icon}
                        sx={{
                          bgcolor: `${categories[faq.category].color}20`,
                          color: categories[faq.category].color,
                          border: `1px solid ${categories[faq.category].color}40`,
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }} />
                      {expandedAccordion === faq.id && (
                        <EditOnGitHub
                          filePath='src/pages/FAQ.tsx'
                          variant='improve'
                          size='small'
                          sx={{ mr: 1 }}
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant='body1' color='text.secondary' paragraph>
                      {faq.answer}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {faq.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size='small'
                          variant='outlined'
                          sx={{
                            fontSize: '0.75rem',
                            height: 20,
                            borderColor: 'rgba(255, 69, 0, 0.3)',
                            color: 'text.secondary',
                          }}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </AnimatedSection>
            ))
          )}
        </Box>

        {/* Contact Section */}
        <AnimatedSection delay={0.6}>
          <Paper
            sx={{
              p: 4,
              mt: 6,
              textAlign: 'center',
              background:
                'linear-gradient(135deg, rgba(255, 69, 0, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)',
              border: '1px solid rgba(255, 69, 0, 0.2)',
            }}
          >
            <Typography variant='h5' gutterBottom>
              Still have questions?
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              Join our community on GitHub Discussions, check out our documentation, or explore the
              source code.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to='/docs'
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#ff4500',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                Read Documentation
              </Link>
              <a
                href='https://github.com/noahsabaj/hearth-engine/discussions'
                target='_blank'
                rel='noopener noreferrer'
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  border: '1px solid #ff4500',
                  color: '#ff4500',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                <GitHub fontSize='small' />
                GitHub Discussions
              </a>
            </Box>
          </Paper>
        </AnimatedSection>
      </Container>
    </Box>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ;
