import k from "../kaplayCtx"
import { makePlayer } from "../entities/player"
import { makeMotobug } from "../entities/motobug"
import { makeNote } from "../entities/note" // Importando makeNote

export default function game() {
  const citySfx = window.gameSoundtrack
  // Make sure the music is playing when entering the game scene
  if (citySfx && citySfx.paused) {
    citySfx.paused = false
  }
  k.setGravity(3100)

  // Configurações do Background
  const bgY = -26
  const bgOpacity = 0.8
  const bgScale = 2

  // Adiciona a primeira peça do background para obter sua largura real (escalada)
  const bg1 = k.add([
    k.sprite("fase01"),
    k.pos(0, bgY),
    k.scale(bgScale),
    k.opacity(bgOpacity),
    "background_piece", // Tag opcional para identificar
  ])
  const actualBgWidth = bg1.width + 5720 // Largura da imagem de fundo após a escala

  // Adiciona a segunda peça do background, posicionada à direita da primeira
  const bg2 = k.add([
    k.sprite("fase01"),
    k.pos(actualBgWidth, bgY), // Posiciona logo após a primeira
    k.scale(bgScale),
    k.opacity(bgOpacity),
    "background_piece",
  ])

  // Array para gerenciar as peças do background
  const backgroundPieces = [bg1, bg2]

  // Debug text (opcional, remova ou comente se não precisar)
  const debugText = k.add([
    k.text("", { font: "mania", size: 24 }),
    k.pos(1650, 100),
    k.color(255, 255, 255),
    k.fixed(), // Para o texto de debug não se mover com a câmera
  ])

  // --- código inicial ---
  const platforms = [
    k.add([k.sprite("platforms"), k.pos(0, 450), k.scale(4)]),
    k.add([k.sprite("platforms"), k.pos(384, 450), k.scale(4)]), // Se esta é a largura escalada de "platforms", ok.
    // Caso contrário, posicione como platforms[0].width
  ]

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
    k.fixed(), // Para o texto não se mover
  ])

  const dismissControlsAction = k.onButtonPress("jump", () => {
    k.destroy(controlsText)
    dismissControlsAction.cancel()
  })

  // Novo sistema de pontuação baseado em média
  const scoreText = k.add([
    k.text("MÉDIA: 0.0", { font: "mania", size: 72 }),
    k.pos(20, 20),
    k.fixed(), // Para o score não se mover
  ])

  // Texto adicional para mostrar quantas notas foram coletadas
  const notesCollectedText = k.add([k.text("NOTAS: 0", { font: "mania", size: 36 }), k.pos(20, 100), k.fixed()])

  const backButton = k.add([
    k.rect(172, 60, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.width() - 100, 50), // Posição relativa à largura da tela
    k.fixed(), // Para o botão não se mover
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

  // Variáveis para o novo sistema de pontuação
  let totalScore = 0 // Soma de todas as notas coletadas
  let notesCollected = 0 // Número de notas coletadas
  let averageScore = 0 // Média das notas
  let scoreMultiplier = 0 // Mantemos o multiplicador para inimigos

  // Lógica de colisão com notas
  player.onCollide("note", (note) => {
    k.play("ring", { volume: 0.5 })

    // Adicionar o valor da nota ao total
    totalScore += note.value
    notesCollected++

    // Calcular a média
    averageScore = notesCollected > 0 ? totalScore / notesCollected : 0

    // Atualizar os textos de pontuação
    scoreText.text = `MÉDIA: ${averageScore.toFixed(1)}`
    notesCollectedText.text = `NOTAS: ${notesCollected}`

    // Mostrar o valor da nota coletada
    player.ringCollectUI.text = `+${note.value}`
    k.wait(1, () => {
      player.ringCollectUI.text = ""
    })

    // Destruir a nota após coletá-la
    k.destroy(note)
  })

  player.onCollide("enemy", (enemy) => {
    if (!player.isGrounded()) {
      k.play("destroy", { volume: 0.5 })
      k.play("hyper-ring", { volume: 0.5 })
      k.destroy(enemy)
      player.play("jump")
      player.jump()
      scoreMultiplier += 1

      // Bônus por derrotar inimigos - adiciona pontos extras à média
      // Adicionamos um valor fixo (por exemplo, 6) multiplicado pelo multiplicador
      // const bonus = 5 * scoreMultiplier
      const bonus = 6
      totalScore += bonus
      notesCollected += 1 // Considerando como uma nota extra para o cálculo da média

      // Recalcular a média
      averageScore = totalScore / notesCollected

      // Atualizar os textos
      scoreText.text = `MÉDIA: ${averageScore.toFixed(1)}`
      notesCollectedText.text = `NOTAS: ${notesCollected}`

      if (scoreMultiplier === 1) player.ringCollectUI.text = `+${bonus}`
      if (scoreMultiplier > 1) player.ringCollectUI.text = `x${scoreMultiplier}`
      k.wait(1, () => {
        player.ringCollectUI.text = ""
      })
      return
    }

    k.play("hurt", { volume: 0.5 })
    // Salvar a média atual em vez da pontuação bruta
    k.setData("current-score", averageScore)
    k.go("gameover", citySfx)
  })

  let gameSpeed = 300
  k.loop(1, () => {
    // Aumenta a velocidade a cada segundo
    if (gameSpeed < 2000) {
      // Adiciona um limite para a velocidade, ajuste conforme necessário
      gameSpeed += 20 // Ajuste o incremento para um aumento mais gradual
    }
  })

  const spawnMotoBug = () => {
    const motobug = makeMotobug(k.vec2(k.width() + 50, 777)) // Spawn fora da tela à direita
    motobug.onUpdate(() => {
      const currentSpeed = gameSpeed
      // A lógica original de `gameSpeed + 300` se gameSpeed < 3000 pode ser simplificada
      // se gameSpeed já aumenta progressivamente.
      // Se quiser que os inimigos sejam um pouco mais rápidos:
      // currentSpeed = gameSpeed * 1.1; ou gameSpeed + X_FIXO
      motobug.move(-(currentSpeed + 100), 0) // Ajuste a velocidade do motobug como desejar
    })

    motobug.onExitScreen(() => {
      // Destroi se sair completamente pela esquerda
      if (motobug.pos.x < -motobug.width) {
        k.destroy(motobug)
      }
    })
    // Recursivamente chama spawnMotoBug com um tempo aleatório
    const waitTime = k.rand(1.5, 3.5) // Aumentei um pouco o tempo mínimo para não sobrecarregar
    k.wait(waitTime, spawnMotoBug)
  }

  spawnMotoBug()

  // Função para spawnar notas em vez de anéis
  const spawnNote = () => {
    const note = makeNote(k.vec2(k.width() + 50, k.randi(650, 745))) // Spawn nota em alturas variadas
    note.onUpdate(() => {
      note.move(-gameSpeed, 0)
    })
    note.onExitScreen(() => {
      if (note.pos.x < -note.width) {
        k.destroy(note)
      }
    })
    const waitTime = k.rand(0.8, 2.5)
    k.wait(waitTime, spawnNote)
  }

  spawnNote() // Iniciar o spawn de notas

  // Plataforma de chão estática - usando k.width() para preencher a tela
  k.add([
    k.rect(k.width(), 300),
    k.opacity(0), // Invisível, apenas para colisão
    k.area(),
    k.pos(0, 840),
    k.body({ isStatic: true }),
    "platform",
  ])

  // --- Lógica de atualização (k.onUpdate) ---
  k.onUpdate(() => {
    if (player.isGrounded()) scoreMultiplier = 0

    const backgroundSpeed = gameSpeed * 0.3 // Velocidade do parallax para o fundo

    // Mover e reposicionar as peças do background
    for (const bg of backgroundPieces) {
      bg.move(-backgroundSpeed, 0)

      // Se a peça do background saiu completamente pela esquerda
      if (bg.pos.x + actualBgWidth <= 0) {
        // Move esta peça para a direita, após a última peça visível do background.
        // Como temos duas peças, ela se move duas larguras para frente de sua posição atual.
        bg.pos.x += 2 * actualBgWidth
      }
    }

    // Atualizar texto de debug (opcional)
    if (debugText && backgroundPieces.length >= 2) {
      // Checa se debugText existe
      debugText.text = `BG1 X: ${Math.round(backgroundPieces[0].pos.x)} | BG2 X: ${Math.round(backgroundPieces[1].pos.x)}`
    }

    // Lógica de scroll das plataformas visuais (não colidíveis no seu código original)
    // Certifique-se que platforms[0].width é a largura escalada correta.
    const platformWidth = platforms[0].width // Largura da plataforma já escalada

    platforms[0].move(-gameSpeed, 0)
    platforms[1].moveTo(platforms[0].pos.x + platformWidth, 450) // platforms[1] segue platforms[0]

    // Se a primeira plataforma saiu completamente da tela
    if (platforms[0].pos.x + platformWidth < 0) {
      platforms[0].pos.x = platforms[1].pos.x + platformWidth // Move a antiga platforms[0] para depois da antiga platforms[1]
      platforms.push(platforms.shift()) // Rotaciona o array: a antiga platforms[1] se torna a nova platforms[0]
    }
  })
}
