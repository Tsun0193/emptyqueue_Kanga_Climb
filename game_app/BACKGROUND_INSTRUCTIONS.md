# Adding Background Image to Kanga's Climb

## Quick Instructions

### Option 1: Save the attached image
1. Find the beautiful pixel art background image that was attached in the chat
2. Save it to the `game_app` folder
3. Rename it to: **background.png**
4. Refresh your game - the background will automatically load!

### Option 2: Use your own image
1. Find any image you want to use as a background
2. Save it to the `game_app` folder as: **background.png**
3. The game will automatically scale it to fit the canvas while maintaining proportions

## What the Code Does

The background image implementation includes:

### 1. **Proper Aspect Ratio Handling**
   - The image is automatically scaled to fit the canvas
   - Maintains the original aspect ratio (no stretching or distortion)
   - Covers the entire visible area

### 2. **Parallax Scrolling Effect**
   - The background scrolls at 30% of the game speed
   - Creates a sense of depth as you climb
   - Makes the game feel more dynamic

### 3. **Vertical Tiling**
   - The background repeats vertically to cover the entire 3000px world height
   - Seamless scrolling as you climb higher

### 4. **Fallback Gradient**
   - If the image fails to load, a nice gradient background appears
   - Ensures the game always looks good

## Technical Details

### Files Modified:
- `game.js` - Added background loading and rendering code

### New Features:
- `loadBackgroundImage()` - Loads the background.png file
- `drawBackground()` - Renders the background with proper scaling and parallax
- Background is drawn before game objects (platforms and player)
- Efficient rendering - only draws visible portions

### Image Requirements:
- Format: PNG, JPG, or any web-compatible format
- Recommended size: 720x1280 pixels or similar portrait aspect ratio
- The game will automatically scale any size

## Testing

To test if your background is working:
1. Open the browser console (F12)
2. Look for: "Background image loaded: [width] x [height]"
3. If you see an error, check that the file is named exactly "background.png"

## Troubleshooting

**Background not showing?**
- Check the file name is exactly: `background.png` (lowercase)
- Make sure it's in the `game_app` folder (same folder as game.js)
- Check browser console for error messages
- Try refreshing with Ctrl+F5 (hard refresh)

**Image looks stretched?**
- The code maintains aspect ratio, so it won't stretch
- If it doesn't fit perfectly, the image may be cropped to cover the canvas
- Try using an image with a portrait orientation for best results

## Image Attribution

If using the provided pixel art background:
- Beautiful fantasy landscape with forest, waterfall, and industrial elements
- Perfect for the "climb from pollution to paradise" theme
- Represents the journey from the polluted depths to the Sky Garden
