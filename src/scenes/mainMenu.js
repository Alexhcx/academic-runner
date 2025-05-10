import k from "../kaplayCtx"
import { makePlayer } from "../entities/player"

export default function mainMenu() {
  if (!k.getData("best-score")) k.setData("best-score", 0)

  // Reset gravity to prevent character falling
  k.setGravity(0)

  // Botões do menu
  const playButton = k.add([
    k.rect(400, 100, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.center().x, k.center().y - 100),
    "clickable",
  ])

  playButton.add([k.text("JOGAR", { font: "mania", size: 48 }), k.anchor("center"), k.pos(0, 0)])

  const selectCharButton = k.add([
    k.rect(600, 100, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.center().x, k.center().y + 50),
    "clickable",
  ])

  selectCharButton.add([k.text("SELECIONAR PERSONAGEM", { font: "mania", size: 48 }), k.anchor("center"), k.pos(0, 0)])

  // Eventos de clique
  playButton.onClick(() => {
    k.play("jump", { volume: 0.5 })
    k.go("game")
  })

  // Verifique se o nome da cena está correto ao navegar para ela
  selectCharButton.onClick(() => {
    k.play("ring", { volume: 0.5 })
    k.go("character-select") // Certifique-se de que o nome está correto
  })

  // Efeitos hover
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

  // Atalho de teclado
  k.onButtonPress("jump", () => k.go("game"))

  const bgPieceWidth = 1920
  const bgPieces = [
    k.add([k.sprite("chemical-bg"), k.pos(0, 0), k.scale(2), k.opacity(0.8)]),
    k.add([k.sprite("chemical-bg"), k.pos(1920, 0), k.scale(2), k.opacity(0.8)]),
  ]

  const platforms = [
    k.add([k.sprite("platforms"), k.pos(0, 450), k.scale(4)]),
    k.add([k.sprite("platforms"), k.pos(384, 450), k.scale(4)]),
  ]

  k.add([k.text("ACADEMIC RUNNER", { font: "mania", size: 96 }), k.anchor("center"), k.pos(k.center().x, 200)])

  // Usar o personagem selecionado
  const selectedCharacter = k.getData("selected-character") || "gleisla"

  // Create player with a static position (no physics)
  const menuPlayer = makePlayer(k.vec2(200, 741), selectedCharacter)

  // Remove body component to prevent physics affecting the character in menu
  if (menuPlayer.body) {
    menuPlayer.body.destroy()
  }

  const gameSpeed = 4000
  k.onUpdate(() => {
    if (bgPieces[1].pos.x < 0) {
      bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth * 2, 0)
      bgPieces.push(bgPieces.shift())
    }

    bgPieces[0].move(-100, 0)
    bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth * 2, 0)

    if (platforms[1].pos.x < 0) {
      platforms[0].moveTo(platforms[1].pos.x + platforms[1].width * 4, 450)
      platforms.push(platforms.shift())
    }

    platforms[0].move(-gameSpeed, 0)
    platforms[1].moveTo(platforms[0].pos.x + platforms[1].width * 4, 450)
  })
}
