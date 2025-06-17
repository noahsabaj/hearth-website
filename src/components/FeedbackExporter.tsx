import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Download } from '@mui/icons-material';

interface FeedbackData {
  sectionId: string;
  helpful: boolean;
  comment?: string;
  timestamp: number;
}

const FeedbackExporter: React.FC = () => {
  const exportFeedback = () => {
    const storedFeedback = localStorage.getItem('hearthFeedback');
    if (!storedFeedback) {
      alert('No feedback data to export');
      return;
    }

    const feedbackData: FeedbackData[] = JSON.parse(storedFeedback);
    
    // Create analytics-ready format
    const analyticsData = {
      exportDate: new Date().toISOString(),
      totalFeedback: feedbackData.length,
      feedbackBySections: {} as any,
      detailedFeedback: feedbackData,
    };

    // Aggregate by section
    feedbackData.forEach((feedback) => {
      if (!analyticsData.feedbackBySections[feedback.sectionId]) {
        analyticsData.feedbackBySections[feedback.sectionId] = {
          helpful: 0,
          notHelpful: 0,
          comments: [],
        };
      }
      
      const section = analyticsData.feedbackBySections[feedback.sectionId];
      if (feedback.helpful) {
        section.helpful++;
      } else {
        section.notHelpful++;
      }
      
      if (feedback.comment) {
        section.comments.push({
          comment: feedback.comment,
          timestamp: feedback.timestamp,
        });
      }
    });

    // Calculate satisfaction rates
    Object.keys(analyticsData.feedbackBySections).forEach((sectionId) => {
      const section = analyticsData.feedbackBySections[sectionId];
      const total = section.helpful + section.notHelpful;
      section.satisfactionRate = total > 0 ? (section.helpful / total) * 100 : 0;
    });

    // Create downloadable file
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hearth-feedback-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFeedback = () => {
    if (window.confirm('Are you sure you want to clear all feedback data?')) {
      // Clear feedback data
      localStorage.removeItem('hearthFeedback');
      
      // Clear all vote records
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('hearthVote_')) {
          localStorage.removeItem(key);
        }
      });
      
      alert('Feedback data cleared');
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Feedback Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={exportFeedback}
          size="small"
        >
          Export Feedback Data
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={clearFeedback}
          size="small"
        >
          Clear All Feedback
        </Button>
      </Box>
    </Box>
  );
};

export default FeedbackExporter;