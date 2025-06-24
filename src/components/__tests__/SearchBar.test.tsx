import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, mockLocalStorage, setupTest, teardownTest } from '../../test-utils';
import SearchBar, { SearchBarRef } from '../SearchBar';

expect.extend(toHaveNoViolations);

describe('SearchBar Component', () => {
  let searchBarRef: React.RefObject<SearchBarRef>;

  beforeEach(() => {
    setupTest();
    searchBarRef = React.createRef();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['test search']));
  });

  afterEach(() => {
    teardownTest();
  });

  it('renders search button with correct placeholder', () => {
    render(<SearchBar ref={searchBarRef} />);

    expect(screen.getByText('Search...')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
  });

  it('opens search modal when clicked', async () => {
    const user = userEvent.setup();
    render(<SearchBar ref={searchBarRef} />);

    const searchButton = screen.getByRole('button');
    await user.click(searchButton);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search documentation, commands, FAQ...'),
      ).toBeInTheDocument();
    });
  });

  it('opens search modal with keyboard shortcut', () => {
    render(<SearchBar ref={searchBarRef} />);

    // Simulate Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(
      screen.getByPlaceholderText('Search documentation, commands, FAQ...'),
    ).toBeInTheDocument();
  });

  it('filters search results by category', async () => {
    const user = userEvent.setup();
    render(<SearchBar ref={searchBarRef} />);

    // Open search
    const searchButton = screen.getByRole('button');
    await user.click(searchButton);

    // Type search query
    const searchInput = screen.getByPlaceholderText('Search documentation, commands, FAQ...');
    await user.type(searchInput, 'getting started');

    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
    });

    // Click Pages filter
    const pagesFilter = screen.getByText('Pages');
    await user.click(pagesFilter);

    // Should filter results
    await waitFor(() => {
      const results = screen.queryAllByText(/Getting Started/);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  it('supports command mode with ">" prefix', async () => {
    const user = userEvent.setup();
    render(<SearchBar ref={searchBarRef} />);

    // Open search
    const searchButton = screen.getByRole('button');
    await user.click(searchButton);

    // Type command prefix
    const searchInput = screen.getByPlaceholderText('Search documentation, commands, FAQ...');
    await user.type(searchInput, '>');

    await waitFor(() => {
      expect(screen.getByText('Available Commands')).toBeInTheDocument();
    });
  });

  it('supports help mode with "?" prefix', async () => {
    const user = userEvent.setup();
    render(<SearchBar ref={searchBarRef} />);

    // Open search
    const searchButton = screen.getByRole('button');
    await user.click(searchButton);

    // Type help prefix
    const searchInput = screen.getByPlaceholderText('Search documentation, commands, FAQ...');
    await user.type(searchInput, '?');

    await waitFor(() => {
      expect(screen.getByText('Search Help')).toBeInTheDocument();
    });
  });

  it('navigates with keyboard arrows', async () => {
    const user = userEvent.setup();
    render(<SearchBar ref={searchBarRef} />);

    // Open search
    const searchButton = screen.getByRole('button');
    await user.click(searchButton);

    // Type search query to get results
    const searchInput = screen.getByPlaceholderText('Search documentation, commands, FAQ...');
    await user.type(searchInput, 'home');

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    // Navigate with arrow keys
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent.keyDown(searchInput, { key: 'ArrowUp' });

    // Should not throw errors
  });

  it('closes modal with Escape key', async () => {
    const user = userEvent.setup();
    render(<SearchBar ref={searchBarRef} />);

    // Open search
    const searchButton = screen.getByRole('button');
    await user.click(searchButton);

    const searchInput = screen.getByPlaceholderText('Search documentation, commands, FAQ...');
    expect(searchInput).toBeInTheDocument();

    // Close with Escape
    fireEvent.keyDown(searchInput, { key: 'Escape' });

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText('Search documentation, commands, FAQ...'),
      ).not.toBeInTheDocument();
    });
  });

  it('saves search history to localStorage', async () => {
    const user = userEvent.setup();
    render(<SearchBar ref={searchBarRef} />);

    // Open search
    const searchButton = screen.getByRole('button');
    await user.click(searchButton);

    // Type and select a result
    const searchInput = screen.getByPlaceholderText('Search documentation, commands, FAQ...');
    await user.type(searchInput, 'home');

    await waitFor(() => {
      const homeResult = screen.getByText('Home');
      expect(homeResult).toBeInTheDocument();
    });

    // Click on result
    const homeResult = screen.getByText('Home');
    await user.click(homeResult);

    // Should save to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'searchHistory',
      expect.stringContaining('home')
    );
  });

  it('shows recent searches when opened without query', async () => {
    const user = userEvent.setup();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['previous search', 'another search']));

    render(<SearchBar ref={searchBarRef} />);

    // Open search
    const searchButton = screen.getByRole('button');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('previous search')).toBeInTheDocument();
    });
  });

  it('shows popular searches', async () => {
    const user = userEvent.setup();
    render(<SearchBar ref={searchBarRef} />);

    // Open search
    const searchButton = screen.getByRole('button');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Popular Searches')).toBeInTheDocument();
    });
  });

  it('focuses input when ref method is called', () => {
    render(<SearchBar ref={searchBarRef} />);

    // Call focus method
    searchBarRef.current?.focus();

    expect(
      screen.getByPlaceholderText('Search documentation, commands, FAQ...'),
    ).toBeInTheDocument();
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<SearchBar ref={searchBarRef} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('handles mobile view correctly', () => {
    // Mock mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    render(<SearchBar ref={searchBarRef} />);

    // Should not show "Search..." text on mobile
    expect(screen.queryByText('Search...')).not.toBeInTheDocument();
  });

  it('handles search analytics correctly', async () => {
    const user = userEvent.setup();
    render(<SearchBar ref={searchBarRef} />);

    // Open search
    const searchButton = screen.getByRole('button');
    await user.click(searchButton);

    // Type search query
    const searchInput = screen.getByPlaceholderText('Search documentation, commands, FAQ...');
    await user.type(searchInput, 'test query');

    // Should track the search in analytics
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('searchAnalytics', expect.any(String));
  });
});
