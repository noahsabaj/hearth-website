/**
 * Showcase data for community projects built with Hearth Engine
 */

export interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  image: string;
  categories: string[];
  githubUrl?: string;
  liveUrl?: string;
  author: string;
  featured?: boolean;
}

export const showcaseProjects: ShowcaseProject[] = [
  {
    id: 'voxel-adventure',
    title: 'Voxel Adventure',
    description:
      'An open-world exploration game featuring procedurally generated landscapes, dynamic weather, and engaging survival mechanics built entirely with Hearth Engine.',
    image: '/hearth-website/showcase/voxel-adventure.png',
    categories: ['games'],
    githubUrl: 'https://github.com/example/voxel-adventure',
    author: 'Alex Chen',
    featured: true,
  },
  {
    id: 'terrain-sculptor',
    title: 'Terrain Sculptor',
    description:
      "A powerful terrain editing tool that showcases Hearth Engine's real-time mesh manipulation capabilities. Create stunning landscapes with intuitive brush-based controls.",
    image: '/hearth-website/showcase/terrain-sculptor.png',
    categories: ['tools'],
    githubUrl: 'https://github.com/example/terrain-sculptor',
    liveUrl: 'https://terrain-sculptor.example.com',
    author: 'Sarah Miller',
  },
  {
    id: 'physics-playground',
    title: 'Physics Playground',
    description:
      "Interactive physics demonstration showcasing Hearth Engine's advanced physics simulation with destructible voxel environments and realistic material properties.",
    image: '/hearth-website/showcase/physics-playground.png',
    categories: ['techDemos'],
    githubUrl: 'https://github.com/example/physics-playground',
    author: 'Marcus Rodriguez',
    featured: true,
  },
  {
    id: 'pixel-fortress',
    title: 'Pixel Fortress',
    description:
      'A tower defense game with a unique voxel art style. Build defenses, manage resources, and protect your kingdom from waves of enemies in this strategic masterpiece.',
    image: '/hearth-website/showcase/pixel-fortress.png',
    categories: ['games'],
    githubUrl: 'https://github.com/example/pixel-fortress',
    liveUrl: 'https://pixel-fortress.itch.io',
    author: 'Emma Watson',
  },
  {
    id: 'voxel-animator',
    title: 'Voxel Animator',
    description:
      'Professional animation tool for creating voxel-based characters and animations. Export to multiple formats and integrate seamlessly with Hearth Engine projects.',
    image: '/hearth-website/showcase/voxel-animator.png',
    categories: ['tools'],
    githubUrl: 'https://github.com/example/voxel-animator',
    author: 'David Kim',
  },
  {
    id: 'light-and-shadow',
    title: 'Light & Shadow Demo',
    description:
      "Technical demonstration of Hearth Engine's advanced lighting system, featuring real-time global illumination, volumetric fog, and dynamic shadow mapping.",
    image: '/hearth-website/showcase/light-and-shadow.png',
    categories: ['techDemos'],
    githubUrl: 'https://github.com/example/light-shadow-demo',
    author: 'Technical Team',
  },
  {
    id: 'block-builder-vr',
    title: 'Block Builder VR',
    description:
      'Virtual reality building experience powered by Hearth Engine. Create and share amazing voxel constructions in an immersive VR environment.',
    image: '/hearth-website/showcase/block-builder-vr.png',
    categories: ['games', 'techDemos'],
    githubUrl: 'https://github.com/example/block-builder-vr',
    author: 'VR Studios',
    featured: true,
  },
  {
    id: 'procedural-dungeons',
    title: 'Procedural Dungeons',
    description:
      'Roguelike dungeon crawler with procedurally generated levels. Each playthrough offers a unique experience with random layouts, enemies, and treasures.',
    image: '/hearth-website/showcase/procedural-dungeons.png',
    categories: ['games'],
    githubUrl: 'https://github.com/example/procedural-dungeons',
    author: 'Indie Dev Collective',
  },
  {
    id: 'world-editor-pro',
    title: 'World Editor Pro',
    description:
      'Comprehensive world building tool with node-based scripting, asset management, and real-time collaboration features for Hearth Engine developers.',
    image: '/hearth-website/showcase/world-editor-pro.png',
    categories: ['tools'],
    githubUrl: 'https://github.com/example/world-editor-pro',
    liveUrl: 'https://worldeditor.pro',
    author: 'Professional Tools Inc',
  },
];
