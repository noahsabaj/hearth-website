import { render } from '@testing-library/react';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

import SEO, { DEFAULT_SITE_METADATA } from '../SEO';

// Simple wrapper for SEO testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

describe('SEO Component - Simple Test', () => {
  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <SEO />
      </TestWrapper>
    );
    // If we get here, the component rendered successfully
    expect(true).toBe(true);
  });

  it('should export DEFAULT_SITE_METADATA', () => {
    expect(DEFAULT_SITE_METADATA).toBeDefined();
    expect(DEFAULT_SITE_METADATA.title).toBe('Hearth Engine');
    expect(DEFAULT_SITE_METADATA.description).toContain('game engine');
  });

  it('should render with custom title', () => {
    render(
      <TestWrapper>
        <SEO title='Custom Page' />
      </TestWrapper>
    );
    // Component should render without errors
    expect(true).toBe(true);
  });
});
