# Testing Guide - Hearth Engine Website

## Table of Contents
- [Overview](#overview)
- [Test Structure](#test-structure)
- [Testing Conventions](#testing-conventions)
- [Types of Tests](#types-of-tests)
- [Writing Tests](#writing-tests)
- [Test Data and Mocking](#test-data-and-mocking)
- [Running Tests](#running-tests)
- [Debugging Tests](#debugging-tests)
- [Continuous Integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses a comprehensive testing strategy that includes:
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions and data flow
- **End-to-End (E2E) Tests**: Test complete user workflows
- **Accessibility Tests**: Ensure WCAG compliance
- **Performance Tests**: Monitor Core Web Vitals
- **Visual Regression Tests**: Catch UI changes

### Testing Stack
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **Cypress**: End-to-end testing framework
- **jest-axe**: Accessibility testing
- **MSW**: API mocking
- **Percy**: Visual regression testing

## Test Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx        # Unit tests
│   │   └── Button.stories.tsx     # Storybook stories
│   └── __tests__/                 # Shared component tests
├── hooks/
│   ├── useCustomHook.ts
│   └── __tests__/
│       └── useCustomHook.test.ts  # Hook tests
├── pages/
│   ├── HomePage/
│   │   ├── HomePage.tsx
│   │   └── HomePage.test.tsx      # Page tests
├── utils/
│   ├── helpers.ts
│   └── __tests__/
│       └── helpers.test.ts        # Utility tests
└── test-utils/
    ├── index.ts                   # Test utilities
    ├── mocks/                     # Mock data
    └── fixtures/                  # Test fixtures

tests/
├── e2e/                           # Cypress E2E tests
├── integration/                   # Integration tests
└── performance/                   # Performance tests
```

## Testing Conventions

### File Naming
- Unit tests: `ComponentName.test.tsx`
- Integration tests: `feature.integration.test.tsx`
- E2E tests: `user-workflow.cy.ts`
- Test utilities: `*.test-utils.ts`

### Test Organization
```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  // Grouped by functionality
  describe('rendering', () => {
    it('renders with default props', () => {
      // Test implementation
    });
  });

  describe('user interactions', () => {
    it('handles click events', async () => {
      // Test implementation
    });
  });

  describe('accessibility', () => {
    it('meets WCAG standards', async () => {
      // Accessibility test
    });
  });
});
```

### Test Naming
- Use descriptive test names: `'should render error message when API call fails'`
- Start with action: `'renders'`, `'handles'`, `'validates'`, `'throws'`
- Be specific about conditions and expected outcomes

## Types of Tests

### 1. Unit Tests
Test individual components, hooks, and utilities in isolation.

**Example: Component Unit Test**
```typescript
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import Button from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**Example: Hook Unit Test**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter Hook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### 2. Integration Tests
Test how components work together and data flows through the application.

```typescript
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockApiResponse } from '../../test-utils';
import SearchPage from './SearchPage';

describe('Search Integration', () => {
  it('displays search results after user input', async () => {
    const user = userEvent.setup();
    mockApiResponse('/api/search', { results: [{ title: 'Test Result' }] });
    
    render(<SearchPage />);
    
    const searchInput = screen.getByLabelText('Search');
    await user.type(searchInput, 'test query');
    
    await waitFor(() => {
      expect(screen.getByText('Test Result')).toBeInTheDocument();
    });
  });
});
```

### 3. End-to-End Tests
Test complete user workflows using Cypress.

```typescript
// cypress/e2e/user-search.cy.ts
describe('User Search Workflow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('allows user to search and view results', () => {
    // User types in search box
    cy.get('[data-testid="search-input"]')
      .type('Hearth Engine');

    // Results appear
    cy.get('[data-testid="search-results"]')
      .should('be.visible')
      .within(() => {
        cy.contains('Documentation').should('be.visible');
      });

    // User clicks on result
    cy.contains('Documentation').click();

    // User is navigated to docs page
    cy.url().should('include', '/docs');
    cy.get('h1').should('contain', 'Documentation');
  });
});
```

### 4. Accessibility Tests
Ensure WCAG compliance using jest-axe.

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('NavigationBar Accessibility', () => {
  it('meets WCAG standards', async () => {
    const { container } = render(<NavigationBar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA labels', () => {
    render(<NavigationBar />);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<NavigationBar />);
    
    // Tab through navigation items
    await user.tab();
    expect(screen.getByText('Documentation')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByText('Engine')).toHaveFocus();
  });
});
```

### 5. Performance Tests
Monitor Core Web Vitals and performance metrics.

```typescript
// tests/performance/core-web-vitals.test.ts
describe('Core Web Vitals', () => {
  it('meets LCP threshold', async () => {
    await page.goto('http://localhost:3000');
    
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(lcp).toBeLessThan(2500); // 2.5s threshold
  });
});
```

## Writing Tests

### Best Practices

1. **Follow the AAA Pattern**
   ```typescript
   it('should handle user input', async () => {
     // Arrange
     const user = userEvent.setup();
     render(<SearchComponent />);
     
     // Act
     await user.type(screen.getByLabelText('Search'), 'test query');
     
     // Assert
     expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
   });
   ```

2. **Use Semantic Queries**
   ```typescript
   // Good: Semantic queries
   screen.getByRole('button', { name: 'Submit' });
   screen.getByLabelText('Email address');
   screen.getByText('Welcome message');
   
   // Avoid: Implementation details
   screen.getByClassName('submit-btn');
   screen.getByTestId('email-input');
   ```

3. **Test User Behavior, Not Implementation**
   ```typescript
   // Good: Test what user sees/does
   it('shows error message when form is invalid', () => {
     render(<ContactForm />);
     fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
     expect(screen.getByText('Email is required')).toBeInTheDocument();
   });
   
   // Avoid: Testing internal state
   it('sets error state to true', () => {
     const { component } = render(<ContactForm />);
     expect(component.state.hasError).toBe(true);
   });
   ```

4. **Use async/await for User Events**
   ```typescript
   it('handles user interaction', async () => {
     const user = userEvent.setup();
     render(<Component />);
     
     await user.click(screen.getByRole('button'));
     await user.type(screen.getByLabelText('Input'), 'text');
     
     expect(screen.getByDisplayValue('text')).toBeInTheDocument();
   });
   ```

### Component Testing Template

```typescript
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, setupTest, teardownTest } from '../../test-utils';
import ComponentName from './ComponentName';

expect.extend(toHaveNoViolations);

describe('ComponentName', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('rendering', () => {
    it('renders with default props', () => {
      render(<ComponentName />);
      // Add assertions
    });

    it('renders with custom props', () => {
      render(<ComponentName customProp="value" />);
      // Add assertions
    });
  });

  describe('user interactions', () => {
    it('handles click events', async () => {
      const user = userEvent.setup();
      const mockHandler = jest.fn();
      
      render(<ComponentName onClick={mockHandler} />);
      
      await user.click(screen.getByRole('button'));
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('meets WCAG standards', async () => {
      const { container } = render(<ComponentName />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes', () => {
      render(<ComponentName />);
      // Add ARIA assertions
    });
  });

  describe('error handling', () => {
    it('handles error states gracefully', () => {
      render(<ComponentName error="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
```

## Test Data and Mocking

### Mock Data Organization
```typescript
// src/test-utils/mocks/index.ts
export const mockUserData = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
};

export const mockApiResponse = {
  success: true,
  data: mockUserData,
};

// Component-specific mocks
export const mockSearchResults = [
  {
    id: '1',
    title: 'Test Result 1',
    excerpt: 'Test excerpt...',
    url: '/test-1',
  },
];
```

### API Mocking with MSW
```typescript
// src/test-utils/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/search', (req, res, ctx) => {
    const query = req.url.searchParams.get('q');
    
    if (!query) {
      return res(ctx.status(400), ctx.json({ error: 'Query required' }));
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        results: mockSearchResults.filter(result =>
          result.title.toLowerCase().includes(query.toLowerCase())
        ),
      })
    );
  }),
];

// src/test-utils/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Component Mocking
```typescript
// Mock external dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock custom hooks
jest.mock('../../hooks/useCustomHook', () => ({
  useCustomHook: () => ({
    data: mockData,
    loading: false,
    error: null,
  }),
}));
```

## Running Tests

### Available Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- NavigationBar.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="accessibility"

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run visual regression tests
npm run test:visual

# Run all tests (CI mode)
npm run test:ci
```

### Test Coverage
We maintain >90% test coverage for:
- Components: >95%
- Hooks: >90%
- Utilities: >95%
- Integration flows: >85%

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Debugging Tests

### VS Code Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/react-scripts",
      "args": ["test", "--runInBand", "--no-cache", "--watchAll=false"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Common Debugging Techniques

1. **Use screen.debug()**
   ```typescript
   it('debugs component rendering', () => {
     render(<Component />);
     screen.debug(); // Prints current DOM
   });
   ```

2. **Debug specific elements**
   ```typescript
   it('debugs specific element', () => {
     render(<Component />);
     const element = screen.getByRole('button');
     screen.debug(element);
   });
   ```

3. **Use logRoles for accessibility debugging**
   ```typescript
   import { logRoles } from '@testing-library/dom';
   
   it('debugs roles', () => {
     const { container } = render(<Component />);
     logRoles(container);
   });
   ```

4. **Debug queries**
   ```typescript
   // This will suggest available queries
   screen.getByRole('button', { name: /submit/i });
   ```

### Cypress Debugging
```typescript
// cypress/e2e/debug-example.cy.ts
describe('Debug Example', () => {
  it('debugs test execution', () => {
    cy.visit('/');
    cy.debug(); // Pauses execution
    cy.get('[data-testid="search"]').debug().type('test');
  });
});
```

## Continuous Integration

### GitHub Actions Workflow
Our CI pipeline runs:
1. **Unit Tests**: Jest with coverage reporting
2. **Integration Tests**: Component interaction tests
3. **E2E Tests**: Cypress browser tests
4. **Accessibility Tests**: axe-core compliance checks
5. **Performance Tests**: Lighthouse audits
6. **Visual Regression**: Percy snapshots
7. **Bundle Analysis**: Size impact assessment

### Test Result Reporting
- **Coverage**: Coveralls.io integration
- **Test Results**: GitHub PR comments
- **Performance**: Lighthouse CI reports
- **Visual Changes**: Percy PR comments

### Quality Gates
- All tests must pass
- Coverage must be >90%
- No critical accessibility violations
- Performance budget within limits
- No visual regression failures

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. Async operation warnings
```typescript
// Use act() for state updates
import { act } from '@testing-library/react';

act(() => {
  // State updates here
});

// Or use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

#### 3. Timer-related issues
```typescript
// Mock timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// Fast-forward timers
act(() => {
  jest.advanceTimersByTime(1000);
});
```

#### 4. Memory leaks in tests
```typescript
// Proper cleanup
afterEach(() => {
  cleanup(); // From React Testing Library
  jest.clearAllMocks();
  jest.clearAllTimers();
});
```

#### 5. Flaky E2E tests
```typescript
// Add proper waits
cy.get('[data-testid="loading"]').should('not.exist');
cy.get('[data-testid="content"]').should('be.visible');

// Use retry logic
Cypress.config('retries', { runMode: 2, openMode: 0 });
```

### Getting Help

1. **Check test output**: Read error messages carefully
2. **Use debugging tools**: VS Code debugger, browser dev tools
3. **Check documentation**: React Testing Library, Jest, Cypress docs
4. **Search existing issues**: GitHub issues for similar problems
5. **Ask the team**: Use team channels for testing questions

### Performance Optimization

#### Test Performance Tips
```typescript
// Use describe.skip() for temporarily disabled tests
describe.skip('Slow tests', () => {
  // Tests here won't run
});

// Use test.concurrent() for parallel execution
test.concurrent('parallel test 1', async () => {
  // Test implementation
});

// Mock expensive operations
jest.mock('./expensiveOperation', () => ({
  expensiveOperation: jest.fn().mockResolvedValue(mockResult),
}));
```

#### CI Optimization
- Run tests in parallel
- Cache node_modules
- Use test sharding for large test suites
- Skip unnecessary tests for documentation-only changes

---

**Remember**: Good tests are:
- **Fast**: Run quickly to enable rapid feedback
- **Independent**: Don't depend on other tests
- **Repeatable**: Produce same results every time
- **Self-validating**: Clear pass/fail results
- **Timely**: Written alongside or before code

For questions or improvements to this testing guide, please create an issue or submit a pull request.