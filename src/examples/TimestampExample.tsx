import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import LastUpdated from '../components/LastUpdated';
import ReadingTime from '../components/ReadingTime';

/**
 * Example component showing different ways to use the LastUpdated component
 * in documentation sections
 */
const TimestampExample: React.FC = () => {
  const exampleContent = `This is an example documentation section demonstrating how to use
  the LastUpdated component. The component shows when content was last updated
  in a user-friendly relative time format (e.g., "2 days ago") with an absolute
  date shown on hover. It also includes an optional link to view the edit history
  on GitHub.`;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h2" gutterBottom>
        Documentation Timestamp Examples
      </Typography>

      {/* Example 1: Basic usage */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4">Basic Usage</Typography>
          <LastUpdated date={new Date('2025-01-15T14:30:00')} />
        </Box>
        <Typography variant="body1">
          Simple timestamp without GitHub link. Shows relative time with absolute date on hover.
        </Typography>
      </Paper>

      {/* Example 2: With GitHub link */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4">With Edit History Link</Typography>
          <LastUpdated 
            date={new Date('2025-01-14T09:15:00')}
            githubEditUrl="https://github.com/noahsabaj/hearth-engine/commits/main/docs/example.md"
          />
        </Box>
        <Typography variant="body1">
          Includes a link to view the edit history on GitHub. Users can click the history icon
          to see all changes made to this documentation section.
        </Typography>
      </Paper>

      {/* Example 3: Combined with reading time */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" sx={{ flex: '1 1 auto' }}>
            Complete Documentation Header
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <ReadingTime text={exampleContent} />
            <LastUpdated 
              date={new Date('2025-01-10T16:20:00')}
              githubEditUrl="https://github.com/noahsabaj/hearth-engine/commits/main/docs/complete.md"
            />
          </Box>
        </Box>
        <Typography variant="body1">
          {exampleContent}
        </Typography>
      </Paper>

      {/* Example 4: Different time ranges */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Time Display Examples</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ minWidth: 150 }}>Just updated:</Typography>
            <LastUpdated date={new Date()} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ minWidth: 150 }}>Hours ago:</Typography>
            <LastUpdated date={new Date(Date.now() - 3 * 60 * 60 * 1000)} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ minWidth: 150 }}>Days ago:</Typography>
            <LastUpdated date={new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ minWidth: 150 }}>Months ago:</Typography>
            <LastUpdated date={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ minWidth: 150 }}>Years ago:</Typography>
            <LastUpdated date={new Date('2023-01-15')} />
          </Box>
        </Box>
      </Paper>

      {/* Example 5: Mobile-responsive layout */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Mobile-Responsive Layout</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Resize your browser to see how the timestamps adapt to smaller screens.
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          flexWrap: 'wrap',
          border: '1px dashed rgba(255, 255, 255, 0.3)',
          p: 2,
          borderRadius: 1
        }}>
          <Typography variant="h5" sx={{ flex: '1 1 auto' }}>
            Responsive Documentation Section
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <ReadingTime text={exampleContent} />
            <LastUpdated 
              date={new Date('2025-01-16T11:00:00')}
              githubEditUrl="https://github.com/noahsabaj/hearth-engine/commits/main"
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TimestampExample;