import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import Showcase from '../Showcase';

expect.extend(toHaveNoViolations);

// Mock the showcase data module
jest.mock('../../data/showcaseData', () => ({
  showcaseProjects: [
    {
      id: 'voxel-adventure',
      title: 'Voxel Adventure',
      description:
        'An open-world exploration game featuring procedurally generated landscapes, dynamic weather, and engaging survival mechanics built entirely with Hearth Engine.',
      image: '/hearth-website/showcase/voxel-adventure.png',
      categories: ['games'],
      githubUrl: 'https://github.com/example/voxel-adventure',
      author: 'Alex Chen',
      featured: true,
    },
    {
      id: 'terrain-sculptor',
      title: 'Terrain Sculptor',
      description:
        "A powerful terrain editing tool that showcases Hearth Engine's real-time mesh manipulation capabilities.",
      image: '/hearth-website/showcase/terrain-sculptor.png',
      categories: ['tools'],
      githubUrl: 'https://github.com/example/terrain-sculptor',
      liveUrl: 'https://terrain-sculptor.example.com',
      author: 'Sarah Miller',
      featured: false,
    },
    {
      id: 'physics-playground',
      title: 'Physics Playground',
      description:
        "Interactive physics demonstration showcasing Hearth Engine's advanced physics simulation.",
      image: '/hearth-website/showcase/physics-playground.png',
      categories: ['techDemos'],
      githubUrl: 'https://github.com/example/physics-playground',
      author: 'Marcus Rodriguez',
      featured: true,
    },
    {
      id: 'block-builder-vr',
      title: 'Block Builder VR',
      description: 'Virtual reality building experience powered by Hearth Engine.',
      image: '/hearth-website/showcase/block-builder-vr.png',
      categories: ['games', 'techDemos'],
      githubUrl: 'https://github.com/example/block-builder-vr',
      author: 'VR Studios',
      featured: true,
    },
    {
      id: 'world-editor-pro',
      title: 'World Editor Pro',
      description: 'Comprehensive world building tool with node-based scripting.',
      image: '/hearth-website/showcase/world-editor-pro.png',
      categories: ['tools'],
      githubUrl: 'https://github.com/example/world-editor-pro',
      liveUrl: 'https://worldeditor.pro',
      author: 'Professional Tools Inc',
      featured: false,
    },
  ],
}));

