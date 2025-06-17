/**
 * Syntax highlighting themes for code blocks
 * Each theme defines colors for different syntax elements
 */

export interface SyntaxTheme {
  name: string;
  displayName: string;
  background: string;
  foreground: string;
  border: string;
  selection: string;
  colors: {
    keyword: string;
    type: string;
    function: string;
    macro: string;
    string: string;
    comment: string;
    number: string;
    attribute: string;
    operator: string;
    variable: string;
  };
}

export const syntaxThemes: Record<string, SyntaxTheme> = {
  'vscode-dark': {
    name: 'vscode-dark',
    displayName: 'VS Code Dark',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    border: '#333',
    selection: 'rgba(51, 153, 255, 0.2)',
    colors: {
      keyword: '#569cd6',
      type: '#4ec9b0',
      function: '#dcdcaa',
      macro: '#c586c0',
      string: '#ce9178',
      comment: '#6a9955',
      number: '#b5cea8',
      attribute: '#9cdcfe',
      operator: '#d4d4d4',
      variable: '#9cdcfe',
    },
  },
  dracula: {
    name: 'dracula',
    displayName: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    border: '#44475a',
    selection: 'rgba(68, 71, 90, 0.5)',
    colors: {
      keyword: '#ff79c6',
      type: '#8be9fd',
      function: '#50fa7b',
      macro: '#ff79c6',
      string: '#f1fa8c',
      comment: '#6272a4',
      number: '#bd93f9',
      attribute: '#50fa7b',
      operator: '#ff79c6',
      variable: '#f8f8f2',
    },
  },
  monokai: {
    name: 'monokai',
    displayName: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    border: '#3e3d32',
    selection: 'rgba(73, 72, 62, 0.5)',
    colors: {
      keyword: '#f92672',
      type: '#66d9ef',
      function: '#a6e22e',
      macro: '#f92672',
      string: '#e6db74',
      comment: '#75715e',
      number: '#ae81ff',
      attribute: '#a6e22e',
      operator: '#f92672',
      variable: '#f8f8f2',
    },
  },
  'solarized-dark': {
    name: 'solarized-dark',
    displayName: 'Solarized Dark',
    background: '#002b36',
    foreground: '#839496',
    border: '#073642',
    selection: 'rgba(7, 54, 66, 0.5)',
    colors: {
      keyword: '#859900',
      type: '#b58900',
      function: '#268bd2',
      macro: '#cb4b16',
      string: '#2aa198',
      comment: '#586e75',
      number: '#d33682',
      attribute: '#b58900',
      operator: '#839496',
      variable: '#839496',
    },
  },
  'solarized-light': {
    name: 'solarized-light',
    displayName: 'Solarized Light',
    background: '#fdf6e3',
    foreground: '#657b83',
    border: '#eee8d5',
    selection: 'rgba(238, 232, 213, 0.5)',
    colors: {
      keyword: '#859900',
      type: '#b58900',
      function: '#268bd2',
      macro: '#cb4b16',
      string: '#2aa198',
      comment: '#93a1a1',
      number: '#d33682',
      attribute: '#b58900',
      operator: '#657b83',
      variable: '#657b83',
    },
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    background: '#ffffff',
    foreground: '#24292e',
    border: '#e1e4e8',
    selection: 'rgba(3, 102, 214, 0.1)',
    colors: {
      keyword: '#d73a49',
      type: '#005cc5',
      function: '#6f42c1',
      macro: '#d73a49',
      string: '#032f62',
      comment: '#6a737d',
      number: '#005cc5',
      attribute: '#22863a',
      operator: '#d73a49',
      variable: '#e36209',
    },
  },
  'one-dark': {
    name: 'one-dark',
    displayName: 'One Dark',
    background: '#282c34',
    foreground: '#abb2bf',
    border: '#3e4451',
    selection: 'rgba(62, 68, 81, 0.5)',
    colors: {
      keyword: '#c678dd',
      type: '#e06c75',
      function: '#61afef',
      macro: '#c678dd',
      string: '#98c379',
      comment: '#5c6370',
      number: '#d19a66',
      attribute: '#e06c75',
      operator: '#56b6c2',
      variable: '#e06c75',
    },
  },
  'night-owl': {
    name: 'night-owl',
    displayName: 'Night Owl',
    background: '#011627',
    foreground: '#d6deeb',
    border: '#1d3b53',
    selection: 'rgba(29, 59, 83, 0.5)',
    colors: {
      keyword: '#c792ea',
      type: '#ffcb6b',
      function: '#82aaff',
      macro: '#c792ea',
      string: '#ecc48d',
      comment: '#637777',
      number: '#f78c6c',
      attribute: '#7fdbca',
      operator: '#c792ea',
      variable: '#addb67',
    },
  },
};

export const defaultTheme = 'vscode-dark';