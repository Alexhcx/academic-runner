import k from "../kaplayCtx"

export default function characterSelect() {
  // Definição dos personagens disponíveis
  const characters = [
    { id: "gleisla", name: "Gleisla", description: "Feliz sempre!" },
    { id: "nicoly", name: "Nicoly", description: "Sempre tranquila." },
    { id: "alexandre", name: "Alexandre", description: "Bem irresponsavel!" },
    { id: "edvaldo", name: "Edvaldo", description: "Sempre ansioso." },
    { id: "alberto", name: "Alberto", description: "Bem estressado." },
  ]

  // Personagem selecionado atualmente (índice)
  let currentSelection = 0

  // Flag para controlar se o botão de pulo deve iniciar o jogo
  let allowJumpToStart = false

  // Background configuration (matching mainMenu.js)
  const bgY = -26;
  const bgOpacity = 0.8;
  const bgScale = 2;
  const platformY = 450;
  const platformScale = 4;

  // Speed configuration
  const backgroundSpeed = 100; // Slower for character select
  const platformSpeed = 200; // Platform speed

  // Background Manager Class (from mainMenu.js)
  class BackgroundManager {
    constructor() {
      this.bgPieces = [];
      this.bgWidth = 1920 * bgScale; // Standard background width
      this.scrollX = 0;
      this.backgrounds = ["fase01-01", "fase01-02", "fase01-03"]; // Phase 1 backgrounds
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

  // Platform Manager Class (from mainMenu.js)
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

  // Título
  k.add([k.text("SELECIONE SEU PERSONAGEM", { font: "mania", size: 72 }), k.anchor("center"), k.pos(k.center().x, 150)])

  // Instruções
  const instructions = k.add([
    k.text("Use as setas para navegar\nAperte ESPAÇO para confirmar", {
      font: "mania",
      size: 32,
      align: "center",
    }),
    k.anchor("center"),
    k.pos(k.center().x, k.height() - 100),
  ])

  // Container do personagem
  const characterContainer = k.add([
    k.rect(600, 600),
    k.color(0, 0, 0, 0.5),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.pos(k.center()),
  ])

  // Sprite do personagem
  const characterSprite = characterContainer.add([
    k.sprite("gleisla", { anim: "run" }),
    k.scale(8),
    k.anchor("center"),
    k.pos(0, -50),
  ])

  // Nome do personagem
  const characterName = characterContainer.add([
    k.text(characters[currentSelection].name, { font: "mania", size: 48 }),
    k.anchor("center"),
    k.pos(0, 150),
  ])

  // Descrição do personagem
  const characterDesc = characterContainer.add([
    k.text(characters[currentSelection].description, { font: "mania", size: 32 }),
    k.anchor("center"),
    k.pos(0, 200),
  ])

  // Botão de confirmação
  const confirmButton = k.add([
    k.rect(400, 80, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.center().x, k.height() - 185),
  ])

  confirmButton.add([k.text("SELECIONAR", { font: "mania", size: 36 }), k.anchor("center"), k.pos(0, 0)])

  // Setas de navegação com áreas maiores e mais visíveis
  const leftArrowButton = k.add([
    k.rect(100, 100, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.center().x - 400, k.center().y),
  ])

  leftArrowButton.add([k.text("<", { font: "mania", size: 64 }), k.anchor("center"), k.pos(0, 0)])

  const rightArrowButton = k.add([
    k.rect(100, 100, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.center().x + 400, k.center().y),
  ])

  rightArrowButton.add([k.text(">", { font: "mania", size: 64 }), k.anchor("center"), k.pos(0, 0)])

  // Função para atualizar a exibição do personagem
  function updateCharacterDisplay() {
    const character = characters[currentSelection]
    characterName.text = character.name
    characterDesc.text = character.description
    characterSprite.use(k.sprite(character.id, { anim: "run" }))
  }

  // Navegação com teclado
  k.onKeyPress("left", () => {
    currentSelection = (currentSelection - 1 + characters.length) % characters.length
    updateCharacterDisplay()
    k.play("ring", { volume: 0.3 })
  })

  k.onKeyPress("right", () => {
    currentSelection = (currentSelection + 1) % characters.length
    updateCharacterDisplay()
    k.play("ring", { volume: 0.3 })
  })

  // Cancela o evento de pulo padrão para evitar iniciar o jogo ao clicar
  const jumpAction = k.onButtonPress("jump", () => {
    if (allowJumpToStart) {
      selectCharacter()
    }
  })

  // Navegação com clique - usando eventos de clique específicos
  leftArrowButton.onClick(() => {
    currentSelection = (currentSelection - 1 + characters.length) % characters.length
    updateCharacterDisplay()
    k.play("ring", { volume: 0.3 })
  })

  rightArrowButton.onClick(() => {
    currentSelection = (currentSelection + 1) % characters.length
    updateCharacterDisplay()
    k.play("ring", { volume: 0.3 })
  })

  // Efeito hover nas setas
  leftArrowButton.onHover(() => {
    leftArrowButton.outline.width = 6
    leftArrowButton.color = k.Color.fromArray([0, 0, 0, 0.9])
  })

  leftArrowButton.onHoverEnd(() => {
    leftArrowButton.outline.width = 4
    leftArrowButton.color = k.Color.fromArray([0, 0, 0, 0.7])
  })

  rightArrowButton.onHover(() => {
    rightArrowButton.outline.width = 6
    rightArrowButton.color = k.Color.fromArray([0, 0, 0, 0.9])
  })

  rightArrowButton.onHoverEnd(() => {
    rightArrowButton.outline.width = 4
    rightArrowButton.color = k.Color.fromArray([0, 0, 0, 0.7])
  })

  // Efeito hover no botão de confirmação
  confirmButton.onHover(() => {
    confirmButton.outline.width = 6
    confirmButton.color = k.Color.fromArray([0, 0, 0, 0.9])
    allowJumpToStart = true
  })

  confirmButton.onHoverEnd(() => {
    confirmButton.outline.width = 4
    confirmButton.color = k.Color.fromArray([0, 0, 0, 0.7])
    allowJumpToStart = false
  })

  // Seleção do personagem com clique no botão de confirmação
  confirmButton.onClick(() => {
    selectCharacter()
  })

  // Função para selecionar o personagem e iniciar o jogo
  function selectCharacter() {
    k.setData("selected-character", characters[currentSelection].id)
    k.play("jump", { volume: 0.5 })
    jumpAction.cancel() // Cancelar o evento de pulo para evitar problemas
    k.go("game")
  }

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