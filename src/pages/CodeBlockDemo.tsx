import { Home, GitHub } from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  AppBar,
  Toolbar,
  Button,
  IconButton,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import CodeBlock from '../components/CodeBlock';

const CodeBlockDemo: React.FC = () => {
  const rustExample = `// Rust example with line highlighting
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);
    
    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }
    
    // Update a value
    scores.entry(String::from("Blue")).or_insert(50);
    scores.entry(String::from("Red")).or_insert(25);
}`;

  const javascriptExample = `// JavaScript example with async/await
async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const userData = await response.json();
        // Process user data
        
        return userData;
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        throw error;
    }
}

// Usage
fetchUserData(123)
    .then(user => /* Handle success */
    .catch(err => console.error('Error:', err));`;

  const pythonExample = `# Python example with classes
class Animal:
    def __init__(self, name, species):
        self.name = name
        self.species = species
    
    def speak(self):
        raise NotImplementedError("Subclass must implement abstract method")
    
    def __str__(self):
        return f"{self.name} is a {self.species}"

class Dog(Animal):
    def __init__(self, name):
        super().__init__(name, "dog")
    
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def __init__(self, name):
        super().__init__(name, "cat")
    
    def speak(self):
        return f"{self.name} says Meow!"

# Create instances
dog = Dog("Buddy")
cat = Cat("Whiskers")

print(dog.speak())  # Buddy says Woof!
print(cat.speak())  # Whiskers says Meow!`;

  const longLineExample = `// Example with very long lines that can be wrapped
const veryLongVariableName = "This is a very long string that demonstrates how the word wrap feature works in the enhanced CodeBlock component. When enabled, long lines will wrap to the next line instead of requiring horizontal scrolling.";

// Another long line with a complex object
const complexConfiguration = { server: { host: "localhost", port: 8080, ssl: { enabled: true, certificate: "/path/to/cert.pem", key: "/path/to/key.pem" }, cors: { origin: "*", credentials: true } } };`;

  return (
    <Box>
      {/* Navigation */}
      <AppBar
        position='fixed'
        sx={{ background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(10px)' }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              CodeBlock Demo
            </Typography>
          </Box>
          <Box>
            <Button color='inherit' component={Link} to='/' startIcon={<Home />}>
              Home
            </Button>
            <Button color='inherit' component={Link} to='/docs'>
              Documentation
            </Button>
            <IconButton
              color='inherit'
              href='https://github.com/noahsabaj/hearth-engine'
              target='_blank'
              rel='noopener noreferrer'
            >
              <GitHub />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth='lg' sx={{ mt: 12, mb: 8 }}>
        <Typography variant='h2' gutterBottom>
          Enhanced CodeBlock Component Demo
        </Typography>
        <Typography variant='body1' paragraph color='text.secondary'>
          This page demonstrates all the new features of the enhanced CodeBlock component.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            1. Basic Features (Line Numbers, Language Label, Copy/Select)
          </Typography>
          <Typography variant='body2' paragraph>
            By default, the CodeBlock shows line numbers, a language label, and provides copy/select
            all functionality.
          </Typography>
          <CodeBlock language='rust'>{rustExample}</CodeBlock>
        </Paper>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            2. File Path Display
          </Typography>
          <Typography variant='body2' paragraph>
            You can specify a file path to provide context for the code snippet.
          </Typography>
          <CodeBlock language='javascript' filePath='src/utils/api.js'>
            {javascriptExample}
          </CodeBlock>
        </Paper>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            3. Line Highlighting
          </Typography>
          <Typography variant='body2' paragraph>
            Highlight specific lines or ranges to draw attention to important code sections.
          </Typography>
          <CodeBlock
            language='python'
            filePath='examples/animals.py'
            highlightLines={[7, [13, 16], 28]}
          >
            {pythonExample}
          </CodeBlock>
        </Paper>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            4. Toggle Features
          </Typography>
          <Typography variant='body2' paragraph>
            Try toggling line numbers off and word wrap on for long lines. You can also hide line
            numbers by default.
          </Typography>
          <CodeBlock
            language='javascript'
            filePath='config/settings.js'
            showLineNumbers={false}
            wrapLines={false}
          >
            {longLineExample}
          </CodeBlock>
        </Paper>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            5. Different Languages
          </Typography>
          <Typography variant='body2' paragraph>
            The component supports syntax highlighting for multiple languages.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              TypeScript
            </Typography>
            <CodeBlock language='typescript' filePath='src/types/user.ts'>
              {`interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
}

async function getUser(id: number): Promise<User> {
    const response = await fetch(\`/api/users/\${id}\`);
    return response.json();
}`}
            </CodeBlock>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              TOML
            </Typography>
            <CodeBlock language='toml' filePath='Cargo.toml'>
              {`[package]
name = "hearth-engine"
version = "0.35.0"
edition = "2021"

[dependencies]
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
wgpu = "0.17"`}
            </CodeBlock>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              Bash
            </Typography>
            <CodeBlock language='bash' filePath='scripts/build.sh'>
              {`#!/bin/bash
# Build script for Hearth Engine

echo "Building Hearth Engine..."
cargo build --release

if [ $? -eq 0 ]; then
    echo "Build successful!"
else
    echo "Build failed!"
    exit 1
fi`}
            </CodeBlock>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            6. Combined Features
          </Typography>
          <Typography variant='body2' paragraph>
            All features work together seamlessly. This example shows a Rust file with line
            highlighting, file path, and all interactive features enabled.
          </Typography>
          <CodeBlock
            language='rust'
            filePath='src/engine/physics.rs'
            highlightLines={[[5, 8], 12, [15, 17]]}
          >
            {`use crate::math::{Vec3, Matrix4};
use crate::world::World;

pub struct PhysicsEngine {
    gravity: Vec3,
    time_step: f32,
    max_velocity: f32,
    collision_iterations: u32,
}

impl PhysicsEngine {
    pub fn new() -> Self {
        Self {
            gravity: Vec3::new(0.0, -9.81, 0.0),
            time_step: 1.0 / 60.0,
            max_velocity: 100.0,
            collision_iterations: 4,
        }
    }
    
    pub fn simulate(&mut self, world: &mut World, dt: f32) {
        // Apply gravity to all entities
        for entity in world.entities_mut() {
            if entity.has_physics() {
                entity.velocity += self.gravity * dt;
                entity.velocity = entity.velocity.clamp_length(self.max_velocity);
            }
        }
        
        // Collision detection and response
        for _ in 0..self.collision_iterations {
            self.resolve_collisions(world);
        }
    }
}`}
          </CodeBlock>
        </Paper>

        <Typography variant='body2' color='text.secondary' sx={{ mt: 4 }}>
          All code blocks feature smooth animations and maintain excellent accessibility with proper
          ARIA labels and keyboard navigation support.
        </Typography>
      </Container>
    </Box>
  );
};

export default CodeBlockDemo;
