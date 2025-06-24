import { renderHook, waitFor } from '@testing-library/react';

import { useGitHistory } from '../useGitHistory';

describe('useGitHistory', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should return null initially', () => {
      const { result } = renderHook(() => useGitHistory('test-section'));
      expect(result.current).toBeNull();
    });

    it('should return history data for known section after timeout', async () => {
      const { result } = renderHook(() => useGitHistory('getting-started'));

      expect(result.current).toBeNull();

      // Fast-forward time
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current).toEqual({
        lastModified: new Date('2025-01-15T10:30:00'),
        commitUrl:
          'https://github.com/noahsabaj/hearth-engine/commits/main/docs/getting-started.md',
      });
    });

    it('should return null for unknown section', async () => {
      const { result } = renderHook(() => useGitHistory('unknown-section'));

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).toBeNull();
      });
    });
  });

  describe('Known sections', () => {
    const knownSections = [
      {
        id: 'getting-started',
        expected: {
          lastModified: new Date('2025-01-15T10:30:00'),
          commitUrl:
            'https://github.com/noahsabaj/hearth-engine/commits/main/docs/getting-started.md',
        },
      },
      {
        id: 'installation',
        expected: {
          lastModified: new Date('2025-01-14T14:45:00'),
          commitUrl: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/installation.md',
        },
      },
      {
        id: 'basic-usage',
        expected: {
          lastModified: new Date('2025-01-13T09:15:00'),
          commitUrl: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/basic-usage.md',
        },
      },
      {
        id: 'core-concepts',
        expected: {
          lastModified: new Date('2025-01-10T16:20:00'),
          commitUrl:
            'https://github.com/noahsabaj/hearth-engine/commits/main/docs/core-concepts.md',
        },
      },
      {
        id: 'cargo-commands',
        expected: {
          lastModified: new Date('2025-01-16T11:00:00'),
          commitUrl:
            'https://github.com/noahsabaj/hearth-engine/commits/main/docs/cargo-commands.md',
        },
      },
      {
        id: 'api-reference',
        expected: {
          lastModified: new Date('2025-01-12T13:30:00'),
          commitUrl:
            'https://github.com/noahsabaj/hearth-engine/commits/main/docs/api-reference.md',
        },
      },
    ];

    knownSections.forEach(({ id, expected }) => {
      it(`should return correct data for ${id}`, async () => {
        const { result } = renderHook(() => useGitHistory(id));

        jest.advanceTimersByTime(100);

        await waitFor(() => {
          expect(result.current).toEqual(expected);
        });
      });
    });
  });

  describe('Behavior on section change', () => {
    it('should update when section changes', async () => {
      const { result, rerender } = renderHook(({ sectionId }) => useGitHistory(sectionId), {
        initialProps: { sectionId: 'getting-started' },
      });

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).toEqual({
          lastModified: new Date('2025-01-15T10:30:00'),
          commitUrl:
            'https://github.com/noahsabaj/hearth-engine/commits/main/docs/getting-started.md',
        });
      });

      // Change section
      rerender({ sectionId: 'installation' });
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).toEqual({
          lastModified: new Date('2025-01-14T14:45:00'),
          commitUrl: 'https://github.com/noahsabaj/hearth-engine/commits/main/docs/installation.md',
        });
      });
    });

    it('should return null when changing to unknown section', async () => {
      const { result, rerender } = renderHook(({ sectionId }) => useGitHistory(sectionId), {
        initialProps: { sectionId: 'getting-started' },
      });

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Change to unknown section
      rerender({ sectionId: 'unknown-section' });
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).toBeNull();
      });
    });
  });

  describe('Timer cleanup', () => {
    it('should cleanup timer on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { unmount } = renderHook(() => useGitHistory('getting-started'));

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should cleanup previous timer when section changes', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { rerender } = renderHook(({ sectionId }) => useGitHistory(sectionId), {
        initialProps: { sectionId: 'getting-started' },
      });

      rerender({ sectionId: 'installation' });

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string section', async () => {
      const { result } = renderHook(() => useGitHistory(''));

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).toBeNull();
      });
    });

    it('should handle null section', async () => {
      const { result } = renderHook(() => useGitHistory(null as any));

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).toBeNull();
      });
    });

    it('should handle undefined section', async () => {
      const { result } = renderHook(() => useGitHistory(undefined as any));

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).toBeNull();
      });
    });
  });

  describe('Performance', () => {
    it('should not cause excessive re-renders', () => {
      let renderCount = 0;

      const { rerender } = renderHook(() => {
        renderCount++;
        return useGitHistory('getting-started');
      });

      // Initial render
      expect(renderCount).toBe(1);

      // Advance time to trigger effect
      jest.advanceTimersByTime(100);

      // Should not cause additional renders beyond the state update
      expect(renderCount).toBeLessThanOrEqual(3);
    });

    it('should handle rapid section changes gracefully', () => {
      const { rerender } = renderHook(({ sectionId }) => useGitHistory(sectionId), {
        initialProps: { sectionId: 'getting-started' },
      });

      // Rapid changes
      rerender({ sectionId: 'installation' });
      rerender({ sectionId: 'basic-usage' });
      rerender({ sectionId: 'core-concepts' });
      rerender({ sectionId: 'cargo-commands' });

      // Should not throw errors
      expect(() => {
        jest.advanceTimersByTime(100);
      }).not.toThrow();
    });
  });

  describe('Data structure validation', () => {
    it('should return proper GitHistoryData interface', async () => {
      const { result } = renderHook(() => useGitHistory('getting-started'));

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      const data = result.current!;
      expect(data).toHaveProperty('lastModified');
      expect(data).toHaveProperty('commitUrl');
      expect(data.lastModified).toBeInstanceOf(Date);
      expect(typeof data.commitUrl).toBe('string');
    });

    it('should return valid Date objects', async () => {
      const { result } = renderHook(() => useGitHistory('getting-started'));

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      const data = result.current!;
      expect(data.lastModified.getTime()).not.toBeNaN();
      expect(data.lastModified.getTime()).toBeGreaterThan(0);
    });

    it('should return valid commit URLs', async () => {
      const { result } = renderHook(() => useGitHistory('getting-started'));

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      const data = result.current!;
      expect(data.commitUrl).toMatch(
        /^https:\/\/github\.com\/noahsabaj\/hearth-engine\/commits\/main\/docs\/.+\.md$/,
      );
    });
  });
});
