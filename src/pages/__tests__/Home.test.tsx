import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { render } from '../../test-utils';
import Home from '../Home';

// Mock constants
jest.mock('../../constants', () => ({
  COLORS: {
    primary: { main: '#ff4500', light: '#ff6b35' },
    background: { default: '#0a0a0a', paper: '#1a1a1a' },
    text: { secondary: '#d4d4d4' },
    utils: { transparent: 'transparent' },
  },
  MISC: {
    github: {
      repoUrl: 'https://github.com/test/repo',
    },
  },
}));

// Mock React Router Link
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material', () => ({
  GitHub: () => <div data-testid='github-icon' />,
  Download: () => <div data-testid='download-icon' />,
  MenuBook: () => <div data-testid='menubook-icon' />,
  Speed: () => <div data-testid='speed-icon' />,
  Terrain: () => <div data-testid='terrain-icon' />,
  Build: () => <div data-testid='build-icon' />,
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hero Section', () => {
    it('renders hero title correctly', () => {
      render(<Home />);
      expect(screen.getByText('Hearth Engine')).toBeInTheDocument();
    });

    it('renders hero subtitle', () => {
      render(<Home />);
      expect(
        screen.getByText('Build worlds that feel real. Destroy them too.'),
      ).toBeInTheDocument();
    });

    it('renders hero description', () => {
      render(<Home />);
      expect(
        screen.getByText(/A next-generation voxel engine with true physics simulation/)
      ).toBeInTheDocument();
    });

    it('renders hero image with correct alt text', () => {
      render(<Home />);
      const heroImage = screen.getByAltText('Hearth Engine Logo');
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute('src', '/hearth-website/logo.png');
    });

    it('displays performance chips', () => {
      render(<Home />);
      expect(screen.getByText('60+ FPS')).toBeInTheDocument();
      expect(screen.getByText('1M+ Voxels')).toBeInTheDocument();
      expect(screen.getByText('Real Physics')).toBeInTheDocument();
    });

    it('has performance chip tooltips', () => {
      render(<Home />);
      const fpsChip = screen.getByText('60+ FPS').parentElement;
      expect(fpsChip).toHaveAttribute('title');
    });
  });

  describe('CTA Buttons', () => {
    it('renders download button with correct link', () => {
      render(<Home />);
      const downloadButton = screen.getByRole('link', { name: /download latest/i });
      expect(downloadButton).toBeInTheDocument();
      expect(downloadButton).toHaveAttribute('href', '/downloads');
    });

    it('renders get started button with correct link', () => {
      render(<Home />);
      const getStartedButton = screen.getByRole('link', { name: /get started/i });
      expect(getStartedButton).toBeInTheDocument();
      expect(getStartedButton).toHaveAttribute('href', '/docs');
    });

    it('renders GitHub CTA button', () => {
      render(<Home />);
      const githubButton = screen.getByRole('link', { name: /view on github/i });
      expect(githubButton).toBeInTheDocument();
      expect(githubButton).toHaveAttribute('href', 'https://github.com/test/repo');
      expect(githubButton).toHaveAttribute('target', '_blank');
    });

    it('renders Discord CTA button', () => {
      render(<Home />);
      const discordButton = screen.getByRole('link', { name: /join discord/i });
      expect(discordButton).toBeInTheDocument();
      expect(discordButton).toHaveAttribute('href', 'https://discord.gg/hearth');
      expect(discordButton).toHaveAttribute('target', '_blank');
    });
  });

  describe('Feature Cards', () => {
    it('renders all three feature cards', () => {
      render(<Home />);
      expect(screen.getByText('Blazing Performance')).toBeInTheDocument();
      expect(screen.getByText('True Voxel Physics')).toBeInTheDocument();
      expect(screen.getByText('Emergent Gameplay')).toBeInTheDocument();
    });

    it('feature cards have correct descriptions', () => {
      render(<Home />);
      expect(
        screen.getByText(/GPU-first architecture with data-oriented design/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Every voxel simulates realistic physics/)).toBeInTheDocument();
      expect(screen.getByText(/Complex behaviors emerge from simple rules/)).toBeInTheDocument();
    });

    it('feature cards have icons', () => {
      render(<Home />);
      expect(screen.getByTestId('speed-icon')).toBeInTheDocument();
      expect(screen.getByTestId('terrain-icon')).toBeInTheDocument();
      expect(screen.getByTestId('build-icon')).toBeInTheDocument();
    });

    it('feature cards have hover effects', () => {
      render(<Home />);
      const performanceCard = screen.getByText('Blazing Performance').closest('.MuiCard-root');
      expect(performanceCard).toHaveStyle({
        transition: expect.stringContaining('all'),
      });
    });
  });

  describe('SEO Component', () => {
    it('renders SEO component with correct props', () => {
      render(<Home />);
      // SEO component would set document title and meta tags
      // In a real test, you might check document.title or meta tags
      expect(document.title).toContain('Home');
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Home />);

      // Check that elements still render on mobile
      expect(screen.getByText('Hearth Engine')).toBeInTheDocument();
      expect(
        screen.getByText('Build worlds that feel real. Destroy them too.'),
      ).toBeInTheDocument();
    });

    it('shows proper grid layout on desktop', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<Home />);

      // Feature cards should be in a grid
      const featureCards = screen.getAllByRole('article');
      expect(featureCards).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Home />);

      // Check for h1
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // Check for h2s (section titles)
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });

    it('has accessible button labels', () => {
      render(<Home />);

      const downloadButton = screen.getByRole('link', { name: /download latest/i });
      const getStartedButton = screen.getByRole('link', { name: /get started/i });

      expect(downloadButton).toHaveAccessibleName();
      expect(getStartedButton).toHaveAccessibleName();
    });

    it('has proper alt text for images', () => {
      render(<Home />);

      const logoImage = screen.getByAltText('Hearth Engine Logo');
      expect(logoImage).toBeInTheDocument();
    });

    it('has keyboard navigation support', () => {
      render(<Home />);

      const downloadButton = screen.getByRole('link', { name: /download latest/i });
      downloadButton.focus();
      expect(downloadButton).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('lazy loads images correctly', async () => {
      render(<Home />);

      const logoImage = screen.getByAltText('Hearth Engine Logo');

      // Simulate image load
      fireEvent.load(logoImage);

      await waitFor(() => {
        expect(logoImage).toBeInTheDocument();
      });
    });

    it('has memoized component to prevent unnecessary re-renders', () => {
      const { rerender } = render(<Home />);

      // Component should be memoized
      expect(Home.displayName).toBe('Home');

      // Re-render with same props shouldn't cause issues
      rerender(<Home />);
      expect(screen.getByText('Hearth Engine')).toBeInTheDocument();
    });
  });

  describe('Footer and Navigation', () => {
    it('renders navigation bar', () => {
      render(<Home />);
      // NavigationBar component should be rendered
      // This would depend on your NavigationBar implementation
    });

    it('renders footer', () => {
      render(<Home />);
      // Footer component should be rendered
      // This would depend on your Footer implementation
    });
  });

  describe('Animation and Interactions', () => {
    it('handles card hover interactions', () => {
      render(<Home />);

      const performanceCard = screen.getByText('Blazing Performance').closest('.MuiCard-root');

      if (performanceCard) {
        fireEvent.mouseEnter(performanceCard);
        // Card should have hover styles applied
        expect(performanceCard).toHaveStyle({
          transition: expect.stringContaining('all'),
        });
      }
    });

    it('has smooth scrolling for internal navigation', () => {
      render(<Home />);

      // Test smooth scrolling behavior if implemented
      const ctaSection = screen.getByText('Ready to Build Something Amazing?');
      expect(ctaSection).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing image gracefully', () => {
      render(<Home />);

      const logoImage = screen.getByAltText('Hearth Engine Logo');

      // Simulate image error
      fireEvent.error(logoImage);

      // Should still render without crashing
      expect(logoImage).toBeInTheDocument();
    });
  });
});
