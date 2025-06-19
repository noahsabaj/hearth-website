import { Container, Typography, Box, Paper, Grid, Divider } from '@mui/material';
import React from 'react';

import CodeBlock from '../components/CodeBlock';
import { syntaxThemes } from '../themes/syntaxThemes';

const sampleCode = `// Hearth Engine Example
use hearth_engine::{Engine, Game, World};

struct MyGame {
    player_pos: Vec3,
    score: u32,
}

impl Game for MyGame {
    fn init(&mut self, world: &mut World) {
        // Initialize the game world
        world.set_render_distance(16);
        world.generate_terrain(TerrainParams {
            seed: 42,
            scale: 0.1,
            octaves: 4,
        });
    }
    
    fn update(&mut self, world: &mut World, input: &Input, dt: f32) {
        // Handle player movement
        if input.is_key_pressed(Key::W) {
            self.player_pos.z += 5.0 * dt;
        }
        
        // Update physics
        world.simulate_physics(dt);
    }
}

fn main() {
    let mut engine = Engine::new();
    engine.run(MyGame {
        player_pos: Vec3::ZERO,
        score: 0,
    });
}`;

const ThemeDemo: React.FC = () => {
  return (
    <Container maxWidth='lg' sx={{ py: 8 }}>
      <Typography variant='h2' gutterBottom align='center'>
        Syntax Highlighting Themes Demo
      </Typography>

      <Typography variant='body1' paragraph align='center' sx={{ mb: 6 }}>
        Click the palette icon on any code block to change the syntax highlighting theme. Your
        preference will be saved and applied to all code blocks across the site.
      </Typography>

      <Box sx={{ mb: 6 }}>
        <Typography variant='h4' gutterBottom>
          Interactive Theme Switcher
        </Typography>
        <Typography variant='body2' color='text.secondary' paragraph>
          Try hovering over different themes to see a preview before selecting.
        </Typography>
        <CodeBlock language='rust'>{sampleCode}</CodeBlock>
      </Box>

      <Divider sx={{ my: 8 }} />

      <Typography variant='h4' gutterBottom sx={{ mb: 4 }}>
        Available Themes
      </Typography>

      <Grid container spacing={3}>
        {Object.entries(syntaxThemes).map(([key, theme]) => (
          <Grid item xs={12} md={6} key={key}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant='h6' gutterBottom>
                {theme.displayName}
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: theme.background,
                  border: `1px solid ${theme.border}`,
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  overflow: 'auto',
                }}
              >
                <pre style={{ margin: 0, color: theme.foreground }}>
                  <span style={{ color: theme.colors.comment }}>// Example code</span>
                  {'\n'}
                  <span style={{ color: theme.colors.keyword }}>const</span>{' '}
                  <span style={{ color: theme.colors.variable }}>message</span>{' '}
                  <span style={{ color: theme.colors.operator }}>=</span>{' '}
                  <span style={{ color: theme.colors.string }}>"Hello"</span>;{'\n'}
                  <span style={{ color: theme.colors.keyword }}>function</span>{' '}
                  <span style={{ color: theme.colors.function }}>greet</span>
                  <span style={{ color: theme.foreground }}>(</span>
                  <span style={{ color: theme.colors.variable }}>name</span>
                  <span style={{ color: theme.foreground }}>)</span>{' '}
                  <span style={{ color: theme.foreground }}>{'{'}</span>
                  {'\n  '}
                  <span style={{ color: theme.colors.keyword }}>return</span>{' '}
                  <span style={{ color: theme.colors.string }}>`Hello, ${'${name}'}!`</span>;{'\n'}
                  <span style={{ color: theme.foreground }}>{'}'}</span>
                </pre>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 8, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant='h5' gutterBottom>
          Features
        </Typography>
        <Typography component='ul' sx={{ pl: 3 }}>
          <li>8 carefully crafted themes including VS Code Dark, Dracula, Monokai, and more</li>
          <li>Theme preference saved in localStorage for persistence across sessions</li>
          <li>Smooth transition animations when switching themes</li>
          <li>Preview themes on hover before selecting</li>
          <li>Accessible theme names and keyboard navigation</li>
          <li>Consistent application across all code blocks</li>
          <li>Support for multiple programming languages (Rust, Bash, TOML)</li>
        </Typography>
      </Box>
    </Container>
  );
};

export default ThemeDemo;
