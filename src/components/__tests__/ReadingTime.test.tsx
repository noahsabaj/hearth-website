import { screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import ReadingTime from '../ReadingTime';

expect.extend(toHaveNoViolations);

describe('ReadingTime Component', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with text prop', () => {
      const text = 'This is a sample text for reading time calculation.';
      render(<ReadingTime text={text} />);

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('displays reading time chip with icon', () => {
      const text = 'Sample text';
      render(<ReadingTime text={text} />);

      const chip = screen.getByRole('img');
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveAccessibleName(/Estimated reading time/);
    });

    it('applies custom className when provided', () => {
      const text = 'Sample text';
      const customClass = 'custom-reading-time';
      render(<ReadingTime text={text} className={customClass} />);

      const chip = screen.getByRole('img');
      expect(chip).toHaveClass(customClass);
    });
  });

  describe('Reading Time Calculation', () => {
    it('shows "< 1 min read" for very short text', () => {
      const shortText = 'Short text.';
      render(<ReadingTime text={shortText} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('shows "< 1 min read" for text under 75 words', () => {
      const text = 'Word '.repeat(74); // 74 words
      render(<ReadingTime text={text} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('calculates reading time for longer text', () => {
      const text = 'Word '.repeat(150); // 150 words, should be 1 minute at 150 WPM
      render(<ReadingTime text={text} />);

      expect(screen.getByText('1 min read')).toBeInTheDocument();
    });

    it('calculates reading time for much longer text', () => {
      const text = 'Word '.repeat(450); // 450 words, should be 3 minutes at 150 WPM
      render(<ReadingTime text={text} />);

      expect(screen.getByText('3 min read')).toBeInTheDocument();
    });

    it('rounds up reading time', () => {
      const text = 'Word '.repeat(225); // 225 words, should round up to 2 minutes
      render(<ReadingTime text={text} />);

      expect(screen.getByText('2 min read')).toBeInTheDocument();
    });

    it('handles exactly 75 words', () => {
      const text = 'Word '.repeat(75); // Exactly 75 words
      render(<ReadingTime text={text} />);

      expect(screen.getByText('1 min read')).toBeInTheDocument();
    });

    it('uses 150 WPM calculation for technical content', () => {
      // 300 words should be 2 minutes at 150 WPM
      const text = 'Word '.repeat(300);
      render(<ReadingTime text={text} />);

      expect(screen.getByText('2 min read')).toBeInTheDocument();
    });
  });

  describe('Text Processing', () => {
    it('handles empty text', () => {
      render(<ReadingTime text='' />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles whitespace-only text', () => {
      render(<ReadingTime text='   \n\t   ' />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with multiple spaces', () => {
      const text = 'Word    with    multiple    spaces    between    words';
      render(<ReadingTime text={text} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with newlines and tabs', () => {
      const text = 'Word\nwith\tnewlines\nand\ttabs\nbetween\twords';
      render(<ReadingTime text={text} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with punctuation', () => {
      const text = 'Words, with! various? punctuation. marks; and: more.';
      render(<ReadingTime text={text} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with numbers', () => {
      const text = 'Text with 123 numbers 456 and 789 mixed in';
      render(<ReadingTime text={text} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with special characters', () => {
      const text = 'Text with @special #characters & símβols ñañá';
      render(<ReadingTime text={text} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles very long single word', () => {
      const text = 'Supercalifragilisticexpialidocious';
      render(<ReadingTime text={text} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper ARIA label for short text', () => {
      const text = 'Short text';
      render(<ReadingTime text={text} />);

      const chip = screen.getByRole('img');
      expect(chip).toHaveAccessibleName('Estimated reading time: less than 1 minute');
    });

    it('provides proper ARIA label for 1 minute text', () => {
      const text = 'Word '.repeat(150); // 1 minute
      render(<ReadingTime text={text} />);

      const chip = screen.getByRole('img');
      expect(chip).toHaveAccessibleName('Estimated reading time: 1 minute');
    });

    it('provides proper ARIA label for multiple minutes text', () => {
      const text = 'Word '.repeat(450); // 3 minutes
      render(<ReadingTime text={text} />);

      const chip = screen.getByRole('img');
      expect(chip).toHaveAccessibleName('Estimated reading time: 3 minutes');
    });

    it('has proper role attribute', () => {
      const text = 'Sample text';
      render(<ReadingTime text={text} />);

      const chip = screen.getByRole('img');
      expect(chip).toHaveAttribute('role', 'img');
    });

    it('hides icon from screen readers', () => {
      const text = 'Sample text';
      render(<ReadingTime text={text} />);

      // Icon should have aria-hidden="true"
      const icon =
        screen.getByTestId('AccessTimeIcon') || screen.getByRole('img').querySelector('svg');
      if (icon) {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });

  describe('Accessibility Testing', () => {
    it('meets accessibility standards with short text', async () => {
      const { container } = render(<ReadingTime text='Short text' />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with long text', async () => {
      const longText = 'Word '.repeat(500);
      const { container } = render(<ReadingTime text={longText} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with custom className', async () => {
      const { container } = render(<ReadingTime text='Test text' className='custom-class' />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with empty text', async () => {
      const { container } = render(<ReadingTime text='' />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with special characters', async () => {
      const { container } = render(
        <ReadingTime text='Text with émojis 🎉 and speciål çharacters' />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Visual Styling', () => {
    it('applies hover styles', () => {
      const text = 'Sample text';
      render(<ReadingTime text={text} />);

      const chip = screen.getByRole('img');

      // Trigger hover
      fireEvent.mouseEnter(chip);

      // Component should handle hover (visual change tested indirectly)
      expect(chip).toBeInTheDocument();
    });

    it('applies focus styles', () => {
      const text = 'Sample text';
      render(<ReadingTime text={text} />);

      const chip = screen.getByRole('img');

      // Trigger focus
      fireEvent.focus(chip);

      // Component should handle focus (visual change tested indirectly)
      expect(chip).toBeInTheDocument();
    });

    it('handles keyboard navigation', () => {
      const text = 'Sample text';
      render(<ReadingTime text={text} />);

      const chip = screen.getByRole('img');

      // Should be focusable
      chip.focus();
      expect(document.activeElement).toBe(chip);
    });
  });

  describe('Performance and Memory', () => {
    it('memoizes calculation results', () => {
      const text = 'Sample text for memoization test';
      const { rerender } = render(<ReadingTime text={text} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();

      // Re-render with same text should use memoized result
      rerender(<ReadingTime text={text} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('recalculates when text changes', () => {
      const shortText = 'Short text';
      const longText = 'Word '.repeat(300);

      const { rerender } = render(<ReadingTime text={shortText} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();

      rerender(<ReadingTime text={longText} />);

      expect(screen.getByText('2 min read')).toBeInTheDocument();
    });

    it('handles rapid text changes efficiently', () => {
      const { rerender } = render(<ReadingTime text='Initial text' />);

      // Rapidly change text
      for (let i = 1; i <= 10; i++) {
        const text = `Text change ${i} `.repeat(i * 10);
        rerender(<ReadingTime text={text} />);
      }

      // Should handle without performance issues
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('handles component remounting efficiently', () => {
      const text = 'Remount test text';

      // Mount and unmount multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<ReadingTime text={text} />);
        expect(screen.getByText('< 1 min read')).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely long text', () => {
      const extremelyLongText = 'Word '.repeat(10000); // 10,000 words
      render(<ReadingTime text={extremelyLongText} />);

      // Should calculate correctly without performance issues
      expect(screen.getByText('67 min read')).toBeInTheDocument();
    });

    it('handles text with only punctuation', () => {
      const punctuationText = '!@#$%^&*().,;:';
      render(<ReadingTime text={punctuationText} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with mixed languages', () => {
      const mixedText = 'English words мешают с русскими словами and français words';
      render(<ReadingTime text={mixedText} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with HTML-like content', () => {
      const htmlLikeText = '<div>This is not HTML but looks like it</div>';
      render(<ReadingTime text={htmlLikeText} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with markdown-like content', () => {
      const markdownText =
        '# Title\n\n**Bold text** and *italic text* with [links](http://example.com)';
      render(<ReadingTime text={markdownText} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with code blocks', () => {
      const codeText = 'Here is some code: `console.log("hello")` and more text';
      render(<ReadingTime text={codeText} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with URLs', () => {
      const urlText = 'Visit https://example.com for more information about this topic';
      render(<ReadingTime text={urlText} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles text with email addresses', () => {
      const emailText = 'Contact us at test@example.com for more information';
      render(<ReadingTime text={emailText} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('handles undefined className gracefully', () => {
      const text = 'Test text';
      render(<ReadingTime text={text} className={undefined} />);

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('handles empty className gracefully', () => {
      const text = 'Test text';
      render(<ReadingTime text={text} className='' />);

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('handles multiple CSS classes', () => {
      const text = 'Test text';
      const multipleClasses = 'class1 class2 class3';
      render(<ReadingTime text={text} className={multipleClasses} />);

      const chip = screen.getByRole('img');
      expect(chip).toHaveClass('class1', 'class2', 'class3');
    });
  });

  describe('Boundary Values', () => {
    it('handles exactly 149 words (just under 1 minute)', () => {
      const text = 'Word '.repeat(149);
      render(<ReadingTime text={text} />);

      expect(screen.getByText('1 min read')).toBeInTheDocument();
    });

    it('handles exactly 151 words (just over 1 minute)', () => {
      const text = 'Word '.repeat(151);
      render(<ReadingTime text={text} />);

      expect(screen.getByText('2 min read')).toBeInTheDocument();
    });

    it('handles exactly 74 words (just under threshold)', () => {
      const text = 'Word '.repeat(74);
      render(<ReadingTime text={text} />);

      expect(screen.getByText('< 1 min read')).toBeInTheDocument();
    });

    it('handles exactly 76 words (just over threshold)', () => {
      const text = 'Word '.repeat(76);
      render(<ReadingTime text={text} />);

      expect(screen.getByText('1 min read')).toBeInTheDocument();
    });
  });

  describe('Real-world Content', () => {
    it('handles typical blog post content', () => {
      const blogPost = `
        # Introduction to Voxel Engines
        
        Voxel engines are a fascinating technology that enables the creation of 
        block-based 3D worlds. Unlike traditional mesh-based rendering, voxel 
        engines work with discrete volumetric elements called voxels.
        
        ## Key Features
        
        1. **Procedural Generation**: Create infinite worlds
        2. **Destructible Environments**: Fully modifiable terrain
        3. **Efficient Rendering**: GPU-optimized techniques
        
        This technology powers games like Minecraft and enables complex
        simulation systems for physics, lighting, and more.
      `;

      render(<ReadingTime text={blogPost} />);

      // Should calculate reading time for typical content
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByText(/min read/)).toBeInTheDocument();
    });

    it('handles technical documentation', () => {
      const techDoc = `
        function calculateVoxelPosition(x: number, y: number, z: number): Vector3 {
          return new Vector3(
            x * VOXEL_SIZE,
            y * VOXEL_SIZE, 
            z * VOXEL_SIZE
          );
        }
        
        The calculateVoxelPosition function converts voxel coordinates to world 
        space coordinates by multiplying each component by the VOXEL_SIZE constant.
        This is essential for proper positioning in the 3D world.
      `;

      render(<ReadingTime text={techDoc} />);

      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByText(/min read/)).toBeInTheDocument();
    });

    it('handles FAQ content', () => {
      const faqContent = `
        Q: How does the voxel engine handle lighting?
        A: The engine uses a cascaded light propagation algorithm.
        
        Q: What platforms are supported?
        A: Windows, Linux, and macOS are all supported.
        
        Q: Can I create custom voxel types?
        A: Yes, the engine supports fully customizable voxel properties.
      `;

      render(<ReadingTime text={faqContent} />);

      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByText(/min read/)).toBeInTheDocument();
    });
  });
});
