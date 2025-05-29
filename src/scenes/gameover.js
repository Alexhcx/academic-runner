import k from "../kaplayCtx"

export default function gameover() {
  const citySfx = window.gameSoundtrack
  
  let bestScore = k.getData("best-score") || 0
  const currentScore = k.getData("current-score") || 0
  const selectedCharacter = k.getData("selected-character") || "gleisla"

  // Mapeamento dos nomes dos personagens
  const characterNames = {
    "gleisla": "Gleisla",
    "nicoly": "Nicoly", 
    "alexandre": "Alexandre",
    "edvaldo": "Edvaldo",
    "alberto": "Alberto"
  }

  // Sistema de ranking - recupera e atualiza
  let rankings = k.getData("rankings") || []
  
  // Adiciona o score atual ao ranking
  const newEntry = {
    score: currentScore,
    character: selectedCharacter,
    characterName: characterNames[selectedCharacter],
    timestamp: Date.now()
  }
  
  rankings.push(newEntry)
  
  // Ordena por score (maior para menor) e pega apenas os top 10
  rankings = rankings
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
  
  // Salva o ranking atualizado
  k.setData("rankings", rankings)

  // Ajustando os valores de rank para o sistema de média (0-10)
  const rankGrades = ["F", "E", "D", "C", "B", "A", "S"]
  const rankValues = [2, 4, 6, 7, 8, 9, 10]

  let currentRank = "F"
  let bestRank = "F"
  for (let i = 0; i < rankValues.length; i++) {
    if (currentScore >= rankValues[i]) {
      currentRank = rankGrades[i]
    }
    if (bestScore >= rankValues[i]) {
      bestRank = rankGrades[i]
    }
  }

  // Atualiza o melhor score se necessário
  if (bestScore < currentScore) {
    k.setData("best-score", currentScore)
    bestScore = currentScore
    bestRank = currentRank
  }

  // Estado para alternar entre resultado e ranking
  let showRanking = false

  // Função para criar a tela de resultado
  const createResultScreen = () => {
    // Limpa a tela
    k.get("result-element").forEach(obj => k.destroy(obj))
    k.get("ranking-element").forEach(obj => k.destroy(obj))

    const isApproved = currentScore >= 6.0

    // Título de aprovação/reprovação
    k.add([
      k.text(isApproved ? "APROVADO!" : "REPROVADO", { font: "mania", size: 96 }),
      k.anchor("center"),
      k.pos(k.center().x, 150),
      k.color(isApproved ? k.Color.fromArray([0, 255, 0]) : k.Color.fromArray([255, 0, 0])),
      "result-element"
    ])

    // Personagem atual
    k.add([
      k.text(`Personagem: ${characterNames[selectedCharacter]}`, { font: "mania", size: 48 }),
      k.anchor("center"),
      k.pos(k.center().x, 220),
      "result-element"
    ])

    // Média atual
    k.add([
      k.text(`MÉDIA ATUAL: ${currentScore.toFixed(1)}`, { font: "mania", size: 64 }),
      k.anchor("center"),
      k.pos(k.center().x, 520),
      "result-element"
    ])

    // Caixa do rank atual
    // const currentRankBox = k.add([
    //   k.rect(300, 300, { radius: 4 }),
    //   k.color(0, 0, 0),
    //   k.anchor("center"),
    //   k.outline(6, k.Color.fromArray([255, 255, 255])),
    //   k.pos(k.center().x, 515),
    //   "result-element"
    // ])
    // currentRankBox.add([k.text(currentRank, { font: "mania", size: 100 }), k.anchor("center")])

    // Instruções
    k.add([
      k.text("Aperte Espaço/Clique/Toque para jogar", { font: "mania", size: 48 }),
      k.anchor("center"),
      k.pos(k.center().x, 850),
      "result-element"
    ])

    k.add([
      k.text("Aperte R para ver Ranking", { font: "mania", size: 36 }),
      k.anchor("center"),
      k.pos(k.center().x, 910),
      "result-element"
    ])
  }

  // Função para criar a tela de ranking
  const createRankingScreen = () => {
    // Limpa a tela
    k.get("result-element").forEach(obj => k.destroy(obj))
    k.get("ranking-element").forEach(obj => k.destroy(obj))

    // Título do ranking
    k.add([
      k.text("🏆 TOP 10 RANKING 🏆", { font: "mania", size: 72 }),
      k.anchor("center"),
      k.pos(k.center().x, 100),
      k.color(255, 215, 0), // Dourado
      "ranking-element"
    ])

    // Cabeçalho da tabela
    k.add([
      k.text("POS", { font: "mania", size: 36 }),
      k.pos(620, 180),
      "ranking-element"
    ])
    k.add([
      k.text("PERSONAGEM", { font: "mania", size: 36 }),
      k.pos(720, 180),
      "ranking-element"
    ])
    k.add([
      k.text("MÉDIA", { font: "mania", size: 36 }),
      k.pos(1070, 180),
      "ranking-element"
    ])
    k.add([
      k.text("RANK", { font: "mania", size: 36 }),
      k.pos(1220, 180),
      "ranking-element"
    ])

    // Linha separadora
    k.add([
      k.rect(800, 4),
      k.pos(560, 220),
      k.color(255, 255, 255),
      "ranking-element"
    ])

    // Entradas do ranking
    rankings.forEach((entry, index) => {
      const yPos = 250 + (index * 45)
      
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

      // Destaque se for o score atual
      const isCurrentEntry = entry.timestamp === newEntry.timestamp
      if (isCurrentEntry) {
        k.add([
          k.rect(800, 40),
          k.pos(560, yPos - 5),
          k.color(0, 100, 0, 0.3),
          "ranking-element"
        ])
      }

      // Posição
      k.add([
        k.text(`${index + 1}°`, { font: "mania", size: 32 }),
        k.pos(635, yPos),
        k.color(...textColor),
        "ranking-element"
      ])

      // Nome do personagem
      k.add([
        k.text(entry.characterName, { font: "mania", size: 32 }),
        k.pos(742, yPos),
        k.color(...textColor),
        "ranking-element"
      ])

      // Média
      k.add([
        k.text(entry.score.toFixed(1), { font: "mania", size: 32 }),
        k.pos(1090, yPos),
        k.color(...textColor),
        "ranking-element"
      ])

      // Rank
      k.add([
        k.text(entryRank, { font: "mania", size: 32 }),
        k.pos(1250, yPos),
        k.color(...textColor),
        "ranking-element"
      ])
    })

    // Se não há rankings suficientes, mostra placeholders
    for (let i = rankings.length; i < 10; i++) {
      const yPos = 250 + (i * 45)
      k.add([
        k.text(`${i + 1}°`, { font: "mania", size: 32 }),
        k.pos(200, yPos),
        k.color(100, 100, 100),
        "ranking-element"
      ])
      k.add([
        k.text("---", { font: "mania", size: 32 }),
        k.pos(300, yPos),
        k.color(100, 100, 100),
        "ranking-element"
      ])
      k.add([
        k.text("0.0", { font: "mania", size: 32 }),
        k.pos(650, yPos),
        k.color(100, 100, 100),
        "ranking-element"
      ])
      k.add([
        k.text("F", { font: "mania", size: 32 }),
        k.pos(800, yPos),
        k.color(100, 100, 100),
        "ranking-element"
      ])
    }

    // Instruções
    k.add([
      k.text("Aperte Espaço/Clique/Toque para jogar", { font: "mania", size: 48 }),
      k.anchor("center"),
      k.pos(k.center().x, 850),
      "ranking-element"
    ])

    k.add([
      k.text("Aperte R para voltar ao Resultado", { font: "mania", size: 36 }),
      k.anchor("center"),
      k.pos(k.center().x, 910),
      "ranking-element"
    ])
  }

  // Botão de voltar ao menu principal
  const backButton = k.add([
    k.rect(172, 60, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(1820, 50),
  ])

  backButton.add([k.text("MAIN MENU", { font: "mania", size: 32 }), k.anchor("center")])

  backButton.onHover(() => {
    backButton.outline.width = 6
    backButton.color = k.Color.fromArray([0, 0, 0, 0.9])
  })

  backButton.onHoverEnd(() => {
    backButton.outline.width = 4
    backButton.color = k.Color.fromArray([0, 0, 0, 0.7])
  })

  backButton.onClick(() => {
    k.play("ring", { volume: 0.5 })
    k.go("main-menu")
  })

  // Controles
  k.onButtonPress("jump", () => k.go("game"))
  
  k.onKeyPress("r", () => {
    showRanking = !showRanking
    if (showRanking) {
      createRankingScreen()
    } else {
      createResultScreen()
    }
  })

  // Inicializa com a tela de resultado
  createResultScreen()
}