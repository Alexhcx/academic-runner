import k from "../kaplayCtx"
import { makePlayer } from "../entities/player"
import { makeMotobug } from "../entities/motobug"
import { makeRing } from "../entities/ring"

export default function game() {
  const citySfx = window.gameSoundtrack
  // Make sure the music is playing when entering the game scene
  if (citySfx && citySfx.paused) {
    citySfx.paused = false
  }
  k.setGravity(3100)
  const bgPieceWidth = 1920
  const bgPieces = [
    k.add([k.sprite("chemical-bg"), k.pos(0, 0), k.scale(2), k.opacity(0.8)]),
    k.add([k.sprite("chemical-bg"), k.pos(bgPieceWidth, 0), k.scale(2), k.opacity(0.8)]),
  ]

  const platforms = [
    k.add([k.sprite("platforms"), k.pos(0, 450), k.scale(4)]),
    k.add([k.sprite("platforms"), k.pos(384, 450), k.scale(4)]),
  ]

  // Usar o personagem selecionado
  const selectedCharacter = k.getData("selected-character") || "gleisla"
  const player = makePlayer(k.vec2(200, 745), selectedCharacter)
  player.setControls()
  player.setEvents()

  const controlsText = k.add([
    k.text("Pressione Espaço/Clique/Toque para Pular!", {
      font: "mania",
      size: 64,
    }),
    k.anchor("center"),
    k.pos(k.center()),
  ])

  const dismissControlsAction = k.onButtonPress("jump", () => {
    k.destroy(controlsText)
    dismissControlsAction.cancel()
  })

  const scoreText = k.add([k.text("NOTA : 0", { font: "mania", size: 72 }), k.pos(20, 20)])

  // Back button to return to main menu
  const backButton = k.add([
    k.rect(172, 60, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(1820, 50),
  ])

  backButton.add([k.text("MAIN MENU", { font: "mania", size: 32 }), k.anchor("center"), k.pos(0, 0)])

  // Add hover effects
  backButton.onHover(() => {
    backButton.outline.width = 6
    backButton.color = k.Color.fromArray([0, 0, 0, 0.9])
  })

  backButton.onHoverEnd(() => {
    backButton.outline.width = 4
    backButton.color = k.Color.fromArray([0, 0, 0, 0.7])
  })

  // Add click handler to return to main menu
  backButton.onClick(() => {
    k.play("ring", { volume: 0.5 })
    k.go("main-menu")
    // We don't pause the music when going back to the menu
  })

  let score = 0
  let scoreMultiplier = 0
  player.onCollide("ring", (ring) => {
    k.play("ring", { volume: 0.5 })
    k.destroy(ring)
    score++
    scoreText.text = `NOTA : ${score}`
    player.ringCollectUI.text = "+1"
    k.wait(1, () => {
      player.ringCollectUI.text = ""
    })
  })
  player.onCollide("enemy", (enemy) => {
    if (!player.isGrounded()) {
      k.play("destroy", { volume: 0.5 })
      k.play("hyper-ring", { volume: 0.5 })
      k.destroy(enemy)
      player.play("jump")
      player.jump()
      scoreMultiplier += 1
      score += 10 * scoreMultiplier
      scoreText.text = `NOTA : ${score}`
      if (scoreMultiplier === 1) player.ringCollectUI.text = `+${10 * scoreMultiplier}`
      if (scoreMultiplier > 1) player.ringCollectUI.text = `x${scoreMultiplier}`
      k.wait(1, () => {
        player.ringCollectUI.text = ""
      })
      return
    }

    k.play("hurt", { volume: 0.5 })
    k.setData("current-score", score)
    k.go("gameover", citySfx)
  })

  let gameSpeed = 300
  k.loop(1, () => {
    gameSpeed += 50
  })

  const spawnMotoBug = () => {
    const motobug = makeMotobug(k.vec2(1950, 777))
    motobug.onUpdate(() => {
      if (gameSpeed < 3000) {
        motobug.move(-(gameSpeed + 300), 0)
        return
      }
      motobug.move(-gameSpeed, 0)
    })

    motobug.onExitScreen(() => {
      if (motobug.pos.x < 0) k.destroy(motobug)
    })

    const waitTime = k.rand(0.5, 2.5)

    k.wait(waitTime, spawnMotoBug)
  }

  spawnMotoBug()

  const spawnRing = () => {
    const ring = makeRing(k.vec2(1950, 745))
    ring.onUpdate(() => {
      ring.move(-gameSpeed, 0)
    })
    ring.onExitScreen(() => {
      if (ring.pos.x < 0) k.destroy(ring)
    })

    const waitTime = k.rand(0.5, 3)

    k.wait(waitTime, spawnRing)
  }

  spawnRing()

  k.add([k.rect(1920, 300), k.opacity(0), k.area(), k.pos(0, 840), k.body({ isStatic: true }), "platform"])

  k.onUpdate(() => {
    if (player.isGrounded()) scoreMultiplier = 0

    if (bgPieces[1].pos.x < 0) {
      bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth * 2, 0)
      bgPieces.push(bgPieces.shift())
    }

    bgPieces[0].move(-100, 0)
    bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth * 2, 0)

    // for jump effect
    bgPieces[0].moveTo(bgPieces[0].pos.x, -player.pos.y / 10 - 50)
    bgPieces[1].moveTo(bgPieces[1].pos.x, -player.pos.y / 10 - 50)

    if (platforms[1].pos.x < 0) {
      platforms[0].moveTo(platforms[1].pos.x + platforms[1].width * 4, 450)
      platforms.push(platforms.shift())
    }

    platforms[0].move(-gameSpeed, 0)
    platforms[1].moveTo(platforms[0].pos.x + platforms[1].width * 4, 450)
  })
}
