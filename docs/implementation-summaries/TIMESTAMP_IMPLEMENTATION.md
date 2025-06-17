# Documentation Timestamp Implementation

This document describes the implementation of timestamps showing when documentation sections were last updated on the Hearth Engine website.

## Components Created

### 1. LastUpdated Component (`src/components/LastUpdated.tsx`)
A reusable component that displays when content was last updated with the following features:
- Shows relative time (e.g., "2 days ago", "3 hours ago")
- Displays absolute date on hover tooltip
- Optional link to GitHub commit history
- Clock icon with muted styling
- Mobile-responsive design
- Accessible with proper ARIA labels

### 2. Git History Hook (`src/hooks/useGitHistory.ts`)
A React hook that provides a foundation for fetching real Git history:
- Currently returns static dates as a placeholder
- Includes example code for fetching real Git history from GitHub API
- Can be enhanced to connect to a backend service or GitHub API

### 3. Timestamp Example (`src/examples/TimestampExample.tsx`)
A demonstration page showing various ways to use the LastUpdated component:
- Basic usage without GitHub link
- With edit history link
- Combined with reading time indicators
- Different time range examples
- Mobile-responsive layouts

## Integration with Documentation Page

The LastUpdated component has been integrated into all documentation sections:

1. **Getting Started** - Updated 2 days ago
2. **Installation** - Updated 3 days ago  
3. **Basic Usage** - Updated 4 days ago
4. **Core Concepts** - Updated 7 days ago
5. **Cargo Commands** - Updated 1 day ago
6. **API Reference** - Updated 5 days ago

Each section header now displays:
- Section title
- Reading time estimate
- Last updated timestamp
- Edit history link (GitHub commits)
- Edit on GitHub button

## Usage

### Basic Usage
```tsx
import LastUpdated from '../components/LastUpdated';

<LastUpdated date={new Date('2025-01-15T10:30:00')} />
```

### With GitHub History Link
```tsx
<LastUpdated 
  date={new Date('2025-01-15T10:30:00')}
  githubEditUrl="https://github.com/user/repo/commits/main/docs/file.md"
/>
```

### Combined with Reading Time
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <ReadingTime text={content} />
  <LastUpdated date={lastModified} githubEditUrl={editUrl} />
</Box>
```

## Styling

The component uses a muted color scheme to avoid distracting from the main content:
- Background: `rgba(100, 100, 100, 0.1)`
- Text color: `rgba(255, 255, 255, 0.7)`
- Hover state increases opacity
- History icon uses the theme's primary color on hover

## Mobile Responsiveness

The timestamp display adapts for mobile devices:
- Smaller font size on screens < 600px
- Flexible wrapping for section headers
- Compact icon buttons

## Future Enhancements

1. **Real Git History Integration**
   - Connect to GitHub API to fetch actual commit dates
   - Cache results to avoid API rate limits
   - Show commit author information

2. **Content Management System**
   - If using a CMS, fetch last modified dates from the CMS API
   - Track content revisions and changes

3. **Auto-refresh**
   - Periodically check for updates
   - Notify users when new content is available

4. **Analytics**
   - Track which sections are most frequently updated
   - Monitor user engagement with fresh vs. stale content

## Technical Notes

- Uses Material-UI components for consistent styling
- Fully TypeScript typed for type safety
- Memoized for performance optimization
- Accessible with proper ARIA labels and keyboard navigation
- Uses relative time formatting for better user experience