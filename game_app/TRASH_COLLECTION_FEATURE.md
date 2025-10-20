# Trash Collection Feature

## Overview
Added a trash collection mechanic to the Kanga's Climb game where players can collect trash items placed on platforms to earn points.

## Features Implemented

### 1. Trash Item Loading
- Loads 9 different trash item sprites from `assets/trash/` directory:
  - bag.PNG
  - bottle.PNG
  - box.PNG
  - broke.PNG
  - can.PNG
  - cup.PNG
  - glass.PNG
  - paper.PNG
  - pizza.PNG

### 2. Random Trash Placement
- Each platform (except ground platform) gets a random trash item
- Trash items are placed on top of platforms, centered horizontally
- Each trash item is 32x32 pixels in size
- Random selection ensures variety throughout the game

### 3. Collision Detection & Collection
- Added `checkTrashCollection()` function that runs every frame
- Uses bounding box collision detection
- When kangaroo touches a trash item:
  - Item is marked as collected
  - Player earns +10 points
  - Console logs the collection event
  - Score display updates immediately

### 4. Score Display
- Added score counter to the game UI header
- Located in top bar alongside health, jump power, and height indicators
- Styled in orange/gold color (#f39c12, #e67e22)
- Updates in real-time as trash is collected

### 5. Game State Management
- Score resets to 0 when starting a new game
- Trash items regenerate with new platforms on game restart
- All trash items cleared and regenerated on reset

## Technical Details

### Code Changes

#### game.js
- Added `trashSprites` array to store loaded images
- Added `trashItems` array to track active trash in game
- Added `score` variable to track player points
- Created `loadTrashSprites()` - loads all trash images
- Created `getRandomTrash()` - returns random trash sprite
- Created `createTrashItem(platform)` - spawns trash on platform
- Created `checkTrashCollection()` - detects and handles collection
- Created `updateScoreDisplay()` - updates UI with current score
- Created `drawTrashItems()` - renders all uncollected trash
- Modified `generatePlatforms()` - adds trash to each platform
- Modified `startGame()` - initializes score and trash items
- Modified `resetGame()` - clears and regenerates trash items
- Modified `update()` - calls trash collection check each frame
- Modified `render()` - draws trash items on screen

#### index.html
- Added score container div with label and value span
- Positioned in game UI header

#### styles.css
- Added `#score-container` styling (orange color theme)
- Added `#score-value` styling
- Matches the styling of other UI elements

## How It Works

1. **Game Start**: When game begins, platforms are generated
2. **Trash Spawn**: Each platform gets assigned a random trash item using `createTrashItem()`
3. **Rendering**: Trash items are drawn on screen above their platforms
4. **Collection**: Every frame, the game checks if kangaroo's bounding box overlaps with any trash item
5. **Scoring**: On collection, score increases by 10 points and UI updates
6. **Visual Feedback**: Collected trash items disappear from screen (no longer rendered)

## Future Enhancements (Optional)
- Add collection sound effect
- Add visual particle effect when collecting trash
- Add different point values for different trash types
- Add combo multiplier for collecting trash quickly
- Add collection animation
- Display total trash count and collected count
- Add achievement for collecting all trash items
