// Game State Management
const GameState = {
    MENU: 'menu',
    HOW_TO_PLAY: 'how_to_play',
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

class KangaClimbGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentState = GameState.MENU;
        
        // Set canvas to full window size
        this.resizeCanvas();
        
        // Game settings
        this.gravity = 0.5;
        this.maxJumpPower = 20;
        this.worldHeight = 3000; // Total climbable height
        this.cameraY = 0;
        this.startingY = 0; // Will be set when canvas is resized
        
        // Player object
        this.player = {
            x: this.canvas.width / 2 - 32, // Center horizontally
            y: this.canvas.height - 180, // Near bottom
            width: 64,  // Increased from 32 to 64 (double size)
            height: 64, // Increased from 32 to 64 (double size)
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            facingLeft: false,
            jumpPower: 0,
            charging: false,
            maxHeight: 0,
            isMoving: false,
            chargeStartTime: 0,
            maxChargeTime: 1500, // 1.5 seconds for maximum charge (faster charging)
            walkSpeed: 2,
            momentum: 0,
            wasOnGroundWhenCharging: false
        };
        
        // Input handling
        this.keys = {};
        this.jumpCharging = false;
        this.walkingLeft = false;
        this.walkingRight = false;
        
        // Game assets
        this.sprites = {};
        this.spritesLoaded = false;
        this.platforms = [];
        this.backgroundImage = null;
        this.backgroundLoaded = false;
        this.bushSprites = []; // Array to hold bush images
        this.trashSprites = []; // Array to hold trash item images
        this.trashItems = []; // Active trash items in the game
        
        // Game scoring
        this.score = 0; // Points from collecting trash
        
        // UI elements
        this.joeyHealth = 100; // Starting health (full)
        this.maxJoeyHealth = 100;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadAssets();
        this.generatePlatforms();
        this.gameLoop();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    resizeCanvas() {
        // Set canvas to match window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 60; // Subtract UI height
        
        // Set starting Y position (where player starts = height 0m)
        this.startingY = this.canvas.height - 180;
    }
    
    setupEventListeners() {
        // Menu navigation
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('how-to-play-btn').addEventListener('click', () => {
            this.showScreen('how-to-play-screen');
        });
        
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.showScreen('menu-screen');
            this.currentState = GameState.MENU;
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        
        document.getElementById('main-menu-btn').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('menu-screen');
        });
        
        document.getElementById('play-again-victory-btn').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        
        document.getElementById('main-menu-victory-btn').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('menu-screen');
        });
        
        // Game controls - fixed for reliable jump and movement
        document.addEventListener('keydown', (e) => {
            if (this.currentState !== GameState.PLAYING) return;
            
            // Prevent default for game keys
            if (e.code === 'Space' || e.code === 'KeyA' || e.code === 'KeyD' || 
                e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
                e.preventDefault();
            }
            
            // Ignore repeat events to prevent multiple triggers
            if (e.repeat) return;
            
            // Update key state
            this.keys[e.code] = true;
            
            // Handle jump charging - only start if on ground and not already charging
            if (e.code === 'Space') {
                if (this.player.onGround && !this.jumpCharging) {
                    this.jumpCharging = true;
                    this.player.charging = true;
                    this.player.jumpPower = 5;
                    this.player.chargeStartTime = Date.now();
                    this.player.wasOnGroundWhenCharging = true; // Track ground state at charge start
                    this.walkingLeft = false;
                    this.walkingRight = false;
                    this.player.isMoving = false;
                    this.player.velocityX = 0;
                }
                return;
            }
            
            // Handle walking movement - immediate response
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                if (!this.jumpCharging) {
                    this.walkingLeft = true;
                    this.player.facingLeft = true;
                    this.player.isMoving = true;
                } else {
                    // Set direction during charge without moving
                    this.player.facingLeft = true;
                }
            } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                if (!this.jumpCharging) {
                    this.walkingRight = true;
                    this.player.facingLeft = false;
                    this.player.isMoving = true;
                } else {
                    // Set direction during charge without moving
                    this.player.facingLeft = false;
                }
            }
        }, { passive: false });

        
        document.addEventListener('keyup', (e) => {
            if (this.currentState !== GameState.PLAYING) return;
            
            // Handle jump execution - use consistent key check
            if (e.code === 'Space') {
                e.preventDefault();
                
                // Execute jump if we were charging and started on ground
                if (this.jumpCharging && this.player.wasOnGroundWhenCharging) {
                    this.executeJump();
                }
                
                // Always clear charging state on space release
                this.jumpCharging = false;
                this.player.charging = false;
                this.player.wasOnGroundWhenCharging = false;
                this.keys[e.code] = false;
                return;
            }
            
            // Update key state
            this.keys[e.code] = false;
            
            // Handle walking movement stops
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                this.walkingLeft = false;
                if (!this.walkingRight) this.player.isMoving = false;
            } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                this.walkingRight = false;
                if (!this.walkingLeft) this.player.isMoving = false;
            }
        });
    }
    
    loadAssets() {
        // Create simple colored rectangles as placeholder sprites
        this.createPlaceholderSprites();
        
        // Try to load actual kangaroo sprites
        this.loadKangarooSprites();
        
        // Load platform tile images
        this.loadPlatformTiles();
        
        // Load background image
        this.loadBackgroundImage();
        
        // Load bush sprites
        this.loadBushSprites();
        
        // Load trash sprites
        this.loadTrashSprites();
    }
    
    loadPlatformTiles() {
        // Load grass top tile (Tile_02.png)
        const grassTile = new Image();
        grassTile.onload = () => {
            this.sprites.grassTile = grassTile;
            console.log('Grass tile loaded');
        };
        grassTile.onerror = () => {
            console.error('Failed to load grass tile');
        };
        grassTile.src = '../assets/1 Tiles/Tile_02.png';
        
        // Load dirt block tile (Tile_12.png)
        const dirtTile = new Image();
        dirtTile.onload = () => {
            this.sprites.dirtTile = dirtTile;
            console.log('Dirt tile loaded');
        };
        dirtTile.onerror = () => {
            console.error('Failed to load dirt tile');
        };
        dirtTile.src = '../assets/1 Tiles/Tile_12.png';
    }
    
    loadBackgroundImage() {
        // Load the background image
        const bgImage = new Image();
        bgImage.onload = () => {
            this.backgroundImage = bgImage;
            this.backgroundLoaded = true;
            console.log('Background image loaded:', bgImage.width, 'x', bgImage.height);
        };
        bgImage.onerror = () => {
            console.error('Failed to load background image from:', bgImage.src);
        };
        // Load from assets folder (relative to game_app folder)
        bgImage.src = '../assets/background.png';
    }
    
    loadBushSprites() {
        // Load all 9 bush sprites
        for (let i = 1; i <= 9; i++) {
            const bushImage = new Image();
            bushImage.onload = () => {
                console.log(`Bush ${i} loaded`);
            };
            bushImage.onerror = () => {
                console.error(`Failed to load bush ${i}`);
            };
            bushImage.src = `../assets/3 Objects/Bushes/${i}.png`;
            this.bushSprites.push(bushImage);
        }
    }
    
    getRandomBush() {
        // Return a random bush sprite
        if (this.bushSprites.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.bushSprites.length);
        return this.bushSprites[randomIndex];
    }
    
    loadTrashSprites() {
        // Load all trash item sprites
        const trashFiles = ['bag.PNG', 'bottle.PNG', 'box.PNG', 'broke.PNG', 
                           'can.PNG', 'cup.PNG', 'glass.PNG', 'paper.PNG', 'pizza.PNG'];
        
        for (const filename of trashFiles) {
            const trashImage = new Image();
            trashImage.onload = () => {
                console.log(`Trash item ${filename} loaded`);
            };
            trashImage.onerror = () => {
                console.error(`Failed to load trash item ${filename}`);
            };
            trashImage.src = `../assets/trash/${filename}`;
            this.trashSprites.push({
                image: trashImage,
                name: filename.replace('.PNG', '')
            });
        }
    }
    
    getRandomTrash() {
        // Return a random trash sprite
        if (this.trashSprites.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.trashSprites.length);
        return this.trashSprites[randomIndex];
    }
    
    createPlaceholderSprites() {
        // Create placeholder kangaroo sprites as actual Image objects to prevent glitching
        
        // Right-facing kangaroo
        const canvas = document.createElement('canvas');
        canvas.width = 64;  // Updated to match new player size
        canvas.height = 64; // Updated to match new player size
        const ctx = canvas.getContext('2d');
        
        // Draw right-facing kangaroo (scaled up)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(16, 16, 32, 40); // Body scaled up
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(20, 20, 8, 8); // Eye scaled up
        ctx.fillRect(28, 48, 16, 8); // Tail scaled up
        
        // Convert to Image object immediately to prevent glitching
        const rightImg = new Image();
        rightImg.onload = () => {
            this.sprites.kangarooRight = rightImg;
            this.checkSpritesLoaded();
        };
        rightImg.src = canvas.toDataURL();
        
        // Left-facing (flipped)
        const canvasLeft = document.createElement('canvas');
        canvasLeft.width = 64;
        canvasLeft.height = 64;
        const ctxLeft = canvasLeft.getContext('2d');
        ctxLeft.scale(-1, 1);
        ctxLeft.translate(-64, 0);
        ctxLeft.drawImage(canvas, 0, 0);
        
        const leftImg = new Image();
        leftImg.onload = () => {
            this.sprites.kangarooLeft = leftImg;
            this.checkSpritesLoaded();
        };
        leftImg.src = canvasLeft.toDataURL();
        
        // Jump sprite (slightly different pose)
        const canvasJump = document.createElement('canvas');
        canvasJump.width = 64;
        canvasJump.height = 64;
        const ctxJump = canvasJump.getContext('2d');
        ctxJump.fillStyle = '#8B4513';
        ctxJump.fillRect(16, 24, 32, 32); // Body scaled up
        ctxJump.fillStyle = '#A0522D';
        ctxJump.fillRect(20, 28, 8, 8); // Eye scaled up
        ctxJump.fillRect(32, 40, 24, 8); // Extended tail scaled up
        
        const jumpImg = new Image();
        jumpImg.onload = () => {
            this.sprites.kangarooJumpRight = jumpImg;
            this.checkSpritesLoaded();
        };
        jumpImg.src = canvasJump.toDataURL();
        
        // Create jump left sprite
        const canvasJumpLeft = document.createElement('canvas');
        canvasJumpLeft.width = 64;
        canvasJumpLeft.height = 64;
        const ctxJumpLeft = canvasJumpLeft.getContext('2d');
        ctxJumpLeft.scale(-1, 1);
        ctxJumpLeft.translate(-64, 0);
        ctxJumpLeft.drawImage(canvasJump, 0, 0);
        
        const jumpLeftImg = new Image();
        jumpLeftImg.onload = () => {
            this.sprites.kangarooJumpLeft = jumpLeftImg;
            this.checkSpritesLoaded();
        };
        jumpLeftImg.src = canvasJumpLeft.toDataURL();
    }
    
    checkSpritesLoaded() {
        // Check if all basic sprites are loaded
        const requiredSprites = ['kangarooRight', 'kangarooLeft', 'kangarooJumpRight', 'kangarooJumpLeft'];
        const loadedSprites = requiredSprites.filter(name => 
            this.sprites[name] && 
            this.sprites[name].complete && 
            this.sprites[name].naturalWidth > 0
        );
        
        if (loadedSprites.length === requiredSprites.length) {
            this.spritesLoaded = true;
            console.log("All sprites loaded successfully"); // Keep only essential logging
        }
    }
    
    loadKangarooSprites() {
        // Try to load actual sprites from assets folder
        const spriteFiles = {
            kangarooRight: './assets/kangaroo/IdleRight.png',
            kangarooLeft: './assets/kangaroo/IdleLeft.png',
            kangarooJumpRight: './assets/kangaroo/JumpRight.png',
            kangarooJumpLeft: './assets/kangaroo/JumpLeft.png'
        };
        
        // Also try absolute path if relative doesn't work
        const spriteFilesAlt = {
            kangarooRight: '/assets/kangaroo/IdleRight.png',
            kangarooLeft: '/assets/kangaroo/IdleLeft.png',
            kangarooJumpRight: '/assets/kangaroo/JumpRight.png',
            kangarooJumpLeft: '/assets/kangaroo/JumpLeft.png'
        };
        
        Object.entries(spriteFiles).forEach(([key, src]) => {
            const img = new Image();
            img.onload = () => {
                this.sprites[key] = img; // Override placeholder sprite
                this.checkSpritesLoaded();
            };
            img.onerror = () => {
                // Try alternative path
                const altSrc = spriteFilesAlt[key];
                const altImg = new Image();
                altImg.onload = () => {
                    this.sprites[key] = altImg;
                    this.checkSpritesLoaded();
                };
                altImg.onerror = () => {
                    // Keep the placeholder sprite that was created earlier
                };
                altImg.src = altSrc;
            };
            img.src = src;
        });
    }
    
    generatePlatforms() {
        this.platforms = [];
        
        const BLOCK_SIZE = 32; // Size of each tile block (32x32 pixels)
        
        // Helper function to create a block-based platform
        const createBlockPlatform = (x, y, type, color) => {
            // Random length: 2-3 blocks (changed from 1-2)
            const blocksWidth = 3 + Math.floor(Math.random() * 2); // 2 or 3
            // Random height: 2-3 blocks
            const blocksHeight = 1 + Math.floor(Math.random() * 2); // 2 or 3
            
            return {
                x: x,
                y: y,
                width: blocksWidth * BLOCK_SIZE,
                height: blocksHeight * BLOCK_SIZE,
                blocksWidth: blocksWidth,
                blocksHeight: blocksHeight,
                blockSize: BLOCK_SIZE,
                type: type,
                color: color,
                landed: false, // Track if player has landed on this platform
                bush: this.getRandomBush() // Assign a random bush to this platform
            };
        };
        
        // Ground platform - full width of canvas (dynamically calculated)
        const groundBlocksWidth = Math.ceil(this.canvas.width / BLOCK_SIZE); // Full width ground platform
        const groundBlocksHeight = 3;
        const groundY = this.canvas.height - (groundBlocksHeight * BLOCK_SIZE);
        this.platforms.push({
            x: 0,
            y: groundY,
            width: groundBlocksWidth * BLOCK_SIZE,
            height: groundBlocksHeight * BLOCK_SIZE,
            blocksWidth: groundBlocksWidth,
            blocksHeight: groundBlocksHeight,
            blockSize: BLOCK_SIZE,
            type: 'trash',
            color: '#654321',
            landed: true, // Ground platform doesn't give health
            bush: null // No bush on ground platform
        });
        
        // Generate platforms going up with proper spacing
        let currentHeight = this.canvas.height - 300; // Start with gap from ground (increased from 200)
        let platformCount = 0;
        let previousLevelPlatforms = []; // Track platforms from previous level
        
        // Define the playable area in the middle of the screen
        const playableWidth = this.canvas.width * 0.4; // Use 40% of screen width (reduced from 60% to be closer to middle)
        const playableStartX = (this.canvas.width - playableWidth) / 2; // Center it
        const minHorizontalOffset = BLOCK_SIZE * 2; // Minimum horizontal offset = 2 blocks apart (64px)
        
        while (currentHeight > -this.worldHeight) {
            // Random 1-2 platforms per level (changed from 2-3)
            const numPlatforms = Math.random() < 0.5 ? 1 : 2;
            
            const platformsAtThisLevel = [];
            
            for (let i = 0; i < numPlatforms; i++) {
                // Determine platform type based on height
                let type = 'trash';
                let color = '#654321';
                
                if (currentHeight < -1000) {
                    type = 'rock';
                    color = '#808080';
                } else if (currentHeight < -2000) {
                    type = 'clean';
                    color = '#228B22';
                }
                
                // Create block-based platform
                const platform = createBlockPlatform(0, currentHeight, type, color);
                
                // Position platforms to avoid stacking directly above/below previous level
                let validPosition = false;
                let attempts = 0;
                
                while (!validPosition && attempts < 50) {
                    // Random position within playable area
                    platform.x = playableStartX + Math.random() * (playableWidth - platform.width);
                    
                    // Check if this position is horizontally offset from other platforms
                    validPosition = true;
                    
                    // Check against platforms on the same level (horizontal spacing)
                    for (const sameLevelPlatform of platformsAtThisLevel) {
                        const platformLeft = platform.x;
                        const platformRight = platform.x + platform.width;
                        const sameLeft = sameLevelPlatform.x;
                        const sameRight = sameLevelPlatform.x + sameLevelPlatform.width;
                        
                        // Calculate distance between platform edges
                        const leftDistance = Math.abs(platformLeft - sameRight);
                        const rightDistance = Math.abs(sameLeft - platformRight);
                        const minDistance = Math.min(leftDistance, rightDistance);
                        
                        // Ensure minimum spacing between platforms on same level
                        if (minDistance < minHorizontalOffset) {
                            validPosition = false;
                            break;
                        }
                    }
                    
                    // Also check against previous level platforms (vertical adjacency)
                    if (validPosition) {
                        for (const prevPlatform of previousLevelPlatforms) {
                            // Calculate horizontal overlap
                            const platformLeft = platform.x;
                            const platformRight = platform.x + platform.width;
                            const prevLeft = prevPlatform.x;
                            const prevRight = prevPlatform.x + prevPlatform.width;
                            
                            // Check if platforms would be stacked (overlapping horizontally)
                            const hasOverlap = !(platformRight < prevLeft || platformLeft > prevRight);
                            
                            if (hasOverlap) {
                                // Calculate minimum offset needed
                                const centerDistance = Math.abs((platform.x + platform.width/2) - (prevPlatform.x + prevPlatform.width/2));
                                if (centerDistance < minHorizontalOffset) {
                                    validPosition = false;
                                    break;
                                }
                            }
                        }
                    }
                    attempts++;
                }
                
                // Ensure platform stays within playable area
                platform.x = Math.max(playableStartX, Math.min(playableStartX + playableWidth - platform.width, platform.x));
                
                platformsAtThisLevel.push(platform);
                this.platforms.push(platform);
                
                // Add a trash item on every platform (except ground platform which is handled separately)
                // Since this is inside the loop that creates platforms above ground, all platforms here should get trash
                this.createTrashItem(platform);
            }
            
            // Save current level as previous level for next iteration
            previousLevelPlatforms = platformsAtThisLevel;
            
            // Increase vertical spacing - reduced gap between levels
            currentHeight -= 110 + Math.random() * 40; // Reduced spacing: 110-150 (was 150-200)
            platformCount++;
        }
        
        // Victory platform at the top (centered)
        const victoryBlocksWidth = 6;
        const victoryBlocksHeight = 2;
        const victoryPlatform = {
            x: (this.canvas.width / 2) - (victoryBlocksWidth * BLOCK_SIZE / 2),
            y: -this.worldHeight,
            width: victoryBlocksWidth * BLOCK_SIZE,
            height: victoryBlocksHeight * BLOCK_SIZE,
            blocksWidth: victoryBlocksWidth,
            blocksHeight: victoryBlocksHeight,
            blockSize: BLOCK_SIZE,
            type: 'victory',
            color: '#FFD700',
            landed: false, // Victory platform can give health
            bush: this.getRandomBush() // Add a bush to victory platform
        };
        this.platforms.push(victoryPlatform);
        
        // Add a trash item to the victory platform as well
        this.createTrashItem(victoryPlatform);
    }
    
    createTrashItem(platform) {
        // Create a trash item on the platform
        const trashData = this.getRandomTrash();
        if (!trashData) return;
        
        // Calculate trash size maintaining aspect ratio - make slightly larger
        const maxTrashSize = 40; // Increased from 32 to 40 for slightly larger size
        let trashWidth, trashHeight;
        
        if (trashData.image.complete && trashData.image.naturalWidth > 0) {
            const trashAspectRatio = trashData.image.naturalWidth / trashData.image.naturalHeight;
            
            if (trashAspectRatio > 1) {
                // Trash is wider than tall
                trashWidth = maxTrashSize;
                trashHeight = maxTrashSize / trashAspectRatio;
            } else {
                // Trash is taller than wide or square
                trashHeight = maxTrashSize;
                trashWidth = maxTrashSize * trashAspectRatio;
            }
        } else {
            // Fallback if image not loaded yet
            trashWidth = maxTrashSize;
            trashHeight = maxTrashSize;
        }
        
        // Position trash item on top of platform
        const trashX = platform.x + (platform.width / 2) - (trashWidth / 2); // Center on platform
        const trashY = platform.y - trashHeight - 5; // Slightly above platform
        
        this.trashItems.push({
            x: trashX,
            y: trashY,
            width: trashWidth,
            height: trashHeight,
            sprite: trashData.image,
            name: trashData.name,
            collected: false,
            platformId: platform.x + platform.y // Link to platform for reference
        });
    }
    
    checkTrashCollection() {
        // Check if player collides with any trash items
        for (const trash of this.trashItems) {
            if (trash.collected) continue;
            
            // Simple bounding box collision
            if (this.player.x < trash.x + trash.width &&
                this.player.x + this.player.width > trash.x &&
                this.player.y < trash.y + trash.height &&
                this.player.y + this.player.height > trash.y) {
                
                // Collect the trash
                trash.collected = true;
                this.score += 10; // Add 10 points per trash item
                console.log(`Collected ${trash.name}! Score: ${this.score}`);
                this.updateScoreDisplay();
            }
        }
    }
    
    updateScoreDisplay() {
        // Update the score display in the UI
        const scoreElement = document.getElementById('score-value');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    startGame() {
        this.currentState = GameState.PLAYING;
        this.showScreen('game-screen');
        this.resetPlayer();
        this.score = 0;
        this.trashItems = [];
        this.generatePlatforms(); // Regenerate platforms to create new trash items
        this.updateScoreDisplay();
    }
    
    resetGame() {
        this.currentState = GameState.MENU;
        this.resetPlayer();
        this.joeyHealth = 100;
        this.cameraY = 0;
        this.score = 0;
        this.trashItems = [];
        this.generatePlatforms(); // Regenerate platforms with new trash items
        this.updateScoreDisplay();
    }
    
    resetPlayer() {
        this.player.x = this.canvas.width / 2 - 32; // Center horizontally
        this.player.y = this.canvas.height - 180; // Near bottom
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.onGround = false;
        this.player.facingLeft = false; // Start facing right
        this.player.jumpPower = 0;
        this.player.charging = false;
        this.player.maxHeight = 0;
        this.player.isMoving = false;
        this.player.chargeStartTime = 0;
        this.player.momentum = 0;
        this.player.wasOnGroundWhenCharging = false;
        this.jumpCharging = false;
        this.walkingLeft = false;
        this.walkingRight = false;
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    executeJump() {
        // Execute jump based on charge state, regardless of current ground status
        // Use wasOnGroundWhenCharging to allow jump even if player slightly left ground
        if (this.player.wasOnGroundWhenCharging) {
            const chargeTime = Date.now() - this.player.chargeStartTime;
            const chargeRatio = Math.min(chargeTime / this.player.maxChargeTime, 1.0);
            
            // Use the current jumpPower that was built up during charging
            const power = this.player.jumpPower;
            
            // Determine jump direction based on facing direction set during charge
            let horizontalMultiplier = 0;
            
            // Use the facing direction established before/during charge
            if (this.player.facingLeft) {
                horizontalMultiplier = -1; // Jump left
            } else {
                horizontalMultiplier = 1; // Jump right
            }
            
            // Calculate jump velocities with improved physics
            const baseHorizontalPower = power * 0.3; // Reduced horizontal power (was 0.5)
            const baseVerticalPower = power * 1.0; // Increased vertical power (was 0.8)
            
            // Apply trajectory commitment - no mid-air control
            this.player.velocityX = horizontalMultiplier * baseHorizontalPower * chargeRatio;
            this.player.velocityY = -baseVerticalPower * (0.8 + chargeRatio * 0.2); // Stronger vertical component
            
            // Store momentum for landing effects
            this.player.momentum = Math.abs(this.player.velocityX);
            
            this.player.onGround = false;
            this.player.jumpPower = 0;
            this.player.isMoving = false;
            
            // Removed placeholder sound call for better performance
        }
    }
    
    update() {
        if (this.currentState !== GameState.PLAYING) return;
        
        // Handle precise walking movement (only when on ground and not charging)
        if (this.player.onGround && !this.jumpCharging) {
            let targetVelocityX = 0;
            
            if (this.walkingLeft) {
                targetVelocityX = -this.player.walkSpeed;
            } else if (this.walkingRight) {
                targetVelocityX = this.player.walkSpeed;
            }
            
            // Smooth walking movement with precise control
            this.player.velocityX = targetVelocityX;
        }
        
        // Handle jump charging with visual feedback
        if (this.jumpCharging && this.player.onGround) {
            const chargeTime = Date.now() - this.player.chargeStartTime;
            const chargeProgress = Math.min(chargeTime / this.player.maxChargeTime, 1.0);
            
            // Auto-release if charged for too long (safety mechanism)
            if (chargeTime > this.player.maxChargeTime + 1000) { // 1 second after max charge
                this.executeJump();
                this.jumpCharging = false;
                this.player.charging = false;
                return; // Exit early to prevent further processing
            }
            
            // Exponential charge power for better control feel
            this.player.jumpPower = Math.min(
                this.maxJumpPower * (chargeProgress * chargeProgress), 
                this.maxJumpPower
            );
            
            // Stop any walking movement during charge
            if (this.player.velocityX !== 0 && Math.abs(this.player.velocityX) < 3) {
                this.player.velocityX = 0;
            }
        }
        
        // Apply physics (gravity and momentum)
        if (!this.player.onGround) {
            // Apply gravity
            this.player.velocityY += this.gravity;
            
            // No mid-air control - trajectory is committed
            // Apply stronger air resistance to horizontal movement (slower mid-air movement)
            this.player.velocityX *= 0.98; // Increased resistance from 0.995 to 0.98
        } else {
            // Ground friction for walking
            if (!this.walkingLeft && !this.walkingRight && Math.abs(this.player.velocityX) < 0.1) {
                this.player.velocityX = 0;
            }
        }
        
        // Update position
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Reduce momentum over time after landing
        if (this.player.onGround && this.player.momentum > 0) {
            this.player.momentum *= 0.95;
            if (this.player.momentum < 0.1) this.player.momentum = 0;
        }
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        
        // Check platform collisions
        this.checkPlatformCollisions();
        
        // Check trash collection
        this.checkTrashCollection();
        
        // Update camera
        this.updateCamera();
        
        // Update joey health based on height
        this.updateJoeyHealth();
        
        // Check win/lose conditions
        this.checkGameConditions();
        
        // Update UI
        this.updateUI();
    }
    
    checkPlatformCollisions() {
        this.player.onGround = false;
        
        for (const platform of this.platforms) {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y < platform.y + platform.height &&
                this.player.y + this.player.height > platform.y) {
                
                // Landing on top of platform (more precise edge detection)
                if (this.player.velocityY > 0 && 
                    this.player.y < platform.y &&
                    this.player.y + this.player.height - platform.y < 10) { // More precise landing detection
                    
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                    
                    // Increase health when landing on a new platform for the first time
                    if (!platform.landed) {
                        platform.landed = true; // Mark as landed
                        const healthIncrease = 2; // Add 2 health points per platform
                        this.joeyHealth = Math.min(this.maxJoeyHealth, this.joeyHealth + healthIncrease);
                        console.log('Landed on new platform! Health: ' + Math.floor(this.joeyHealth));
                    }
                    
                    // Reset jump state when landing to prevent stuck states
                    if (!this.keys['Space']) { // Only reset if space isn't currently held
                        this.jumpCharging = false;
                        this.player.charging = false;
                        this.player.jumpPower = 0;
                    }
                    
                    // Apply landing momentum effects
                    if (this.player.momentum > 5) {
                        // Removed placeholder sound call for better performance
                    }
                    
                    // Check for victory platform
                    if (platform.type === 'victory') {
                        this.currentState = GameState.VICTORY;
                        this.showVictory();
                        return;
                    }
                } else if (this.player.velocityY > 0) {
                    // Failed to land properly on platform - slide off
                    // This implements the "landing on edge results in fall" mechanic
                    if (this.player.x + this.player.width/2 < platform.x + 5 || 
                        this.player.x + this.player.width/2 > platform.x + platform.width - 5) {
                        // Near edge - apply sliding effect
                        this.player.velocityX = this.player.x + this.player.width/2 < platform.x + platform.width/2 ? 
                                               -2 : 2; // Slide off the edge
                    }
                }
            }
        }
    }
    
    updateCamera() {
        const targetY = -this.player.y + 400;
        this.cameraY += (targetY - this.cameraY) * 0.1;
        
        // Update max height - calculate based on starting position
        const currentHeight = Math.max(0, (this.startingY - this.player.y) / 10);
        this.player.maxHeight = Math.max(this.player.maxHeight, currentHeight);
    }
    
    updateJoeyHealth() {
        // Joey health stays at 100 (full health)
        // Can be modified later if you want health mechanics based on height
        this.joeyHealth = this.maxJoeyHealth;
    }
    
    checkGameConditions() {
        // Game over if player falls too far below their max height
        const currentHeight = (this.startingY - this.player.y) / 10;
        if (this.player.maxHeight - currentHeight > 200 && this.player.maxHeight > 20) {
            this.currentState = GameState.GAME_OVER;
            this.showGameOver();
        }
        
        // Check if player fell off the world
        if (this.player.y > 800) {
            this.currentState = GameState.GAME_OVER;
            this.showGameOver();
        }
    }
    
    updateUI() {
        // Update joey health bar
        const healthPercent = (this.joeyHealth / this.maxJoeyHealth) * 100;
        document.getElementById('joey-health-fill').style.width = healthPercent + '%';
        
        // Update jump power bar
        const powerPercent = (this.player.jumpPower / this.maxJumpPower) * 100;
        document.getElementById('jump-power-fill').style.width = powerPercent + '%';
        
        // Update height indicator
        const height = Math.floor(this.player.maxHeight);
        document.getElementById('height-value').textContent = height + 'm';
    }
    
    showGameOver() {
        const height = Math.floor(this.player.maxHeight);
        const envProgress = Math.min(100, Math.floor((height / (this.worldHeight / 10)) * 100));
        
        document.getElementById('max-height').textContent = height + 'm';
        document.getElementById('env-progress').textContent = envProgress + '%';
        
        this.showScreen('game-over-screen');
    }
    
    showVictory() {
        const height = Math.floor(this.worldHeight / 10);
        document.getElementById('final-height').textContent = height + 'm';
        
        this.showScreen('victory-screen');
    }
    
    render() {
        if (this.currentState !== GameState.PLAYING) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background first (before camera transform)
        this.drawBackground();
        
        // Apply camera transform for game objects
        this.ctx.save();
        this.ctx.translate(0, this.cameraY);
        
        // Draw platforms
        this.drawPlatforms();
        
        // Draw trash items
        this.drawTrashItems();
        
        // Draw player
        this.drawPlayer();
        
        this.ctx.restore();
    }
    
    drawBackground() {
        if (this.backgroundLoaded && this.backgroundImage) {
            // Calculate the vertical scroll position based on player height
            // The background will scroll slower than the game (parallax effect)
            const scrollFactor = 0.5; // Background scrolls at 50% of game speed for better depth
            const bgScrollY = this.cameraY * scrollFactor;
            
            // Calculate scaling to maintain aspect ratio and cover the canvas
            const canvasAspect = this.canvas.width / this.canvas.height;
            const imageAspect = this.backgroundImage.width / this.backgroundImage.height;
            
            let drawWidth, drawHeight, drawX;
            
            if (canvasAspect > imageAspect) {
                // Canvas is wider - fit to width
                drawWidth = this.canvas.width;
                drawHeight = this.canvas.width / imageAspect;
                drawX = 0;
            } else {
                // Canvas is taller - fit to height
                drawHeight = this.canvas.height;
                drawWidth = this.canvas.height * imageAspect;
                drawX = (this.canvas.width - drawWidth) / 2;
            }
            
            // Map the background image to the game world:
            // - Bottom of image = starting position (0m) at ground level
            // - Top of image = top of world (300m) at Sky Garden
            // Background scrolls as player climbs
            
            // Calculate how many times we need to tile the image to cover the world
            const worldHeightInPixels = this.worldHeight + this.canvas.height;
            const numTiles = Math.ceil(worldHeightInPixels / drawHeight) + 1;
            
            // Draw the background tiles from bottom to top
            for (let i = 0; i < numTiles; i++) {
                // Calculate Y position for this tile
                // Position tiles going upward from the ground level
                const tileY = this.canvas.height - drawHeight + bgScrollY + (i * drawHeight);
                
                // Only draw tiles that are visible on screen
                if (tileY + drawHeight > 0 && tileY < this.canvas.height) {
                    this.ctx.drawImage(
                        this.backgroundImage,
                        drawX,
                        tileY,
                        drawWidth,
                        drawHeight
                    );
                }
            }
        } else {
            // Fallback: Draw a gradient background if image not loaded
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB'); // Sky blue at top
            gradient.addColorStop(0.7, '#98D8C8'); // Light green
            gradient.addColorStop(1, '#6B8E23'); // Olive drab at bottom
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    drawPlatforms() {
        for (const platform of this.platforms) {
            // Check if we have block-based platform data
            if (platform.blocksWidth && platform.blocksHeight && platform.blockSize) {
                // Draw platform as multiple blocks
                for (let row = 0; row < platform.blocksHeight; row++) {
                    for (let col = 0; col < platform.blocksWidth; col++) {
                        const blockX = platform.x + (col * platform.blockSize);
                        const blockY = platform.y + (row * platform.blockSize);
                        
                        // Top row uses grass tile, other rows use dirt tile
                        let tileImage = null;
                        if (row === 0) {
                            // Top layer - grass tile
                            tileImage = this.sprites.grassTile;
                        } else {
                            // Under layers - dirt tile
                            tileImage = this.sprites.dirtTile;
                        }
                        
                        // Draw the tile if loaded, otherwise use fallback color
                        if (tileImage && tileImage.complete && tileImage.naturalWidth > 0) {
                            this.ctx.drawImage(tileImage, blockX, blockY, platform.blockSize, platform.blockSize);
                        } else {
                            // Fallback to colored blocks
                            if (row === 0) {
                                // Top row - lighter/grass color
                                this.ctx.fillStyle = '#228B22'; // Forest green
                            } else {
                                // Dirt color
                                this.ctx.fillStyle = platform.color;
                            }
                            this.ctx.fillRect(blockX, blockY, platform.blockSize, platform.blockSize);
                            
                            // Add border to make blocks visible
                            this.ctx.strokeStyle = '#000';
                            this.ctx.lineWidth = 1;
                            this.ctx.strokeRect(blockX, blockY, platform.blockSize, platform.blockSize);
                        }
                    }
                }
                
                // Draw bush on top of platform if it has one
                if (platform.bush && platform.bush.complete && platform.bush.naturalWidth > 0) {
                    // Calculate bush size maintaining aspect ratio - make smaller
                    const maxBushSize = platform.blockSize * 0.8; // Reduced from 1.2 to 0.8 for smaller size
                    const bushAspectRatio = platform.bush.naturalWidth / platform.bush.naturalHeight;
                    
                    let bushWidth, bushHeight;
                    if (bushAspectRatio > 1) {
                        // Bush is wider than tall
                        bushWidth = maxBushSize;
                        bushHeight = maxBushSize / bushAspectRatio;
                    } else {
                        // Bush is taller than wide or square
                        bushHeight = maxBushSize;
                        bushWidth = maxBushSize * bushAspectRatio;
                    }
                    
                    // Position bush at random spot on top of platform
                    // Calculate a position based on platform's properties for consistency
                    const bushSeed = platform.x + platform.y; // Use position as seed for consistent placement
                    const maxBushX = platform.width - bushWidth;
                    const bushOffsetX = maxBushX > 0 ? (bushSeed % maxBushX) : 0;
                    const bushX = platform.x + bushOffsetX;
                    const bushY = platform.y - bushHeight; // Place directly on top of platform
                    
                    // Draw the bush scaled to appropriate size with proper aspect ratio
                    this.ctx.drawImage(platform.bush, bushX, bushY, bushWidth, bushHeight);
                }
            } else {
                // Legacy platform rendering (fallback for any old platforms)
                this.ctx.fillStyle = platform.color;
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                
                // Add platform border
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            }
        }
    }
    
    drawTrashItems() {
        // Draw all uncollected trash items
        for (const trash of this.trashItems) {
            if (trash.collected) continue;
            
            // Check if trash sprite is loaded
            if (trash.sprite && trash.sprite.complete && trash.sprite.naturalWidth > 0) {
                // Draw trash item
                this.ctx.drawImage(trash.sprite, trash.x, trash.y, trash.width, trash.height);
            } else {
                // Fallback - draw a colored box
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.fillRect(trash.x, trash.y, trash.width, trash.height);
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(trash.x, trash.y, trash.width, trash.height);
            }
        }
    }
    
    drawPlayer() {
        let sprite = null;
        
        // Choose sprite based on state and facing direction - FIXED LOGIC
        // Use velocity to determine if actually in air, not just onGround flag
        const isActuallyJumping = !this.player.onGround && Math.abs(this.player.velocityY) > 0.5;
        
        if (isActuallyJumping) {
            // Player is actually jumping/falling - use jump sprites
            sprite = this.player.facingLeft ? this.sprites.kangarooJumpLeft : this.sprites.kangarooJumpRight;
        } else {
            // Player is on ground or just landed - use idle sprites
            sprite = this.player.facingLeft ? this.sprites.kangarooLeft : this.sprites.kangarooRight;
        }
        
        // Apply visual effects based on player state
        this.ctx.save();
        
        // Charging visual effect - slight crouch
        if (this.player.charging && this.player.onGround) {
            const chargeTime = Date.now() - this.player.chargeStartTime;
            const chargeProgress = Math.min(chargeTime / this.player.maxChargeTime, 1.0);
            const crouchOffset = chargeProgress * 4; // Crouch up to 4 pixels
            
            this.ctx.translate(0, crouchOffset);
        }
        
        // Draw the sprite - improved handling to prevent glitching
        if (sprite && sprite instanceof Image && sprite.complete && sprite.naturalWidth > 0) {
            // Only draw if the image is fully loaded
            this.ctx.drawImage(sprite, this.player.x, this.player.y, this.player.width, this.player.height);
        } else {
            // Fallback to colored rectangle with enhanced visual feedback
            let fillColor = '#8B4513'; // Default brown
            
            if (this.player.charging) {
                const chargeTime = Date.now() - this.player.chargeStartTime;
                const chargeProgress = Math.min(chargeTime / this.player.maxChargeTime, 1.0);
                const intensity = Math.floor(255 * chargeProgress);
                fillColor = `rgb(255, ${165 - intensity * 0.3}, 0)`; // Orange getting more intense
            } else if (!this.player.onGround) {
                fillColor = '#CD853F'; // Lighter brown when jumping
            }
            
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            
            // Add simple direction indicator for fallback
            this.ctx.fillStyle = '#FFFFFF';
            if (this.player.facingLeft) {
                this.ctx.fillRect(this.player.x + 2, this.player.y + 8, 4, 4); // Left eye
            } else {
                this.ctx.fillRect(this.player.x + this.player.width - 6, this.player.y + 8, 4, 4); // Right eye
            }
        }
        
        this.ctx.restore();
        
        // Draw enhanced jump charge indicator
        if (this.player.charging && this.player.onGround) {
            const chargeTime = Date.now() - this.player.chargeStartTime;
            const chargeProgress = Math.min(chargeTime / this.player.maxChargeTime, 1.0);
            
            // Draw charge power bar above player
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(this.player.x - 5, this.player.y - 20, this.player.width + 10, 10);
            
            // Charge bar with color progression
            const green = Math.floor(255 * (1 - chargeProgress));
            const red = Math.floor(255 * chargeProgress);
            this.ctx.fillStyle = `rgba(${red}, ${green}, 0, 0.8)`;
            this.ctx.fillRect(this.player.x - 3, this.player.y - 18, 
                             (this.player.width + 6) * chargeProgress, 6);
            
            // Draw trajectory preview
            this.drawTrajectoryPreview(chargeProgress);
            
            // Draw direction indicator
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            const centerX = this.player.x + this.player.width / 2;
            const centerY = this.player.y - 25;
            
            // Enhanced direction arrow
            this.ctx.beginPath();
            if (this.player.facingLeft) {
                this.ctx.moveTo(centerX - 12, centerY);
                this.ctx.lineTo(centerX - 6, centerY - 4);
                this.ctx.lineTo(centerX - 6, centerY + 4);
            } else {
                this.ctx.moveTo(centerX + 12, centerY);
                this.ctx.lineTo(centerX + 6, centerY - 4);
                this.ctx.lineTo(centerX + 6, centerY + 4);
            }
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    drawTrajectoryPreview(chargeProgress) {
        if (chargeProgress < 0.1) return; // Don't show trajectory for very weak charges
        
        // Calculate approximate trajectory
        const power = this.maxJumpPower * (chargeProgress * chargeProgress);
        const horizontalPower = power * 0.5;
        const verticalPower = power * 0.8;
        
        const startX = this.player.x + this.player.width / 2;
        const startY = this.player.y;
        
        let velocityX = (this.player.facingLeft ? -1 : 1) * horizontalPower * chargeProgress;
        let velocityY = -verticalPower * (0.7 + chargeProgress * 0.3);
        
        // Draw trajectory dots
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        let x = startX;
        let y = startY;
        
        for (let i = 0; i < 20; i++) {
            x += velocityX;
            y += velocityY;
            velocityY += this.gravity;
            velocityX *= 0.995;
            
            if (i % 3 === 0) { // Show every 3rd point
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Stop if trajectory goes off screen or hits ground level
            if (y > startY || x < 0 || x > this.canvas.width) break;
        }
    }
    
    playJumpSound() {
        // Placeholder for jump sound effect
        // In a full implementation, you would load and play an audio file
        console.log("Jump sound effect");
    }
    
    playLandingSound() {
        // Placeholder for landing sound effect
        // In a full implementation, you would load and play an audio file
        console.log("Landing sound effect");
    }
    
    gameLoop() {
        // Only update and render when playing to improve performance
        if (this.currentState === GameState.PLAYING) {
            this.update();
            this.render();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new KangaClimbGame();
});