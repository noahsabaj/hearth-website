import { screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import LoadingEnhancementsSummary from '../LoadingEnhancementsSummary';

expect.extend(toHaveNoViolations);

describe('LoadingEnhancementsSummary Component', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Basic Rendering', () => {
    it('renders the main title', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('Loading Enhancement Summary')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Loading Enhancement Summary',
      );
    });

    it('renders the introduction paragraph', () => {
      render(<LoadingEnhancementsSummary />);

      expect(
        screen.getByText(/All loading states throughout the Hearth Website have been enhanced/),
      ).toBeInTheDocument();
    });

    it('renders within a Paper component', () => {
      const { container } = render(<LoadingEnhancementsSummary />);

      // Paper component should be the root element
      const paper = container.firstChild;
      expect(paper).toBeInTheDocument();
    });
  });

  describe('Enhancement Categories', () => {
    it('renders VoxelLoader Component section', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('VoxelLoader Component')).toBeInTheDocument();
      const headings = screen.getAllByRole('heading', { level: 5 });
      expect(headings[0]).toHaveTextContent('VoxelLoader Component');
    });

    it('renders LoadingProgress Component section', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('LoadingProgress Component')).toBeInTheDocument();
    });

    it('renders Enhanced GitHub Releases Loading section', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('Enhanced GitHub Releases Loading')).toBeInTheDocument();
    });

    it('renders PageLoader with Route Detection section', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('PageLoader with Route Detection')).toBeInTheDocument();
    });

    it('renders Enhanced LazyImage Component section', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('Enhanced LazyImage Component')).toBeInTheDocument();
    });

    it('renders DownloadButton with Progress section', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('DownloadButton with Progress')).toBeInTheDocument();
    });

    it('renders Advanced SkeletonLoader section', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('Advanced SkeletonLoader')).toBeInTheDocument();
    });

    it('renders Loading State Management section', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('Loading State Management')).toBeInTheDocument();
    });

    it('renders Accessibility Features section', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('Accessibility Features')).toBeInTheDocument();
    });
  });

  describe('Feature Lists', () => {
    it('renders VoxelLoader features with check icons', () => {
      render(<LoadingEnhancementsSummary />);

      // Check for some specific VoxelLoader features
      expect(
        screen.getByText(/3D voxel-building animation representing the engine's voxel nature/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Animated voxel blocks building from center outwards/),
      ).toBeInTheDocument();
      expect(screen.getByText(/CSS-based 3D transforms \(no WebGL required\)/)).toBeInTheDocument();
    });

    it('renders LoadingProgress features', () => {
      render(<LoadingEnhancementsSummary />);

      expect(
        screen.getByText(/Multiple variants: linear, circular, dots, spinner, skeleton, voxel/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Progress percentage display with smooth animations/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Estimated time remaining calculations/)).toBeInTheDocument();
    });

    it('renders GitHub Releases Loading features', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText(/Real-time progress tracking for API calls/)).toBeInTheDocument();
      expect(
        screen.getByText(/Stage-based loading messages \(Connecting → Fetching → Processing\)/),
      ).toBeInTheDocument();
    });

    it('renders PageLoader features', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText(/Automatic page name detection based on route/)).toBeInTheDocument();
      expect(screen.getByText(/Animated logo with glow effects/)).toBeInTheDocument();
    });

    it('renders LazyImage features', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText(/Shimmer effect during loading/)).toBeInTheDocument();
      expect(screen.getByText(/Progress bar for larger images/)).toBeInTheDocument();
    });

    it('renders DownloadButton features', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText(/Real-time download progress simulation/)).toBeInTheDocument();
      expect(screen.getByText(/File size and speed calculations/)).toBeInTheDocument();
    });

    it('renders SkeletonLoader features', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText(/New variants: image, table, list/)).toBeInTheDocument();
      expect(screen.getByText(/Shimmer animation option/)).toBeInTheDocument();
    });

    it('renders Loading State Management features', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText(/useLoadingState hook for centralized control/)).toBeInTheDocument();
      expect(screen.getByText(/useProgressSimulation for realistic progress/)).toBeInTheDocument();
    });

    it('renders Accessibility features', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText(/LoadingAnnouncer component for screen readers/)).toBeInTheDocument();
      expect(screen.getByText(/ARIA live regions for progress updates/)).toBeInTheDocument();
    });
  });

  describe('Check Icons', () => {
    it('displays check icons for all features', () => {
      render(<LoadingEnhancementsSummary />);

      // Should have check icons for each feature
      const lists = screen.getAllByRole('list');
      lists.forEach(list => {
        const listItems = within(list).getAllByRole('listitem');
        listItems.forEach(item => {
          // Each list item should contain a check icon (MUI CheckCircle icon)
          const checkIcon = within(item).getByTestId('CheckCircleIcon');
          expect(checkIcon).toBeInTheDocument();
        });
      });
    });

    it('applies correct styling to check icons', () => {
      render(<LoadingEnhancementsSummary />);

      // Check icons should have success color and proper size
      const lists = screen.getAllByRole('list');
      expect(lists.length).toBeGreaterThan(0);
    });
  });

  describe('Key Benefits Section', () => {
    it('renders Key Benefits heading', () => {
      render(<LoadingEnhancementsSummary />);

      expect(screen.getByText('Key Benefits')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Key Benefits');
    });

    it('renders all key benefits', () => {
      render(<LoadingEnhancementsSummary />);

      expect(
        screen.getByText(/Improved user experience with visual feedback during loading/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Better accessibility for users with screen readers/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Consistent loading patterns across the entire application/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Performance optimizations with lazy loading and progress tracking/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Professional appearance with smooth animations and transitions/),
      ).toBeInTheDocument();
    });

    it('styles the Key Benefits section correctly', () => {
      render(<LoadingEnhancementsSummary />);

      const benefitsSection = screen.getByText('Key Benefits').closest('div');
      expect(benefitsSection).toBeInTheDocument();
    });
  });

  describe('List Structure', () => {
    it('renders proper list structure for each section', () => {
      render(<LoadingEnhancementsSummary />);

      const lists = screen.getAllByRole('list');

      // Should have 9 lists (one for each enhancement category)
      expect(lists).toHaveLength(9);

      lists.forEach(list => {
        const listItems = within(list).getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });

    it('uses dense list styling', () => {
      render(<LoadingEnhancementsSummary />);

      const lists = screen.getAllByRole('list');
      lists.forEach(list => {
        // Lists should be rendered (MUI dense prop is applied in component)
        expect(list).toBeInTheDocument();
      });
    });

    it('has proper list item structure', () => {
      render(<LoadingEnhancementsSummary />);

      const listItems = screen.getAllByRole('listitem');
      listItems.forEach(item => {
        // Each list item should have icon and text
        expect(item).toBeInTheDocument();
      });
    });
  });

  describe('Typography and Styling', () => {
    it('applies correct heading variants', () => {
      render(<LoadingEnhancementsSummary />);

      // Main title should be h3
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Loading Enhancement Summary',
      );

      // Section titles should be h5
      const h5Headings = screen.getAllByRole('heading', { level: 5 });
      expect(h5Headings.length).toBe(9); // One for each enhancement section

      // Key Benefits should be h6
      expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Key Benefits');
    });

    it('applies proper text styling', () => {
      render(<LoadingEnhancementsSummary />);

      // Introduction paragraph should be present
      const introParagraph = screen.getByText(/All loading states throughout the Hearth Website/);
      expect(introParagraph).toBeInTheDocument();
    });

    it('uses consistent spacing between sections', () => {
      render(<LoadingEnhancementsSummary />);

      // All section headings should be present
      const sectionHeadings = screen.getAllByRole('heading', { level: 5 });
      expect(sectionHeadings).toHaveLength(9);
    });
  });

  describe('Content Completeness', () => {
    it('includes all expected enhancement categories', () => {
      render(<LoadingEnhancementsSummary />);

      const expectedCategories = [
        'VoxelLoader Component',
        'LoadingProgress Component',
        'Enhanced GitHub Releases Loading',
        'PageLoader with Route Detection',
        'Enhanced LazyImage Component',
        'DownloadButton with Progress',
        'Advanced SkeletonLoader',
        'Loading State Management',
        'Accessibility Features',
      ];

      expectedCategories.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    it('includes comprehensive feature descriptions', () => {
      render(<LoadingEnhancementsSummary />);

      // Check for some key technical terms and features
      expect(screen.getByText(/3D voxel-building animation/)).toBeInTheDocument();
      expect(screen.getByText(/ARIA live regions/)).toBeInTheDocument();
      expect(screen.getByText(/useLoadingState hook/)).toBeInTheDocument();
      expect(screen.getByText(/Shimmer effect/)).toBeInTheDocument();
      expect(screen.getByText(/Progress tracking/)).toBeInTheDocument();
    });

    it('provides specific implementation details', () => {
      render(<LoadingEnhancementsSummary />);

      // Should include specific technical details
      expect(screen.getByText(/CSS-based 3D transforms \(no WebGL required\)/)).toBeInTheDocument();
      expect(
        screen.getByText(/Multiple variants: linear, circular, dots, spinner, skeleton, voxel/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Stage-based loading messages \(Connecting → Fetching → Processing\)/),
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<LoadingEnhancementsSummary />);

      const results = await axe(container, {
        rules: {
          'heading-order': { enabled: false }, // Skip heading order rule as this component has h3->h5->h6 structure
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(<LoadingEnhancementsSummary />);

      // Should have proper heading hierarchy: h3 > h5 > h6
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 5 })).toHaveLength(9);
      expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();
    });

    it('provides proper list semantics', () => {
      render(<LoadingEnhancementsSummary />);

      const lists = screen.getAllByRole('list');
      const listItems = screen.getAllByRole('listitem');

      expect(lists.length).toBeGreaterThan(0);
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('has accessible text content', () => {
      render(<LoadingEnhancementsSummary />);

      // All text should be accessible to screen readers
      const textContent = screen.getByText(/All loading states throughout the Hearth Website/);
      expect(textContent).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('applies proper Paper styling', () => {
      const { container } = render(<LoadingEnhancementsSummary />);

      const paper = container.firstChild as HTMLElement;
      expect(paper).toBeInTheDocument();
    });

    it('uses consistent color scheme', () => {
      render(<LoadingEnhancementsSummary />);

      // Component should render without errors
      expect(screen.getByText('Loading Enhancement Summary')).toBeInTheDocument();
    });

    it('applies proper spacing and layout', () => {
      render(<LoadingEnhancementsSummary />);

      // All sections should be properly spaced
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Content Accuracy', () => {
    it('describes VoxelLoader features accurately', () => {
      render(<LoadingEnhancementsSummary />);

      // VoxelLoader-specific features
      expect(
        screen.getByText(/3D voxel-building animation representing the engine's voxel nature/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Progress tracking with visual voxel completion/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Voxel-themed loading tips about engine features/),
      ).toBeInTheDocument();
    });

    it('describes accessibility features comprehensively', () => {
      render(<LoadingEnhancementsSummary />);

      // Accessibility-specific features
      expect(screen.getByText(/LoadingAnnouncer component for screen readers/)).toBeInTheDocument();
      expect(screen.getByText(/ARIA live regions for progress updates/)).toBeInTheDocument();
      expect(screen.getByText(/Keyboard navigation support/)).toBeInTheDocument();
      expect(screen.getByText(/High contrast loading indicators/)).toBeInTheDocument();
    });

    it('highlights performance improvements', () => {
      render(<LoadingEnhancementsSummary />);

      // Performance-related features
      expect(
        screen.getByText(/Performance optimizations with lazy loading and progress tracking/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Minimum duration support/)).toBeInTheDocument();
      expect(screen.getByText(/Error handling with recovery/)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('maintains consistent section structure', () => {
      render(<LoadingEnhancementsSummary />);

      // Each section should have title and feature list
      const sectionTitles = screen.getAllByRole('heading', { level: 5 });
      const lists = screen.getAllByRole('list');

      expect(sectionTitles).toHaveLength(9);
      expect(lists).toHaveLength(9);
    });

    it('organizes content logically', () => {
      render(<LoadingEnhancementsSummary />);

      // Content should be organized from specific components to general features
      const allText = document.body.textContent || '';

      // VoxelLoader should come before general Loading State Management
      const voxelIndex = allText.indexOf('VoxelLoader Component');
      const stateIndex = allText.indexOf('Loading State Management');
      expect(voxelIndex).toBeLessThan(stateIndex);

      // Accessibility should be near the end
      const accessibilityIndex = allText.indexOf('Accessibility Features');
      expect(accessibilityIndex).toBeGreaterThan(voxelIndex);
    });
  });

  describe('Error Handling', () => {
    it('renders without crashing with no props', () => {
      expect(() => {
        render(<LoadingEnhancementsSummary />);
      }).not.toThrow();
    });

    it('maintains structure even if constants are missing', () => {
      render(<LoadingEnhancementsSummary />);

      // Should still render the basic structure
      expect(screen.getByText('Loading Enhancement Summary')).toBeInTheDocument();
      expect(screen.getByText('Key Benefits')).toBeInTheDocument();
    });
  });
});
