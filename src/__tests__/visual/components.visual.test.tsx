import { percySnapshot } from '@percy/puppeteer';
import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Import components to test
import CodeBlock from '../../components/CodeBlock';
import Footer from '../../components/Footer';
import InteractiveCard from '../../components/InteractiveCard';
import LazyImage from '../../components/LazyImage';
import LoadingOverlay from '../../components/LoadingOverlay';
import NavigationBar from '../../components/NavigationBar';
import RippleButton from '../../components/RippleButton';
import SearchBar from '../../components/SearchBar';
import ThemeSelector from '../../components/ThemeSelector';
import ToastNotification from '../../components/ToastNotification';
import { KeyboardShortcutsProvider } from '../../contexts/KeyboardShortcutsContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Test wrapper with all necessary providers
const TestWrapper: React.FC<{
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'high-contrast';
}> = ({ children, theme = 'light' }) => (
  <BrowserRouter>
    <ThemeProvider initialTheme={theme}>
      <KeyboardShortcutsProvider>{children}</KeyboardShortcutsProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Component Visual Tests', () => {
  // Sample data for testing
  const sampleCodeSnippet = `// Example Hearth Engine usage
#include "hearth/core/Application.h"
#include "hearth/renderer/Renderer.h"
#include "hearth/scene/Scene.h"

int main() {
    Hearth::Application app;
    
    // Initialize the engine
    app.Initialize();
    
    // Create a scene
    auto scene = std::make_shared<Hearth::Scene>();
    
    // Game loop
    while (app.IsRunning()) {
        app.Update();
        
        Hearth::Renderer::BeginFrame();
        scene->Render();
        Hearth::Renderer::EndFrame();
    }
    
    return 0;
}`;

  const sampleCardData = {
    title: 'Advanced Rendering',
    description: 'High-performance rendering pipeline with modern graphics APIs',
    link: '/docs/rendering',
    icon: 'rendering',
    category: 'Core Features',
  };

  describe('NavigationBar Component', () => {
    it('renders navigation bar in light theme', async () => {
      const { container } = render(
        <TestWrapper theme='light'>
          <NavigationBar variant='home' />
        </TestWrapper>
      );

      await percySnapshot('NavigationBar - Light Theme');
    });

    it('renders navigation bar in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark'>
          <NavigationBar variant='home' />
        </TestWrapper>
      );

      await percySnapshot('NavigationBar - Dark Theme');
    });

    it('renders navigation bar in high contrast mode', async () => {
      const { container } = render(
        <TestWrapper theme='high-contrast'>
          <NavigationBar variant='home' />
        </TestWrapper>
      );

      await percySnapshot('NavigationBar - High Contrast');
    });

    it('renders documentation variant', async () => {
      const { container } = render(
        <TestWrapper>
          <NavigationBar variant='docs' />
        </TestWrapper>
      );

      await percySnapshot('NavigationBar - Documentation Variant');
    });
  });

  describe('Footer Component', () => {
    it('renders footer in light theme', async () => {
      const { container } = render(
        <TestWrapper theme='light'>
          <Footer />
        </TestWrapper>
      );

      await percySnapshot('Footer - Light Theme');
    });

    it('renders footer in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark'>
          <Footer />
        </TestWrapper>
      );

      await percySnapshot('Footer - Dark Theme');
    });
  });

  describe('CodeBlock Component', () => {
    it('renders code block with syntax highlighting', async () => {
      const { container } = render(
        <TestWrapper>
          <CodeBlock code={sampleCodeSnippet} language='cpp' title='Main Application' copyable />
        </TestWrapper>
      );

      await percySnapshot('CodeBlock - C++ Syntax Highlighting');
    });

    it('renders code block in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark'>
          <CodeBlock code={sampleCodeSnippet} language='cpp' title='Main Application' copyable />
        </TestWrapper>
      );

      await percySnapshot('CodeBlock - Dark Theme');
    });

    it('renders inline code block', async () => {
      const { container } = render(
        <TestWrapper>
          <CodeBlock code='Hearth::Application app;' language='cpp' inline />
        </TestWrapper>
      );

      await percySnapshot('CodeBlock - Inline Style');
    });
  });

  describe('InteractiveCard Component', () => {
    it('renders interactive card', async () => {
      const { container } = render(
        <TestWrapper>
          <InteractiveCard
            title={sampleCardData.title}
            description={sampleCardData.description}
            link={sampleCardData.link}
            icon={sampleCardData.icon}
            category={sampleCardData.category}
          />
        </TestWrapper>
      );

      await percySnapshot('InteractiveCard - Default State');
    });

    it('renders interactive card in dark theme', async () => {
      const { container } = render(
        <TestWrapper theme='dark'>
          <InteractiveCard
            title={sampleCardData.title}
            description={sampleCardData.description}
            link={sampleCardData.link}
            icon={sampleCardData.icon}
            category={sampleCardData.category}
          />
        </TestWrapper>
      );

      await percySnapshot('InteractiveCard - Dark Theme');
    });
  });

  describe('RippleButton Component', () => {
    it('renders ripple button variants', async () => {
      const { container } = render(
        <TestWrapper>
          <div style={{ display: 'flex', gap: '16px', padding: '20px' }}>
            <RippleButton variant='primary'>Primary Button</RippleButton>
            <RippleButton variant='secondary'>Secondary Button</RippleButton>
            <RippleButton variant='outline'>Outline Button</RippleButton>
            <RippleButton disabled>Disabled Button</RippleButton>
          </div>
        </TestWrapper>
      );

      await percySnapshot('RippleButton - All Variants');
    });

    it('renders icon buttons', async () => {
      const { container } = render(
        <TestWrapper>
          <div style={{ display: 'flex', gap: '16px', padding: '20px' }}>
            <RippleButton icon='download' size='small'>
              Download
            </RippleButton>
            <RippleButton icon='github' size='medium'>
              GitHub
            </RippleButton>
            <RippleButton icon='play' size='large'>
              Play
            </RippleButton>
          </div>
        </TestWrapper>
      );

      await percySnapshot('RippleButton - Icon Variants');
    });
  });

  describe('ThemeSelector Component', () => {
    it('renders theme selector', async () => {
      const { container } = render(
        <TestWrapper>
          <ThemeSelector />
        </TestWrapper>
      );

      await percySnapshot('ThemeSelector - Default');
    });
  });

  describe('SearchBar Component', () => {
    it('renders search bar', async () => {
      const { container } = render(
        <TestWrapper>
          <SearchBar />
        </TestWrapper>
      );

      await percySnapshot('SearchBar - Default State');
    });

    it('renders search bar with results', async () => {
      const { container } = render(
        <TestWrapper>
          <div style={{ width: '400px' }}>
            <SearchBar />
          </div>
        </TestWrapper>
      );

      await percySnapshot('SearchBar - With Container');
    });
  });

  describe('Loading Components', () => {
    it('renders loading overlay', async () => {
      const { container } = render(
        <TestWrapper>
          <div style={{ position: 'relative', height: '200px', width: '300px' }}>
            <LoadingOverlay isLoading message='Loading Hearth Engine...' progress={65} />
          </div>
        </TestWrapper>
      );

      await percySnapshot('LoadingOverlay - With Progress');
    });
  });

  describe('Toast Notification Component', () => {
    it('renders toast notifications', async () => {
      const { container } = render(
        <TestWrapper>
          <div style={{ padding: '20px' }}>
            <ToastNotification message='Feature copied to clipboard!' type='success' isVisible />
            <ToastNotification message='Failed to load documentation' type='error' isVisible />
            <ToastNotification message='New version available' type='info' isVisible />
          </div>
        </TestWrapper>
      );

      await percySnapshot('ToastNotification - All Types');
    });
  });

  describe('LazyImage Component', () => {
    it('renders lazy image with placeholder', async () => {
      const { container } = render(
        <TestWrapper>
          <div style={{ padding: '20px' }}>
            <LazyImage
              src='/logo512.png'
              alt='Hearth Engine Logo'
              width={200}
              height={200}
              placeholder='Loading image...'
            />
          </div>
        </TestWrapper>
      );

      await percySnapshot('LazyImage - With Placeholder');
    });
  });

  describe('Responsive Design Tests', () => {
    it('renders components at mobile breakpoint', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <TestWrapper theme='light'>
          <div>
            <NavigationBar variant='home' />
            <div style={{ padding: '20px' }}>
              <InteractiveCard
                title={sampleCardData.title}
                description={sampleCardData.description}
                link={sampleCardData.link}
                icon={sampleCardData.icon}
                category={sampleCardData.category}
              />
            </div>
          </div>
        </TestWrapper>
      );

      await percySnapshot('Components - Mobile Layout', { widths: [375] });
    });

    it('renders components at tablet breakpoint', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(
        <TestWrapper theme='light'>
          <div>
            <NavigationBar variant='home' />
            <div
              style={{
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
              }}
            >
              <InteractiveCard
                title={sampleCardData.title}
                description={sampleCardData.description}
                link={sampleCardData.link}
                icon={sampleCardData.icon}
                category={sampleCardData.category}
              />
              <InteractiveCard
                title='Physics System'
                description='Realistic physics simulation with collision detection'
                link='/docs/physics'
                icon='physics'
                category='Core Features'
              />
            </div>
          </div>
        </TestWrapper>
      );

      await percySnapshot('Components - Tablet Layout', { widths: [768] });
    });
  });
});
