import k from "../kaplayCtx"
import { makePlayer } from "../entities/player"
import { makeMotobug } from "../entities/motobug"
import { makeNote } from "../entities/note"
import { makeTextShadow } from "../scenes/components/textBackgroundShadow"
import { makeGameControls } from "../scenes/components/gameControls"

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
  const maxRepeatsPerStage = 3

  // Variáveis para controle do fade
  let isTransitioning = false

  // Arrays para gerenciar as peças
  let backgroundPieces = []
  let platforms = []
  let actualBgWidth = 0
  let actualPlatformWidth = 0

  // CORREÇÃO 1: Criar player primeiro e garantir Z-index alto
  const selectedCharacter = k.getData("selected-character") || "gleisla"
  const player = makePlayer(k.vec2(200, 745), selectedCharacter)

  // Garantir que o player tenha z-index alto para ficar sempre na frente
  player.z = 1000

  player.setControls()
  player.setEvents()

  const gameControls = makeGameControls()
  gameControls.init()

  // VARIÁVEL CRÍTICA: Salvar referência original da opacidade do player
  let playerOriginalOpacity = 1
  
  // GARANTIR que o player inicie com opacidade correta
  if (player && player.opacity !== undefined) {
    player.opacity = 1
    playerOriginalOpacity = 1
  }

  // Função para obter o cenário atual
  const getCurrentStage = () => stages[currentStageIndex]

  // CORREÇÃO PRINCIPAL: Função melhorada para criar elementos com sincronização perfeita
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
      const initialOpacity = isInitial ? bgOpacity : 0
      
      const bg1 = k.add([
        k.sprite(getCurrentStage().bg),
        k.pos(0, bgY),
        k.scale(bgScale),
        k.opacity(initialOpacity),
        k.z(-100),
        "background_piece",
      ])
      
      actualBgWidth = bg1.width + 5720

      const bg2 = k.add([
        k.sprite(getCurrentStage().bg),
        k.pos(actualBgWidth, bgY),
        k.scale(bgScale),
        k.opacity(initialOpacity),
        k.z(-100),
        "background_piece",
      ])

      backgroundPieces = [bg1, bg2]

      // CORREÇÃO: Criar plataformas com a MESMA lógica de posicionamento do background
      const platformInitialOpacity = isInitial ? 1 : 0
      
      const platform1 = k.add([
        k.sprite(getCurrentStage().platform), 
        k.pos(0, 450), 
        k.scale(4), 
        k.opacity(platformInitialOpacity),
        k.z(-50),
      ])
      
      // IMPORTANTE: Usar a mesma largura calculada do background
      actualPlatformWidth = actualBgWidth // Mesmo valor que o background
      
      const platform2 = k.add([
        k.sprite(getCurrentStage().platform), 
        k.pos(actualPlatformWidth, 450), // Usar a mesma largura do background
        k.scale(4), 
        k.opacity(platformInitialOpacity),
        k.z(-50),
      ])

      platforms = [platform1, platform2]
      
      // Reconfirmar Z-index do player após criar novos elementos
      player.z = 1000
      
      console.log(`Elementos criados - BG Width: ${actualBgWidth}, Platform Width: ${actualPlatformWidth}`)
      console.log(`Elementos do cenário ${isInitial ? 'iniciais' : 'recriados'} para: ${getCurrentStage().name}`)
    })
  }

  // NOVA FUNÇÃO: Criar elementos sem fade (para repetições)
  const createSceneryElementsWithoutFade = () => {
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
      // Criar novos elementos do background com OPACIDADE TOTAL (sem fade)
      const bg1 = k.add([
        k.sprite(getCurrentStage().bg),
        k.pos(0, bgY),
        k.scale(bgScale),
        k.opacity(bgOpacity), // Opacidade total desde o início
        k.z(-100),
        "background_piece",
      ])
      
      actualBgWidth = bg1.width + 5720

      const bg2 = k.add([
        k.sprite(getCurrentStage().bg),
        k.pos(actualBgWidth, bgY),
        k.scale(bgScale),
        k.opacity(bgOpacity), // Opacidade total desde o início
        k.z(-100),
        "background_piece",
      ])

      backgroundPieces = [bg1, bg2]

      // Criar plataformas com OPACIDADE TOTAL (sem fade)
      const platform1 = k.add([
        k.sprite(getCurrentStage().platform), 
        k.pos(0, 450), 
        k.scale(4), 
        k.opacity(1), // Opacidade total desde o início
        k.z(-50),
      ])
      
      actualPlatformWidth = actualBgWidth
      
      const platform2 = k.add([
        k.sprite(getCurrentStage().platform), 
        k.pos(actualPlatformWidth, 450),
        k.scale(4), 
        k.opacity(1), // Opacidade total desde o início
        k.z(-50),
      ])

      platforms = [platform1, platform2]
      
      // Reconfirmar Z-index do player após criar novos elementos
      player.z = 1000
      
      console.log(`Elementos recriados SEM FADE - BG Width: ${actualBgWidth}, Platform Width: ${actualPlatformWidth}`)
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
          const tween = k.tween(
            bg.opacity,
            0,
            duration,
            (val) => {
              if (bg && bg.exists()) {
                bg.opacity = val
              }
              player.z = 1000
              if (player && player.opacity !== undefined) {
                player.opacity = 1
              }
            },
            k.easings.easeOutQuad
          )
          tween.onEnd(() => {
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
              player.z = 1000
              if (player && player.opacity !== undefined) {
                player.opacity = 1
              }
            },
            k.easings.easeOutQuad
          )
          tween.onEnd(() => {
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
              player.z = 1000
              if (player && player.opacity !== undefined) {
                player.opacity = 1
              }
            },
            k.easings.easeInQuad
          )
          tween.onEnd(() => {
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
              player.z = 1000
              if (player && player.opacity !== undefined) {
                player.opacity = 1
              }
            },
            k.easings.easeInQuad
          )
          tween.onEnd(() => {
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

  // **INICIALIZAÇÃO**: Criar elementos iniciais do cenário (visíveis desde o início)
  createSceneryElements(true)

  makeTextShadow()
  // Debug text
  const debugText = k.add([
    k.text("", { font: "mania", size: 24 }),
    k.pos(1390, 100),
    k.color(255, 255, 255),
    k.fixed(),
  ]);

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
    k.pos(20, 12),
    k.fixed(),
  ])

  const notesCollectedText = k.add([
    k.text("NOTAS: 0", { font: "mania", size: 36 }), 
    k.pos(20, 100), 
    k.fixed()
  ])

  // ========================================
  // ADIÇÕES: Sistema de preview da próxima nota
  // ========================================
  let nextNoteValue = k.randi(0, 11) // Próxima nota que será gerada
  let nextNoteAfterThat = k.randi(0, 11) // Nota após a próxima

  // Texto para mostrar a próxima nota
  // const nextNoteText = k.add([
  //   k.text(`PRÓXIMA NOTA: ${nextNoteValue}`, { 
  //     font: "mania", 
  //     size: 48,
  //     align: "center" 
  //   }),
  //   k.pos(1000, 50),
  //   k.anchor("center"),
  //   k.color(255, 255, 255), // Cor amarela para destacar
  //   k.fixed(),
  // ])

  // Preview visual da próxima nota
  let nextNotePreview = k.add([
    k.sprite(`note${nextNoteValue}`),
    k.pos(1000, 140),
    k.anchor("center"),
    k.scale(1.5),
    k.fixed(),
  ])

  const backButton = k.add([
    k.rect(172, 60, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(1820, 40),
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

player.onCollide("enemy", (enemy) => {
  // Se está pulando (não está no chão), mantém a lógica original
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

  // NOVA LÓGICA: Se está correndo (no chão)
  k.play("hurt", { volume: 0.5 })
  k.destroy(enemy)
  
  // Adicionar uma nota com valor 0
  totalScore += 0 // Adiciona 0 ao score
  notesCollected++
  averageScore = notesCollected > 0 ? totalScore / notesCollected : 0

  // Atualizar textos de pontuação
  scoreText.text = `MÉDIA: ${averageScore.toFixed(1)}`
  notesCollectedText.text = `NOTAS: ${notesCollected}`

  // Mostrar feedback visual da nota 0
  player.ringCollectUI.text = `+0`
  k.wait(1, () => {
    player.ringCollectUI.text = ""
  })

  // Reduzir velocidade do jogo em 10%
  gameSpeed = gameSpeed * 0.9
  console.log(`Velocidade reduzida para: ${Math.round(gameSpeed)}`)
})

  // Ajusta a velocidade do jogo
  let gameSpeed = 1200
  k.loop(1, () => {
    if (gameSpeed < 5000) {
      gameSpeed += 25
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

  // MODIFICAÇÃO: Spawn de notas com sistema de preview
  const spawnNote = () => {
    // Usar o valor pré-definido da próxima nota
    const note = makeNote(k.vec2(k.width() + 50, k.randi(650, 745)), nextNoteValue)
    
    note.onUpdate(() => {
      note.move(-gameSpeed, 0)
    })
    
    note.onExitScreen(() => {
      if (note.pos.x < -note.width) {
        k.destroy(note)
      }
    })
    
    // Atualizar o sistema de preview para a próxima nota
    nextNoteValue = nextNoteAfterThat
    nextNoteAfterThat = k.randi(0, 11)
    
    // Atualizar o texto de preview
    // nextNoteText.text = `PRÓXIMA NOTA: ${nextNoteValue}`
    
    // Atualizar o sprite de preview
    if (nextNotePreview && nextNotePreview.exists()) {
      k.destroy(nextNotePreview)
    }
    nextNotePreview = k.add([
      k.sprite(`note${nextNoteValue}`),
      k.pos(1000, 83),
      k.anchor("center"),
      k.scale(1.5),
      k.fixed(),
    ])
    
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

  // CORREÇÃO PRINCIPAL: Sistema que só faz fade quando troca de cenário
  
  // 1. Substituir as variáveis de controle de distância:
  let distanceTraveled = 0
  const distancePerRepetition = 11440
  let nextSwitchDistance = distancePerRepetition

  // CORREÇÃO: Variáveis de fade só para mudança de cenário real
  let nextScenarioChangeDistance = distancePerRepetition * maxRepeatsPerStage // Só após todas as repetições
  const fadeStartOffset = 500
  let nextFadeStartDistance = nextScenarioChangeDistance - fadeStartOffset
  let isFading = false

  // Função corrigida switchToNextStage - VERSÃO COMPLETA CORRIGIDA:
  const switchToNextStage = async () => {
    if (isTransitioning) return
    
    isTransitioning = true
    stageRepeatCount++
    
    console.log(`Transição iniciada - Repetição: ${stageRepeatCount}/${maxRepeatsPerStage}`)
    
    // GARANTIR que o player fique visível
    player.z = 1000
    if (player && player.opacity !== undefined) {
      player.opacity = 1
    }
    
    // DECISÃO: Verificar se é troca de cenário ou apenas repetição
    const isScenarioChange = stageRepeatCount >= maxRepeatsPerStage
    
    if (isScenarioChange) {
      console.log(`MUDANÇA DE CENÁRIO: ${getCurrentStage().name} → próximo cenário`)
      
      // APENAS na mudança de cenário: fazer fade out (se ainda não foi feito)
      if (!isFading) {
        await fadeOutScenery(0.2)
      }
      
      // Trocar para o próximo cenário
      currentStageIndex = (currentStageIndex + 1) % stages.length
      stageRepeatCount = 0
      
      console.log(`Cenário trocado para: ${getCurrentStage().name}`)
      
      // Recriar elementos para o novo cenário
      createSceneryElements()
      
      // Aguardar recriação
      await k.wait(0.00)
      
      // Garantir player na frente
      player.z = 1000
      if (player && player.opacity !== undefined) {
        player.opacity = 1
      }
      
      // APENAS na mudança de cenário: fazer fade in
      await fadeInScenery(0.4)
      console.log(`Fade in completo para: ${getCurrentStage().name}`)
      
    } else {
      console.log(`REPETIÇÃO do cenário: ${getCurrentStage().name} (${stageRepeatCount + 1}/${maxRepeatsPerStage})`)
      
      // Em repetições: SEM fade, apenas recriar elementos instantaneamente COM OPACIDADE TOTAL
      createSceneryElementsWithoutFade()
      
      // Aguardar recriação
      await k.wait(0.02)
      
      // Garantir player na frente
      player.z = 1000
      if (player && player.opacity !== undefined) {
        player.opacity = 1
      }
    }
    
    // Atualizar texto
    stageInfoText.text = `${getCurrentStage().name} - Repetição: ${stageRepeatCount + 1}/${maxRepeatsPerStage}`
    
    // Garantir player visível
    player.z = 1000
    if (player && player.opacity !== undefined) {
      player.opacity = 1
    }
    
    isFading = false
    isTransitioning = false
  }

  // 3. Lógica corrigida no onUpdate():
  k.onUpdate(() => {
    if (player.isGrounded()) scoreMultiplier = 0

    // Proteção do player
    if (player.z !== 1000) {
      player.z = 1000
    }
    if (player && player.opacity !== undefined && player.opacity !== 1) {
      player.opacity = 1
    }

    const backgroundSpeed = gameSpeed * 0.5
    distanceTraveled += backgroundSpeed * k.dt()

    // CORREÇÃO: Fade antecipado APENAS quando está próximo de uma mudança real de cenário
    const isNearScenarioChange = distanceTraveled >= nextFadeStartDistance
    
    if (isNearScenarioChange && !isFading && !isTransitioning) {
      // Verificar se a próxima transição será realmente uma mudança de cenário
      const nextRepetitionCount = stageRepeatCount + 1
      const willChangeScenario = nextRepetitionCount >= maxRepeatsPerStage
      
      if (willChangeScenario) {
        isFading = true
        console.log(`Iniciando fade antecipado - MUDANÇA DE CENÁRIO em breve`)
        
        fadeOutScenery(0.6).then(() => {
          console.log('Fade out antecipado completo')
        })
      }
    }

    // Fazer transição a cada distancePerRepetition (mas o fade só acontece quando necessário)
    if (distanceTraveled >= nextSwitchDistance && !isTransitioning) {
      switchToNextStage()
      
      // Atualizar próxima distância de transição
      nextSwitchDistance += distancePerRepetition
      
      // CORREÇÃO: Só atualizar distâncias de fade quando realmente for mudar cenário
      const willChangeScenarioNext = (stageRepeatCount + 1) >= maxRepeatsPerStage
      if (willChangeScenarioNext) {
        nextScenarioChangeDistance = nextSwitchDistance + (distancePerRepetition * (maxRepeatsPerStage - 1))
        nextFadeStartDistance = nextScenarioChangeDistance - fadeStartOffset
      }
    }

    // Movimento do cenário (sempre contínuo)
    if (backgroundPieces.length >= 2 && platforms.length >= 2) {
      const validBackgrounds = backgroundPieces.filter(bg => bg && bg.exists())
      const validPlatforms = platforms.filter(platform => platform && platform.exists())
      
      for (const bg of validBackgrounds) {
        bg.move(-backgroundSpeed, 0)
        if (bg.pos.x + actualBgWidth <= 0) {
          bg.pos.x += 2 * actualBgWidth
        }
      }

      for (const platform of validPlatforms) {
        platform.move(-backgroundSpeed, 0)
        if (platform.pos.x + actualPlatformWidth <= 0) {
          platform.pos.x += 2 * actualPlatformWidth
        }
      }
    }

    // Debug melhorado
    if (debugText) {
      const nextRepetition = stageRepeatCount + 1
      const willChangeNext = nextRepetition >= maxRepeatsPerStage
      const status = isFading ? "FADING" : isTransitioning ? "TRANSITIONING" : "NORMAL"
      const distanceToNext = Math.max(0, nextSwitchDistance - distanceTraveled)
      
      debugText.text = `Speed: ${Math.round(gameSpeed)} | ${status} | Next: ${willChangeNext ? 'CHANGE' : 'REPEAT'} | Dist: ${Math.round(distanceToNext)}`
    }
  })
}