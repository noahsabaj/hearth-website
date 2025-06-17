# Contributing to Hearth Engine Website

Thank you for your interest in contributing to the Hearth Engine Website! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

This project follows the same code of conduct as the main Hearth Engine project. We are committed to fostering a welcoming and inclusive community. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** (≥ 16.0.0)
- **npm** (≥ 7.0.0)
- **Git**
- A GitHub account
- Basic knowledge of React, TypeScript, and Material-UI

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/hearth-website.git
   cd hearth-website
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/noahsabaj/hearth-website.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Verify setup**
   - Open `http://localhost:3000` in your browser
   - Ensure the site loads correctly
   - Run `npm test` to verify tests pass

## Development Workflow

### Creating a New Feature

1. **Sync with upstream**
   ```bash
   git checkout main
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the coding standards below
   - Write tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm test
   npm run build
   npm start # Verify in browser
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to GitHub and create a PR from your branch
   - Follow the pull request template
   - Link any related issues

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `style/description` - UI/styling changes
- `test/description` - Test additions/updates

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper interfaces for props and state
- Avoid `any` type; use specific types or `unknown`
- Use optional properties appropriately

```typescript
// Good
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

// Avoid
interface ButtonProps {
  onClick: any;
  disabled: any;
  children: any;
}
```

### React Components

- Use functional components with hooks
- Follow the component structure pattern
- Destructure props in the parameter list
- Use proper JSDoc comments

```typescript
/**
 * A reusable button component with loading state
 * @param onClick - Function to call when button is clicked
 * @param disabled - Whether the button is disabled
 * @param loading - Whether to show loading state
 * @param children - Button content
 */
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  disabled = false, 
  loading = false, 
  children 
}) => {
  // Component logic here
  return (
    // JSX here
  );
};

export default Button;
```

### Styling Guidelines

- Use Material-UI's `sx` prop for styling
- Follow the existing theme structure
- Use consistent spacing and colors
- Maintain responsive design principles

```typescript
// Good
<Box sx={{ 
  p: 2, 
  mb: 3, 
  backgroundColor: 'background.paper',
  borderRadius: 1 
}}>

// Avoid inline styles
<Box style={{ 
  padding: '16px', 
  marginBottom: '24px' 
}}>
```

### File Organization

```
src/
├── components/          # Reusable components
│   ├── ComponentName/
│   │   ├── index.tsx   # Main component
│   │   ├── types.ts    # Type definitions
│   │   └── utils.ts    # Helper functions
├── pages/              # Route components
├── hooks/              # Custom hooks
├── utils/              # Utility functions
└── types/              # Global type definitions
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Examples

```bash
feat: add FAQ component with collapsible sections
fix: resolve mobile navigation menu overflow issue
docs: update installation instructions in README
style: improve button hover animations
refactor: extract theme configuration to separate file
test: add unit tests for ReadingTime component
```

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Tests pass locally (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors or warnings
- [ ] Documentation updated if needed
- [ ] Branch is up to date with main

### PR Template Checklist

When creating a PR, ensure you:

- [ ] Provide a clear description of changes
- [ ] Link related issues
- [ ] Include screenshots for UI changes
- [ ] List any breaking changes
- [ ] Confirm testing was performed

### Review Process

1. **Automated Checks** - All CI checks must pass
2. **Code Review** - At least one maintainer review required
3. **Testing** - Reviewer will test functionality
4. **Approval** - PR approved by maintainer
5. **Merge** - Squash and merge to main branch

## Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- **Environment** (OS, Node version, browser)
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Additional context**

### Feature Requests

Use the feature request template and include:

- **Problem description**
- **Proposed solution**
- **Alternative solutions considered**
- **Additional context**
- **Mockups/wireframes** (if applicable)

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- Button.test.tsx
```

### Writing Tests

- Write tests for all new components
- Test both happy path and edge cases
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    // Arrange
    const buttonText = 'Click me';
    
    // Act
    render(<Button onClick={() => {}}>{buttonText}</Button>);
    
    // Assert
    expect(screen.getByText(buttonText)).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    // Arrange
    const mockClick = jest.fn();
    
    // Act
    render(<Button onClick={mockClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    
    // Assert
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments to all exported functions and components
- Include parameter descriptions and return types
- Provide usage examples for complex components

### README Updates

When making significant changes:

- Update the README if the changes affect setup or usage
- Keep the project structure section current
- Update the table of contents if adding new sections

### Component Documentation

For new components, consider:

- Adding usage examples
- Documenting all props and their types
- Including accessibility considerations
- Providing styling customization examples

## Getting Help

If you need help:

- **Documentation**: Check the [project README](README.md)
- **Issues**: Search existing issues for similar problems
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord server

## Recognition

Contributors will be recognized in the following ways:

- Listed in the project contributors
- Mentioned in release notes for significant contributions
- Added to the project's acknowledgments

Thank you for contributing to the Hearth Engine Website! Your contributions help make this project better for everyone.