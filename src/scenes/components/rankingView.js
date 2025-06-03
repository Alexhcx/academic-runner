import k from "../../kaplayCtx"

export default function rankingView() {
  // Pausa a música se estiver tocando
  const citySfx = window.gameSoundtrack
  if (citySfx && !citySfx.paused) {
    citySfx.paused = true;
  }

  // Recupera o estado do jogo para voltar depois
  const gameState = k.getData("game-state") || {}
  
  // Sistema de ranking
  let rankings = k.getData("rankings") || []
  
  // Mapeamento dos nomes dos personagens
  const characterNames = {
    "gleisla": "Gleisla",
    "nicoly": "Nicoly", 
    "alexandre": "Alexandre",
    "edvaldo": "Edvaldo",
    "alberto": "Alberto"
  }

  // Valores de rank para o sistema de média (0-10)
  const rankGrades = ["F", "E", "D", "C", "B", "A", "S"]
  const rankValues = [2, 4, 6, 7, 8, 9, 10]

  // Background escuro semi-transparente
  k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0, 0.8),
    k.pos(0, 0),
    k.fixed(),
  ])

  // Container do ranking
  const containerWidth = 900
  const containerHeight = 800
  const containerX = (k.width() - containerWidth) / 2
  const containerY = (k.height() - containerHeight) / 2

  k.add([
    k.rect(containerWidth, containerHeight, { radius: 16 }),
    k.color(20, 20, 20),
    k.outline(4, k.Color.fromArray([255, 215, 0])),
    k.pos(containerX, containerY),
    k.fixed(),
  ])

  // Título do ranking
  k.add([
    k.text("🏆 TOP 10 RANKING 🏆", { font: "mania", size: 56 }),
    k.anchor("center"),
    k.pos(k.center().x, containerY + 60),
    k.color(255, 215, 0), // Dourado
    k.fixed(),
  ])

  // Status atual do jogador
  if (gameState.score !== undefined) {
    k.add([
      k.text(`Sua média atual: ${gameState.score.toFixed(1)}`, { font: "mania", size: 32 }),
      k.anchor("center"),
      k.pos(k.center().x, containerY + 120),
      k.color(100, 255, 100),
      k.fixed(),
    ])
  }

  // Cabeçalho da tabela
  const tableStartY = containerY + 180
  const tableStartX = containerX + 50

  k.add([
    k.text("POS", { font: "mania", size: 28 }),
    k.pos(tableStartX, tableStartY),
    k.fixed(),
  ])
  k.add([
    k.text("PERSONAGEM", { font: "mania", size: 28 }),
    k.pos(tableStartX + 80, tableStartY),
    k.fixed(),
  ])
  k.add([
    k.text("MÉDIA", { font: "mania", size: 28 }),
    k.pos(tableStartX + 400, tableStartY),
    k.fixed(),
  ])
  k.add([
    k.text("RANK", { font: "mania", size: 28 }),
    k.pos(tableStartX + 550, tableStartY),
    k.fixed(),
  ])

  // Linha separadora
  k.add([
    k.rect(containerWidth - 100, 3),
    k.pos(containerX + 50, tableStartY + 35),
    k.color(255, 255, 255),
    k.fixed(),
  ])

  // Entradas do ranking
  rankings.forEach((entry, index) => {
    const yPos = tableStartY + 60 + (index * 40)
    
    // Determina o rank baseado na média
    let entryRank = "F"
    for (let i = 0; i < rankValues.length; i++) {
      if (entry.score >= rankValues[i]) {
        entryRank = rankGrades[i]
      }
    }

    // Cor especial para o top 3
    let textColor = [255, 255, 255]
    if (index === 0) textColor = [255, 215, 0] // Ouro
    else if (index === 1) textColor = [192, 192, 192] // Prata  
    else if (index === 2) textColor = [205, 127, 50] // Bronze

    // Destaque se for um score do game ending recente
    if (entry.isGameEnding) {
      k.add([
        k.rect(containerWidth - 100, 35),
        k.pos(containerX + 50, yPos - 5),
        k.color(0, 100, 0, 0.3),
        k.fixed(),
      ])
    }

    // Posição
    k.add([
      k.text(`${index + 1}°`, { font: "mania", size: 26 }),
      k.pos(tableStartX + 10, yPos),
      k.color(...textColor),
      k.fixed(),
    ])

    // Nome do personagem
    k.add([
      k.text(entry.characterName || characterNames[entry.character] || "???", { font: "mania", size: 26 }),
      k.pos(tableStartX + 80, yPos),
      k.color(...textColor),
      k.fixed(),
    ])

    // Média
    k.add([
      k.text(entry.score.toFixed(1), { font: "mania", size: 26 }),
      k.pos(tableStartX + 420, yPos),
      k.color(...textColor),
      k.fixed(),
    ])

    // Rank
    k.add([
      k.text(entryRank, { font: "mania", size: 26 }),
      k.pos(tableStartX + 570, yPos),
      k.color(...textColor),
      k.fixed(),
    ])
  })

  // Se não há rankings suficientes, mostra placeholders
  for (let i = rankings.length; i < 10; i++) {
    const yPos = tableStartY + 60 + (i * 40)
    k.add([
      k.text(`${i + 1}°`, { font: "mania", size: 26 }),
      k.pos(tableStartX + 10, yPos),
      k.color(100, 100, 100),
      k.fixed(),
    ])
    k.add([
      k.text("---", { font: "mania", size: 26 }),
      k.pos(tableStartX + 80, yPos),
      k.color(100, 100, 100),
      k.fixed(),
    ])
    k.add([
      k.text("0.0", { font: "mania", size: 26 }),
      k.pos(tableStartX + 420, yPos),
      k.color(100, 100, 100),
      k.fixed(),
    ])
    k.add([
      k.text("F", { font: "mania", size: 26 }),
      k.pos(tableStartX + 570, yPos),
      k.color(100, 100, 100),
      k.fixed(),
    ])
  }

  // Botão de voltar ao jogo
  const backToGameButton = k.add([
    k.rect(300, 60, { radius: 8 }),
    k.color(0, 100, 0),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.center().x + -240, containerY + containerHeight - 80),
    k.fixed(),
  ])

  backToGameButton.add([
    k.text("VOLTAR AO JOGO", { font: "mania", size: 36 }),
    k.anchor("center"),
    k.color(255, 255, 255)
  ])

  backToGameButton.onHover(() => {
    backToGameButton.outline.width = 6
    backToGameButton.color = k.Color.fromArray([0, 150, 0])
  })

  backToGameButton.onHoverEnd(() => {
    backToGameButton.outline.width = 4
    backToGameButton.color = k.Color.fromArray([0, 100, 0])
  })

  backToGameButton.onClick(() => {
    k.play("ring", { volume: 0.5 })
    // Retoma a música
    if (citySfx && citySfx.paused) {
      citySfx.paused = false
    }
    // Volta ao jogo
    k.go("game")
  })

  // Tecla ESC para voltar
  k.onKeyPress("escape", () => {
    k.play("ring", { volume: 0.3 })
    if (citySfx && citySfx.paused) {
      citySfx.paused = false
    }
    k.go("game")
  })

  // Botão de reset ranking (apenas se houver rankings)
  if (rankings.length > 0) {
    const resetButton = k.add([
      k.rect(300, 60, { radius: 8 }),
      k.color(139, 0, 0), 
      k.outline(3, k.Color.fromArray([255, 255, 255])),
      k.anchor("center"),
      k.area(),
      k.pos(k.center().x + 240, containerY + containerHeight - 80),
      k.fixed(),
    ])

    resetButton.add([
      k.text("RESET", { font: "mania", size: 28 }), 
      k.anchor("center"),
      k.color(255, 255, 255)
    ])

    resetButton.onHover(() => {
      resetButton.outline.width = 5
      resetButton.color = k.Color.fromArray([180, 0, 0])
    })

    resetButton.onHoverEnd(() => {
      resetButton.outline.width = 3
      resetButton.color = k.Color.fromArray([139, 0, 0])
    })

    resetButton.onClick(() => {
      k.play("ring", { volume: 0.3 })
      k.setData("rankings", [])
      k.go("ranking-view") // Recarrega a cena
    })
  }
}