import { ContentCopy, SelectAll, Numbers, WrapText, Code } from '@mui/icons-material';
import {
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Box,
  Typography,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import React, { useState, memo, useCallback, useMemo } from 'react';

/**
 * Props for the CodeBlock component
 */
interface CodeBlockProps {
  /** The code content to display */
  children: string;
  /** Programming language for syntax highlighting (default: 'rust') */
  language?: string;
  /** Optional file path to display */
  filePath?: string;
  /** Lines to highlight (e.g., [1, 3, 5] or [[1,3], [5,7]] for ranges) */
  highlightLines?: (number | number[])[];
  /** Whether to show line numbers by default */
  showLineNumbers?: boolean;
  /** Whether to wrap long lines by default */
  wrapLines?: boolean;
}

/**
 * CodeBlock component for displaying syntax-highlighted code with copy functionality
 *
 * Features:
 * - Syntax highlighting for multiple languages (Rust, JavaScript/TypeScript, Python)
 * - Line numbers with toggle functionality
 * - Language label display
 * - Select all button
 * - Line highlighting for specific ranges
 * - Word-wrap toggle for long lines
 * - File path display
 * - Smooth animations
 * - One-click copy to clipboard functionality
 * - Success feedback via snackbar notification
 * - Responsive design with proper scrolling
 *
 * @param children - The code content to display
 * @param language - Programming language for syntax highlighting (default: 'rust')
 * @param filePath - Optional file path to display
 * @param highlightLines - Lines to highlight
 * @param showLineNumbers - Whether to show line numbers by default
 * @param wrapLines - Whether to wrap long lines by default
 * @returns A styled code block with syntax highlighting and enhanced functionality
 */
const CodeBlock: React.FC<CodeBlockProps> = memo(
  ({
    children,
    language = 'rust',
    filePath,
    highlightLines = [],
    showLineNumbers: defaultShowLineNumbers = true,
    wrapLines: defaultWrapLines = false,
  }) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const [selectSuccess, setSelectSuccess] = useState(false);
    const [showLineNumbers, setShowLineNumbers] = useState(defaultShowLineNumbers);
    const [wrapLines, setWrapLines] = useState(defaultWrapLines);

    /**
     * Handles copying code content to clipboard
     */
    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(children);
        setCopySuccess(true);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }, [children]);

    /**
     * Handles selecting all code content
     */
    const handleSelectAll = useCallback(() => {
      const codeElement = document.getElementById(
        `code-content-${language}-${filePath || 'default'}`
      );
      if (codeElement) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(codeElement);
        selection?.removeAllRanges();
        selection?.addRange(range);
        setSelectSuccess(true);
      }
    }, [language, filePath]);

    /**
     * Handles closing the copy success snackbar
     */
    const handleCloseSnackbar = useCallback(() => {
      setCopySuccess(false);
      setSelectSuccess(false);
    }, []);

    /**
     * Toggle line numbers visibility
     */
    const handleToggleLineNumbers = useCallback(() => {
      setShowLineNumbers(prev => !prev);
    }, []);

    /**
     * Toggle line wrapping
     */
    const handleToggleWrap = useCallback(() => {
      setWrapLines(prev => !prev);
    }, []);

    /**
     * Check if a line should be highlighted
     */
    const isLineHighlighted = useCallback(
      (lineNumber: number) => {
        return highlightLines.some(item => {
          if (Array.isArray(item) && item.length >= 2) {
            // Range: [start, end]
            const [start, end] = item as [number, number];
            return lineNumber >= start && lineNumber <= end;
          }
          // Single line
          return lineNumber === item;
        });
      },
      [highlightLines]
    );

    /**
     * Split code into lines for line number display
     */
    const codeLines = useMemo(() => {
      return children.split('\n');
    }, [children]);

    /**
     * Applies syntax highlighting to the code content
     * Currently supports Rust syntax highlighting with extensibility for other languages
     */
    const highlightedLines = useMemo(() => {
      /**
       * Applies syntax highlighting patterns to code string
       * @param code - Raw code string to highlight
       * @returns HTML string with syntax highlighting markup
       */
      const highlightCode = (originalCode: string) => {
        let code = originalCode;

        // Escape HTML entities first
        code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        if (language === 'rust') {
          // Keywords
          code = code.replace(
            /\b(use|struct|impl|fn|let|mut|const|pub|mod|match|if|else|for|while|loop|return|break|continue|self|Self|trait|enum|where|async|await|move|ref|static|type|unsafe|extern|crate|as|in)\b/g,
            '<span class="keyword">$1</span>'
          );

          // Types
          code = code.replace(
            /\b(u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64|bool|char|str|String|Vec|Option|Result|Box|Rc|Arc|RefCell|HashMap|HashSet|BTreeMap|BTreeSet)\b/g,
            '<span class="type">$1</span>'
          );

          // Functions and macros
          code = code.replace(/(\w+)(?=\()/g, '<span class="function">$1</span>');
          code = code.replace(/(\w+)!/g, '<span class="macro">$1!</span>');

          // Strings
          code = code.replace(/"([^"]*)"/g, '<span class="string">"$1"</span>');
          code = code.replace(/'([^']*)'/g, '<span class="string">\'$1\'</span>');

          // Comments
          code = code.replace(/(\/\/[^\n]*)/g, '<span class="comment">$1</span>');
          code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');

          // Numbers
          code = code.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

          // Attributes
          code = code.replace(/(#\[[\s\S]*?\])/g, '<span class="attribute">$1</span>');
        } else if (
          language === 'javascript' ||
          language === 'js' ||
          language === 'typescript' ||
          language === 'ts'
        ) {
          // JavaScript/TypeScript keywords
          code = code.replace(
            /\b(const|let|var|function|class|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|async|await|import|export|from|default|extends|implements|interface|type|enum|namespace|module|declare|abstract|static|readonly|private|public|protected)\b/g,
            '<span class="keyword">$1</span>'
          );

          // Built-in types
          code = code.replace(
            /\b(string|number|boolean|any|void|null|undefined|never|object|symbol|bigint|unknown)\b/g,
            '<span class="type">$1</span>'
          );

          // Functions
          code = code.replace(/(\w+)(?=\()/g, '<span class="function">$1</span>');

          // Strings
          code = code.replace(/"([^"]*)"/g, '<span class="string">"$1"</span>');
          code = code.replace(/'([^']*)'/g, '<span class="string">\'$1\'</span>');
          code = code.replace(/`([^`]*)`/g, '<span class="string">`$1`</span>');

          // Comments
          code = code.replace(/(\/\/[^\n]*)/g, '<span class="comment">$1</span>');
          code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');

          // Numbers
          code = code.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
        } else if (language === 'python' || language === 'py') {
          // Python keywords
          code = code.replace(
            /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|pass|break|continue|lambda|async|await|global|nonlocal|assert|del|raise|and|or|not|in|is)\b/g,
            '<span class="keyword">$1</span>'
          );

          // Built-in functions and types
          code = code.replace(
            /\b(int|float|str|list|dict|set|tuple|bool|None|True|False|print|len|range|enumerate|zip|map|filter)\b/g,
            '<span class="type">$1</span>'
          );

          // Functions
          code = code.replace(/(\w+)(?=\()/g, '<span class="function">$1</span>');

          // Strings
          code = code.replace(/"([^"]*)"/g, '<span class="string">"$1"</span>');
          code = code.replace(/'([^']*)'/g, '<span class="string">\'$1\'</span>');

          // Comments
          code = code.replace(/(#[^\n]*)/g, '<span class="comment">$1</span>');

          // Numbers
          code = code.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
        }

        return code;
      };

      return codeLines.map(line => highlightCode(line));
    }, [codeLines, language]);

    return (
      <>
        <Paper
          component='figure'
          role='img'
          aria-label={`Code block in ${language}`}
          sx={{
            bgcolor: '#1e1e1e',
            my: 2,
            borderRadius: 2,
            border: '1px solid #333',
            position: 'relative',
            overflow: 'hidden',
            '&:hover .action-buttons': {
              opacity: 1,
            },
            '&:focus-within .action-buttons': {
              opacity: 1,
            },
          }}
        >
          {/* Header with file path and language */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 1,
              borderBottom: '1px solid #333',
              bgcolor: '#252525',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {filePath && (
                <Typography
                  variant='caption'
                  sx={{
                    color: '#999',
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Code fontSize='small' />
                  {filePath}
                </Typography>
              )}
            </Box>
            <Fade in timeout={300}>
              <Typography
                variant='caption'
                sx={{
                  color: '#666',
                  fontFamily: 'monospace',
                  textTransform: 'lowercase',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                {language}
              </Typography>
            </Fade>
          </Box>

          {/* Toolbar */}
          <Box
            className='action-buttons'
            sx={{
              position: 'absolute',
              top: filePath ? 48 : 8,
              right: 8,
              display: 'flex',
              gap: 0.5,
              opacity: 0,
              transition: 'opacity 0.3s ease',
              zIndex: 2,
            }}
          >
            <ToggleButtonGroup
              size='small'
              sx={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                '& .MuiToggleButton-root': {
                  color: '#999',
                  borderColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  '&.Mui-selected': {
                    color: '#ff4500',
                    backgroundColor: 'rgba(255,69,0,0.2)',
                  },
                },
              }}
            >
              <ToggleButton
                value='lineNumbers'
                selected={showLineNumbers}
                onChange={handleToggleLineNumbers}
                aria-label='Toggle line numbers'
              >
                <Tooltip title='Toggle line numbers'>
                  <Numbers fontSize='small' />
                </Tooltip>
              </ToggleButton>
              <ToggleButton
                value='wrap'
                selected={wrapLines}
                onChange={handleToggleWrap}
                aria-label='Toggle line wrap'
              >
                <Tooltip title='Toggle line wrap'>
                  <WrapText fontSize='small' />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <Tooltip title='Select all'>
                <IconButton
                  onClick={handleSelectAll}
                  aria-label='Select all code'
                  sx={{
                    color: '#999',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                    },
                  }}
                  size='small'
                >
                  <SelectAll fontSize='small' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Copy to clipboard'>
                <IconButton
                  onClick={handleCopy}
                  aria-label='Copy code to clipboard'
                  sx={{
                    color: '#999',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                    },
                  }}
                  size='small'
                >
                  <ContentCopy fontSize='small' />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Code content */}
          <Box
            sx={{
              p: 2,
              overflow: 'auto',
              maxHeight: '600px',
              '& pre': {
                margin: 0,
                fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
                wordBreak: wrapLines ? 'break-word' : 'normal',
              },
              '& .keyword': {
                color: '#569cd6',
                fontWeight: 'bold',
              },
              '& .type': {
                color: '#4ec9b0',
              },
              '& .function': {
                color: '#dcdcaa',
              },
              '& .macro': {
                color: '#c586c0',
              },
              '& .string': {
                color: '#ce9178',
              },
              '& .comment': {
                color: '#6a9955',
                fontStyle: 'italic',
              },
              '& .number': {
                color: '#b5cea8',
              },
              '& .attribute': {
                color: '#9cdcfe',
              },
            }}
          >
            <pre
              id={`code-content-${language}-${filePath || 'default'}`}
              role='code'
              aria-label={`${language} code snippet`}
            >
              <table style={{ borderSpacing: 0, width: '100%' }}>
                <tbody>
                  {highlightedLines.map((line, index) => {
                    const lineNumber = index + 1;
                    const isHighlighted = isLineHighlighted(lineNumber);
                    return (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: isHighlighted ? 'rgba(255, 69, 0, 0.1)' : 'transparent',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        {showLineNumbers && (
                          <td
                            style={{
                              textAlign: 'right',
                              paddingRight: '16px',
                              userSelect: 'none',
                              color: isHighlighted ? '#ff4500' : '#666',
                              minWidth: '40px',
                              verticalAlign: 'top',
                              fontWeight: isHighlighted ? 'bold' : 'normal',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {lineNumber}
                          </td>
                        )}
                        <td
                          style={{
                            paddingLeft: showLineNumbers ? '0' : '0',
                            width: '100%',
                          }}
                          dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
                        />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </pre>
          </Box>
        </Paper>

        <Snackbar
          open={copySuccess}
          autoHideDuration={2000}
          onClose={handleCloseSnackbar}
          message='Code copied to clipboard!'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          role='status'
          aria-live='polite'
        />

        <Snackbar
          open={selectSuccess}
          autoHideDuration={2000}
          onClose={handleCloseSnackbar}
          message='Code selected!'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          role='status'
          aria-live='polite'
        />
      </>
    );
  }
);

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
