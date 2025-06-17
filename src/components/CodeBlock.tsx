import React, { useState } from 'react';
import { Paper, IconButton, Tooltip, Snackbar } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

interface CodeBlockProps {
  children: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, language = 'rust' }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleCloseSnackbar = () => {
    setCopySuccess(false);
  };

  // Simple syntax highlighting for Rust
  const highlightCode = (code: string) => {
    // Keywords
    code = code.replace(/\b(use|struct|impl|fn|let|mut|const|pub|mod|match|if|else|for|while|loop|return|break|continue|self|Self)\b/g, '<span class="keyword">$1</span>');
    
    // Types
    code = code.replace(/\b(u8|u16|u32|u64|u128|i8|i16|i32|i64|i128|f32|f64|bool|char|str|String|Vec|Option|Result)\b/g, '<span class="type">$1</span>');
    
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
    
    return code;
  };

  return (
    <>
      <Paper 
        sx={{ 
          p: 2, 
          bgcolor: '#1e1e1e', 
          my: 2,
          overflow: 'auto',
          borderRadius: 2,
          border: '1px solid #333',
          position: 'relative',
          '&:hover .copy-button': {
            opacity: 1,
          },
          '& pre': {
            margin: 0,
            fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
            fontSize: '14px',
            lineHeight: 1.6,
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
        <Tooltip title="Copy code">
          <IconButton
            className="copy-button"
            onClick={handleCopy}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              opacity: 0,
              transition: 'opacity 0.2s ease',
              color: '#999',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
              },
              zIndex: 1,
            }}
            size="small"
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
        <pre 
          dangerouslySetInnerHTML={{ 
            __html: highlightCode(children) 
          }} 
        />
      </Paper>
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Code copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default CodeBlock;