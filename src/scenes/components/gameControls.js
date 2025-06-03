import k from "../../kaplayCtx"

export function makeGameControls() {
  // Estados dos controles
  let isMusicEnabled = true
  let isSoundEnabled = true
  let isPaused = false
  let pauseOverlay = null
  let controlButtons = []

  // Arrays para armazenar referências dos timers e loops ativos
  let activeTimers = []
  let activeLoops = []
  let pausedTimers = []
  let pausedLoops = []

  // CORREÇÃO 1: Fixar referência da música
  const citySfx = window.gameSoundtrack

  // Função para interceptar e rastrear timers/loops
  const setupTimerTracking = () => {
    // Salvar referências originais
    const originalWait = k.wait
    const originalLoop = k.loop

    // Interceptar k.wait
    k.wait = function(time, callback) {
      const timer = originalWait.call(k, time, callback)
      if (timer && typeof timer === 'object') {
        activeTimers.push(timer)
      }
      return timer
    }

    // Interceptar k.loop  
    k.loop = function(interval, callback) {
      const loop = originalLoop.call(k, interval, callback)
      if (loop && typeof loop === 'object') {
        activeLoops.push(loop)
      }
      return loop
    }
  }

  // Função para pausar todos os timers e loops
  const pauseAllTimers = () => {
    // Pausar timers ativos
    activeTimers.forEach(timer => {
      if (timer && timer.paused !== undefined && !timer.paused) {
        timer.paused = true
        pausedTimers.push(timer)
      }
    })

    // Pausar loops ativos
    activeLoops.forEach(loop => {
      if (loop && loop.paused !== undefined && !loop.paused) {
        loop.paused = true
        pausedLoops.push(loop)
      }
    })

    console.log(`Pausados: ${pausedTimers.length} timers, ${pausedLoops.length} loops`)
  }

  // Função para retomar todos os timers e loops
  const resumeAllTimers = () => {
    // Retomar timers pausados
    pausedTimers.forEach(timer => {
      if (timer && timer.paused !== undefined) {
        timer.paused = false
      }
    })

    // Retomar loops pausados
    pausedLoops.forEach(loop => {
      if (loop && loop.paused !== undefined) {
        loop.paused = false
      }
    })

    console.log(`Retomados: ${pausedTimers.length} timers, ${pausedLoops.length} loops`)

    // Limpar arrays de pausados
    pausedTimers = []
    pausedLoops = []
  }

  // Função para limpar timers/loops finalizados dos arrays
  const cleanupFinishedTimers = () => {
    activeTimers = activeTimers.filter(timer => 
      timer && (timer.paused !== undefined || timer.time !== undefined)
    )
    activeLoops = activeLoops.filter(loop => 
      loop && (loop.paused !== undefined || loop.time !== undefined)
    )
  }

  // CORREÇÃO: Versão melhorada do controle de música
  const toggleMusic = () => {
    isMusicEnabled = !isMusicEnabled
    
    // Buscar a música tanto pelo nome antigo quanto novo
    const citySfx = window.gameSoundtrack || window.gameSoundstack
    
    if (citySfx) {
      if (isMusicEnabled) {
        citySfx.paused = false
        citySfx.volume = 0.7
        console.log("Música ativada")
      } else {
        citySfx.paused = true
        console.log("Música pausada")
      }
    } else {
      console.warn("Referência da música não encontrada")
    }
    
    updateMusicButton()
    console.log(`Música ${isMusicEnabled ? 'ligada' : 'desligada'}`)
  }

  // CORREÇÃO 2: Versão melhorada do controle de sons
  const toggleSound = () => {
    isSoundEnabled = !isSoundEnabled
    
    // Guardar referência do volume original da música
    const citySfx = window.gameSoundtrack || window.gameSoundstack
    const originalMusicVolume = citySfx ? citySfx.volume : 0.7
    
    if (isSoundEnabled) {
      // Restaurar apenas efeitos sonoros
      k.volume(1.0)
      // Manter música no volume original se estiver habilitada
      if (citySfx && isMusicEnabled) {
        citySfx.volume = originalMusicVolume
      }
    } else {
      // Silenciar efeitos sonoros
      k.volume(0.0)
      // Manter música se estiver habilitada
      if (citySfx && isMusicEnabled) {
        citySfx.volume = originalMusicVolume
      }
    }
    
    updateSoundButton()
    console.log(`Sons ${isSoundEnabled ? 'ligados' : 'desligados'}`)
  }

  // Função melhorada para pausar/despausar o jogo
  const togglePause = () => {
    isPaused = !isPaused
    
    if (isPaused) {
      console.log("🛑 PAUSANDO JOGO COMPLETO...")
      
      // 1. Pausar todos os objetos do jogo (exceto elementos fixos da UI)
      k.get("*").forEach(obj => {
        if (obj.paused !== undefined && !obj.fixed) {
          obj.paused = true
        }
      })
      
      // 2. Pausar todos os timers e loops ativos
      pauseAllTimers()
      
      // 3. Pausar música se estiver tocando
      if (citySfx && !citySfx.paused && isMusicEnabled) {
        citySfx.paused = true
      }
      
      // 4. Pausar o contexto de áudio global (para todos os sons)
      if (k.audioCtx && k.audioCtx.state === 'running') {
        k.audioCtx.suspend()
      }
      
      showPauseOverlay()
      
    } else {
      console.log("▶️ RETOMANDO JOGO COMPLETO...")
      
      // 1. Despausar todos os objetos do jogo
      k.get("*").forEach(obj => {
        if (obj.paused !== undefined && !obj.fixed) {
          obj.paused = false
        }
      })
      
      // 2. Retomar todos os timers e loops
      resumeAllTimers()
      
      // 3. Retomar música se estava habilitada
      if (citySfx && citySfx.paused && isMusicEnabled) {
        citySfx.paused = false
      }
      
      // 4. Retomar o contexto de áudio global
      if (k.audioCtx && k.audioCtx.state === 'suspended') {
        k.audioCtx.resume()
      }
      
      // 5. Limpar timers finalizados
      cleanupFinishedTimers()
      
      hidePauseOverlay()
    }
    
    console.log(`Jogo ${isPaused ? 'pausado' : 'despausado'} - Timers ativos: ${activeTimers.length}, Loops ativos: ${activeLoops.length}`)
  }

  // Criar overlay de pausa
  const showPauseOverlay = () => {
    pauseOverlay = k.add([
      k.rect(k.width(), k.height()),
      k.color(0, 0, 0, 0.8),
      k.pos(0, 0),
      k.fixed(),
      k.z(9999),
    ])

    // Texto de pausa
    pauseOverlay.add([
      k.text("JOGO PAUSADO", { 
        font: "mania", 
        size: 96 
      }),
      k.anchor("center"),
      k.pos(k.width() / 2, k.height() / 2 - 100),
      k.color(255, 255, 255),
    ])

    // Instruções
    pauseOverlay.add([
      k.text("Pressione ESC ou clique em CONTINUAR para retomar", { 
        font: "mania", 
        size: 48 
      }),
      k.anchor("center"),
      k.pos(k.width() / 2, k.height() / 2),
      k.color(200, 200, 200),
    ])

    // Botão continuar
    const continueButton = pauseOverlay.add([
      k.rect(200, 60, { radius: 8 }),
      k.color(0, 100, 200),
      k.outline(4, k.Color.fromArray([255, 255, 255])),
      k.anchor("center"),
      k.area(),
      k.pos(k.width() / 2, k.height() / 2 + 100),
    ])

    continueButton.add([
      k.text("CONTINUAR", { font: "mania", size: 32 }),
      k.anchor("center"),
      k.color(255, 255, 255)
    ])

    continueButton.onHover(() => {
      continueButton.color = k.Color.fromArray([0, 120, 220])
    })

    continueButton.onHoverEnd(() => {
      continueButton.color = k.Color.fromArray([0, 100, 200])
    })

    continueButton.onClick(() => {
      if (isSoundEnabled) k.play("ring", { volume: 0.3 })
      togglePause()
    })
  }

  // Esconder overlay de pausa
  const hidePauseOverlay = () => {
    if (pauseOverlay && pauseOverlay.exists()) {
      k.destroy(pauseOverlay)
      pauseOverlay = null
    }
  }

  // Criar botão de música
  const createMusicButton = () => {
    const musicButton = k.add([
      k.rect(60, 60, { radius: 8 }),
      k.color(0, 0, 0, 0.7),
      k.outline(3, k.Color.fromArray([255, 255, 255])),
      k.anchor("center"),
      k.area(),
      k.pos(k.width() - 205, 1040), // Posição ajustada para a direita
      k.fixed(),
      k.z(1001),
      "musicButton"
    ])

    const musicIcon = musicButton.add([
      k.text("♪", { font: "mania", size: 32 }),
      k.anchor("center"),
      k.color(255, 255, 255),
      "musicIcon"
    ])

    musicButton.onHover(() => {
      musicButton.outline.width = 5
      musicButton.color = k.Color.fromArray([0, 0, 0, 0.9])
    })

    musicButton.onHoverEnd(() => {
      musicButton.outline.width = 3
      musicButton.color = k.Color.fromArray([0, 0, 0, 0.7])
    })

    // CORREÇÃO 3: Melhorar controle do som do botão
    musicButton.onClick(() => {
      if (isSoundEnabled) k.play("ring", { volume: 0.3 })
      toggleMusic()
    })

    controlButtons.push(musicButton)
    return musicButton
  }

  // Criar botão de som
  const createSoundButton = () => {
    const soundButton = k.add([
      k.rect(60, 60, { radius: 8 }),
      k.color(0, 0, 0, 0.7),
      k.outline(3, k.Color.fromArray([255, 255, 255])),
      k.anchor("center"),
      k.area(),
      k.pos(k.width() - 125, 1040), // Posição ajustada para a direita
      k.fixed(),
      k.z(1001),
      "soundButton"
    ])

    const soundIcon = soundButton.add([
      k.text("🔊", { font: "mania", size: 24 }),
      k.anchor("center"),
      k.color(255, 255, 255),
      "soundIcon"
    ])

    soundButton.onHover(() => {
      soundButton.outline.width = 5
      soundButton.color = k.Color.fromArray([0, 0, 0, 0.9])
    })

    soundButton.onHoverEnd(() => {
      soundButton.outline.width = 3
      soundButton.color = k.Color.fromArray([0, 0, 0, 0.7])
    })

    // CORREÇÃO 3: Para o botão de som, sempre tocar o feedback (antes de alterar)
    soundButton.onClick(() => {
      k.play("ring", { volume: 0.3 })
      toggleSound()
    })

    controlButtons.push(soundButton)
    return soundButton
  }

  // Criar botão de pausa
  const createPauseButton = () => {
    const pauseButton = k.add([
      k.rect(60, 60, { radius: 8 }),
      k.color(0, 0, 0, 0.7),
      k.outline(3, k.Color.fromArray([255, 255, 255])),
      k.anchor("center"),
      k.area(),
      k.pos(k.width() - 45, 1040), // Posição ajustada para a direita
      k.fixed(),
      k.z(1001),
      "pauseButton"
    ])

    const pauseIcon = pauseButton.add([
      k.text("⏸", { font: "mania", size: 24 }),
      k.anchor("center"),
      k.color(255, 255, 255),
      "pauseIcon"
    ])

    pauseButton.onHover(() => {
      pauseButton.outline.width = 5
      pauseButton.color = k.Color.fromArray([0, 0, 0, 0.9])
    })

    pauseButton.onHoverEnd(() => {
      pauseButton.outline.width = 3
      pauseButton.color = k.Color.fromArray([0, 0, 0, 0.7])
    })

    // CORREÇÃO 3: Melhorar controle do som do botão
    pauseButton.onClick(() => {
      if (isSoundEnabled) k.play("ring", { volume: 0.3 })
      togglePause()
    })

    controlButtons.push(pauseButton)
    return pauseButton
  }

  // Atualizar aparência do botão de música
  const updateMusicButton = () => {
    const musicButton = k.get("musicButton")[0]
    const musicIcon = k.get("musicIcon")[0]
    
    if (musicButton && musicIcon) {
      if (isMusicEnabled) {
        musicButton.color = k.Color.fromArray([0, 100, 0, 0.7]) // Verde
        musicIcon.text = "♪"
        musicIcon.color = k.Color.fromArray([255, 255, 255])
      } else {
        musicButton.color = k.Color.fromArray([100, 0, 0, 0.7]) // Vermelho
        musicIcon.text = "♪"
        musicIcon.color = k.Color.fromArray([150, 150, 150])
      }
    }
  }

  // Atualizar aparência do botão de som
  const updateSoundButton = () => {
    const soundButton = k.get("soundButton")[0]
    const soundIcon = k.get("soundIcon")[0]
    
    if (soundButton && soundIcon) {
      if (isSoundEnabled) {
        soundButton.color = k.Color.fromArray([0, 100, 0, 0.7]) // Verde
        soundIcon.text = "🔊"
        soundIcon.color = k.Color.fromArray([255, 255, 255])
      } else {
        soundButton.color = k.Color.fromArray([100, 0, 0, 0.7]) // Vermelho
        soundIcon.text = "🔇"
        soundIcon.color = k.Color.fromArray([150, 150, 150])
      }
    }
  }

  // CORREÇÃO 4: Controle por teclado ajustado
  const setupKeyboardControls = () => {
    k.onKeyPress("escape", () => {
      togglePause()
    })

    k.onKeyPress("m", () => {
      if (isSoundEnabled) k.play("ring", { volume: 0.3 })
      toggleMusic()
    })

    k.onKeyPress("s", () => {
      k.play("ring", { volume: 0.3 }) // Sempre tocar para feedback
      toggleSound()
    })
  }

  // Inicializar controles
  const init = () => {
    // Configurar rastreamento de timers PRIMEIRO
    setupTimerTracking()
    
    // Criar botões
    createMusicButton()
    createSoundButton()
    createPauseButton()
    setupKeyboardControls()
    
    // Atualizar aparência inicial
    updateMusicButton()
    updateSoundButton()
    
    console.log("🎮 Controles avançados do jogo inicializados")
    console.log("⌨️ Teclas: ESC (pausar), M (música), S (sons)")
    console.log("🔧 Sistema de pausa completa ativado")
  }

  // Função para limpar controles (útil ao trocar de cena)
  const cleanup = () => {
    // Limpar botões
    controlButtons.forEach(button => {
      if (button && button.exists()) {
        k.destroy(button)
      }
    })
    
    // Limpar overlay
    if (pauseOverlay && pauseOverlay.exists()) {
      k.destroy(pauseOverlay)
    }
    
    // Limpar arrays
    controlButtons = []
    activeTimers = []
    activeLoops = []
    pausedTimers = []
    pausedLoops = []
    pauseOverlay = null
    
    console.log("🧹 Controles do jogo limpos")
  }

  // Retornar objeto com as funções públicas
  return {
    init,
    cleanup,
    toggleMusic,
    toggleSound,
    togglePause,
    isMusicEnabled: () => isMusicEnabled,
    isSoundEnabled: () => isSoundEnabled,
    isPaused: () => isPaused,
    // Funções de debug
    getActiveTimers: () => activeTimers.length,
    getActiveLoops: () => activeLoops.length
  }
}