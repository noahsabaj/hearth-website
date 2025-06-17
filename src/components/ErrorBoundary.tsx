import { Refresh, BugReport } from '@mui/icons-material';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            p: 3,
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              background: 'rgba(30, 30, 30, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 69, 0, 0.2)',
            }}
          >
            <BugReport
              sx={{
                fontSize: 64,
                color: '#ff4500',
                mb: 2,
              }}
            />
            <Typography variant='h4' gutterBottom sx={{ color: '#fff', mb: 2 }}>
              Oops! Something went wrong
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              We apologize for the inconvenience. The application encountered an unexpected error.
              Please try refreshing the page or contact support if the problem persists.
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Paper
                sx={{
                  p: 2,
                  mt: 2,
                  bgcolor: '#0a0a0a',
                  border: '1px solid #333',
                  textAlign: 'left',
                  maxHeight: 200,
                  overflow: 'auto',
                }}
              >
                <Typography variant='caption' component='pre' sx={{ color: '#ff6b6b' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Typography>
              </Paper>
            )}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant='contained'
                onClick={this.handleRetry}
                startIcon={<Refresh />}
                sx={{
                  bgcolor: '#ff4500',
                  '&:hover': { bgcolor: '#ff6b35' },
                }}
              >
                Try Again
              </Button>
              <Button
                variant='outlined'
                onClick={() => (window.location.href = '/')}
                sx={{
                  borderColor: '#ff4500',
                  color: '#ff4500',
                  '&:hover': { borderColor: '#ff6b35', color: '#ff6b35' },
                }}
              >
                Go Home
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