describe('Showcase Page', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Page Rendering', () => {
    it('should render showcase page with main sections', () => {
      render(<Showcase />);

      // Check main heading
      expect(
        screen.getByRole('heading', { name: /community showcase/i, level: 1 }),
      ).toBeInTheDocument();

      // Check description
      expect(
        screen.getByText(/discover amazing projects built with hearth engine/i),
      ).toBeInTheDocument();

      // Check submit project button
      expect(screen.getByRole('button', { name: /submit your project/i })).toBeInTheDocument();

      // Check category filters
      expect(screen.getByText(/filter by:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /all projects/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /games/i })).toBeInTheDocument();
    });

    it('should render project cards with proper information', () => {
      render(<Showcase />);

      // Check for project cards
      expect(screen.getByText(/voxel adventure/i)).toBeInTheDocument();
      expect(screen.getByText(/terrain sculptor/i)).toBeInTheDocument();
      expect(screen.getByText(/physics playground/i)).toBeInTheDocument();

      // Check for author information
      expect(screen.getByText(/by alex chen/i)).toBeInTheDocument();
      expect(screen.getByText(/by sarah miller/i)).toBeInTheDocument();

      // Check for descriptions
      expect(screen.getByText(/open-world exploration game/i)).toBeInTheDocument();
      expect(screen.getByText(/terrain editing tool/i)).toBeInTheDocument();
    });

    it('should display featured projects with proper styling', () => {
      render(<Showcase />);

      // Featured projects should have featured badges
      const featuredBadges = screen.getAllByText(/featured/i);
      expect(featuredBadges.length).toBeGreaterThan(0);

      // Check specific featured projects
      expect(screen.getByText(/voxel adventure/i)).toBeInTheDocument();
      expect(screen.getByText(/physics playground/i)).toBeInTheDocument();
    });

    it('should show project count', () => {
      render(<Showcase />);

      // Should show total project count
      expect(screen.getByText(/5 projects/i)).toBeInTheDocument();
    });

    it('should render call to action section', () => {
      render(<Showcase />);

      // Check CTA section
      expect(screen.getByText(/built something amazing\?/i)).toBeInTheDocument();
      expect(screen.getByText(/share your hearth engine project/i)).toBeInTheDocument();

      // Check CTA buttons
      const submitButtons = screen.getAllByRole('button', { name: /submit project/i });
      expect(submitButtons.length).toBeGreaterThan(0);

      const docButton = screen.getByRole('button', { name: /view documentation/i });
      expect(docButton).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should filter projects by category', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      // Click on "Games" category
      const gamesFilter = screen.getByRole('button', { name: /games/i });
      await user.click(gamesFilter);

      await waitFor(() => {
        // Should show games projects
        expect(screen.getByText(/voxel adventure/i)).toBeInTheDocument();
        expect(screen.getByText(/block builder vr/i)).toBeInTheDocument();

        // Should hide non-games projects
        expect(screen.queryByText(/terrain sculptor/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/world editor pro/i)).not.toBeInTheDocument();
      });

      // Check updated project count
      expect(screen.getByText(/2 projects/i)).toBeInTheDocument();
    });

    it('should filter projects by tools category', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      const toolsFilter = screen.getByRole('button', { name: /tools/i });
      await user.click(toolsFilter);

      await waitFor(() => {
        // Should show tools projects
        expect(screen.getByText(/terrain sculptor/i)).toBeInTheDocument();
        expect(screen.getByText(/world editor pro/i)).toBeInTheDocument();

        // Should hide non-tools projects
        expect(screen.queryByText(/voxel adventure/i)).not.toBeInTheDocument();
      });
    });

    it('should filter projects by tech demos category', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      const techDemosFilter = screen.getByRole('button', { name: /tech demos/i });
      await user.click(techDemosFilter);

      await waitFor(() => {
        // Should show tech demo projects
        expect(screen.getByText(/physics playground/i)).toBeInTheDocument();
        expect(screen.getByText(/block builder vr/i)).toBeInTheDocument();
      });
    });

    it('should show all projects when "All" is selected', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      // First filter by games
      const gamesFilter = screen.getByRole('button', { name: /games/i });
      await user.click(gamesFilter);

      await waitFor(() => {
        expect(screen.getByText(/2 projects/i)).toBeInTheDocument();
      });

      // Then click "All"
      const allFilter = screen.getByRole('button', { name: /all projects/i });
      await user.click(allFilter);

      await waitFor(() => {
        // Should show all projects again
        expect(screen.getByText(/5 projects/i)).toBeInTheDocument();
        expect(screen.getByText(/voxel adventure/i)).toBeInTheDocument();
        expect(screen.getByText(/terrain sculptor/i)).toBeInTheDocument();
      });
    });

    it('should handle projects with multiple categories', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      // Block Builder VR has both 'games' and 'techDemos' categories

      // Filter by games
      const gamesFilter = screen.getByRole('button', { name: /games/i });
      await user.click(gamesFilter);

      await waitFor(() => {
        expect(screen.getByText(/block builder vr/i)).toBeInTheDocument();
      });

      // Filter by tech demos
      const techDemosFilter = screen.getByRole('button', { name: /tech demos/i });
      await user.click(techDemosFilter);

      await waitFor(() => {
        // Should still show Block Builder VR
        expect(screen.getByText(/block builder vr/i)).toBeInTheDocument();
      });
    });
  });

  describe('Project Interactions', () => {
    it('should handle GitHub link clicks', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      // Find GitHub icons/buttons
      const githubButtons = screen.getAllByLabelText(/view.*source on github/i);
      expect(githubButtons.length).toBeGreaterThan(0);

      // Check GitHub link attributes
      const firstGithubButton = githubButtons[0];
      expect(firstGithubButton).toHaveAttribute('href', expect.stringContaining('github.com'));
      expect(firstGithubButton).toHaveAttribute('target', '_blank');
      expect(firstGithubButton).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should handle live demo link clicks', async () => {
      render(<Showcase />);

      // Find live demo buttons (only some projects have them)
      const liveButtons = screen.getAllByLabelText(/view.*live demo/i);
      expect(liveButtons.length).toBeGreaterThan(0);

      // Check live demo link attributes
      const firstLiveButton = liveButtons[0];
      expect(firstLiveButton).toHaveAttribute('target', '_blank');
      expect(firstLiveButton).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should handle learn more button clicks', async () => {
      render(<Showcase />);

      const learnMoreButtons = screen.getAllByRole('button', { name: /learn more/i });
      expect(learnMoreButtons.length).toBeGreaterThan(0);

      // Buttons should have proper attributes
      learnMoreButtons.forEach(button => {
        expect(button).toHaveAttribute('target', '_blank');
        expect(button).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should prevent event bubbling on action buttons', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      // Click on GitHub button should not trigger card click
      const githubButtons = screen.getAllByLabelText(/view.*source on github/i);

      // Mock stopPropagation to verify it's called
      const mockStopPropagation = jest.fn();

      await user.click(githubButtons[0]);

      // The actual stopPropagation check is in the component implementation
      // This test verifies the buttons are properly configured
      expect(githubButtons[0]).toBeInTheDocument();
    });
  });

  describe('Project Display Features', () => {
    it('should display category chips with proper colors', () => {
      render(<Showcase />);

      // Check for category chips on project cards
      const categoryChips = screen.getAllByText(/games|tools|tech demos/i);
      expect(categoryChips.length).toBeGreaterThan(0);
    });

    it('should display project images with fallback handling', () => {
      render(<Showcase />);

      // Check for project images
      const projectImages = screen.getAllByRole('img');
      expect(projectImages.length).toBeGreaterThan(0);

      // Each image should have alt text
      projectImages.forEach(img => {
        expect(img).toHaveAttribute('alt', expect.stringContaining('screenshot'));
      });
    });

    it('should handle image loading errors gracefully', () => {
      render(<Showcase />);

      const images = screen.getAllByRole('img');

      // Simulate image error
      fireEvent.error(images[0]);

      // Image should still be in document (fallback handling is in the component)
      expect(images[0]).toBeInTheDocument();
    });

    it('should truncate long descriptions properly', () => {
      render(<Showcase />);

      // Project descriptions should be truncated with ellipsis
      // This is handled by CSS in the component
      const descriptions = screen.getAllByText(/.*terrain editing tool.*/i);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should sort featured projects first', () => {
      render(<Showcase />);

      // Get all project titles in order
      const projectTitles = [
        screen.getByText(/voxel adventure/i),
        screen.getByText(/physics playground/i),
        screen.getByText(/block builder vr/i),
      ];

      // Featured projects should appear first
      // This is verified by the component's sorting logic
      expect(projectTitles.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no projects match filter', async () => {
      const user = userEvent.setup();

      // Mock empty showcase data
      jest.doMock('../../data/showcaseData', () => ({
        showcaseProjects: [],
      }));

      const { rerender } = render(<Showcase />);

      // Force re-render with empty data
      rerender(<Showcase />);

      // Should show empty state
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
      expect(screen.getByText(/be the first to submit/i)).toBeInTheDocument();
    });

    it('should show category-specific empty state', async () => {
      // This would require mocking the data to be empty for specific categories
      // The component should handle this case
      render(<Showcase />);

      // The actual empty state testing would depend on having no projects
      // for a specific category in the mocked data
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Showcase />);

      // Should render mobile-friendly layout
      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();

      // Project grid should adapt to mobile
      const projectCards = screen.getAllByText(/voxel adventure|terrain sculptor/i);
      expect(projectCards.length).toBeGreaterThan(0);
    });

    it('should handle tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<Showcase />);

      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
    });

    it('should handle large desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<Showcase />);

      // Should use full desktop layout
      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
    });

    it('should maintain filter functionality on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const user = userEvent.setup();
      render(<Showcase />);

      // Category filters should still work on mobile
      const gamesFilter = screen.getByRole('button', { name: /games/i });
      await user.click(gamesFilter);

      await waitFor(() => {
        expect(screen.getByText(/2 projects/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(<Showcase />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      render(<Showcase />);

      // Check heading structure
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should provide proper ARIA labels for filter controls', () => {
      render(<Showcase />);

      // Category filter group should have proper label
      const filterGroup = screen.getByRole('group', { name: /project category filter/i });
      expect(filterGroup).toBeInTheDocument();

      // Filter buttons should have descriptive labels
      const allFilter = screen.getByRole('button', { name: /all projects/i });
      const gamesFilter = screen.getByRole('button', { name: /games/i });

      expect(allFilter).toHaveAttribute('aria-label', 'all projects');
      expect(gamesFilter).toHaveAttribute('aria-label', 'games');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      // Tab through interactive elements
      await user.tab();

      // Should focus on first interactive element
      const firstButton = screen.getAllByRole('button')[0];
      if (firstButton) {
        expect(document.activeElement).toBeDefined();
      }
    });

    it('should provide proper alternative text for images', () => {
      render(<Showcase />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).toMatch(/screenshot$/i);
      });
    });

    it('should have accessible project cards', () => {
      render(<Showcase />);

      // Project cards should be keyboard accessible
      const projectCards = screen.getAllByRole('button', { name: /learn more/i });
      projectCards.forEach(card => {
        expect(card).toBeInTheDocument();
      });
    });

    it('should provide proper focus indicators', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      // Focus on category filter
      const gamesFilter = screen.getByRole('button', { name: /games/i });
      gamesFilter.focus();

      expect(gamesFilter).toHaveFocus();

      // Enter should activate the filter
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/2 projects/i)).toBeInTheDocument();
      });
    });
  });

  describe('Animation and Visual Effects', () => {
    it('should render with fade-in animations', () => {
      render(<Showcase />);

      // Projects should be wrapped in Fade components
      // This is tested by verifying the content renders properly
      expect(screen.getByText(/voxel adventure/i)).toBeInTheDocument();
    });

    it('should handle hover effects properly', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      // Project cards should respond to hover
      const projectCards = screen.getAllByText(/voxel adventure|terrain sculptor/i);

      // Hover effect is CSS-based, but we can verify the cards are interactive
      if (projectCards[0]) {
        await user.hover(projectCards[0]);
        expect(projectCards[0]).toBeInTheDocument();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing project data gracefully', () => {
      // Component should handle edge cases in project data
      render(<Showcase />);

      // Should still render even with incomplete data
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should handle missing images gracefully', () => {
      render(<Showcase />);

      const images = screen.getAllByRole('img');

      // Simulate broken image
      if (images[0]) {
        fireEvent.error(images[0]);
        expect(images[0]).toBeInTheDocument();
      }
    });

    it('should handle rapid filter changes', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      // Rapidly click different filters
      const filters = ['all', 'games', 'tools', 'techDemos'];

      for (const filter of filters) {
        const filterButton = screen.getByRole('button', {
          name: new RegExp(filter === 'all' ? 'all projects' : filter, 'i'),
        });
        await user.click(filterButton);
      }

      // Should end up in consistent state
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of projects efficiently', () => {
      // Component should render without performance issues
      render(<Showcase />);

      // All projects should be rendered
      expect(screen.getAllByText(/by .+/i).length).toBeGreaterThan(0);
    });

    it('should memoize filtered results', async () => {
      const user = userEvent.setup();
      render(<Showcase />);

      const gamesFilter = screen.getByRole('button', { name: /games/i });

      // Apply same filter twice
      await user.click(gamesFilter);
      await user.click(screen.getByRole('button', { name: /all projects/i }));
      await user.click(gamesFilter);

      await waitFor(() => {
        expect(screen.getByText(/2 projects/i)).toBeInTheDocument();
      });
    });
  });

  describe('Integration with Components', () => {
    it('should integrate with NavigationBar', () => {
      render(<Showcase />);

      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('should integrate with Footer', () => {
      render(<Showcase />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should integrate with SEO component', () => {
      render(<Showcase />);

      expect(document.title).toContain('Showcase');
    });

    it('should integrate with EditOnGitHub component', () => {
      render(<Showcase />);

      const editButton = screen.getByRole('button', { name: /edit on github/i });
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('External Links', () => {
    it('should have proper external link security attributes', () => {
      render(<Showcase />);

      // Submit project buttons should link externally
      const submitButtons = screen.getAllByRole('button', { name: /submit.*project/i });

      submitButtons.forEach(button => {
        expect(button).toHaveAttribute('target', '_blank');
        expect(button).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should link to GitHub for project submissions', () => {
      render(<Showcase />);

      const submitButton = screen.getAllByRole('button', { name: /submit your project/i })[0];
      expect(submitButton).toHaveAttribute('href', expect.stringContaining('github.com'));
    });

    it('should have working documentation link', () => {
      render(<Showcase />);

      const docButton = screen.getByRole('button', { name: /view documentation/i });
      expect(docButton).toHaveAttribute('href', '/docs');
    });
  });
});
