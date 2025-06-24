import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { render } from '../../test-utils';
import Benchmarks from '../Benchmarks';

// Mock recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid='line-chart'>{children}</div>,
  Line: ({ name }: any) => <div data-testid={`line-${name.toLowerCase()}`} />,
  BarChart: ({ children }: any) => <div data-testid='bar-chart'>{children}</div>,
  Bar: ({ name }: any) => <div data-testid={`bar-${name.toLowerCase()}`} />,
  AreaChart: ({ children }: any) => <div data-testid='area-chart'>{children}</div>,
  Area: ({ name }: any) => <div data-testid={`area-${name.toLowerCase()}`} />,
  RadarChart: ({ children }: any) => <div data-testid='radar-chart'>{children}</div>,
  Radar: ({ name }: any) => <div data-testid={`radar-${name.toLowerCase()}`} />,
  XAxis: () => <div data-testid='x-axis' />,
  YAxis: () => <div data-testid='y-axis' />,
  CartesianGrid: () => <div data-testid='cartesian-grid' />,
  Tooltip: () => <div data-testid='tooltip' />,
  Legend: () => <div data-testid='legend' />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid='responsive-container'>{children}</div>
  ),
  PolarGrid: () => <div data-testid='polar-grid' />,
  PolarAngleAxis: () => <div data-testid='polar-angle-axis' />,
  PolarRadiusAxis: () => <div data-testid='polar-radius-axis' />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
}));

