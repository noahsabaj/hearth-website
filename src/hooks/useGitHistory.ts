import { useState, useEffect } from 'react';

interface GitHistoryData {
  lastModified: Date;
  commitUrl?: string;
}

/**
 * Hook to fetch Git history for documentation sections
 * This is a placeholder that returns static dates, but could be enhanced
 * to fetch real Git history from GitHub API or a backend service
 */
export const useGitHistory = (sectionId: string): GitHistoryData | null => {
  const [historyData, setHistoryData] = useState<GitHistoryData | null>(null);

  useEffect(() => {
    // In a real implementation, this would:
    // 1. Call GitHub API to get commit history for the specific file/section
    // 2. Parse the response to get the last modified date
    // 3. Generate the commit URL
    
    // For now, we'll use static dates that can be replaced with real API calls
    const staticDates: Record<string, GitHistoryData> = {
      'getting-started': {
        lastModified: new Date('2025-01-15T10:30:00'),
        commitUrl: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/getting-started.md'
      },
      'installation': {
        lastModified: new Date('2025-01-14T14:45:00'),
        commitUrl: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/installation.md'
      },
      'basic-usage': {
        lastModified: new Date('2025-01-13T09:15:00'),
        commitUrl: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/basic-usage.md'
      },
      'core-concepts': {
        lastModified: new Date('2025-01-10T16:20:00'),
        commitUrl: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/core-concepts.md'
      },
      'cargo-commands': {
        lastModified: new Date('2025-01-16T11:00:00'),
        commitUrl: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/cargo-commands.md'
      },
      'api-reference': {
        lastModified: new Date('2025-01-12T13:30:00'),
        commitUrl: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/api-reference.md'
      }
    };

    // Simulate async data fetching
    const timer = setTimeout(() => {
      setHistoryData(staticDates[sectionId] || null);
    }, 100);

    return () => clearTimeout(timer);
  }, [sectionId]);

  return historyData;
};

/**
 * Example of how to fetch real Git history from GitHub API:
 * 
 * async function fetchGitHistory(owner: string, repo: string, path: string): Promise<GitHistoryData> {
 *   const response = await fetch(
 *     `https://api.github.com/repos/${owner}/${repo}/commits?path=${path}&per_page=1`,
 *     {
 *       headers: {
 *         'Accept': 'application/vnd.github.v3+json',
 *         // Add authentication token if needed for rate limiting
 *         // 'Authorization': `Bearer ${GITHUB_TOKEN}`
 *       }
 *     }
 *   );
 *   
 *   const commits = await response.json();
 *   if (commits.length > 0) {
 *     const lastCommit = commits[0];
 *     return {
 *       lastModified: new Date(lastCommit.commit.author.date),
 *       commitUrl: lastCommit.html_url
 *     };
 *   }
 *   
 *   throw new Error('No commits found');
 * }
 */