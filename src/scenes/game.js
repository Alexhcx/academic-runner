import k from "../kaplayCtx"
import { makePlayer } from "../entities/player"
import { makeMotobug } from "../entities/motobug"
import { makeNote } from "../entities/note"

export default function game() {
  const citySfx = window.gameSoundtrack
  if (citySfx && citySfx.paused) {
    citySfx.paused = false
  }
  k.setGravity(3100)

  // Configurações do Background
  const bgY = -26
  const bgOpacity = 0.8
  const bgScale = 2

  // Sistema de gerenciamento de cenários
  const stages = [
    { 
      bg: "fase01", 
      platform: "platforms",
      name: "Fase 1"
    },
    { 
      bg: "fase02", 
      platform: "platforms02",
      name: "Fase 2"
    }
  ]
  
  let currentStageIndex = 0
  let stageRepeatCount = 0
  const maxRepeatsPerStage = 1

  // Variáveis para controle do fade
  let isTransitioning = false

  // Arrays para gerenciar as peças (serão recriados a cada transição)
  let backgroundPieces = []
  let platforms = []
  let actualBgWidth = 0

  // CORREÇÃO 1: Criar player primeiro e garantir Z-index alto
  const selectedCharacter = k.getData("selected-character") || "gleisla"
  const player = makePlayer(k.vec2(200, 745), selectedCharacter)

  // Garantir que o player tenha z-index alto para ficar sempre na frente
  player.z = 1000

  player.setControls()
  player.setEvents()

  // VARIÁVEL CRÍTICA: Salvar referência original da opacidade do player
  let playerOriginalOpacity = 1
  
  // GARANTIR que o player inicie com opacidade correta
  if (player && player.opacity !== undefined) {
    player.opacity = 1
    playerOriginalOpacity = 1
  }

  // Função para obter o cenário atual
  const getCurrentStage = () => stages[currentStageIndex]

  // CORREÇÃO 2: Função melhorada para criar elementos do cenário
  const createSceneryElements = (isInitial = false) => {
    // Pausar temporariamente a atualização do player durante a recriação
    const wasPlayerFrozen = player.paused || false
    
    // Destruir elementos antigos se existirem
    backgroundPieces.forEach(bg => {
      if (bg && bg.exists()) {
        k.destroy(bg)
      }
    })
    
    platforms.forEach(platform => {
      if (platform && platform.exists()) {
        k.destroy(platform)
      }
    })

    // Aguardar um frame para garantir que a destruição foi processada
    k.wait(0, () => {
      // Criar novos elementos do background com Z-index baixo
      // Se for inicial, começar visível; se for transição, começar invisível
      const initialOpacity = isInitial ? bgOpacity : 0
      
      const bg1 = k.add([
        k.sprite(getCurrentStage().bg),
        k.pos(0, bgY),
        k.scale(bgScale),
        k.opacity(initialOpacity),
        k.z(-100), // Z-index baixo para ficar atrás
        "background_piece",
      ])
      
      actualBgWidth = bg1.width + 5720

      const bg2 = k.add([
        k.sprite(getCurrentStage().bg),
        k.pos(actualBgWidth, bgY),
        k.scale(bgScale),
        k.opacity(initialOpacity),
        k.z(-100), // Z-index baixo para ficar atrás
        "background_piece",
      ])

      backgroundPieces = [bg1, bg2]

      // Criar novas plataformas visuais com Z-index médio
      // Se for inicial, começar visível; se for transição, começar invisível
      const platformInitialOpacity = isInitial ? 1 : 0
      
      const platform1 = k.add([
        k.sprite(getCurrentStage().platform), 
        k.pos(0, 450), 
        k.scale(4), 
        k.opacity(platformInitialOpacity),
        k.z(-50), // Z-index médio
      ])
      
      const platform2 = k.add([
        k.sprite(getCurrentStage().platform), 
        k.pos(384, 450), 
        k.scale(4), 
        k.opacity(platformInitialOpacity),
        k.z(-50), // Z-index médio
      ])

      platforms = [platform1, platform2]
      
      // Reconfirmar Z-index do player após criar novos elementos
      player.z = 1000
      
      console.log(`Elementos do cenário ${isInitial ? 'iniciais' : 'recriados'} para: ${getCurrentStage().name}`)
    })
  }

  // CORREÇÃO 3: Tweens mais seguros que não afetam outros objetos
  const fadeOutScenery = (duration = 0.3) => {
    return new Promise((resolve) => {
      // Proteger player antes de iniciar tweens
      const originalPlayerZ = player.z
      player.z = 1000
      
      // FORÇA a opacidade do player antes de começar
      if (player && player.opacity !== undefined) {
        playerOriginalOpacity = player.opacity
        player.opacity = 1
      }

      let completedTweens = 0
      const totalTweens = backgroundPieces.length + platforms.length

      const onTweenComplete = () => {
        completedTweens++
        if (completedTweens >= totalTweens) {
          // Reconfirmar Z-index e opacidade do player
          player.z = 1000
          if (player && player.opacity !== undefined) {
            player.opacity = 1
          }
          resolve()
        }
      }

      // Fade out APENAS dos backgrounds específicos
      backgroundPieces.forEach((bg, index) => {
        if (bg && bg.exists()) {
          // Usar tween mais específico que só afeta o objeto target
          const tween = k.tween(
            bg.opacity,
            0,
            duration,
            (val) => {
              if (bg && bg.exists()) {
                bg.opacity = val
              }
              // PROTEÇÃO ATIVA: força Z-index e opacidade do player a cada frame
              player.z = 1000
              if (player && player.opacity !== undefined) {
                player.opacity = 1
              }
            },
            k.easings.easeOutQuad
          )
          tween.onEnd(() => {
            // Garantir que o player não foi afetado
            player.z = 1000
            if (player && player.opacity !== undefined) {
              player.opacity = 1
            }
            onTweenComplete()
          })
        } else {
          onTweenComplete()
        }
      })
      
      // Fade out APENAS das plataformas específicas
      platforms.forEach((platform, index) => {
        if (platform && platform.exists()) {
          const tween = k.tween(
            platform.opacity,
            0,
            duration,
            (val) => {
              if (platform && platform.exists()) {
                platform.opacity = val
              }
              // PROTEÇÃO ATIVA: força Z-index e opacidade do player a cada frame
              player.z = 1000
              if (player && player.opacity !== undefined) {
                player.opacity = 1
              }
            },
            k.easings.easeOutQuad
          )
          tween.onEnd(() => {
            // Garantir que o player não foi afetado
            player.z = 1000
            if (player && player.opacity !== undefined) {
              player.opacity = 1
            }
            onTweenComplete()
          })
        } else {
          onTweenComplete()
        }
      })
    })
  }

  const fadeInScenery = (duration = 0.3) => {
    return new Promise((resolve) => {
      // Proteger player antes de iniciar tweens
      player.z = 1000
      
      // FORÇA a opacidade do player antes de começar
      if (player && player.opacity !== undefined) {
        player.opacity = 1
      }

      let completedTweens = 0
      const totalTweens = backgroundPieces.length + platforms.length

      const onTweenComplete = () => {
        completedTweens++
        if (completedTweens >= totalTweens) {
          // Reconfirmar Z-index e opacidade do player
          player.z = 1000
          if (player && player.opacity !== undefined) {
            player.opacity = 1
          }
          resolve()
        }
      }

      // Fade in APENAS dos backgrounds específicos
      backgroundPieces.forEach((bg, index) => {
        if (bg && bg.exists()) {
          const tween = k.tween(
            0,
            bgOpacity,
            duration,
            (val) => {
              if (bg && bg.exists()) {
                bg.opacity = val
              }
              // PROTEÇÃO ATIVA: força Z-index e opacidade do player a cada frame
              player.z = 1000
              if (player && player.opacity !== undefined) {
                player.opacity = 1
              }
            },
            k.easings.easeInQuad
          )
          tween.onEnd(() => {
            // Garantir que o player não foi afetado
            player.z = 1000
            if (player && player.opacity !== undefined) {
              player.opacity = 1
            }
            onTweenComplete()
          })
        } else {
          onTweenComplete()
        }
      })
      
      // Fade in APENAS das plataformas específicas
      platforms.forEach((platform, index) => {
        if (platform && platform.exists()) {
          const tween = k.tween(
            0,
            1,
            duration,
            (val) => {
              if (platform && platform.exists()) {
                platform.opacity = val
              }
              // PROTEÇÃO ATIVA: força Z-index e opacidade do player a cada frame
              player.z = 1000
              if (player && player.opacity !== undefined) {
                player.opacity = 1
              }
            },
            k.easings.easeInQuad
          )
          tween.onEnd(() => {
            // Garantir que o player não foi afetado
            player.z = 1000
            if (player && player.opacity !== undefined) {
              player.opacity = 1
            }
            onTweenComplete()
          })
        } else {
          onTweenComplete()
        }
      })
    })
  }

  // CORREÇÃO 4: Função de transição mais robusta
  const switchToNextStage = async () => {
    if (isTransitioning) return
    
    stageRepeatCount++
    
    if (stageRepeatCount >= maxRepeatsPerStage) {
      isTransitioning = true
      
      console.log(`Iniciando transição do cenário... Player Z-index: ${player.z}, Opacity: ${player.opacity}`)
      
      // GARANTIR que o player fique visível durante toda a transição
      player.z = 1000
      if (player && player.opacity !== undefined) {
        player.opacity = 1
      }
      
      // 1. Fazer fade out do cenário atual
      await fadeOutScenery(0.25)
      
      console.log(`Fade out completo. Player Z-index: ${player.z}, Opacity: ${player.opacity}`)
      
      // FORÇA novamente após fade out
      player.z = 1000
      if (player && player.opacity !== undefined) {
        player.opacity = 1
      }
      
      // 2. Trocar para o próximo cenário
      currentStageIndex = (currentStageIndex + 1) % stages.length
      stageRepeatCount = 0
      
      // 3. Recriar todos os elementos do cenário
      createSceneryElements()
      
      // 4. Aguardar a recriação dos elementos
      await k.wait(0.1)
      
      // 5. Garantir novamente que o player esteja na frente
      player.z = 1000
      if (player && player.opacity !== undefined) {
        player.opacity = 1
      }
      
      // 6. Atualizar texto de informação do cenário
      stageInfoText.text = `${getCurrentStage().name} - Repetição: ${stageRepeatCount + 1}/${maxRepeatsPerStage}`
      
      console.log(`Cenário trocado para: ${getCurrentStage().name}. Player Z-index: ${player.z}, Opacity: ${player.opacity}`)
      
      // 7. Fazer fade in do novo cenário
      await fadeInScenery(0.25)
      
      console.log(`Transição completa! Player Z-index final: ${player.z}, Opacity: ${player.opacity}`)
      
      // FORÇA final
      player.z = 1000
      if (player && player.opacity !== undefined) {
        player.opacity = 1
      }
      
      isTransitioning = false
    }
  }

  // **INICIALIZAÇÃO**: Criar elementos iniciais do cenário (visíveis desde o início)
  createSceneryElements(true)

  // Debug text
  const debugText = k.add([
    k.text("", { font: "mania", size: 24 }),
    k.pos(1650, 100),
    k.color(255, 255, 255),
    k.fixed(),
  ])

  // Texto para mostrar informações do cenário atual
  const stageInfoText = k.add([
    k.text(`${getCurrentStage().name} - Repetição: ${stageRepeatCount + 1}/${maxRepeatsPerStage}`, { 
      font: "mania", 
      size: 36 
    }),
    k.pos(20, 140),
    k.fixed(),
  ])

  const controlsText = k.add([
    k.text("Pressione Espaço/Clique/Toque para Pular!", {
      font: "mania",
      size: 64,
    }),
    k.anchor("center"),
    k.pos(k.center()),
    k.fixed(),
  ])

  const dismissControlsAction = k.onButtonPress("jump", () => {
    k.destroy(controlsText)
    dismissControlsAction.cancel()
  })

  // Sistema de pontuação
  const scoreText = k.add([
    k.text("MÉDIA: 0.0", { font: "mania", size: 72 }),
    k.pos(20, 20),
    k.fixed(),
  ])

  const notesCollectedText = k.add([
    k.text("NOTAS: 0", { font: "mania", size: 36 }), 
    k.pos(20, 100), 
    k.fixed()
  ])

  const backButton = k.add([
    k.rect(172, 60, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.width() - 100, 50),
    k.fixed(),
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

  // Variáveis de pontuação
  let totalScore = 0
  let notesCollected = 0
  let averageScore = 0
  let scoreMultiplier = 0

  // Colisão com notas
  player.onCollide("note", (note) => {
    k.play("ring", { volume: 0.5 })
    totalScore += note.value
    notesCollected++
    averageScore = notesCollected > 0 ? totalScore / notesCollected : 0

    scoreText.text = `MÉDIA: ${averageScore.toFixed(1)}`
    notesCollectedText.text = `NOTAS: ${notesCollected}`

    player.ringCollectUI.text = `+${note.value}`
    k.wait(1, () => {
      player.ringCollectUI.text = ""
    })

    k.destroy(note)
  })

  // Colisão com inimigos
  player.onCollide("enemy", (enemy) => {
    if (!player.isGrounded()) {
      k.play("destroy", { volume: 0.5 })
      k.play("hyper-ring", { volume: 0.5 })
      k.destroy(enemy)
      player.play("jump")
      player.jump()
      scoreMultiplier += 1

      const bonus = 6
      totalScore += bonus
      notesCollected += 1
      averageScore = totalScore / notesCollected

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
    k.setData("current-score", averageScore)
    k.go("gameover", citySfx)
  })

  //Ajusta a velocidade do jogo
  let gameSpeed = 800
  k.loop(1, () => {
    if (gameSpeed < 3000) {
      gameSpeed += 20
    }
  })

  // Spawn de inimigos
  const spawnMotoBug = () => {
    const motobug = makeMotobug(k.vec2(k.width() + 50, 777))
    motobug.onUpdate(() => {
      const currentSpeed = gameSpeed
      motobug.move(-(currentSpeed + 100), 0)
    })

    motobug.onExitScreen(() => {
      if (motobug.pos.x < -motobug.width) {
        k.destroy(motobug)
      }
    })
    
    const waitTime = k.rand(1.5, 3.5)
    k.wait(waitTime, spawnMotoBug)
  }

  spawnMotoBug()

  // Spawn de notas
  const spawnNote = () => {
    const note = makeNote(k.vec2(k.width() + 50, k.randi(650, 745)))
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

  spawnNote()

  // Plataforma de chão invisível
  k.add([
    k.rect(k.width(), 300),
    k.opacity(0),
    k.area(),
    k.pos(0, 840),
    k.body({ isStatic: true }),
    "platform",
  ])

  // Sistema de controle de distância para troca de cenário
  let distanceTraveled = 0
  const distancePerRepetition = 11440
  let nextSwitchDistance = distancePerRepetition

  // Remover fade in inicial - elementos já começam visíveis
  // fadeInScenery(0.8) - REMOVIDO

  // CORREÇÃO 5: Loop principal com proteção contra ghosting
  k.onUpdate(() => {
    if (player.isGrounded()) scoreMultiplier = 0

    // PROTEÇÃO ANTI-GHOSTING: Manter Z-index e opacidade do player sempre corretos
    if (player.z !== 1000) {
      console.log(`CORRIGINDO Z-index do player de ${player.z} para 1000`)
      player.z = 1000
    }

    // PROTEÇÃO CONTÍNUA: Verificar e corrigir opacidade do player constantemente
    if (player && player.opacity !== undefined && player.opacity !== 1) {
      console.log(`CORRIGINDO opacidade do player de ${player.opacity} para 1`)
      player.opacity = 1
    }

    const backgroundSpeed = gameSpeed * 0.3
    
    // Acumular distância percorrida
    distanceTraveled += backgroundSpeed * k.dt()

    // Verificar se é hora de trocar de cenário
    if (distanceTraveled >= nextSwitchDistance && !isTransitioning) {
      switchToNextStage()
      nextSwitchDistance += distancePerRepetition
    }

    // Mover e reposicionar backgrounds (só se existirem e não estiver em transição)
    if (!isTransitioning && backgroundPieces.length >= 2) {
      for (const bg of backgroundPieces) {
        if (bg && bg.exists()) {
          bg.move(-backgroundSpeed, 0)

          if (bg.pos.x + actualBgWidth <= 0) {
            bg.pos.x += 2 * actualBgWidth
          }
        }
      }
    }

    // Debug text - INCLUIR Z-index e opacidade do player
    if (debugText && backgroundPieces.length >= 2) {
      const bg1Exists = backgroundPieces[0] && backgroundPieces[0].exists()
      const bg2Exists = backgroundPieces[1] && backgroundPieces[1].exists()
      
      debugText.text = `BG1 X: ${bg1Exists ? Math.round(backgroundPieces[0].pos.x) : 'N/A'} | BG2 X: ${bg2Exists ? Math.round(backgroundPieces[1].pos.x) : 'N/A'} | Player Z: ${player.z} | Op: ${player.opacity} | Dist: ${Math.round(distanceTraveled)}`
    }

    // Lógica das plataformas visuais (só se existirem e não estiver em transição)
    if (!isTransitioning && platforms.length >= 2) {
      const platform1Exists = platforms[0] && platforms[0].exists()
      const platform2Exists = platforms[1] && platforms[1].exists()
      
      if (platform1Exists && platform2Exists) {
        const platformWidth = platforms[0].width

        platforms[0].move(-gameSpeed, 0)
        platforms[1].moveTo(platforms[0].pos.x + platformWidth, 450)

        if (platforms[0].pos.x + platformWidth < 0) {
          platforms[0].pos.x = platforms[1].pos.x + platformWidth
          platforms.push(platforms.shift())
        }
      }
    }
  })
}