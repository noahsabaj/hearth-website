import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Shortcut } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
  formatShortcut: (shortcut: Shortcut) => string;
  isMac: boolean;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  open,
  onClose,
  shortcuts,
  formatShortcut,
  isMac,
}) => {
  const theme = useTheme();

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category]!.push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  // Special shortcuts that need additional formatting
  const specialShortcuts = [
    {
      keys: ['G', 'H'],
      description: 'Go to Home',
      category: 'Navigation',
    },
    {
      keys: ['G', 'D'],
      description: 'Go to Documentation',
      category: 'Navigation',
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
          Keyboard Shortcuts
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            Press{' '}
            <Chip
              label="?"
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontFamily: 'monospace',
              }}
            />{' '}
            anytime to show this help
          </Typography>

          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.primary.main,
                }}
              >
                {category}
              </Typography>
              <TableContainer
                component={Paper}
                sx={{
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  boxShadow: 'none',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Table size="small">
                  <TableBody>
                    {categoryShortcuts
                      .filter(s => s.key !== 'g') // Filter out the 'g' key as it's part of sequences
                      .map((shortcut, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:last-child td': { border: 0 },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                          }}
                        >
                          <TableCell sx={{ width: '40%', py: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {formatShortcut(shortcut).split(/(\+|⌘|⌃|⌥|⇧)/).map((part, i) => {
                                if (!part) return null;
                                const isModifier = ['⌘', '⌃', '⌥', '⇧', 'Ctrl', 'Alt', 'Shift'].includes(part);
                                return (
                                  <Chip
                                    key={i}
                                    label={part}
                                    size="small"
                                    sx={{
                                      backgroundColor: isModifier
                                        ? alpha(theme.palette.primary.main, 0.1)
                                        : alpha(theme.palette.text.primary, 0.1),
                                      color: isModifier
                                        ? theme.palette.primary.main
                                        : theme.palette.text.primary,
                                      fontFamily: 'monospace',
                                      fontWeight: 600,
                                      fontSize: '0.875rem',
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.secondary }}>
                            {shortcut.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    
                    {/* Add special sequence shortcuts for this category */}
                    {category === 'Navigation' && specialShortcuts
                      .filter(s => s.category === category)
                      .map((shortcut, index) => (
                        <TableRow
                          key={`special-${index}`}
                          sx={{
                            '&:last-child td': { border: 0 },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                          }}
                        >
                          <TableCell sx={{ width: '40%', py: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              {shortcut.keys.map((key, i) => (
                                <React.Fragment key={i}>
                                  <Chip
                                    label={key}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(theme.palette.text.primary, 0.1),
                                      color: theme.palette.text.primary,
                                      fontFamily: 'monospace',
                                      fontWeight: 600,
                                      fontSize: '0.875rem',
                                    }}
                                  />
                                  {i < shortcut.keys.length - 1 && (
                                    <Typography variant="caption" sx={{ mx: 0.5 }}>
                                      then
                                    </Typography>
                                  )}
                                </React.Fragment>
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.secondary }}>
                            {shortcut.description}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}

          <Box
            sx={{
              mt: 4,
              p: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>Tips:</strong>
              <br />
              • {isMac ? '⌘' : 'Ctrl'} represents the {isMac ? 'Command' : 'Control'} key
              <br />
              • Shortcuts work anywhere except in input fields
              <br />
              • Press <strong>ESC</strong> to close dialogs
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;