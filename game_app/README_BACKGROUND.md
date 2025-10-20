# How to Add the Background Image

## STEP 1: Save the Image
The image you attached in the chat needs to be saved manually:

1. **In VS Code:**
   - Look at the attached image in the chat
   - Right-click on the image
   - Select "Save Image As..."
   - Navigate to: `d:\RMIT\game_app\`
   - Save as: `background.png`

2. **Or from the chat interface:**
   - Download the attached image
   - Move it to: `d:\RMIT\game_app\`
   - Rename it to: `background.png`

## STEP 2: Verify the Setup
The file structure should look like this:
```
game_app/
├── background.png          ← Your new file here!
├── game.js
├── index.html
└── styles.css
```

## STEP 3: Test the Game
1. Open `game_app/index.html` in your browser
2. Start the game
3. You should see the beautiful pixel art background!

## What's Been Implemented

✅ **Background Image Loading**
   - Automatically loads `background.png` from the game_app folder
   
✅ **Aspect Ratio Preservation**
   - The image maintains its original proportions
   - No stretching or distortion
   - Automatically scales to cover the canvas
   
✅ **Parallax Scrolling**
   - Background moves at 30% speed (slower than player)
   - Creates depth and immersion
   
✅ **Vertical Tiling**
   - Background repeats to cover the entire 3000px world
   - Smooth scrolling throughout the climb
   
✅ **Fallback Support**
   - If image doesn't load, shows a nice gradient
   - Game always looks polished

## Image Specifications

The attached image is perfect because:
- **Vertical composition**: Shows the journey from bottom to top
- **Theme match**: Forest at top, industrial at bottom = pollution to paradise
- **Pixel art style**: Matches the game aesthetic
- **Rich detail**: Waterfalls, trees, buildings create visual interest

## Troubleshooting

**Problem: Background not showing**
- Check file name is exactly `background.png` (lowercase)
- Check file location is `game_app/background.png`
- Open browser console (F12) and look for errors
- Try hard refresh (Ctrl + F5)

**Problem: Image looks wrong**
- The code automatically handles aspect ratio
- Portrait images work best (taller than wide)
- Try different scroll positions to see the full effect

## Next Steps

After saving the image:
1. Open the game in your browser
2. Press F12 to open console
3. Look for: "Background image loaded: [dimensions]"
4. Start playing and enjoy the new background!

The background will create a much more immersive experience for your "Kanga's Climb" game! 🦘🌳
