import { Snackbar, Alert, Slide, SlideProps } from '@mui/material';
import React from 'react';

interface ToastNotificationProps {
  open: boolean;
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction='up' />;
};

const ToastNotification: React.FC<ToastNotificationProps> = ({
  open,
  message,
  severity = 'info',
  onClose,
  duration = 2000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      TransitionComponent={SlideTransition as any}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant='filled'
        sx={{
          minWidth: 300,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          '& .MuiAlert-icon': {
            fontSize: 26,
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastNotification;
