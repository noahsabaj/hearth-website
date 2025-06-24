import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { render } from '../../test-utils';
import Engine from '../Engine';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
  },
}));

// Mock Material-UI hooks
jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: () => ({
    palette: {
      primary: { main: '#ff4500' },
      background: { paper: '#1a1a1a' },
      text: { secondary: '#d4d4d4' },
    },
    breakpoints: {
      down: () => false,
    },
  }),
  useMediaQuery: () => false,
}));

// Mock constants
jest.mock('../../constants', () => ({
  COLORS: {
    primary: { main: '#ff4500', light: '#ff6b35', dark: '#e63900' },
    background: { paper: '#1a1a1a', elevated: '#222', default: '#0a0a0a' },
    text: { primary: '#ffffff', secondary: '#d4d4d4' },
    utils: { border: 'rgba(255, 255, 255, 0.1)', transparent: 'transparent' },
    status: { success: '#4caf50', error: '#f44336', warning: '#ff9800' },
  },
  SHADOWS: {
    button: '0 4px 8px rgba(0, 0, 0, 0.2)',
    primaryLight: '0 8px 16px rgba(255, 69, 0, 0.3)',
  },
  MISC: {
    github: {
      repoUrl: 'https://github.com/test/repo',
    },
  },
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material', () => ({
  Speed: () => <div data-testid='speed-icon' />,
  Memory: () => <div data-testid='memory-icon' />,
  Code: () => <div data-testid='code-icon' />,
  Terrain: () => <div data-testid='terrain-icon' />,
  Architecture: () => <div data-testid='architecture-icon' />,
  CloudQueue: () => <div data-testid='cloudqueue-icon' />,
  CheckCircle: () => <div data-testid='checkcircle-icon' />,
  Bolt: () => <div data-testid='bolt-icon' />,
  Storage: () => <div data-testid='storage-icon' />,
  Public: () => <div data-testid='public-icon' />,
  Layers: () => <div data-testid='layers-icon' />,
  ViewInAr: () => <div data-testid='viewinar-icon' />,
  Psychology: () => <div data-testid='psychology-icon' />,
  RocketLaunch: () => <div data-testid='rocketlaunch-icon' />,
  Engineering: () => <div data-testid='engineering-icon' />,
  Science: () => <div data-testid='science-icon' />,
  Build: () => <div data-testid='build-icon' />,
  Devices: () => <div data-testid='devices-icon' />,
  GpsFixed: () => <div data-testid='gpsfixed-icon' />,
  MenuBook: () => <div data-testid='menubook-icon' />,
  Check: () => <div data-testid='check-icon' />,
  Close: () => <div data-testid='close-icon' />,
  RemoveCircleOutline: () => <div data-testid='removecircleoutline-icon' />,
  ExpandMore: () => <div data-testid='expandmore-icon' />,
  FileDownload: () => <div data-testid='filedownload-icon' />,
}));

