import React from 'react';
import { Helmet } from 'react-helmet-async';

import { COLORS, MISC } from '../constants';

// Default site metadata
export const DEFAULT_SITE_METADATA = {
  title: 'Hearth Engine',
  titleTemplate: '%s | Hearth Engine',
  description: 'A powerful and flexible game engine for creating amazing experiences',
  keywords:
    'game engine, game development, 3D engine, 2D engine, cross-platform, indie game development',
  author: 'Noah Sabaj',
  siteUrl: 'https://noahsabaj.github.io/hearth-website',
  twitterUsername: '@hearthengine',
  defaultImage: `https://noahsabaj.github.io${MISC.logo.path}`,
  themeColor: COLORS.primary.main,
  locale: 'en_US',
};

// TypeScript interface for SEO component props
interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  article?: boolean;
  pathname?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  twitterCardType?: 'summary' | 'summary_large_image' | 'app' | 'player';
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_SITE_METADATA.description,
  keywords = DEFAULT_SITE_METADATA.keywords,
  image = DEFAULT_SITE_METADATA.defaultImage,
  article = false,
  pathname = '',
  noindex = false,
  nofollow = false,
  canonical,
  author = DEFAULT_SITE_METADATA.author,
  publishedTime,
  modifiedTime,
  twitterCardType = 'summary_large_image',
  schema,
}) => {
  const { siteUrl } = DEFAULT_SITE_METADATA;
  const fullUrl = `${siteUrl}${pathname}`;
  const canonicalUrl = canonical || fullUrl;

  // Ensure image URL is absolute
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Create the full title using the template
  const fullTitle = title
    ? DEFAULT_SITE_METADATA.titleTemplate.replace('%s', title)
    : DEFAULT_SITE_METADATA.title;

  // Build robots meta content
  const robotsContent = [noindex ? 'noindex' : 'index', nofollow ? 'nofollow' : 'follow'].join(',');

  // Default schema for organization
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hearth Engine',
    url: siteUrl,
    logo: `${siteUrl}${MISC.logo.path}`,
    sameAs: [MISC.github.repoUrl],
  };

  // Article schema if it's an article page
  const articleSchema = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title || DEFAULT_SITE_METADATA.title,
        description,
        image: imageUrl,
        author: {
          '@type': 'Person',
          name: author,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Hearth Engine',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}${MISC.logo.path}`,
          },
        },
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      }
    : null;

  const finalSchema = schema || (article ? articleSchema : defaultSchema);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <meta name='author' content={author} />
      <meta name='robots' content={robotsContent} />
      <meta name='theme-color' content={DEFAULT_SITE_METADATA.themeColor} />

      {/* Canonical URL */}
      <link rel='canonical' href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property='og:type' content={article ? 'article' : 'website'} />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={imageUrl} />
      <meta property='og:image:alt' content={title || DEFAULT_SITE_METADATA.title} />
      <meta property='og:url' content={canonicalUrl} />
      <meta property='og:site_name' content='Hearth Engine' />
      <meta property='og:locale' content={DEFAULT_SITE_METADATA.locale} />

      {/* Article specific Open Graph tags */}
      {article && publishedTime && (
        <meta property='article:published_time' content={publishedTime} />
      )}
      {article && modifiedTime && <meta property='article:modified_time' content={modifiedTime} />}
      {article && <meta property='article:author' content={author} />}

      {/* Twitter Card Tags */}
      <meta name='twitter:card' content={twitterCardType} />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={imageUrl} />
      <meta name='twitter:image:alt' content={title || DEFAULT_SITE_METADATA.title} />
      <meta name='twitter:site' content={DEFAULT_SITE_METADATA.twitterUsername} />
      <meta name='twitter:creator' content={DEFAULT_SITE_METADATA.twitterUsername} />

      {/* JSON-LD Schema */}
      {finalSchema && <script type='application/ld+json'>{JSON.stringify(finalSchema)}</script>}
    </Helmet>
  );
};

export default SEO;
