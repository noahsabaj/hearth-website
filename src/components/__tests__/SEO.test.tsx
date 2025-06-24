import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { Helmet } from 'react-helmet-async';

import { render, setupTest, teardownTest } from '../../test-utils';
import SEO, { DEFAULT_SITE_METADATA } from '../SEO';

expect.extend(toHaveNoViolations);

// Mock react-helmet-async
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='helmet'>{children}</div>
  ),
}));

describe('SEO Component', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<SEO />);
      expect(document.querySelector('[data-testid="helmet"]')).toBeInTheDocument();
    });

    it('renders with default metadata when no props provided', () => {
      render(<SEO />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet).toBeInTheDocument();

      // Check for default title
      const titleEl = helmet?.querySelector('title');
      expect(titleEl?.textContent).toBe(DEFAULT_SITE_METADATA.title);
    });

    it('renders with custom title', () => {
      const customTitle = 'Custom Page Title';
      render(<SEO title={customTitle} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const titleEl = helmet?.querySelector('title');
      const expectedTitle = DEFAULT_SITE_METADATA.titleTemplate.replace('%s', customTitle);
      expect(titleEl?.textContent).toBe(expectedTitle);
    });
  });

  describe('Meta Tags', () => {
    it('generates correct basic meta tags', () => {
      const props = {
        title: 'Test Title',
        description: 'Test description',
        keywords: 'test, keywords',
        author: 'Test Author',
      };

      render(<SEO {...props} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
        props.description,
      );
      expect(helmet?.querySelector('meta[name="keywords"]')?.getAttribute('content')).toBe(
        props.keywords,
      );
      expect(helmet?.querySelector('meta[name="author"]')?.getAttribute('content')).toBe(
        props.author,
      );
      expect(helmet?.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(
        DEFAULT_SITE_METADATA.themeColor,
      );
    });

    it('generates correct robots meta tag with default values', () => {
      render(<SEO />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const robotsMeta = helmet?.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute('content')).toBe('index,follow');
    });

    it('generates correct robots meta tag with noindex and nofollow', () => {
      render(<SEO noindex nofollow />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const robotsMeta = helmet?.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute('content')).toBe('noindex,nofollow');
    });

    it('generates correct robots meta tag with partial restrictions', () => {
      render(<SEO noindex nofollow={false} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const robotsMeta = helmet?.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute('content')).toBe('noindex,follow');
    });
  });

  describe('Canonical URL', () => {
    it('generates canonical URL from pathname', () => {
      const pathname = '/test-page';
      render(<SEO pathname={pathname} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const canonicalLink = helmet?.querySelector('link[rel="canonical"]');
      expect(canonicalLink?.getAttribute('href')).toBe(
        `${DEFAULT_SITE_METADATA.siteUrl}${pathname}`,
      );
    });

    it('uses custom canonical URL when provided', () => {
      const customCanonical = 'https://example.com/custom-canonical';
      render(<SEO canonical={customCanonical} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const canonicalLink = helmet?.querySelector('link[rel="canonical"]');
      expect(canonicalLink?.getAttribute('href')).toBe(customCanonical);
    });

    it('defaults to site URL when no pathname provided', () => {
      render(<SEO />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const canonicalLink = helmet?.querySelector('link[rel="canonical"]');
      expect(canonicalLink?.getAttribute('href')).toBe(DEFAULT_SITE_METADATA.siteUrl);
    });
  });

  describe('Open Graph Tags', () => {
    it('generates correct Open Graph tags for website', () => {
      const props = {
        title: 'Test Title',
        description: 'Test description',
        image: '/test-image.jpg',
      };

      render(<SEO {...props} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe(
        'website',
      );
      expect(helmet?.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
        DEFAULT_SITE_METADATA.titleTemplate.replace('%s', props.title)
      );
      expect(
        helmet?.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      ).toBe(props.description);
      expect(helmet?.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
        `${DEFAULT_SITE_METADATA.siteUrl}${props.image}`
      );
      expect(helmet?.querySelector('meta[property="og:site_name"]')?.getAttribute('content')).toBe(
        'Hearth Engine',
      );
      expect(helmet?.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
        DEFAULT_SITE_METADATA.locale,
      );
    });

    it('generates correct Open Graph tags for article', () => {
      const props = {
        title: 'Test Article',
        description: 'Test article description',
        article: true,
        publishedTime: '2023-01-01T00:00:00Z',
        modifiedTime: '2023-01-02T00:00:00Z',
        author: 'Test Author',
      };

      render(<SEO {...props} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe(
        'article',
      );
      expect(
        helmet?.querySelector('meta[property="article:published_time"]')?.getAttribute('content'),
      ).toBe(props.publishedTime);
      expect(
        helmet?.querySelector('meta[property="article:modified_time"]')?.getAttribute('content'),
      ).toBe(props.modifiedTime);
      expect(
        helmet?.querySelector('meta[property="article:author"]')?.getAttribute('content'),
      ).toBe(props.author);
    });

    it('handles absolute image URLs correctly', () => {
      const absoluteImageUrl = 'https://example.com/image.jpg';
      render(<SEO image={absoluteImageUrl} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
        absoluteImageUrl,
      );
    });

    it('converts relative image URLs to absolute', () => {
      const relativeImageUrl = '/relative-image.jpg';
      render(<SEO image={relativeImageUrl} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
        `${DEFAULT_SITE_METADATA.siteUrl}${relativeImageUrl}`
      );
    });
  });

  describe('Twitter Card Tags', () => {
    it('generates correct Twitter card tags with default type', () => {
      const props = {
        title: 'Test Title',
        description: 'Test description',
        image: '/test-image.jpg',
      };

      render(<SEO {...props} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
        'summary_large_image',
      );
      expect(helmet?.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe(
        DEFAULT_SITE_METADATA.titleTemplate.replace('%s', props.title)
      );
      expect(
        helmet?.querySelector('meta[name="twitter:description"]')?.getAttribute('content'),
      ).toBe(props.description);
      expect(helmet?.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(
        `${DEFAULT_SITE_METADATA.siteUrl}${props.image}`
      );
      expect(helmet?.querySelector('meta[name="twitter:site"]')?.getAttribute('content')).toBe(
        DEFAULT_SITE_METADATA.twitterUsername,
      );
      expect(helmet?.querySelector('meta[name="twitter:creator"]')?.getAttribute('content')).toBe(
        DEFAULT_SITE_METADATA.twitterUsername,
      );
    });

    it('generates correct Twitter card tags with custom type', () => {
      render(<SEO twitterCardType='summary' />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
        'summary',
      );
    });

    it('supports all Twitter card types', () => {
      const cardTypes: Array<'summary' | 'summary_large_image' | 'app' | 'player'> = [
        'summary',
        'summary_large_image',
        'app',
        'player',
      ];

      cardTypes.forEach(cardType => {
        const { unmount } = render(<SEO twitterCardType={cardType} />);

        const helmet = document.querySelector('[data-testid="helmet"]');
        expect(helmet?.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
          cardType,
        );

        unmount();
      });
    });
  });

  describe('JSON-LD Schema', () => {
    it('generates default organization schema', () => {
      render(<SEO />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const schemaScript = helmet?.querySelector('script[type="application/ld+json"]');
      expect(schemaScript).toBeInTheDocument();

      const schemaData = JSON.parse(schemaScript?.textContent || '{}');
      expect(schemaData['@context']).toBe('https://schema.org');
      expect(schemaData['@type']).toBe('Organization');
      expect(schemaData.name).toBe('Hearth Engine');
      expect(schemaData.url).toBe(DEFAULT_SITE_METADATA.siteUrl);
    });

    it('generates article schema when article prop is true', () => {
      const props = {
        title: 'Test Article',
        description: 'Test article description',
        article: true,
        publishedTime: '2023-01-01T00:00:00Z',
        modifiedTime: '2023-01-02T00:00:00Z',
        author: 'Test Author',
      };

      render(<SEO {...props} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const schemaScript = helmet?.querySelector('script[type="application/ld+json"]');
      const schemaData = JSON.parse(schemaScript?.textContent || '{}');

      expect(schemaData['@type']).toBe('Article');
      expect(schemaData.headline).toBe(props.title);
      expect(schemaData.description).toBe(props.description);
      expect(schemaData.datePublished).toBe(props.publishedTime);
      expect(schemaData.dateModified).toBe(props.modifiedTime);
      expect(schemaData.author.name).toBe(props.author);
    });

    it('uses custom schema when provided', () => {
      const customSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Custom Product',
      };

      render(<SEO schema={customSchema} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const schemaScript = helmet?.querySelector('script[type="application/ld+json"]');
      const schemaData = JSON.parse(schemaScript?.textContent || '{}');

      expect(schemaData).toEqual(customSchema);
    });

    it('uses modifiedTime as dateModified when publishedTime is not provided', () => {
      const props = {
        title: 'Test Article',
        article: true,
        publishedTime: '2023-01-01T00:00:00Z',
      };

      render(<SEO {...props} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const schemaScript = helmet?.querySelector('script[type="application/ld+json"]');
      const schemaData = JSON.parse(schemaScript?.textContent || '{}');

      expect(schemaData.dateModified).toBe(props.publishedTime);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty title gracefully', () => {
      render(<SEO title='' />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const titleEl = helmet?.querySelector('title');
      expect(titleEl?.textContent).toBe(DEFAULT_SITE_METADATA.title);
    });

    it('handles undefined props gracefully', () => {
      render(<SEO title={undefined} description={undefined} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
        DEFAULT_SITE_METADATA.description,
      );
    });

    it('handles special characters in content', () => {
      const specialTitle = 'Title with "quotes" & ampersands';
      const specialDescription = 'Description with <tags> & special chars';

      render(<SEO title={specialTitle} description={specialDescription} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const titleEl = helmet?.querySelector('title');
      expect(titleEl?.textContent).toContain(specialTitle);
      expect(helmet?.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
        specialDescription,
      );
    });

    it('handles very long content', () => {
      const longTitle = 'A'.repeat(200);
      const longDescription = 'B'.repeat(500);

      render(<SEO title={longTitle} description={longDescription} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
        longDescription,
      );
    });

    it('handles malformed URLs gracefully', () => {
      const malformedUrl = 'not-a-valid-url';
      render(<SEO canonical={malformedUrl} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      const canonicalLink = helmet?.querySelector('link[rel="canonical"]');
      expect(canonicalLink?.getAttribute('href')).toBe(malformedUrl);
    });
  });

  describe('Article-specific Features', () => {
    it('does not render article meta tags when article is false', () => {
      const props = {
        article: false,
        publishedTime: '2023-01-01T00:00:00Z',
        modifiedTime: '2023-01-02T00:00:00Z',
      };

      render(<SEO {...props} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[property="article:published_time"]')).toBeNull();
      expect(helmet?.querySelector('meta[property="article:modified_time"]')).toBeNull();
    });

    it('renders article published time without modified time', () => {
      const props = {
        article: true,
        publishedTime: '2023-01-01T00:00:00Z',
      };

      render(<SEO {...props} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(
        helmet?.querySelector('meta[property="article:published_time"]')?.getAttribute('content'),
      ).toBe(props.publishedTime);
      expect(helmet?.querySelector('meta[property="article:modified_time"]')).toBeNull();
    });

    it('renders article modified time without published time', () => {
      const props = {
        article: true,
        modifiedTime: '2023-01-02T00:00:00Z',
      };

      render(<SEO {...props} />);

      const helmet = document.querySelector('[data-testid="helmet"]');
      expect(helmet?.querySelector('meta[property="article:published_time"]')).toBeNull();
      expect(
        helmet?.querySelector('meta[property="article:modified_time"]')?.getAttribute('content'),
      ).toBe(props.modifiedTime);
    });
  });

  describe('Default Metadata Constants', () => {
    it('exports correct default site metadata', () => {
      expect(DEFAULT_SITE_METADATA.title).toBe('Hearth Engine');
      expect(DEFAULT_SITE_METADATA.titleTemplate).toBe('%s | Hearth Engine');
      expect(DEFAULT_SITE_METADATA.author).toBe('Noah Sabaj');
      expect(DEFAULT_SITE_METADATA.siteUrl).toBe('https://noahsabaj.github.io/hearth-website');
      expect(DEFAULT_SITE_METADATA.twitterUsername).toBe('@hearthengine');
      expect(DEFAULT_SITE_METADATA.locale).toBe('en_US');
    });

    it('has valid default image URL', () => {
      expect(DEFAULT_SITE_METADATA.defaultImage).toContain('https://');
      expect(DEFAULT_SITE_METADATA.defaultImage).toContain('logo.png');
    });

    it('has valid theme color', () => {
      expect(DEFAULT_SITE_METADATA.themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<SEO title='Accessible Page' />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with all props', async () => {
      const { container } = render(
        <SEO
          title='Accessible Article'
          description='An accessible article description'
          keywords='accessibility, testing'
          article
          publishedTime='2023-01-01T00:00:00Z'
          modifiedTime='2023-01-02T00:00:00Z'
          author='Accessibility Tester'
          image='/accessible-image.jpg'
          pathname='/accessible-path'
          twitterCardType='summary_large_image'
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Integration with Helmet', () => {
    it('integrates properly with react-helmet-async', () => {
      render(<SEO title='Integration Test' />);

      // Verify that Helmet component is rendered
      expect(document.querySelector('[data-testid="helmet"]')).toBeInTheDocument();
    });

    it('handles multiple SEO components', () => {
      const { rerender } = render(<SEO title='First Title' />);
      rerender(<SEO title='Second Title' />);

      // Should still render without errors
      expect(document.querySelector('[data-testid="helmet"]')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders quickly with minimal props', () => {
      const startTime = performance.now();
      render(<SEO />);
      const endTime = performance.now();

      // Should render in less than 50ms
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('renders quickly with all props', () => {
      const startTime = performance.now();
      render(
        <SEO
          title='Performance Test'
          description='Testing rendering performance'
          keywords='performance, testing, speed'
          article
          publishedTime='2023-01-01T00:00:00Z'
          modifiedTime='2023-01-02T00:00:00Z'
          author='Performance Tester'
          image='/performance-image.jpg'
          pathname='/performance-path'
          canonical='https://example.com/canonical'
          twitterCardType='summary_large_image'
          noindex={false}
          nofollow={false}
        />
      );
      const endTime = performance.now();

      // Should render in less than 100ms even with all props
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
