import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import React from 'react';

import FeedbackExporter from '../components/FeedbackExporter';
import FeedbackWidget from '../components/FeedbackWidget';

const FeedbackDemo: React.FC = () => {
  return (
    <Container maxWidth='md' sx={{ mt: 10, mb: 6 }}>
      <Typography variant='h2' gutterBottom>
        Feedback Widget Demo
      </Typography>

      <Typography variant='body1' paragraph>
        This page demonstrates the feedback widget system implemented for Hearth Engine
        documentation. Each section can collect user feedback with thumbs up/down voting and
        optional comments.
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant='h5' gutterBottom>
          Sample Documentation Section
        </Typography>
        <Typography variant='body1' paragraph>
          This is a sample documentation section. The feedback widget below allows users to indicate
          whether they found this content helpful or not. Negative feedback triggers an optional
          comment box for detailed feedback.
        </Typography>
        <Typography variant='body1' paragraph>
          Features of the feedback system:
        </Typography>
        <Box component='ul' sx={{ ml: 3 }}>
          <li>Thumbs up/down voting with real-time counters</li>
          <li>Vote persistence (users can only vote once per section)</li>
          <li>Optional comment box for negative feedback</li>
          <li>LocalStorage persistence for demo purposes</li>
          <li>Toast notifications for user feedback</li>
          <li>Analytics-ready data structure</li>
          <li>Fully accessible with ARIA labels</li>
          <li>Smooth animations with Framer Motion</li>
        </Box>

        <FeedbackWidget sectionId='demo-section-1' sectionTitle='Sample Documentation Section' />
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant='h5' gutterBottom>
          Another Sample Section
        </Typography>
        <Typography variant='body1' paragraph>
          This is another sample section to demonstrate that each section maintains its own
          independent feedback state. Users can vote on each section separately.
        </Typography>
        <Typography variant='body1' paragraph>
          The feedback data is stored in a structured format that can be easily exported for
          analytics purposes. Each feedback entry includes the section ID, vote type, optional
          comment, and timestamp.
        </Typography>

        <FeedbackWidget sectionId='demo-section-2' sectionTitle='Another Sample Section' />
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Typography variant='h4' gutterBottom>
        Feedback Data Management
      </Typography>
      <Typography variant='body1' paragraph>
        Use the controls below to export feedback data or clear all stored feedback. The exported
        data is in JSON format and includes aggregated statistics by section.
      </Typography>

      <FeedbackExporter />

      <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(255, 69, 0, 0.1)', borderRadius: 1 }}>
        <Typography variant='h6' gutterBottom>
          Implementation Notes
        </Typography>
        <Typography variant='body2' component='div'>
          <ul>
            <li>Feedback is stored in localStorage with the key 'hearthFeedback'</li>
            <li>User votes are tracked with keys like 'hearthVote_[sectionId]'</li>
            <li>The system is ready for Google Analytics integration via gtag events</li>
            <li>The widget is responsive and works well on mobile devices</li>
            <li>All interactions are keyboard accessible</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};

export default FeedbackDemo;
