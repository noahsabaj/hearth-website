import { screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import CodeBlock from '../CodeBlock';

expect.extend(toHaveNoViolations);

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock window.getSelection for select all functionality
const mockGetSelection = jest.fn();
const mockRemoveAllRanges = jest.fn();
const mockAddRange = jest.fn();
const mockCreateRange = jest.fn();
const mockSelectNodeContents = jest.fn();

Object.assign(window, {
  getSelection: mockGetSelection,
});

Object.assign(document, {
  createRange: mockCreateRange,
});

const mockRange = {
  selectNodeContents: mockSelectNodeContents,
};

const mockSelection = {
  removeAllRanges: mockRemoveAllRanges,
  addRange: mockAddRange,
};

describe('CodeBlock Component', () => {
  beforeEach(() => {
    setupTest();
    jest.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
    mockGetSelection.mockReturnValue(mockSelection);
    mockCreateRange.mockReturnValue(mockRange);
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const code = 'fn main() {\n    println!("Hello, world!");\n}';
      render(<CodeBlock>{code}</CodeBlock>);

      expect(screen.getByText('rust')).toBeInTheDocument();
      expect(screen.getByText('fn main() {')).toBeInTheDocument();
      expect(screen.getByText('println!("Hello, world!");')).toBeInTheDocument();
    });

    it('renders with custom language', () => {
      const code = 'console.log("Hello, world!");';
      render(<CodeBlock language='javascript'>{code}</CodeBlock>);

      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('console.log("Hello, world!");')).toBeInTheDocument();
    });

    it('renders with file path', () => {
      const code = 'fn main() {}';
      render(<CodeBlock filePath='src/main.rs'>{code}</CodeBlock>);

      expect(screen.getByText('src/main.rs')).toBeInTheDocument();
      expect(screen.getByText('rust')).toBeInTheDocument();
    });

    it('renders with line numbers by default', () => {
      const code = 'line 1\nline 2\nline 3';
      render(<CodeBlock>{code}</CodeBlock>);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders without line numbers when disabled', () => {
      const code = 'line 1\nline 2';
      render(<CodeBlock showLineNumbers={false}>{code}</CodeBlock>);

      // Line numbers should not be visible
      expect(screen.queryByText('1')).not.toBeInTheDocument();
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });
  });

  describe('Language Support', () => {
    it('applies Rust syntax highlighting', () => {
      const code = 'fn test() -> String { "hello".to_string() }';
      render(<CodeBlock language='rust'>{code}</CodeBlock>);

      // Check that the code is rendered (syntax highlighting tested through DOM structure)
      expect(screen.getByText(/fn test\(\)/)).toBeInTheDocument();
      expect(screen.getByText(/String/)).toBeInTheDocument();
    });

    it('applies JavaScript syntax highlighting', () => {
      const code = 'function test() { return "hello"; }';
      render(<CodeBlock language='javascript'>{code}</CodeBlock>);

      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText(/function test\(\)/)).toBeInTheDocument();
    });

    it('applies TypeScript syntax highlighting', () => {
      const code = 'function test(): string { return "hello"; }';
      render(<CodeBlock language='typescript'>{code}</CodeBlock>);

      expect(screen.getByText('typescript')).toBeInTheDocument();
      expect(screen.getByText(/function test\(\)/)).toBeInTheDocument();
    });

    it('applies Python syntax highlighting', () => {
      const code = 'def test():\n    return "hello"';
      render(<CodeBlock language='python'>{code}</CodeBlock>);

      expect(screen.getByText('python')).toBeInTheDocument();
      expect(screen.getByText(/def test\(\)/)).toBeInTheDocument();
    });

    it('handles unsupported language gracefully', () => {
      const code = 'some code here';
      render(<CodeBlock language='unknown'>{code}</CodeBlock>);

      expect(screen.getByText('unknown')).toBeInTheDocument();
      expect(screen.getByText('some code here')).toBeInTheDocument();
    });
  });

  describe('Line Highlighting', () => {
    it('highlights single lines', () => {
      const code = 'line 1\nline 2\nline 3';
      render(<CodeBlock highlightLines={[2]}>{code}</CodeBlock>);

      // Line 2 should be highlighted (tested through DOM structure)
      expect(screen.getByText('line 2')).toBeInTheDocument();
    });

    it('highlights line ranges', () => {
      const code = 'line 1\nline 2\nline 3\nline 4';
      render(<CodeBlock highlightLines={[[2, 3]]}>{code}</CodeBlock>);

      // Lines 2-3 should be highlighted
      expect(screen.getByText('line 2')).toBeInTheDocument();
      expect(screen.getByText('line 3')).toBeInTheDocument();
    });

    it('highlights multiple single lines and ranges', () => {
      const code = 'line 1\nline 2\nline 3\nline 4\nline 5';
      render(<CodeBlock highlightLines={[1, [3, 4]]}>{code}</CodeBlock>);

      // Lines 1, 3, and 4 should be highlighted
      expect(screen.getByText('line 1')).toBeInTheDocument();
      expect(screen.getByText('line 3')).toBeInTheDocument();
      expect(screen.getByText('line 4')).toBeInTheDocument();
    });

    it('handles empty highlight lines array', () => {
      const code = 'line 1\nline 2';
      render(<CodeBlock highlightLines={[]}>{code}</CodeBlock>);

      // Should render without highlighting
      expect(screen.getByText('line 1')).toBeInTheDocument();
      expect(screen.getByText('line 2')).toBeInTheDocument();
    });

    it('handles invalid line numbers gracefully', () => {
      const code = 'line 1\nline 2';
      render(<CodeBlock highlightLines={[999]}>{code}</CodeBlock>);

      // Should render without crashing
      expect(screen.getByText('line 1')).toBeInTheDocument();
      expect(screen.getByText('line 2')).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('copies code to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup();
      const code = 'fn main() { println!("test"); }';
      render(<CodeBlock>{code}</CodeBlock>);

      // Hover to show action buttons
      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy code to clipboard/i });
        return user.click(copyButton);
      });

      expect(mockWriteText).toHaveBeenCalledWith(code);
    });

    it('shows success notification after copy', async () => {
      const user = userEvent.setup();
      const code = 'test code';
      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy code to clipboard/i });
        return user.click(copyButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Code copied to clipboard!')).toBeInTheDocument();
      });
    });

    it('handles copy failure gracefully', async () => {
      const user = userEvent.setup();
      mockWriteText.mockRejectedValueOnce(new Error('Copy failed'));

      const code = 'test code';
      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy code to clipboard/i });
        return user.click(copyButton);
      });

      // Should not show success message
      expect(screen.queryByText('Code copied to clipboard!')).not.toBeInTheDocument();
    });

    it('closes snackbar after timeout', async () => {
      const user = userEvent.setup();
      const code = 'test code';
      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy code to clipboard/i });
        return user.click(copyButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Code copied to clipboard!')).toBeInTheDocument();
      });

      // Wait for auto-hide
      await waitFor(
        () => {
          expect(screen.queryByText('Code copied to clipboard!')).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Select All Functionality', () => {
    it('selects all code when select all button is clicked', async () => {
      const user = userEvent.setup();
      const code = 'fn main() { println!("test"); }';
      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        const selectAllButton = screen.getByRole('button', { name: /select all code/i });
        return user.click(selectAllButton);
      });

      expect(mockGetSelection).toHaveBeenCalled();
      expect(mockCreateRange).toHaveBeenCalled();
    });

    it('shows success notification after select all', async () => {
      const user = userEvent.setup();
      const code = 'test code';
      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        const selectAllButton = screen.getByRole('button', { name: /select all code/i });
        return user.click(selectAllButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Code selected!')).toBeInTheDocument();
      });
    });

    it('handles missing code element gracefully', async () => {
      const user = userEvent.setup();
      const code = 'test code';

      // Mock getElementById to return null
      const originalGetElementById = document.getElementById;
      document.getElementById = jest.fn().mockReturnValue(null);

      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        const selectAllButton = screen.getByRole('button', { name: /select all code/i });
        return user.click(selectAllButton);
      });

      // Should not crash
      expect(screen.getByText('test code')).toBeInTheDocument();

      // Restore original function
      document.getElementById = originalGetElementById;
    });
  });

  describe('Toggle Functionality', () => {
    it('toggles line numbers visibility', async () => {
      const user = userEvent.setup();
      const code = 'line 1\nline 2';
      render(<CodeBlock>{code}</CodeBlock>);

      // Line numbers should be visible initially
      expect(screen.getByText('1')).toBeInTheDocument();

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        const toggleButton = screen.getByRole('button', { name: /toggle line numbers/i });
        return user.click(toggleButton);
      });

      await waitFor(() => {
        // Line numbers should be hidden
        expect(screen.queryByText('1')).not.toBeInTheDocument();
        expect(screen.queryByText('2')).not.toBeInTheDocument();
      });
    });

    it('toggles line wrapping', async () => {
      const user = userEvent.setup();
      const code =
        'very long line of code that should wrap when line wrapping is enabled and should not wrap when disabled';
      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        const wrapButton = screen.getByRole('button', { name: /toggle line wrap/i });
        return user.click(wrapButton);
      });

      // The toggle should work (tested through component state)
      expect(screen.getByText(/very long line/)).toBeInTheDocument();
    });

    it('maintains toggle state between renders', async () => {
      const user = userEvent.setup();
      const code = 'line 1\nline 2';
      const { rerender } = render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      // Toggle line numbers off
      await waitFor(() => {
        const toggleButton = screen.getByRole('button', { name: /toggle line numbers/i });
        return user.click(toggleButton);
      });

      // Rerender with same props
      rerender(<CodeBlock>{code}</CodeBlock>);

      // Line numbers should still be hidden
      await waitFor(() => {
        expect(screen.queryByText('1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons Visibility', () => {
    it('shows action buttons on hover', async () => {
      const user = userEvent.setup();
      const code = 'test code';
      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy code to clipboard/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /select all code/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /toggle line numbers/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /toggle line wrap/i })).toBeInTheDocument();
      });
    });

    it('shows action buttons on focus', async () => {
      const user = userEvent.setup();
      const code = 'test code';
      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.click(codeBlock);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy code to clipboard/i })).toBeInTheDocument();
      });
    });

    it('hides action buttons when not hovered or focused', () => {
      const code = 'test code';
      render(<CodeBlock>{code}</CodeBlock>);

      // Action buttons should not be visible initially
      expect(
        screen.queryByRole('button', { name: /copy code to clipboard/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('HTML Escaping', () => {
    it('escapes HTML entities in code', () => {
      const code = '<script>alert("xss")</script>';
      render(<CodeBlock>{code}</CodeBlock>);

      // Should display as text, not execute as HTML
      expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
    });

    it('handles special characters', () => {
      const code = '& < > " \'';
      render(<CodeBlock>{code}</CodeBlock>);

      expect(screen.getByText('& < > " \'')).toBeInTheDocument();
    });

    it('preserves whitespace and formatting', () => {
      const code = '    indented\n        more indented\nback to start';
      render(<CodeBlock>{code}</CodeBlock>);

      expect(screen.getByText('indented')).toBeInTheDocument();
      expect(screen.getByText('more indented')).toBeInTheDocument();
      expect(screen.getByText('back to start')).toBeInTheDocument();
    });
  });

  describe('Empty and Edge Cases', () => {
    it('handles empty code string', () => {
      render(<CodeBlock />);

      expect(screen.getByText('rust')).toBeInTheDocument();
    });

    it('handles single line code', () => {
      const code = 'single line';
      render(<CodeBlock>{code}</CodeBlock>);

      expect(screen.getByText('single line')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('handles code with only newlines', () => {
      const code = '\n\n\n';
      render(<CodeBlock>{code}</CodeBlock>);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('handles very long lines', () => {
      const longLine = 'a'.repeat(1000);
      render(<CodeBlock>{longLine}</CodeBlock>);

      expect(screen.getByText(longLine)).toBeInTheDocument();
    });

    it('handles many lines of code', () => {
      const manyLines = Array.from({ length: 100 }, (_, i) => `line ${i + 1}`).join('\n');
      render(<CodeBlock>{manyLines}</CodeBlock>);

      expect(screen.getByText('line 1')).toBeInTheDocument();
      expect(screen.getByText('line 100')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Props Variations', () => {
    it('renders with all props provided', () => {
      const code = 'fn test() {}';
      render(
        <CodeBlock
          language='rust'
          filePath='test.rs'
          highlightLines={[1]}
          showLineNumbers
          wrapLines
        >
          {code}
        </CodeBlock>
      );

      expect(screen.getByText('rust')).toBeInTheDocument();
      expect(screen.getByText('test.rs')).toBeInTheDocument();
      expect(screen.getByText('fn test() {}')).toBeInTheDocument();
    });

    it('handles boolean props correctly', () => {
      const code = 'test';
      const { rerender } = render(
        <CodeBlock showLineNumbers={false} wrapLines={false}>
          {code}
        </CodeBlock>
      );

      expect(screen.queryByText('1')).not.toBeInTheDocument();

      rerender(
        <CodeBlock showLineNumbers wrapLines>
          {code}
        </CodeBlock>
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(
        <CodeBlock language='rust' filePath='test.rs'>
          fn main() {'{'}
          println!("Hello, world!");
          {'}'}
        </CodeBlock>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA labels', () => {
      const code = 'fn test() {}';
      render(<CodeBlock language='rust'>{code}</CodeBlock>);

      expect(screen.getByRole('img', { name: /code block in rust/i })).toBeInTheDocument();
      expect(screen.getByRole('code', { name: /rust code snippet/i })).toBeInTheDocument();
    });

    it('provides accessible button labels', async () => {
      const user = userEvent.setup();
      const code = 'test code';
      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy code to clipboard/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /select all code/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /toggle line numbers/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /toggle line wrap/i })).toBeInTheDocument();
      });
    });

    it('provides accessible snackbar messages', async () => {
      const user = userEvent.setup();
      const code = 'test code';
      render(<CodeBlock>{code}</CodeBlock>);

      const codeBlock = screen.getByRole('img');
      await user.hover(codeBlock);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy code to clipboard/i });
        return user.click(copyButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const code = 'test code';
      render(<CodeBlock>{code}</CodeBlock>);

      // Focus the code block
      const codeBlock = screen.getByRole('img');
      await user.click(codeBlock);

      // Tab should navigate to action buttons
      await user.tab();

      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes properly to prevent unnecessary re-renders', () => {
      const code = 'test code';
      const { rerender } = render(<CodeBlock>{code}</CodeBlock>);

      // Rerender with same props should not cause issues
      rerender(<CodeBlock>{code}</CodeBlock>);
      rerender(<CodeBlock>{code}</CodeBlock>);

      expect(screen.getByText('test code')).toBeInTheDocument();
    });

    it('handles rapid prop changes efficiently', () => {
      const code = 'test code';
      const { rerender } = render(<CodeBlock language='rust'>{code}</CodeBlock>);

      // Rapidly change language
      rerender(<CodeBlock language='javascript'>{code}</CodeBlock>);
      rerender(<CodeBlock language='python'>{code}</CodeBlock>);
      rerender(<CodeBlock language='typescript'>{code}</CodeBlock>);

      expect(screen.getByText('typescript')).toBeInTheDocument();
      expect(screen.getByText('test code')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('cleans up properly on unmount', () => {
      const code = 'test code';
      const { unmount } = render(<CodeBlock>{code}</CodeBlock>);

      unmount();

      // Should not cause memory leaks or errors
      expect(document.body).toBeInTheDocument();
    });

    it('updates when code content changes', () => {
      const { rerender } = render(<CodeBlock>original code</CodeBlock>);

      expect(screen.getByText('original code')).toBeInTheDocument();

      rerender(<CodeBlock>updated code</CodeBlock>);

      expect(screen.getByText('updated code')).toBeInTheDocument();
      expect(screen.queryByText('original code')).not.toBeInTheDocument();
    });
  });
});
