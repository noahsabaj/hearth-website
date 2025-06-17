<div align="center">
  <img src="public/logo.png" alt="Hearth Engine Logo" width="150"/>
  
  # Hearth Engine Website

  ![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript&logoColor=white)
  ![Material-UI](https://img.shields.io/badge/Material--UI-5.16.7-007FFF?logo=mui&logoColor=white)
  ![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-success?logo=github&logoColor=white)
  ![License](https://img.shields.io/badge/License-Same%20as%20Hearth%20Engine-orange)

  **Official website for the Hearth Engine - A next-generation voxel engine with true physics simulation**

  [🚀 Live Site](https://noahsabaj.github.io/hearth-website) | [📖 Documentation](https://noahsabaj.github.io/hearth-website/#/docs) | [⬇️ Downloads](https://noahsabaj.github.io/hearth-website/#/downloads) | [🔗 Main Repository](https://github.com/noahsabaj/hearth-engine)
</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Development Setup](#-development-setup)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Technologies](#-technologies)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

## ✨ Features

- **🎨 Modern Design**: Clean, responsive UI with Material-UI components
- **⚡ Fast Performance**: Optimized React application with TypeScript
- **📱 Mobile-First**: Responsive design that works on all devices
- **🚀 GitHub Integration**: Automatic deployment with GitHub Pages
- **📊 Real-time Data**: Fetches latest releases from GitHub API
- **🔍 SEO Optimized**: Proper meta tags and structure for search engines
- **♿ Accessible**: WCAG compliant components and navigation
- **🌙 Dark Theme**: Elegant dark mode interface

## 🚀 Quick Start

Get the website running locally in just a few steps:

```bash
# Clone the repository
git clone https://github.com/noahsabaj/hearth-website.git
cd hearth-website

# Install dependencies
npm install

# Start development server
npm start
```

The site will be available at `http://localhost:3000`

## 🛠 Development Setup

### Prerequisites

- **Node.js** (≥ 16.0.0)
- **npm** (≥ 7.0.0)
- **Git**

### Installation

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/hearth-website.git
   cd hearth-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment (if needed)**
   ```bash
   # Copy environment template (if exists)
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The app will reload automatically when you make changes

### Development Workflow

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Build for production
npm run build

# Preview production build locally
npx serve -s build

# Deploy to GitHub Pages
npm run deploy
```

## 📁 Project Structure

```
hearth-website/
├── public/                 # Static assets
│   ├── logo.png           # Hearth Engine logo
│   ├── favicon.ico        # Site favicon
│   └── index.html         # HTML template
├── src/
│   ├── components/        # Reusable React components
│   │   ├── CodeBlock.tsx  # Syntax highlighted code blocks
│   │   ├── ReadingTime.tsx # Reading time estimator
│   │   └── ScrollToTop.tsx # Scroll to top functionality
│   ├── pages/             # Route components
│   │   ├── Home.tsx       # Landing page
│   │   ├── Documentation.tsx # Docs page
│   │   └── Downloads.tsx  # Downloads page
│   ├── App.tsx            # Main app component & theme
│   └── index.tsx          # App entry point
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

### Page Routes

| Route | Component | Description |
|-------|-----------|------------|
| `/` | `Home.tsx` | Landing page with hero section and features |
| `/docs` | `Documentation.tsx` | Getting started guide and documentation |
| `/downloads` | `Downloads.tsx` | Latest releases from GitHub API |

## 🚀 Deployment

The website is automatically deployed to GitHub Pages using GitHub Actions.

### Manual Deployment

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

This command:
1. Runs `npm run build` to create optimized production build
2. Pushes the build folder to the `gh-pages` branch
3. GitHub Pages automatically serves the content

### Deployment Configuration

- **Base URL**: `/hearth-website/` (configured in package.json homepage)
- **Branch**: `gh-pages`
- **Build Directory**: `build/`

## 🛠 Technologies

### Core Framework
- **[React](https://reactjs.org/)** (19.1.0) - UI library
- **[TypeScript](https://www.typescriptlang.org/)** (4.9.5) - Type safety
- **[React Router](https://reactrouter.com/)** (6.30.1) - Client-side routing

### UI & Styling
- **[Material-UI](https://mui.com/)** (5.16.7) - Component library
- **[Emotion](https://emotion.sh/)** (11.13.3) - CSS-in-JS styling

### Development & Build
- **[React Scripts](https://create-react-app.dev/)** (5.0.1) - Build tooling
- **[Testing Library](https://testing-library.com/)** - Testing utilities
- **[Web Vitals](https://web.dev/vitals/)** - Performance metrics

### Deployment
- **[GitHub Pages](https://pages.github.com/)** - Static site hosting
- **[gh-pages](https://github.com/tschaub/gh-pages)** (6.3.0) - Deployment utility

## 📜 Scripts

```bash
# Development
npm start          # Start development server
npm test           # Run test suite
npm run build      # Create production build

# Deployment  
npm run predeploy  # Build before deploy (runs automatically)
npm run deploy     # Deploy to GitHub Pages

# Advanced
npm run eject      # Eject from Create React App (irreversible)
npm test -- --coverage  # Run tests with coverage report
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test locally**
   ```bash
   npm start
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Create a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## 🆘 Support

- **Documentation**: Check our [docs page](https://noahsabaj.github.io/hearth-website/#/docs)
- **Issues**: [Report bugs or request features](https://github.com/noahsabaj/hearth-website/issues)
- **Discussions**: [Join community discussions](https://github.com/noahsabaj/hearth-engine/discussions)
- **Discord**: [Join our Discord server](https://discord.gg/hearth)

## 📄 License

This project uses the same license as the main Hearth Engine project. See the [main repository](https://github.com/noahsabaj/hearth-engine) for license details.

---

<div align="center">
  <p>Built with ❤️ for the Hearth Engine community</p>
  
  **[⭐ Star this repository](https://github.com/noahsabaj/hearth-website) | [🍴 Fork it](https://github.com/noahsabaj/hearth-website/fork) | [📢 Share it](https://twitter.com/intent/tweet?text=Check%20out%20Hearth%20Engine%20Website!%20https://github.com/noahsabaj/hearth-website)**
</div>