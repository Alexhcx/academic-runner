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

  // --- Background Logic ---
  const bgY = -26
  const bgOpacity = 0.8
  const bgScale = 2
  const backgroundSpeed = 100 // Speed for background movement

  // Add the first background piece to get its actual width (scaled)
  const bg1 = k.add([k.sprite("fase01-01"), k.pos(0, bgY), k.scale(bgScale), k.opacity(bgOpacity)])
  const actualBgWidth = bg1.width + 5720

  // Add the second background piece, positioned to the right of the first
  const bg2 = k.add([k.sprite("fase01-01"), k.pos(actualBgWidth, bgY), k.scale(bgScale), k.opacity(bgOpacity)])

  // Array to manage background pieces
  const backgroundPieces = [bg1, bg2]
  // --- End of Background Logic ---

  // --- Platform Logic ---
  const platformLoopSpeed = 200
  const platforms = [
    k.add([k.sprite("platforms"), k.pos(0, 450), k.scale(4)]),
    k.add([k.sprite("platforms"), k.pos(384, 450), k.scale(4)]),
  ]
  // --- End of Platform Logic ---

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

  // Animation for background and platforms
  k.onUpdate(() => {
    // --- Background Loop ---
    for (const bg of backgroundPieces) {
      bg.move(-backgroundSpeed, 0)

      if (bg.pos.x + actualBgWidth <= 0) {
        // Find the rightmost background piece
        let rightmostX = Number.NEGATIVE_INFINITY
        for (const otherBg of backgroundPieces) {
          if (otherBg !== bg && otherBg.pos.x > rightmostX) {
            rightmostX = otherBg.pos.x
          }
        }
        bg.pos.x = rightmostX + actualBgWidth
      }
    }
    // --- End of Background Loop ---

    // --- Platform Loop ---
    const platformVisualWidth = platforms[0].width

    platforms[0].move(-platformLoopSpeed, 0)
    platforms[1].moveTo(platforms[0].pos.x + platformVisualWidth, 450)

    if (platforms[0].pos.x + platformVisualWidth < 0) {
      platforms[0].pos.x = platforms[1].pos.x + platformVisualWidth
      platforms.push(platforms.shift())
    }
    // --- End of Platform Loop ---
  })
}
