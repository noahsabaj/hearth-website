import { ThumbUp, ThumbDown } from '@mui/icons-material';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Collapse,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';

import { COLORS } from '../constants';

interface FeedbackData {
  sectionId: string;
  helpful: boolean;
  comment?: string;
  timestamp: number;
}

interface FeedbackStats {
  thumbsUp: number;
  thumbsDown: number;
  hasVoted: boolean;
  userVote?: 'up' | 'down';
}

interface FeedbackWidgetProps {
  sectionId: string;
  sectionTitle: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ sectionId, sectionTitle }) => {
  const [stats, setStats] = useState<FeedbackStats>({
    thumbsUp: 0,
    thumbsDown: 0,
    hasVoted: false,
  });
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load existing feedback stats on mount
  useEffect(() => {
    const storedFeedback = localStorage.getItem('hearthFeedback');
    if (storedFeedback) {
      const feedbackData: FeedbackData[] = JSON.parse(storedFeedback);

      // Calculate stats for this section
      const sectionFeedback = feedbackData.filter(fb => fb.sectionId === sectionId);
      const thumbsUp = sectionFeedback.filter(fb => fb.helpful).length;
      const thumbsDown = sectionFeedback.filter(fb => !fb.helpful).length;

      // Check if current user has voted
      const userVoteKey = `hearthVote_${sectionId}`;
      const userVote = localStorage.getItem(userVoteKey) as 'up' | 'down' | null;

      setStats({
        thumbsUp,
        thumbsDown,
        hasVoted: !!userVote,
        ...(userVote && { userVote }),
      });
    }
  }, [sectionId]);

  const handleVote = (helpful: boolean) => {
    if (stats.hasVoted) {
      setToastMessage('You have already voted on this section');
      setShowToast(true);
      return;
    }

    // Save feedback
    const feedbackData: FeedbackData = {
      sectionId,
      helpful,
      timestamp: Date.now(),
    };

    // Get existing feedback
    const storedFeedback = localStorage.getItem('hearthFeedback');
    const allFeedback: FeedbackData[] = storedFeedback ? JSON.parse(storedFeedback) : [];
    allFeedback.push(feedbackData);
    localStorage.setItem('hearthFeedback', JSON.stringify(allFeedback));

    // Mark user as voted for this section
    localStorage.setItem(`hearthVote_${sectionId}`, helpful ? 'up' : 'down');

    // Update stats
    setStats(prev => ({
      ...prev,
      thumbsUp: helpful ? prev.thumbsUp + 1 : prev.thumbsUp,
      thumbsDown: !helpful ? prev.thumbsDown + 1 : prev.thumbsDown,
      hasVoted: true,
      userVote: helpful ? 'up' : 'down',
    }));

    // Show comment box for negative feedback
    if (!helpful) {
      setShowCommentBox(true);
    } else {
      setToastMessage('Thank you for your feedback!');
      setShowToast(true);
    }

    // Analytics-ready event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'feedback_vote', {
        section_id: sectionId,
        section_title: sectionTitle,
        vote_type: helpful ? 'helpful' : 'not_helpful',
      });
    }
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      // Update the last feedback entry with comment
      const storedFeedback = localStorage.getItem('hearthFeedback');
      if (storedFeedback) {
        const allFeedback: FeedbackData[] = JSON.parse(storedFeedback);
        const lastFeedback = allFeedback[allFeedback.length - 1];
        if (lastFeedback && lastFeedback.sectionId === sectionId) {
          lastFeedback.comment = comment.trim();
          localStorage.setItem('hearthFeedback', JSON.stringify(allFeedback));
        }
      }

      // Analytics-ready event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'feedback_comment', {
          section_id: sectionId,
          section_title: sectionTitle,
          comment_length: comment.length,
        });
      }
    }

    setShowCommentBox(false);
    setComment('');
    setToastMessage('Thank you for your detailed feedback!');
    setShowToast(true);
  };

  return (
    <>
      <Paper
        component='section'
        elevation={2}
        sx={{
          p: 3,
          mt: 4,
          mb: 2,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        aria-label='Feedback section'
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='body1' sx={{ fontWeight: 500 }}>
            Was this section helpful?
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={stats.hasVoted ? "You've already voted" : 'This was helpful'}>
              <span>
                <IconButton
                  onClick={() => handleVote(true)}
                  disabled={stats.hasVoted}
                  aria-label='Mark as helpful'
                  sx={{
                    color: stats.userVote === 'up' ? COLORS.status.success : 'inherit',
                    '&:hover': {
                      backgroundColor: `${COLORS.status.success}1A`,
                    },
                  }}
                >
                  <ThumbUp />
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant='body2' sx={{ minWidth: 20, textAlign: 'center' }}>
              {stats.thumbsUp}
            </Typography>

            <Box sx={{ width: 1, height: 24, backgroundColor: COLORS.utils.divider }} />

            <Typography variant='body2' sx={{ minWidth: 20, textAlign: 'center' }}>
              {stats.thumbsDown}
            </Typography>
            <Tooltip title={stats.hasVoted ? "You've already voted" : "This wasn't helpful"}>
              <span>
                <IconButton
                  onClick={() => handleVote(false)}
                  disabled={stats.hasVoted}
                  aria-label='Mark as not helpful'
                  sx={{
                    color: stats.userVote === 'down' ? COLORS.status.error : 'inherit',
                    '&:hover': {
                      backgroundColor: `${COLORS.status.error}1A`,
                    },
                  }}
                >
                  <ThumbDown />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <AnimatePresence>
          {showCommentBox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Collapse in={showCommentBox}>
                <Box sx={{ mt: 3 }}>
                  <Typography variant='body2' sx={{ mb: 2 }}>
                    Please tell us how we can improve this section (optional):
                  </Typography>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder='Your feedback helps us improve the documentation...'
                    variant='outlined'
                    aria-label='Feedback comment'
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: COLORS.utils.shimmer,
                      },
                    }}
                  />
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => {
                        setShowCommentBox(false);
                        setComment('');
                        setToastMessage('Thank you for your feedback!');
                        setShowToast(true);
                      }}
                    >
                      Skip
                    </Button>
                    <Button
                      variant='contained'
                      size='small'
                      onClick={handleCommentSubmit}
                      sx={{
                        backgroundColor: COLORS.primary.main,
                        '&:hover': {
                          backgroundColor: COLORS.primary.hover,
                        },
                      }}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity='success'
          variant='filled'
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FeedbackWidget;
