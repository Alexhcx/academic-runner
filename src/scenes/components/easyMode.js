// src/scenes/components/easyMode.js
import k from "../../kaplayCtx";

export function makeEasyMode() {
  // Estado do Easy Mode
  let isEnabled = k.getData('easy-mode') === true;
  let button = null;
  let onChangeCallback = null;

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
      button.color = isEnabled ? k.Color.fromArray([0, 120, 0, 0.9]) : k.Color.fromArray([0, 0, 0, 0.9]);
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
    
    button.color = isEnabled ? k.Color.fromArray([0, 100, 0, 0.7]) : k.Color.fromArray([0, 0, 0, 0.7]);
    button.outline.color = isEnabled ? k.Color.fromArray([0, 255, 0]) : k.Color.fromArray([255, 255, 255]);
  };

  // Função para alternar o Easy Mode
  const toggle = () => {
    isEnabled = !isEnabled;
    k.setData('easy-mode', isEnabled);
    updateButtonAppearance();
    updateMobileButton();
    
    // Chamar callback se existir
    if (onChangeCallback) {
      onChangeCallback(isEnabled);
    }
    
    console.log(`Easy Mode ${isEnabled ? 'ATIVADO' : 'DESATIVADO'}`);
  };

  // Função para atualizar o botão mobile
  const updateMobileButton = () => {
    const mobileEasyButton = document.getElementById('easy-mode-button');
    if (mobileEasyButton) {
      mobileEasyButton.style.backgroundColor = isEnabled ? 'rgba(0, 100, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';
      mobileEasyButton.style.borderColor = isEnabled ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
    }
  };

  // Event listener para mudanças vindas do mobile
  const handleMobileToggle = (event) => {
    isEnabled = event.detail.isEasyMode;
    updateButtonAppearance();
    
    if (onChangeCallback) {
      onChangeCallback(isEnabled);
    }
    
    console.log('Easy Mode atualizado via mobile:', isEnabled);
  };

  // Função de inicialização
  const init = (onChange = null) => {
    onChangeCallback = onChange;
    
    // Criar o botão
    createButton();
    
    // Adicionar listener para eventos mobile
    window.addEventListener('easyModeToggled', handleMobileToggle);
    
    // Sincronizar com o botão mobile inicial
    updateMobileButton();
    
    return button;
  };

  // Função de limpeza
  const cleanup = () => {
    // Remover event listener
    window.removeEventListener('easyModeToggled', handleMobileToggle);
    
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
    isEnabled: () => isEnabled,
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