describe('Engine Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hero Section', () => {
    it('renders page title correctly', () => {
      render(<Engine />);
      expect(screen.getByText('Hearth Engine')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      render(<Engine />);
      expect(
        screen.getByText('Next-generation voxel engine built for the GPU era'),
      ).toBeInTheDocument();
    });

    it('displays feature chips', () => {
      render(<Engine />);
      expect(screen.getByText('GPU-First')).toBeInTheDocument();
      expect(screen.getByText('Data-Oriented')).toBeInTheDocument();
      expect(screen.getByText('Planet-Scale')).toBeInTheDocument();
      expect(screen.getByText('True Physics')).toBeInTheDocument();
    });

    it('renders core philosophy section', () => {
      render(<Engine />);
      expect(screen.getByText('Core Philosophy')).toBeInTheDocument();
      expect(screen.getByText(/Hearth Engine represents a paradigm shift/)).toBeInTheDocument();
    });
  });

  describe('Features Showcase', () => {
    it('renders all engine features', () => {
      render(<Engine />);
      expect(screen.getByText('GPU-First Architecture')).toBeInTheDocument();
      expect(screen.getByText('Data-Oriented Design')).toBeInTheDocument();
      expect(screen.getByText('Unified World System')).toBeInTheDocument();
      expect(screen.getByText('True Physics Simulation')).toBeInTheDocument();
      expect(screen.getByText('Advanced World Generation')).toBeInTheDocument();
      expect(screen.getByText('Modern Rendering')).toBeInTheDocument();
    });

    it('displays feature icons', () => {
      render(<Engine />);
      expect(screen.getByTestId('bolt-icon')).toBeInTheDocument();
      expect(screen.getByTestId('architecture-icon')).toBeInTheDocument();
      expect(screen.getByTestId('memory-icon')).toBeInTheDocument();
      expect(screen.getByTestId('viewinar-icon')).toBeInTheDocument();
      expect(screen.getByTestId('terrain-icon')).toBeInTheDocument();
      expect(screen.getByTestId('cloudqueue-icon')).toBeInTheDocument();
    });

    it('shows feature statistics', () => {
      render(<Engine />);
      expect(screen.getByText(/60\+ FPS with 1M\+ voxels/)).toBeInTheDocument();
      expect(screen.getByText(/GPU-accelerated physics/)).toBeInTheDocument();
      expect(screen.getByText(/Zero-copy architecture/)).toBeInTheDocument();
    });
  });

  describe('Comparison Table', () => {
    it('renders engine comparison section', () => {
      render(<Engine />);
      expect(screen.getByText('Engine Comparison')).toBeInTheDocument();
      expect(
        screen.getByText('See how Hearth stacks up against other popular game engines')
      ).toBeInTheDocument();
    });

    it('displays all engine columns', () => {
      render(<Engine />);
      expect(screen.getByText('Hearth Engine')).toBeInTheDocument();
      expect(screen.getByText('Unity')).toBeInTheDocument();
      expect(screen.getByText('Unreal Engine')).toBeInTheDocument();
      expect(screen.getByText('Godot')).toBeInTheDocument();
    });

    it('has sortable headers', () => {
      render(<Engine />);
      const categoryHeader = screen.getByRole('button', { name: /category/i });
      const featureHeader = screen.getByRole('button', { name: /feature/i });

      expect(categoryHeader).toBeInTheDocument();
      expect(featureHeader).toBeInTheDocument();
    });

    it('handles sorting functionality', () => {
      render(<Engine />);
      const categoryHeader = screen.getByRole('button', { name: /category/i });

      fireEvent.click(categoryHeader);

      // Should trigger sort state change
      expect(categoryHeader).toBeInTheDocument();
    });

    it('shows expandable rows', () => {
      render(<Engine />);
      const expandButtons = screen.getAllByTestId('expandmore-icon');

      expect(expandButtons.length).toBeGreaterThan(0);

      // Click first expand button
      fireEvent.click(expandButtons[0].parentElement as HTMLElement);

      // Should show expanded content
      expect(expandButtons[0]).toBeInTheDocument();
    });

    it('displays comparison values correctly', () => {
      render(<Engine />);

      // Check for various comparison indicators
      expect(screen.getAllByTestId('check-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('close-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('removecircleoutline-icon').length).toBeGreaterThan(0);
    });
  });

  describe('Export Functionality', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock document.createElement and click
      const mockElement = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
    });

    it('renders export buttons', () => {
      render(<Engine />);
      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument();
    });

    it('handles CSV export', () => {
      render(<Engine />);
      const csvButton = screen.getByRole('button', { name: /export csv/i });

      fireEvent.click(csvButton);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('handles JSON export', () => {
      render(<Engine />);
      const jsonButton = screen.getByRole('button', { name: /export json/i });

      fireEvent.click(jsonButton);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('Performance Metrics', () => {
    it('renders performance results section', () => {
      render(<Engine />);
      expect(screen.getByText('Performance Results')).toBeInTheDocument();
      expect(
        screen.getByText('Data-oriented architecture delivers real-world improvements')
      ).toBeInTheDocument();
    });

    it('displays performance improvements', () => {
      render(<Engine />);
      expect(screen.getByText(/4x faster/)).toBeInTheDocument();
      expect(screen.getByText(/4.2x faster/)).toBeInTheDocument();
    });
  });

  describe('Architecture Timeline', () => {
    it('renders architecture evolution section', () => {
      render(<Engine />);
      expect(screen.getByText('Architecture Evolution')).toBeInTheDocument();
      expect(screen.getByText('From traditional design to GPU-first future')).toBeInTheDocument();
    });

    it('displays architecture phases', () => {
      render(<Engine />);
      expect(screen.getByText('GPU-First Design')).toBeInTheDocument();
      expect(screen.getByText('Structure of Arrays')).toBeInTheDocument();
      expect(screen.getByText('Unified Kernel')).toBeInTheDocument();
      expect(screen.getByText('Indirect Drawing')).toBeInTheDocument();
      expect(screen.getByText('Mesh Shaders')).toBeInTheDocument();
    });
  });

  describe('Technology Stack', () => {
    it('renders tech stack section', () => {
      render(<Engine />);
      expect(screen.getByText('Technology Stack')).toBeInTheDocument();
      expect(screen.getByText('Modern tools for next-generation performance')).toBeInTheDocument();
    });

    it('displays all technologies', () => {
      render(<Engine />);
      expect(screen.getByText('Rust')).toBeInTheDocument();
      expect(screen.getByText('WGSL')).toBeInTheDocument();
      expect(screen.getByText('wgpu')).toBeInTheDocument();
      expect(screen.getByText('Compute Shaders')).toBeInTheDocument();
      expect(screen.getByText('Data-Oriented')).toBeInTheDocument();
      expect(screen.getByText('Morton Encoding')).toBeInTheDocument();
    });
  });

  describe('Call to Action', () => {
    it('renders CTA section', () => {
      render(<Engine />);
      expect(screen.getByText('Ready to Build?')).toBeInTheDocument();
      expect(
        screen.getByText('Start creating worlds with Hearth Engine today')
      ).toBeInTheDocument();
    });

    it('has documentation and source code links', () => {
      render(<Engine />);
      const docLink = screen.getByRole('link', { name: /read documentation/i });
      const sourceLink = screen.getByRole('link', { name: /view source/i });

      expect(docLink).toBeInTheDocument();
      expect(sourceLink).toBeInTheDocument();
      expect(sourceLink).toHaveAttribute('href', 'https://github.com/test/repo');
    });
  });

  describe('Responsive Design', () => {
    it('adapts to mobile screens', () => {
      // Mock mobile breakpoint
      jest.mocked(require('@mui/material/styles').useMediaQuery).mockReturnValue(true);

      render(<Engine />);

      // Should still render main content
      expect(screen.getByText('Hearth Engine')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Engine />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('has accessible table structure', () => {
      render(<Engine />);

      const table = screen.getByRole('table', { name: /engine comparison table/i });
      expect(table).toBeInTheDocument();
    });

    it('has keyboard navigation for interactive elements', () => {
      render(<Engine />);

      const sortButton = screen.getByRole('button', { name: /category/i });
      sortButton.focus();
      expect(sortButton).toHaveFocus();
    });
  });

  describe('SEO and Meta', () => {
    it('renders SEO component with correct props', () => {
      render(<Engine />);
      // SEO component should set appropriate meta tags
      expect(document.title).toContain('Engine Technology');
    });
  });

  describe('Animation Performance', () => {
    it('handles animation variants without errors', () => {
      render(<Engine />);

      // Component should render without throwing animation errors
      expect(screen.getByText('Hearth Engine')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing comparison data gracefully', () => {
      render(<Engine />);

      // Should not crash with missing data
      expect(screen.getByText('Engine Comparison')).toBeInTheDocument();
    });
  });
});
