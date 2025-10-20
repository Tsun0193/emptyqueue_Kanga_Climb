# Assets Documentation - "Kanga's Climb" (Simplified MVP Version)

## Asset Categories Overview

This document outlines the essential visual assets needed for the MVP version of "Kanga's Climb" environmental platformer game.

## 1. Character Assets

### Main Character - Kanga (Kangaroo)
**Basic Sprite Requirements (Static Images):**
- **Idle Image**: Standing still, facing right
- **Jump Image**: Mid-air jumping pose, tail extended
- **Left Direction**: Idle pose facing left (can be flipped version of idle)
- **Right Direction**: Idle pose facing right (main idle sprite)

## 2. Environment Assets

### Background
**Single Layer Background:**
- **Simple Background**: Static background showing the vertical climb environment
  - Bottom section: Polluted/industrial theme (dark, smoky)
  - Middle section: Transition area (mixed elements)
  - Top section: Clean environment (bright, natural)

### Platform Assets
**Three General Platform Types:**
- **Platform Type 1 - Trash Platform**: Rectangular platform made of garbage/scrap metal (brown/gray colors)
- **Platform Type 2 - Rock Platform**: Natural stone platform (gray/brown colors)
- **Platform Type 3 - Clean Platform**: Green/natural platform with grass or moss (green colors)

## 3. UI Elements

### Basic Game Interface
- **Simple Health Bar**: Basic rectangular health indicator for Joey
- **Jump Power Meter**: Simple bar showing jump charge level
- **Basic Menu Button**: Simple "MENU" text or icon

### Menu Screens
- **Title Screen**: Simple text title with basic background
- **Game Over Screen**: Basic "Game Over" text with restart option

## 4. Asset Creation Guidelines

### Art Style
- **Pixel Art Style**: Clean, retro pixel art aesthetic
- **Color Progression**: Dark colors (bottom) → bright colors (top) as environment improves
- **Simple Character Design**: Clear, recognizable kangaroo silhouette
- **Environmental Storytelling**: Visual progression from pollution to clean environment

### Technical Specifications
- **Format**: PNG with transparency for sprites
- **Resolution**: 32x32 or 64x64 pixels for character sprites
- **Platform Size**: Standard rectangular platforms (128x32 pixels recommended)
- **Background**: Vertical background sized for game window
- **File Size**: Optimized for web delivery (keep under 100KB per asset)

### AI Generation Prompts Strategy
- **Character Prompts**: "Pixel art kangaroo, [pose], 32x32, transparent background, simple design"
- **Platform Prompts**: "Pixel art platform, [material type], rectangular, top-down view, simple"
- **Background Prompts**: "Pixel art vertical background, environmental progression, pollution to clean"
- **Style Consistency**: Always specify "pixel art style" and "simple design" in prompts

## 5. Asset Priority List (Development Order)

### Phase 1 - Essential Assets (Start Here)
1. Kanga idle sprite (facing right)
2. Kanga jump sprite 
3. Basic background
4. One platform type (trash platform)

### Phase 2 - Core Gameplay
1. Kanga left-facing sprite
2. Remaining platform types (rock, clean)
3. Basic UI elements

### Phase 3 - Polish (Add Later)
1. Better background details
2. Menu screen improvements
3. Audio assets
4. Animation frames

---

*This simplified asset documentation focuses on the MVP requirements for a functional 2D platformer while maintaining the environmental message through visual progression.*