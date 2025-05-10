import k from "../kaplayCtx"

export default function gameover() {
  const citySfx = window.gameSoundtrack
  // We don't pause the music on game over anymore
  // This allows it to continue playing across scenes
  let bestScore = k.getData("best-score")
  const currentScore = k.getData("current-score")

  const rankGrades = ["F", "E", "D", "C", "B", "A", "S"]
  const rankValues = [50, 80, 100, 200, 300, 400, 500]

  let currentRank = "F"
  let bestRank = "F"
  for (let i = 0; i < rankValues.length; i++) {
    if (rankValues[i] < currentScore) {
      currentRank = rankGrades[i]
    }

    if (rankValues[i] < bestScore) {
      bestRank = rankGrades[i]
    }
  }

  if (bestScore < currentScore) {
    k.setData("best-score", currentScore)
    bestScore = currentScore
    bestRank = currentRank
  }

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

  k.add([k.text("REPROVADO", { font: "mania", size: 96 }), k.anchor("center"), k.pos(k.center().x, k.center().y - 300)])
  k.add([
    k.text(`MELHOR NOTA : ${bestScore}`, {
      font: "mania",
      size: 64,
    }),
    k.anchor("center"),
    k.pos(k.center().x - 400, k.center().y - 200),
  ])
  k.add([
    k.text(`NOTA ATUAL : ${currentScore}`, {
      font: "mania",
      size: 64,
    }),
    k.anchor("center"),
    k.pos(k.center().x + 400, k.center().y - 200),
  ])

  const bestRankBox = k.add([
    k.rect(400, 400, { radius: 4 }),
    k.color(0, 0, 0),
    k.area(),
    k.anchor("center"),
    k.outline(6, k.Color.fromArray([255, 255, 255])),
    k.pos(k.center().x - 400, k.center().y + 50),
  ])

  bestRankBox.add([k.text(bestRank, { font: "mania", size: 100 }), k.anchor("center")])

  const currentRankBox = k.add([
    k.rect(400, 400, { radius: 4 }),
    k.color(0, 0, 0),
    k.area(),
    k.anchor("center"),
    k.outline(6, k.Color.fromArray([255, 255, 255])),
    k.pos(k.center().x + 400, k.center().y + 50),
  ])

  currentRankBox.add([k.text(currentRank, { font: "mania", size: 100 }), k.anchor("center")])

  k.wait(1, () => {
    k.add([
      k.text("Aperte Espaço/Clique/Toque para jogar", {
        font: "mania",
        size: 64,
      }),
      k.anchor("center"),
      k.pos(k.center().x, k.center().y + 350),
    ])
    k.onButtonPress("jump", () => k.go("game"))
  })
}
