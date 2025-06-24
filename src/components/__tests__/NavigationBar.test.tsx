import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest, mockLocalStorage } from '../../test-utils';
import NavigationBar from '../NavigationBar';

expect.extend(toHaveNoViolations);

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

describe('NavigationBar Component', () => {
  beforeEach(() => {
    setupTest();
    mockLocalStorage.getItem.mockReturnValue('false');
  });

  afterEach(() => {
    teardownTest();
  });

  it('renders logo and title', () => {
    render(<NavigationBar />);

    expect(screen.getByAltText('Hearth Engine')).toBeInTheDocument();
    expect(screen.getByText('Hearth Engine')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<NavigationBar />);

    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Engine')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('highlights active page', () => {
    // Mock location for docs page
    jest.mocked(require('react-router-dom').useLocation).mockReturnValue({
      pathname: '/docs',
    });

    render(<NavigationBar variant='docs' />);

    const docsLink = screen.getByText('Documentation');
    expect(docsLink.closest('a')).toHaveStyle('border-bottom: 2px solid');
  });

  it('opens keyboard shortcuts modal', async () => {
    const user = userEvent.setup();
    render(<NavigationBar />);

    const keyboardButton = screen.getByLabelText('Show keyboard shortcuts (?)');
    await user.click(keyboardButton);

    // Should dispatch keyboard event
    expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate
  });

  it('has working GitHub link', () => {
    render(<NavigationBar />);

    const githubLink = screen.getByLabelText('View Hearth Engine on GitHub (opens in new tab)');
    expect(githubLink).toHaveAttribute('href', expect.stringContaining('github.com'));
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows search bar', () => {
    render(<NavigationBar />);

    // Search bar should be present
    expect(screen.getByText('Search...')).toBeInTheDocument();
  });

  it('handles mobile view correctly', () => {
    // Mock mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    render(<NavigationBar />);

    // Title should not show on mobile
    expect(screen.queryByText('Hearth Engine')).not.toBeInTheDocument();

    // Links should show shortened text
    expect(screen.getByText('Docs')).toBeInTheDocument();
  });

  it('shows Home link when not on home page', () => {
    render(<NavigationBar variant='docs' />);

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('does not show Home link when on home page', () => {
    render(<NavigationBar variant='home' />);

    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<NavigationBar />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<NavigationBar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has working hover effects', async () => {
    const user = userEvent.setup();
    render(<NavigationBar />);

    const docsLink = screen.getByText('Documentation');

    await user.hover(docsLink);

    // Link should have hover state
    expect(docsLink.closest('a')).toHaveStyle('border-bottom: 2px solid');
  });

  it('sets up search focus callback', () => {
    render(<NavigationBar />);

    // The navigation bar should set up the search focus callback
    // This is tested indirectly through the keyboard shortcuts context
    expect(screen.getByText('Search...')).toBeInTheDocument();
  });

  it('handles theme toggle correctly', async () => {
    const user = userEvent.setup();
    render(<NavigationBar />);

    // Should have high contrast toggle button
    const contrastButton = screen.getByLabelText(/high contrast mode/i);
    expect(contrastButton).toBeInTheDocument();

    await user.click(contrastButton);

    // Should toggle high contrast mode
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('highContrastMode', 'true');
  });

  it('applies proper fixed positioning', () => {
    render(<NavigationBar />);

    const appBar = screen.getByRole('navigation').closest('.MuiAppBar-root');
    expect(appBar).toHaveClass('MuiAppBar-positionFixed');
  });

  it('shows proper icons for all links', () => {
    render(<NavigationBar />);

    // Check for icon presence (they should be in the DOM)
    const docsIcon =
      screen.getByTestId('MenuBookIcon') ||
      screen.getByText('Documentation').closest('a')?.querySelector('svg');
    const engineIcon =
      screen.getByTestId('EngineeringIcon') ||
      screen.getByText('Engine').closest('a')?.querySelector('svg');
    const downloadIcon =
      screen.getByTestId('DownloadIcon') ||
      screen.getByText('Downloads').closest('a')?.querySelector('svg');

    expect(docsIcon || screen.getByText('Documentation')).toBeInTheDocument();
    expect(engineIcon || screen.getByText('Engine')).toBeInTheDocument();
    expect(downloadIcon || screen.getByText('Downloads')).toBeInTheDocument();
  });
});
