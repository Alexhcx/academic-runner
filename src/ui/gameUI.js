import k from "../kaplayCtx";

class GameUI {
  constructor() {
    // Usa a detecção global do HTML
    this.isMobile = window.IS_MOBILE_DEVICE || false;
    console.log(`GameUI initialized - Mobile: ${this.isMobile}`);
    
    this.setupUI();
    this.setupOrientationHandling();
  }

  detectMobile() {
    // Usa a detecção global definida no HTML
    return window.IS_MOBILE_DEVICE || false;
  }

  updateVisibilityForDevice() {
    // Não precisa mais fazer nada aqui, o CSS cuida disso
  }

  setupOrientationHandling() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateUIForOrientation();
      }, 100);
    });

    window.addEventListener('resize', () => {
      this.updateUIForOrientation();
    });
  }

  updateUIForOrientation() {
    const uiLayer = document.getElementById('ui-layer');
    if (!uiLayer) return;

    const isLandscape = window.innerWidth > window.innerHeight;
    uiLayer.className = isLandscape ? 'landscape' : 'portrait';
  }

  setupUI() {
    // Sempre faz o setup, pois o CSS controla a visibilidade
    console.log("Configurando UI...");

    // Jump Button
    const jumpButton = document.getElementById('jump-button');
    if (jumpButton) {
      jumpButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        k.pressButton('jump');
      });
      jumpButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        k.releaseButton('jump');
      });
      jumpButton.addEventListener('mousedown', () => k.pressButton('jump'));
      jumpButton.addEventListener('mouseup', () => k.releaseButton('jump'));
    }

    // Music Button
    const musicButton = document.getElementById('music-button');
    if (musicButton) {
      const updateMusicButton = () => {
        const isMusicEnabled = k.getData('music-enabled') !== false;
        musicButton.textContent = isMusicEnabled ? '♪' : '♫';
        musicButton.style.color = isMusicEnabled ? 'white' : '#666';
      };

      musicButton.addEventListener('click', () => {
        const isMusicEnabled = k.getData('music-enabled') !== false;
        k.setData('music-enabled', !isMusicEnabled);
        updateMusicButton();
        
        if (window.gameSoundtrack) {
          window.gameSoundtrack.paused = !isMusicEnabled;
        }
      });

      updateMusicButton();
    }

    // Sound Button
    const soundButton = document.getElementById('sound-button');
    if (soundButton) {
      const updateSoundButton = () => {
        const isSoundEnabled = k.getData('sound-enabled') !== false;
        soundButton.textContent = isSoundEnabled ? '🔊' : '🔇';
        soundButton.style.color = isSoundEnabled ? 'white' : '#666';
      };

      soundButton.addEventListener('click', () => {
        const isSoundEnabled = k.getData('sound-enabled') !== false;
        k.setData('sound-enabled', !isSoundEnabled);
        updateSoundButton();
      });

      updateSoundButton();
    }

    // Pause Button
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
      pauseButton.addEventListener('click', () => {
        k.pressButton('pause');
      });
    }

    // Ranking Button
    const rankingButton = document.getElementById('ranking-button');
    if (rankingButton) {
      rankingButton.addEventListener('click', () => {
        k.play('ring', { volume: 0.5 });
        k.go('ranking-view');
      });
    }

    // Easy Mode Button
    const easyModeButton = document.getElementById('easy-mode-button');
    if (easyModeButton) {
      const updateEasyModeButton = () => {
        const isEasyMode = k.getData('easy-mode') === true;
        easyModeButton.style.backgroundColor = isEasyMode ? 'rgba(0, 100, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';
        easyModeButton.style.borderColor = isEasyMode ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
      };

      easyModeButton.addEventListener('click', () => {
        const isEasyMode = k.getData('easy-mode') === true;
        k.setData('easy-mode', !isEasyMode);
        updateEasyModeButton();
        k.play('ring', { volume: 0.5 });
        
        // Dispara um evento customizado para notificar o jogo
        window.dispatchEvent(new CustomEvent('easyModeToggled', { 
          detail: { isEasyMode: !isEasyMode } 
        }));
      });

      updateEasyModeButton();
    }

    // Main Menu Button
    const mainMenuButton = document.getElementById('main-menu-button');
    if (mainMenuButton) {
      mainMenuButton.addEventListener('click', () => {
        k.play('ring', { volume: 0.5 });
        k.go('main-menu');
      });
    }

    // Back to Game Button
    const backToGameButton = document.getElementById('back-to-game-button');
    if (backToGameButton) {
      backToGameButton.addEventListener('click', () => {
        k.play('ring', { volume: 0.5 });
        k.go('game');
      });

      // Show/hide based on current scene
      const updateBackToGameVisibility = () => {
        const currentScene = k.getData('current-scene');
        backToGameButton.style.display = currentScene === 'game' ? 'none' : 'block';
      };

      // Update visibility when scene changes
      k.on('sceneEnter', () => {
        k.setData('current-scene', k.getData('current-scene'));
        updateBackToGameVisibility();
      });

      // Initial visibility
      updateBackToGameVisibility();
    }

    // Character Select Button (always visible)
    const characterSelectButton = document.getElementById('character-select-button');
    if (characterSelectButton) {
      characterSelectButton.addEventListener('click', () => {
        k.play('ring', { volume: 0.5 });
        k.go('character-select');
      });
    }

    // Character Selection Buttons (only visible in character select scene)
    const charLeftButton = document.getElementById('char-left-button');
    const charRightButton = document.getElementById('char-right-button');
    const charSelectButton = document.getElementById('char-select-button');

    if (charLeftButton) {
      charLeftButton.addEventListener('click', () => {
        k.play('ring', { volume: 0.5 });
        // Simulate left arrow key press
        const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        window.dispatchEvent(leftEvent);
      });
    }

    if (charRightButton) {
      charRightButton.addEventListener('click', () => {
        k.play('ring', { volume: 0.5 });
        // Simulate right arrow key press
        const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        window.dispatchEvent(rightEvent);
      });
    }

    if (charSelectButton) {
      charSelectButton.addEventListener('click', () => {
        k.play('jump', { volume: 0.5 });
        // Simulate space key press for character selection
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(spaceEvent);
      });
    }

    // Update button visibility based on scene
    const updateButtonVisibility = () => {
      const currentScene = k.getData('current-scene');
      
      // Character selection buttons only in character select scene
      const characterControls = document.querySelector('.character-controls');
      if (characterControls) {
        if (currentScene === 'character-select') {
          characterControls.style.display = 'flex';
          if (charLeftButton) charLeftButton.style.display = 'flex';
          if (charRightButton) charRightButton.style.display = 'flex';
          if (charSelectButton) charSelectButton.style.display = 'flex';
        } else {
          characterControls.style.display = 'none';
          if (charLeftButton) charLeftButton.style.display = 'none';
          if (charRightButton) charRightButton.style.display = 'none';
          if (charSelectButton) charSelectButton.style.display = 'none';
        }
      }
      
      // Jump button visibility - sempre visível agora
      if (jumpButton) {
        jumpButton.style.display = 'flex';
      }
    };

    // Update visibility when scene changes
    k.on('sceneEnter', () => {
      updateButtonVisibility();
    });

    // Initial visibility
    updateButtonVisibility();
  }

  show() {
    // Não precisa fazer nada, o CSS controla a visibilidade
    this.updateButtonStates();
  }

  hide() {
    // Don't hide the UI layer, just update button states
    this.updateButtonStates();
  }

  updateButtonStates() {
    // Update music button
    const musicButton = document.getElementById('music-button');
    if (musicButton) {
      const isMusicEnabled = k.getData('music-enabled') !== false;
      musicButton.textContent = isMusicEnabled ? '♪' : '♫';
      musicButton.style.color = isMusicEnabled ? 'white' : '#666';
    }

    // Update sound button
    const soundButton = document.getElementById('sound-button');
    if (soundButton) {
      const isSoundEnabled = k.getData('sound-enabled') !== false;
      soundButton.textContent = isSoundEnabled ? '🔊' : '🔇';
      soundButton.style.color = isSoundEnabled ? 'white' : '#666';
    }

    // Update easy mode button
    const easyModeButton = document.getElementById('easy-mode-button');
    if (easyModeButton) {
      const isEasyMode = k.getData('easy-mode') === true;
      easyModeButton.style.backgroundColor = isEasyMode ? 'rgba(0, 100, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';
      easyModeButton.style.borderColor = isEasyMode ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
    }
  }
}

export const gameUI = new GameUI();