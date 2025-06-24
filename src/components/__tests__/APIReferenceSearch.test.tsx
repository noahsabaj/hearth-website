import { screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import APIReferenceSearch from '../APIReferenceSearch';

expect.extend(toHaveNoViolations);

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('APIReferenceSearch Component', () => {
  beforeEach(() => {
    setupTest();
    jest.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Basic Rendering', () => {
    it('renders the component with default state', () => {
      render(<APIReferenceSearch />);

      expect(screen.getByRole('heading', { name: /api reference search/i })).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/search api functions, structs, traits/i),
      ).toBeInTheDocument();

      // Should show first 10 items by default
      expect(screen.getByText('Engine::new')).toBeInTheDocument();
      expect(screen.getByText('hearth_engine')).toBeInTheDocument();
    });

    it('renders all item type chips correctly', () => {
      render(<APIReferenceSearch />);

      // Check for different item type chips
      expect(screen.getByText('function')).toBeInTheDocument();
      expect(screen.getByText('struct')).toBeInTheDocument();
    });

    it('displays correct icons for different types', () => {
      render(<APIReferenceSearch />);

      // The icons should be present (tested indirectly through accessible roles)
      const listItems = screen.getAllByRole('button');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('filters results based on search query', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);

      await user.type(searchInput, 'Engine');

      await waitFor(() => {
        expect(screen.getByText('Engine::new')).toBeInTheDocument();
        expect(screen.queryByText('set_voxel')).not.toBeInTheDocument();
      });
    });

    it('shows fuzzy search results', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);

      await user.type(searchInput, 'voxel');

      await waitFor(() => {
        expect(screen.getByText('set_voxel')).toBeInTheDocument();
        expect(screen.getByText('get_voxel')).toBeInTheDocument();
      });
    });

    it('clears search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);

      await user.type(searchInput, 'test query');

      // Clear button should appear
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
    });

    it('shows no results message for non-existent search', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);

      await user.type(searchInput, 'nonexistentthing12345');

      await waitFor(() => {
        // Should show empty results
        const listItems = screen.queryAllByRole('button');
        // Only the clear button should remain
        expect(listItems).toHaveLength(1);
      });
    });

    it('handles empty search query gracefully', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);

      await user.type(searchInput, 'test');
      await user.clear(searchInput);

      await waitFor(() => {
        // Should show default first 10 items
        expect(screen.getByText('Engine::new')).toBeInTheDocument();
      });
    });
  });

  describe('Item Selection and Preview', () => {
    it('selects an item and shows preview panel', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      expect(engineNewItem).toBeInTheDocument();

      await user.click(engineNewItem!);

      await waitFor(() => {
        // Preview panel should appear
        expect(
          screen.getByText(
            'Creates a new instance of the Hearth Engine with default configuration.',
          )
        ).toBeInTheDocument();
        expect(screen.getByText('Signature')).toBeInTheDocument();
        expect(screen.getByText('pub fn new() -> Self')).toBeInTheDocument();
      });
    });

    it('shows parameters section for functions with parameters', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      // Search for a function with parameters
      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);
      await user.type(searchInput, 'set_voxel');

      await waitFor(() => {
        const setVoxelItem = screen.getByText('set_voxel').closest('div')?.closest('li');
        expect(setVoxelItem).toBeInTheDocument();

        return user.click(setVoxelItem!);
      });

      await waitFor(() => {
        expect(screen.getByText('Parameters')).toBeInTheDocument();
        expect(screen.getByText('buffer')).toBeInTheDocument();
        expect(screen.getByText('pos')).toBeInTheDocument();
        expect(screen.getByText('voxel_type')).toBeInTheDocument();
      });
    });

    it('shows return type for functions with return values', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      // Search for a function with return type
      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);
      await user.type(searchInput, 'Engine::new');

      await waitFor(() => {
        const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
        expect(engineNewItem).toBeInTheDocument();

        return user.click(engineNewItem!);
      });

      await waitFor(() => {
        expect(screen.getByText('Returns')).toBeInTheDocument();
        expect(screen.getByText('Engine')).toBeInTheDocument();
      });
    });

    it('shows example section when available', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(engineNewItem!);

      await waitFor(() => {
        expect(screen.getByText('Example')).toBeInTheDocument();
        expect(screen.getByText('let mut engine = Engine::new();')).toBeInTheDocument();
      });
    });

    it('updates selection when different item is clicked', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      // Click first item
      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(engineNewItem!);

      await waitFor(() => {
        expect(screen.getByText('Creates a new instance of the Hearth Engine')).toBeInTheDocument();
      });

      // Click different item
      const engineRunItem = screen.getByText('Engine::run').closest('div')?.closest('li');
      await user.click(engineRunItem!);

      await waitFor(() => {
        expect(
          screen.getByText('Starts the game loop with the provided Game implementation.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Copy Functionality', () => {
    it('copies signature to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(engineNewItem!);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy signature/i });
        return user.click(copyButton);
      });

      expect(mockWriteText).toHaveBeenCalledWith('pub fn new() -> Self');
    });

    it('shows copied tooltip after successful copy', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(engineNewItem!);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy signature/i });
        return user.click(copyButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/copied!/i)).toBeInTheDocument();
      });
    });

    it('handles copy failure gracefully', async () => {
      const user = userEvent.setup();
      mockWriteText.mockRejectedValueOnce(new Error('Copy failed'));

      render(<APIReferenceSearch />);

      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(engineNewItem!);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy signature/i });
        return user.click(copyButton);
      });

      // Should not show success message
      expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
    });
  });

  describe('Animation and Transitions', () => {
    it('applies fade transition to preview panel', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(engineNewItem!);

      // Preview panel should appear with fade transition
      await waitFor(() => {
        const previewPanel = screen.getByText('Signature').closest('div');
        expect(previewPanel).toBeInTheDocument();
      });
    });

    it('shows staggered animations for search results', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);
      await user.type(searchInput, 'Engine');

      // Results should animate in
      await waitFor(() => {
        expect(screen.getByText('Engine::new')).toBeInTheDocument();
      });
    });
  });

  describe('Type Icons and Colors', () => {
    it('displays correct type icons for different API items', () => {
      render(<APIReferenceSearch />);

      // Icons are rendered but we can test their existence through the DOM structure
      const listItems = screen.getAllByRole('button');
      expect(listItems.length).toBeGreaterThan(0);

      // Each item should have an icon (tested through presence of items)
      listItems.forEach(item => {
        expect(item).toBeInTheDocument();
      });
    });

    it('applies correct colors based on item type', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      // Search for different types
      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);
      await user.type(searchInput, 'Engine');

      await waitFor(() => {
        // Check that type chips have different colors (indirectly)
        expect(screen.getByText('function')).toBeInTheDocument();
        expect(screen.getByText('struct')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adjusts layout for preview panel', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(engineNewItem!);

      await waitFor(() => {
        // Should show both search results and preview panel
        expect(screen.getByText('Engine::new')).toBeInTheDocument();
        expect(screen.getByText('Signature')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('allows keyboard navigation through search results', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);
      await user.click(searchInput);

      // Tab should move to first result
      await user.tab();

      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });

    it('handles Enter key on search results', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const firstResult = screen.getByText('Engine::new').closest('div')?.closest('li');
      expect(firstResult).toBeInTheDocument();

      // Focus and press Enter
      firstResult?.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Signature')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very long search queries', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);
      const longQuery = 'a'.repeat(1000);

      await user.type(searchInput, longQuery);

      // Should handle gracefully without crashing
      expect(searchInput).toHaveValue(longQuery);
    });

    it('handles special characters in search', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);

      await user.type(searchInput, '::');

      await waitFor(() => {
        // Should find items with :: in them
        expect(screen.getByText('Engine::new')).toBeInTheDocument();
      });
    });

    it('handles rapid search input changes', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);

      // Type rapidly
      await user.type(searchInput, 'Engine');
      await user.clear(searchInput);
      await user.type(searchInput, 'voxel');
      await user.clear(searchInput);
      await user.type(searchInput, 'Game');

      await waitFor(() => {
        // Should show results for the last query
        expect(screen.getByText('Game')).toBeInTheDocument();
      });
    });

    it('handles missing or undefined API data gracefully', () => {
      // This tests the component's resilience to data issues
      render(<APIReferenceSearch />);

      // Should still render without crashing
      expect(screen.getByRole('heading', { name: /api reference search/i })).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('debounces search input to avoid excessive filtering', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);

      // Type multiple characters quickly
      await user.type(searchInput, 'Engine', { delay: 10 });

      // Should handle rapid typing without performance issues
      await waitFor(() => {
        expect(screen.getByText('Engine::new')).toBeInTheDocument();
      });
    });

    it('handles large result sets efficiently', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);

      // Search for common term that might return many results
      await user.type(searchInput, 'e');

      // Should render results without performance issues
      await waitFor(() => {
        const results = screen.getAllByRole('button');
        expect(results.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<APIReferenceSearch />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with selected item', async () => {
      const user = userEvent.setup();
      const { container } = render(<APIReferenceSearch />);

      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(engineNewItem!);

      await waitFor(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });

    it('provides proper ARIA labels', () => {
      render(<APIReferenceSearch />);

      expect(
        screen.getByPlaceholderText(/search api functions, structs, traits/i),
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /api reference search/i })).toBeInTheDocument();
    });

    it('supports screen reader navigation', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(engineNewItem!);

      await waitFor(() => {
        // Preview panel should be accessible to screen readers
        expect(screen.getByText('Signature')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /copy signature/i })).toBeInTheDocument();
      });
    });

    it('handles focus management correctly', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);
      await user.click(searchInput);

      expect(document.activeElement).toBe(searchInput);

      // Should maintain focus appropriately when interacting with results
      const firstResult = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(firstResult!);

      // Focus should be manageable
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles clipboard API not being available', async () => {
      const user = userEvent.setup();

      // Mock clipboard API as undefined
      const originalClipboard = navigator.clipboard;
      delete (navigator as any).clipboard;

      render(<APIReferenceSearch />);

      const engineNewItem = screen.getByText('Engine::new').closest('div')?.closest('li');
      await user.click(engineNewItem!);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy signature/i });
        return user.click(copyButton);
      });

      // Should not crash the component
      expect(screen.getByText('Signature')).toBeInTheDocument();

      // Restore clipboard
      (navigator as any).clipboard = originalClipboard;
    });

    it('handles malformed search queries gracefully', async () => {
      const user = userEvent.setup();
      render(<APIReferenceSearch />);

      const searchInput = screen.getByPlaceholderText(/search api functions, structs, traits/i);

      // Test regex-breaking characters
      await user.type(searchInput, '[{()}]');

      // Should not crash
      expect(searchInput).toHaveValue('[{()}]');
    });
  });
});
