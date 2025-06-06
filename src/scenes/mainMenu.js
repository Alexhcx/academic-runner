import k from "../kaplayCtx"
import { makePlayer } from "../entities/player"

export default function mainMenu() {

  if (!k.getData("best-score")) k.setData("best-score", 0)

  k.setGravity(0)

  // Background configuration (matching game.js)
  const bgY = -26;
  const bgOpacity = 0.8;
  const bgScale = 2;
  const platformY = 450;
  const platformScale = 4;

  // Speed configuration
  const backgroundSpeed = 200; // Slower for main menu
  const platformSpeed = 300; // Platform speed

  // Background Manager Class (simplified version of game.js)
  class BackgroundManager {
    constructor() {
      this.bgPieces = [];
      this.bgWidth = 1920 * bgScale; // Standard background width
      this.scrollX = 0;
      this.backgrounds = ["fase01-01", "fase01-02", "fase01-03"]; // Phase 1 backgrounds for menu
    }

    init() {
      // Create initial background pieces
      let xPos = 0;
      this.backgrounds.forEach((bgSprite, index) => {
        const bg = k.add([
          k.sprite(bgSprite),
          k.pos(xPos, bgY),
          k.scale(bgScale),
          k.opacity(bgOpacity),
          k.z(-100),
          "background",
          { index, originalX: xPos }
        ]);
        
        this.bgPieces.push(bg);
        xPos += this.bgWidth;
      });

      // Add copy of first background for seamless loop
      const firstBgCopy = k.add([
        k.sprite(this.backgrounds[0]),
        k.pos(xPos, bgY),
        k.scale(bgScale),
        k.opacity(bgOpacity),
        k.z(-100),
        "background",
        { index: this.backgrounds.length, originalX: xPos }
      ]);
      this.bgPieces.push(firstBgCopy);
    }

    update(speed) {
      this.scrollX += speed;

      // Update background positions
      this.bgPieces.forEach(bg => {
        if (bg.exists()) {
          bg.pos.x = bg.originalX - this.scrollX;
          
          // Check if background piece went off screen and needs repositioning
          if (bg.pos.x + this.bgWidth < 0) {
            // Find the rightmost background piece
            let rightmostX = Math.max(...this.bgPieces.map(piece => piece.originalX));
            bg.originalX = rightmostX + this.bgWidth;
            bg.pos.x = bg.originalX - this.scrollX;
          }
        }
      });
    }

    destroy() {
      this.bgPieces.forEach(bg => {
        if (bg && bg.exists()) {
          k.destroy(bg);
        }
      });
      this.bgPieces = [];
    }
  }

  // Platform Manager Class (simplified version)
  class PlatformManager {
    constructor() {
      this.platformPieces = [];
      this.platformWidth = 0;
      this.scrollX = 0;
    }

    init() {
      // Calculate platform width
      const tempPlat = k.add([
        k.sprite("platforms"),
        k.scale(platformScale),
        k.opacity(0)
      ]);
      this.platformWidth = tempPlat.width * platformScale;
      k.destroy(tempPlat);

      // Create initial platform pieces
      const numPlatforms = Math.ceil(k.width() / this.platformWidth) + 2;
      let xPos = 0;

      for (let i = 0; i < numPlatforms; i++) {
        const platform = k.add([
          k.sprite("platforms"),
          k.pos(xPos, platformY),
          k.scale(platformScale),
          k.z(-50),
          "platform",
          { index: i, originalX: xPos }
        ]);
        this.platformPieces.push(platform);
        xPos += this.platformWidth;
      }
    }

    update(speed) {
      this.scrollX += speed;

      // Update platform positions with seamless loop
      this.platformPieces.forEach(platform => {
        if (platform.exists()) {
          platform.pos.x = platform.originalX - this.scrollX;
          
          // Reposition platform if it goes off screen
          if (platform.pos.x + this.platformWidth < 0) {
            const maxX = Math.max(...this.platformPieces.map(p => p.originalX));
            platform.originalX = maxX + this.platformWidth;
            platform.pos.x = platform.originalX - this.scrollX;
          }
        }
      });
    }

    destroy() {
      this.platformPieces.forEach(platform => {
        if (platform && platform.exists()) {
          k.destroy(platform);
        }
      });
      this.platformPieces = [];
    }
  }

  // Initialize managers
  const bgManager = new BackgroundManager();
  const platformManager = new PlatformManager();
  
  bgManager.init();
  platformManager.init();

  // Menu buttons
  const playButton = k.add([
    k.rect(400, 100, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.center().x, k.center().y - 150),
    "clickable",
  ])

  playButton.add([k.text("JOGAR", { font: "mania", size: 48 }), k.anchor("center"), k.pos(0, 0)])

  const selectCharButton = k.add([
    k.rect(600, 100, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.center().x, k.center().y - 20),
    "clickable",
  ])

  selectCharButton.add([k.text("SELECIONAR PERSONAGEM", { font: "mania", size: 48 }), k.anchor("center"), k.pos(0, 4)])

  // Click events
  playButton.onClick(() => {
    k.play("jump", { volume: 0.5 })
    k.go("game")
  })

  selectCharButton.onClick(() => {
    k.play("ring", { volume: 0.5 })
    k.go("character-select")
  })

  // Hover effects
  playButton.onHover(() => {
    playButton.outline.width = 6
    playButton.color = k.Color.fromArray([0, 0, 0, 0.9])
  })

  playButton.onHoverEnd(() => {
    playButton.outline.width = 4
    playButton.color = k.Color.fromArray([0, 0, 0, 0.7])
  })

  selectCharButton.onHover(() => {
    selectCharButton.outline.width = 6
    selectCharButton.color = k.Color.fromArray([0, 0, 0, 0.9])
  })

  selectCharButton.onHoverEnd(() => {
    selectCharButton.outline.width = 4
    selectCharButton.color = k.Color.fromArray([0, 0, 0, 0.7])
  })

  // Keyboard shortcut
  k.onButtonPress("jump", () => k.go("game"))

  // Title
  k.add([k.text("ACADEMIC RUNNER", { font: "mania", size: 96 }), k.anchor("center"), k.pos(k.center().x, 200)])

  // Character display
  const allCharacters = ["gleisla", "nicoly", "alexandre", "edvaldo", "alberto"]
  const selectedCharacter = k.getData("selected-character") || "gleisla"

  const characterSpacing = 150
  const startX = 655
  const characterY = 741

  const menuPlayers = []

  allCharacters.forEach((charId, index) => {
    const charX = startX + index * characterSpacing
    const player = makePlayer(k.vec2(charX, characterY), charId)

    // Remove physics body to prevent falling
    if (player.body) {
      player.body.destroy()
    }

    // Highlight the selected character
    if (charId === selectedCharacter) {
      player.scaleTo = 4.5
    }

    menuPlayers.push(player)
  })

  // Cleanup function
  k.onSceneLeave(() => {
    bgManager.destroy();
    platformManager.destroy();
  });

  // Main update loop
  k.onUpdate(() => {
    // Update background and platform managers
    bgManager.update(backgroundSpeed * k.dt());
    platformManager.update(platformSpeed * k.dt());
  })
}