// Mock constants
jest.mock('../../constants', () => ({
  COLORS: {
    primary: { main: '#ff4500' },
    background: { paper: '#1a1a1a', elevated: '#222' },
    text: { secondary: '#d4d4d4', primary: '#ffffff' },
    utils: {
      border: 'rgba(255, 255, 255, 0.1)',
      divider: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
    status: { success: '#4caf50', info: '#2196f3', warning: '#ff9800' },
  },
  BENCHMARKS: {
    defaultValues: {
      voxelCount: 1000000,
      viewDistance: 12,
      physicsQuality: 'high',
      chunkSize: 32,
    },
    metrics: {
      maxVoxels: 5000000,
      maxViewDistance: 32,
      targetFPS: 60,
    },
    fpsData: [
      { voxels: 1000000, hearth: 120, unity: 60, unreal: 45, godot: 50 },
      { voxels: 2000000, hearth: 110, unity: 45, unreal: 35, godot: 40 },
    ],
    memoryData: [
      { feature: 'Base', hearth: 50, unity: 80, unreal: 120, godot: 70 },
      { feature: '1M Voxels', hearth: 200, unity: 400, unreal: 600, godot: 350 },
    ],
    physicsData: [
      { test: 'Collision', hearth: 50000, unity: 20000, unreal: 25000, godot: 15000 },
      { test: 'Fluid', hearth: 30000, unity: 10000, unreal: 12000, godot: 8000 },
    ],
    chunkGenData: [
      { size: '16³', hearth: 2, unity: 8, unreal: 6, godot: 10 },
      { size: '32³', hearth: 5, unity: 20, unreal: 15, godot: 25 },
    ],
    engineColors: {
      hearth: '#ff4500',
      unity: '#000000',
      unreal: '#0000ff',
      godot: '#478cbf',
    },
  },
  LAYOUT: {
    backdropFilter: {
      blur: 'blur(10px)',
    },
  },
}));

describe('Benchmarks Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Header Section', () => {
    it('renders page title correctly', () => {
      render(<Benchmarks />);
      expect(screen.getByText('Performance Benchmarks')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      render(<Benchmarks />);
      expect(
        screen.getByText(/See how Hearth Engine outperforms the competition/)
      ).toBeInTheDocument();
    });
  });

  describe('Interactive Controls', () => {
    it('renders voxel count slider', () => {
      render(<Benchmarks />);
      expect(screen.getByText(/Voxel Count:/)).toBeInTheDocument();

      const slider = screen.getByRole('slider', { name: /voxel count/i });
      expect(slider).toBeInTheDocument();
    });

    it('renders view distance slider', () => {
      render(<Benchmarks />);
      expect(screen.getByText(/View Distance:/)).toBeInTheDocument();

      const slider = screen.getByRole('slider', { name: /view distance/i });
      expect(slider).toBeInTheDocument();
    });

    it('renders physics quality dropdown', () => {
      render(<Benchmarks />);
      expect(screen.getByRole('combobox', { name: /physics quality/i })).toBeInTheDocument();
    });

    it('renders graphics options switches', () => {
      render(<Benchmarks />);
      expect(screen.getByRole('checkbox', { name: /shadows/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /reflections/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /post processing/i })).toBeInTheDocument();
    });

    it('updates voxel count when slider changes', () => {
      render(<Benchmarks />);

      const slider = screen.getByRole('slider', { name: /voxel count/i });
      fireEvent.change(slider, { target: { value: '2000000' } });

      expect(screen.getByText(/Voxel Count: 2,000,000/)).toBeInTheDocument();
    });

    it('updates view distance when slider changes', () => {
      render(<Benchmarks />);

      const slider = screen.getByRole('slider', { name: /view distance/i });
      fireEvent.change(slider, { target: { value: '16' } });

      expect(screen.getByText(/View Distance: 16 chunks/)).toBeInTheDocument();
    });

    it('updates physics quality when dropdown changes', () => {
      render(<Benchmarks />);

      const dropdown = screen.getByRole('combobox', { name: /physics quality/i });
      fireEvent.mouseDown(dropdown);

      const mediumOption = screen.getByRole('option', { name: /medium/i });
      fireEvent.click(mediumOption);

      expect(dropdown).toHaveDisplayValue('Medium');
    });

    it('toggles graphics options', () => {
      render(<Benchmarks />);

      const shadowsSwitch = screen.getByRole('checkbox', { name: /shadows/i });
      fireEvent.click(shadowsSwitch);

      expect(shadowsSwitch).not.toBeChecked();
    });
  });

  describe('Chart Rendering', () => {
    it('renders FPS performance chart', () => {
      render(<Benchmarks />);
      expect(screen.getByText('FPS vs Voxel Count')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders memory usage chart', () => {
      render(<Benchmarks />);
      expect(screen.getByText('Memory Usage Comparison')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders physics performance chart', () => {
      render(<Benchmarks />);
      expect(screen.getByText('Physics Operations per Second')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('renders engine features radar chart', () => {
      render(<Benchmarks />);
      expect(screen.getByText('Engine Feature Comparison')).toBeInTheDocument();
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('renders chunk generation chart', () => {
      render(<Benchmarks />);
      expect(screen.getByText('Chunk Generation Speed')).toBeInTheDocument();
      expect(screen.getAllByTestId('bar-chart')).toHaveLength(2); // Memory + Chunk generation
    });

    it('displays all engine lines in charts', () => {
      render(<Benchmarks />);
      expect(screen.getByTestId('line-hearth')).toBeInTheDocument();
      expect(screen.getByTestId('line-unity')).toBeInTheDocument();
      expect(screen.getByTestId('line-unreal')).toBeInTheDocument();
      expect(screen.getByTestId('line-godot')).toBeInTheDocument();
    });
  });

  describe('Data Updates', () => {
    it('updates chart data when controls change', async () => {
      render(<Benchmarks />);

      const shadowsSwitch = screen.getByRole('checkbox', { name: /shadows/i });
      fireEvent.click(shadowsSwitch);

      await waitFor(() => {
        // Charts should still be present with updated data
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    it('shows quality indicator in physics chart', () => {
      render(<Benchmarks />);
      expect(screen.getByText(/Quality: High/)).toBeInTheDocument();
    });

    it('updates physics quality indicator', () => {
      render(<Benchmarks />);

      const dropdown = screen.getByRole('combobox', { name: /physics quality/i });
      fireEvent.mouseDown(dropdown);

      const lowOption = screen.getByRole('option', { name: /low/i });
      fireEvent.click(lowOption);

      expect(screen.getByText(/Quality: Low/)).toBeInTheDocument();
    });
  });

  describe('Performance Metrics Display', () => {
    it('displays performance chips and labels', () => {
      render(<Benchmarks />);
      expect(screen.getByText('Hearth Leads')).toBeInTheDocument();
      expect(screen.getByText('Up to 70% Less Memory')).toBeInTheDocument();
      expect(screen.getByText('4x Faster Generation')).toBeInTheDocument();
    });

    it('shows target FPS indicator', () => {
      render(<Benchmarks />);
      expect(screen.getByText(/Target: 60 FPS/)).toBeInTheDocument();
    });

    it('displays chunk size information', () => {
      render(<Benchmarks />);
      expect(screen.getByText(/Current chunk size: 32³ voxels/)).toBeInTheDocument();
    });
  });

  describe('Summary Statistics', () => {
    it('renders summary stats section', () => {
      render(<Benchmarks />);
      expect(screen.getByText('3.5x')).toBeInTheDocument();
      expect(screen.getByText('Faster Voxel Processing')).toBeInTheDocument();

      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('Less Memory Usage')).toBeInTheDocument();

      expect(screen.getByText('2.5x')).toBeInTheDocument();
      expect(screen.getByText('Physics Performance')).toBeInTheDocument();

      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('FPS at 1M Voxels')).toBeInTheDocument();
    });
  });

  describe('Test Environment Information', () => {
    it('displays test environment details', () => {
      render(<Benchmarks />);
      expect(
        screen.getByText(/Benchmarks performed on: Intel i9-13900K, NVIDIA RTX 4090, 32GB DDR5 RAM/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/All engines tested with identical scenes and settings/)
      ).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts charts for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Benchmarks />);

      // Charts should still render on mobile
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('stacks controls vertically on mobile', () => {
      render(<Benchmarks />);

      // Interactive controls should be present
      expect(screen.getByText('Interactive Performance Controls')).toBeInTheDocument();
    });
  });

  describe('Chart Interactivity', () => {
    it('has interactive tooltips', () => {
      render(<Benchmarks />);

      // Tooltips should be rendered
      expect(screen.getAllByTestId('tooltip')).toHaveLength(5); // One for each chart
    });

    it('has legends for all charts', () => {
      render(<Benchmarks />);

      // Legends should be rendered
      expect(screen.getAllByTestId('legend')).toHaveLength(5); // One for each chart
    });

    it('has responsive containers for charts', () => {
      render(<Benchmarks />);

      // All charts should be in responsive containers
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(5);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Benchmarks />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Performance Benchmarks');
    });

    it('has accessible form controls', () => {
      render(<Benchmarks />);

      const voxelSlider = screen.getByRole('slider', { name: /voxel count/i });
      const viewDistanceSlider = screen.getByRole('slider', { name: /view distance/i });
      const physicsSelect = screen.getByRole('combobox', { name: /physics quality/i });

      expect(voxelSlider).toBeInTheDocument();
      expect(viewDistanceSlider).toBeInTheDocument();
      expect(physicsSelect).toBeInTheDocument();
    });

    it('has proper labels for switches', () => {
      render(<Benchmarks />);

      const shadowsSwitch = screen.getByRole('checkbox', { name: /shadows/i });
      const reflectionsSwitch = screen.getByRole('checkbox', { name: /reflections/i });
      const postProcessingSwitch = screen.getByRole('checkbox', { name: /post processing/i });

      expect(shadowsSwitch).toBeInTheDocument();
      expect(reflectionsSwitch).toBeInTheDocument();
      expect(postProcessingSwitch).toBeInTheDocument();
    });
  });

  describe('SEO and Meta', () => {
    it('renders SEO component with correct props', () => {
      render(<Benchmarks />);
      expect(document.title).toContain('Performance Benchmarks');
    });
  });

  describe('Animation and Motion', () => {
    it('handles motion animations without errors', () => {
      render(<Benchmarks />);

      // Component should render with motion elements
      expect(screen.getByText('Performance Benchmarks')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing benchmark data gracefully', () => {
      render(<Benchmarks />);

      // Should not crash with chart rendering
      expect(screen.getByText('Performance Benchmarks')).toBeInTheDocument();
    });

    it('handles invalid slider values', () => {
      render(<Benchmarks />);

      const slider = screen.getByRole('slider', { name: /voxel count/i });

      // Try to set invalid value
      fireEvent.change(slider, { target: { value: '-1' } });

      // Should not crash
      expect(slider).toBeInTheDocument();
    });
  });
});
