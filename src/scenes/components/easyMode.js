// src/scenes/components/easyMode.js
import k from "../../kaplayCtx";

export function makeEasyMode() {
  let button = null;
  let onChangeCallback = null;
  let unsubscribe = null;

  // Função para obter o estado atual do Easy Mode
  const isEnabled = () => {
    if (window.EasyModeManager) {
      return window.EasyModeManager.isEnabled();
    }
    // Fallback para kaplay data se o manager não estiver disponível
    return k.getData('easy-mode') === true;
  };

  // Função para criar o botão visual
  const createButton = (pos = { x: 1420, y: 40 }) => {
    button = k.add([
      k.rect(150, 60, { radius: 8 }),
      k.color(0, 0, 0, 0.7),
      k.outline(4, k.Color.fromArray([255, 255, 255])),
      k.anchor("center"),
      k.area(),
      k.pos(pos.x, pos.y),
      k.fixed(),
      "easyModeButton"
    ]);

    button.add([
      k.text("EASY MODE", { font: "mania", size: 28 }),
      k.anchor("center"),
    ]);

    // Atualizar aparência inicial
    updateButtonAppearance();

    // Eventos do botão
    button.onHover(() => {
      button.outline.width = 6;
      button.color = isEnabled() ? k.Color.fromArray([0, 120, 0, 0.9]) : k.Color.fromArray([0, 0, 0, 0.9]);
    });

    button.onHoverEnd(() => {
      button.outline.width = 4;
      updateButtonAppearance();
    });

    button.onClick(() => {
      k.play("ring", { volume: 0.5 });
      toggle();
    });

    return button;
  };

  // Função para atualizar a aparência do botão
  const updateButtonAppearance = () => {
    if (!button || !button.exists()) return;
    
    const enabled = isEnabled();
    button.color = enabled ? k.Color.fromArray([0, 100, 0, 0.7]) : k.Color.fromArray([0, 0, 0, 0.7]);
    button.outline.color = enabled ? k.Color.fromArray([0, 255, 0]) : k.Color.fromArray([255, 255, 255]);
  };

  // Função para alternar o Easy Mode
  const toggle = () => {
    if (window.EasyModeManager) {
      window.EasyModeManager.toggle();
    } else {
      // Fallback para kaplay data
      const newState = !isEnabled();
      k.setData('easy-mode', newState);
      updateButtonAppearance();
      
      if (onChangeCallback) {
        onChangeCallback(newState);
      }
      
      console.log(`Easy Mode ${newState ? 'ATIVADO' : 'DESATIVADO'}`);
    }
  };

  // Event listener para mudanças vindas do mobile ou outros componentes
  const handleEasyModeChange = (enabled) => {
    // Sincronizar com kaplay data
    k.setData('easy-mode', enabled);
    
    // Atualizar aparência do botão
    updateButtonAppearance();
    
    // Chamar callback se existir
    if (onChangeCallback) {
      onChangeCallback(enabled);
    }
    
    console.log('Easy Mode atualizado:', enabled);
  };

  // Função de inicialização
  const init = (onChange = null) => {
    onChangeCallback = onChange;
    
    // Sincronizar estado inicial
    if (window.EasyModeManager) {
      // Sincronizar kaplay data com o estado global
      const globalState = window.EasyModeManager.isEnabled();
      k.setData('easy-mode', globalState);
      
      // Se houver diferença, atualizar o manager global
      const kaplayState = k.getData('easy-mode') === true;
      if (globalState !== kaplayState) {
        window.EasyModeManager.syncWithKaplay(kaplayState);
      }
      
      // Subscrever para mudanças
      unsubscribe = window.EasyModeManager.subscribe(handleEasyModeChange);
      
      // Atualizar botão mobile
      window.EasyModeManager.updateMobileButton();
    }
    
    // Criar o botão
    createButton();
    
    // Chamar callback inicial se existir
    if (onChangeCallback) {
      onChangeCallback(isEnabled());
    }
    
    return button;
  };

  // Função de limpeza
  const cleanup = () => {
    // Cancelar subscrição
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    
    // Destruir botão
    if (button && button.exists()) {
      k.destroy(button);
    }
    
    button = null;
    onChangeCallback = null;
  };

  // API pública
  return {
    init,
    cleanup,
    isEnabled,
    toggle,
    getButton: () => button,
    setPosition: (x, y) => {
      if (button && button.exists()) {
        button.pos.x = x;
        button.pos.y = y;
      }
    }
  };
}