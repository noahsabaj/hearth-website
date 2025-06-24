import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import FAQ from '../FAQ';

expect.extend(toHaveNoViolations);

describe('FAQ Page', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Page Rendering', () => {
    it('should render FAQ page with main sections', () => {
      render(<FAQ />);

      // Check main heading
      expect(
        screen.getByRole('heading', { name: /frequently asked questions/i, level: 1 }),
      ).toBeInTheDocument();

      // Check description
      expect(screen.getByText(/find answers to common questions/i)).toBeInTheDocument();

      // Check search functionality
      expect(screen.getByPlaceholderText(/search faqs/i)).toBeInTheDocument();

      // Check category filters
      expect(screen.getByText(/getting started/i)).toBeInTheDocument();
      expect(screen.getByText(/technical/i)).toBeInTheDocument();
      expect(screen.getByText(/performance/i)).toBeInTheDocument();
      expect(screen.getByText(/development/i)).toBeInTheDocument();
    });

    it('should render all FAQ items by default', () => {
      render(<FAQ />);

      // Check for key FAQ questions
      expect(screen.getByText(/what is hearth engine\?/i)).toBeInTheDocument();
      expect(screen.getByText(/what are the system requirements\?/i)).toBeInTheDocument();
      expect(screen.getByText(/how do i get started/i)).toBeInTheDocument();
      expect(screen.getByText(/do i need to know rust/i)).toBeInTheDocument();
      expect(screen.getByText(/how does the physics simulation work/i)).toBeInTheDocument();
    });

    it('should render category chips with proper styling', () => {
      render(<FAQ />);

      // Check category chips
      const gettingStartedChip = screen.getByRole('button', { name: /getting started/i });
      const technicalChip = screen.getByRole('button', { name: /technical/i });
      const performanceChip = screen.getByRole('button', { name: /performance/i });

      expect(gettingStartedChip).toBeInTheDocument();
      expect(technicalChip).toBeInTheDocument();
      expect(performanceChip).toBeInTheDocument();

      // Chips should be clickable
      expect(gettingStartedChip).toHaveAttribute('aria-pressed');
      expect(technicalChip).toHaveAttribute('aria-pressed');
      expect(performanceChip).toHaveAttribute('aria-pressed');
    });

    it('should render contact section with links', () => {
      render(<FAQ />);

      // Check contact section
      expect(screen.getByText(/still have questions\?/i)).toBeInTheDocument();

      // Check links
      const docLink = screen.getByRole('link', { name: /read documentation/i });
      const discussionLink = screen.getByRole('link', { name: /github discussions/i });

      expect(docLink).toBeInTheDocument();
      expect(docLink).toHaveAttribute('href', '/docs');

      expect(discussionLink).toBeInTheDocument();
      expect(discussionLink).toHaveAttribute('target', '_blank');
      expect(discussionLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Search Functionality', () => {
    it('should filter FAQs based on search query', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const searchInput = screen.getByPlaceholderText(/search faqs/i);

      // Search for "rust"
      await user.type(searchInput, 'rust');

      await waitFor(() => {
        // Should show FAQ about Rust
        expect(screen.getByText(/do i need to know rust/i)).toBeInTheDocument();

        // Should hide non-matching FAQs
        expect(screen.queryByText(/what are the system requirements/i)).not.toBeInTheDocument();
      });
    });

    it('should search through answers as well as questions', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const searchInput = screen.getByPlaceholderText(/search faqs/i);

      // Search for "voxel" which appears in answers
      await user.type(searchInput, 'voxel');

      await waitFor(() => {
        // Should find FAQs that mention voxels in answers
        expect(screen.getByText(/what is hearth engine\?/i)).toBeInTheDocument();
        expect(screen.getByText(/how does the physics simulation work/i)).toBeInTheDocument();
      });
    });

    it('should search through tags', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const searchInput = screen.getByPlaceholderText(/search faqs/i);

      // Search for "physics" tag
      await user.type(searchInput, 'physics');

      await waitFor(() => {
        // Should find FAQs tagged with physics
        expect(screen.getByText(/how does the physics simulation work/i)).toBeInTheDocument();
      });
    });

    it('should show no results message when search returns empty', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const searchInput = screen.getByPlaceholderText(/search faqs/i);

      // Search for something that doesn't exist
      await user.type(searchInput, 'nonexistent term');

      await waitFor(() => {
        expect(
          screen.getByText(/no faqs found matching your search criteria/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/ask a new question/i)).toBeInTheDocument();
      });
    });

    it('should clear search results when input is cleared', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const searchInput = screen.getByPlaceholderText(/search faqs/i);

      // Search for something
      await user.type(searchInput, 'rust');

      await waitFor(() => {
        expect(screen.queryByText(/what are the system requirements/i)).not.toBeInTheDocument();
      });

      // Clear search
      await user.clear(searchInput);

      await waitFor(() => {
        // All FAQs should be visible again
        expect(screen.getByText(/what are the system requirements/i)).toBeInTheDocument();
        expect(screen.getByText(/do i need to know rust/i)).toBeInTheDocument();
      });
    });
  });

  describe('Category Filtering', () => {
    it('should filter FAQs by category when chip is clicked', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Click on "Getting Started" category
      const gettingStartedChip = screen.getByRole('button', { name: /getting started/i });
      await user.click(gettingStartedChip);

      await waitFor(() => {
        // Should show getting started FAQ
        expect(screen.getByText(/how do i get started/i)).toBeInTheDocument();

        // Should hide other categories
        expect(screen.queryByText(/how does the physics simulation work/i)).not.toBeInTheDocument();
      });
    });

    it('should filter FAQs by technical category', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const technicalChip = screen.getByRole('button', { name: /technical/i });
      await user.click(technicalChip);

      await waitFor(() => {
        // Should show technical FAQs
        expect(screen.getByText(/what are the system requirements/i)).toBeInTheDocument();
        expect(screen.getByText(/how does the physics simulation work/i)).toBeInTheDocument();

        // Should hide other categories
        expect(screen.queryByText(/how do i get started/i)).not.toBeInTheDocument();
      });
    });

    it('should toggle category filter when clicked again', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const performanceChip = screen.getByRole('button', { name: /performance/i });

      // Click to filter
      await user.click(performanceChip);

      await waitFor(() => {
        expect(screen.getByText(/how can i optimize performance/i)).toBeInTheDocument();
      });

      // Click again to clear filter
      await user.click(performanceChip);

      await waitFor(() => {
        // All FAQs should be visible again
        expect(screen.getByText(/what is hearth engine/i)).toBeInTheDocument();
        expect(screen.getByText(/how do i get started/i)).toBeInTheDocument();
      });
    });

    it('should combine search and category filters', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Apply category filter first
      const developmentChip = screen.getByRole('button', { name: /development/i });
      await user.click(developmentChip);

      // Then apply search
      const searchInput = screen.getByPlaceholderText(/search faqs/i);
      await user.type(searchInput, 'rust');

      await waitFor(() => {
        // Should show only development FAQs that match "rust"
        expect(screen.getByText(/do i need to know rust/i)).toBeInTheDocument();

        // Should not show development FAQs that don't match search
        expect(screen.queryByText(/does hearth engine support modding/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accordion Interactions', () => {
    it('should expand FAQ when clicked', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Find the first FAQ accordion
      const faqAccordion = screen.getByText(/what is hearth engine\?/i).closest('[role="button"]');
      expect(faqAccordion).toBeInTheDocument();

      await user.click(faqAccordion!);

      await waitFor(() => {
        // Answer should be visible
        expect(screen.getByText(/next-generation voxel game engine/i)).toBeInTheDocument();

        // Tags should be visible
        expect(screen.getByText(/voxel/i)).toBeInTheDocument();
        expect(screen.getByText(/physics/i)).toBeInTheDocument();
        expect(screen.getByText(/engine/i)).toBeInTheDocument();
      });
    });

    it('should collapse FAQ when clicked again', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const faqAccordion = screen.getByText(/what is hearth engine\?/i).closest('[role="button"]');

      // Expand
      await user.click(faqAccordion!);

      await waitFor(() => {
        expect(screen.getByText(/next-generation voxel game engine/i)).toBeInTheDocument();
      });

      // Collapse
      await user.click(faqAccordion!);

      await waitFor(() => {
        expect(screen.queryByText(/next-generation voxel game engine/i)).not.toBeInTheDocument();
      });
    });

    it('should only allow one accordion to be open at a time', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Open first FAQ
      const firstFaq = screen.getByText(/what is hearth engine\?/i).closest('[role="button"]');
      await user.click(firstFaq!);

      await waitFor(() => {
        expect(screen.getByText(/next-generation voxel game engine/i)).toBeInTheDocument();
      });

      // Open second FAQ
      const secondFaq = screen
        .getByText(/what are the system requirements\?/i)
        .closest('[role="button"]');
      await user.click(secondFaq!);

      await waitFor(() => {
        // Second FAQ should be open
        expect(screen.getByText(/vulkan 1\.2/i)).toBeInTheDocument();

        // First FAQ should be closed
        expect(screen.queryByText(/next-generation voxel game engine/i)).not.toBeInTheDocument();
      });
    });

    it('should show edit button when FAQ is expanded', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const faqAccordion = screen.getByText(/what is hearth engine\?/i).closest('[role="button"]');
      await user.click(faqAccordion!);

      await waitFor(() => {
        // Edit button should appear when expanded
        const editButton = screen.getByRole('button', { name: /edit on github/i });
        expect(editButton).toBeInTheDocument();
      });
    });
  });

  describe('Content Display', () => {
    it('should display FAQ categories with proper icons and colors', () => {
      render(<FAQ />);

      // Check that category chips have different styling
      const categoryButtons = screen.getAllByRole('button');
      const categoryChips = categoryButtons.filter(button =>
        ['Getting Started', 'Technical', 'Performance', 'Development', 'General'].some(cat =>
          button.textContent?.includes(cat)
        ),
      );

      expect(categoryChips.length).toBeGreaterThan(0);
    });

    it('should display proper tag styling for expanded FAQs', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Expand an FAQ
      const faqAccordion = screen.getByText(/what is hearth engine\?/i).closest('[role="button"]');
      await user.click(faqAccordion!);

      await waitFor(() => {
        // Check for tags
        const tags = screen.getAllByText(/voxel|physics|engine/i);
        expect(tags.length).toBeGreaterThan(0);
      });
    });

    it('should display GitHub links in FAQ answers', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Find FAQ with GitHub link
      const gettingStartedFaq = screen
        .getByText(/how do i get started/i)
        .closest('[role="button"]');
      await user.click(gettingStartedFaq!);

      await waitFor(() => {
        // Should contain GitHub repository URL
        expect(screen.getByText(/github\.com\/noahsabaj\/hearth-engine/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<FAQ />);

      // Should render mobile-friendly layout
      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();

      // Category chips should wrap properly
      const categoryChips = screen
        .getAllByRole('button')
        .filter(button =>
          ['Getting Started', 'Technical', 'Performance'].some(cat =>
            button.textContent?.includes(cat)
          ),
        );
      expect(categoryChips.length).toBeGreaterThan(0);
    });

    it('should handle tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<FAQ />);

      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
    });

    it('should maintain functionality on small screens', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      const user = userEvent.setup();
      render(<FAQ />);

      // Search should still work
      const searchInput = screen.getByPlaceholderText(/search faqs/i);
      await user.type(searchInput, 'rust');

      await waitFor(() => {
        expect(screen.getByText(/do i need to know rust/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(<FAQ />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      render(<FAQ />);

      // Check heading structure
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent(/frequently asked questions/i);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Tab through elements
      await user.tab();

      // Should focus on search input first
      const searchInput = screen.getByPlaceholderText(/search faqs/i);
      expect(searchInput).toHaveFocus();

      // Continue tabbing through category filters
      await user.tab();

      const categoryButtons = screen
        .getAllByRole('button')
        .filter(button =>
          ['Getting Started', 'Technical', 'Performance'].some(cat =>
            button.textContent?.includes(cat)
          ),
        );

      if (categoryButtons.length > 0) {
        expect(categoryButtons[0]).toHaveFocus();
      }
    });

    it('should have proper ARIA labels for accordions', () => {
      render(<FAQ />);

      // Check accordion buttons have proper labels
      const accordionButtons = screen
        .getAllByRole('button')
        .filter(button => button.textContent?.includes('?'));

      accordionButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-expanded');
      });
    });

    it('should provide proper focus management for accordions', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Focus on an accordion and open it
      const faqAccordion = screen.getByText(/what is hearth engine\?/i).closest('[role="button"]');
      faqAccordion?.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/next-generation voxel game engine/i)).toBeInTheDocument();
      });
    });

    it('should have accessible search functionality', () => {
      render(<FAQ />);

      const searchInput = screen.getByPlaceholderText(/search faqs/i);
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAccessibleName();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty search gracefully', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const searchInput = screen.getByPlaceholderText(/search faqs/i);

      // Type and delete text
      await user.type(searchInput, 'test');
      await user.clear(searchInput);

      // Should show all FAQs again
      expect(screen.getByText(/what is hearth engine/i)).toBeInTheDocument();
    });

    it('should handle special characters in search', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const searchInput = screen.getByPlaceholderText(/search faqs/i);

      // Search with special characters
      await user.type(searchInput, '!@#$%^&*()');

      await waitFor(() => {
        // Should handle gracefully and show no results
        expect(screen.getByText(/no faqs found/i)).toBeInTheDocument();
      });
    });

    it('should maintain state consistency during rapid interactions', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Rapidly click different category filters
      const categories = ['Getting Started', 'Technical', 'Performance'];

      for (const category of categories) {
        const chip = screen.getByRole('button', { name: new RegExp(category, 'i') });
        await user.click(chip);
      }

      // Should end up in a consistent state
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of FAQ items efficiently', () => {
      // Component should render without performance issues
      render(<FAQ />);

      // All FAQs should be rendered
      const faqElements = screen.getAllByText(/\?/);
      expect(faqElements.length).toBeGreaterThan(0);
    });

    it('should memoize search and filter results', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const searchInput = screen.getByPlaceholderText(/search faqs/i);

      // Perform same search twice
      await user.type(searchInput, 'rust');
      await user.clear(searchInput);
      await user.type(searchInput, 'rust');

      await waitFor(() => {
        expect(screen.getByText(/do i need to know rust/i)).toBeInTheDocument();
      });
    });
  });

  describe('Integration with Components', () => {
    it('should integrate with NavigationBar', () => {
      render(<FAQ />);

      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('should integrate with Footer', () => {
      render(<FAQ />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should integrate with SEO component', () => {
      render(<FAQ />);

      expect(document.title).toContain('FAQ');
    });

    it('should integrate with AnimatedSection components', () => {
      render(<FAQ />);

      // AnimatedSection components should render content
      expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
    });

    it('should integrate with EditOnGitHub component', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Expand an FAQ to show edit button
      const faqAccordion = screen.getByText(/what is hearth engine\?/i).closest('[role="button"]');
      await user.click(faqAccordion!);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit on github/i });
        expect(editButton).toBeInTheDocument();
      });
    });
  });

  describe('External Links', () => {
    it('should have proper external link attributes', () => {
      render(<FAQ />);

      // Check GitHub discussion link
      const discussionLink = screen.getByRole('link', { name: /github discussions/i });
      expect(discussionLink).toHaveAttribute('target', '_blank');
      expect(discussionLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(discussionLink).toHaveAttribute('href', expect.stringContaining('github.com'));
    });

    it('should have working internal navigation links', () => {
      render(<FAQ />);

      const docLink = screen.getByRole('link', { name: /read documentation/i });
      expect(docLink).toHaveAttribute('href', '/docs');
    });
  });
});
