module.exports = {
  // Basic formatting options
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // Line length and tabs
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  
  // End of line
  endOfLine: 'lf',
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // JSX specific
  jsxSingleQuote: true,
  
  // Override for specific file types
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        singleQuote: false,
      },
    },
  ],
};