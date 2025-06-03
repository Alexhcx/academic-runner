import k from "../../kaplayCtx";

export function makeMobileJumpButton(options = {}) {
  // Configurações padrão que podem ser sobrescritas
  const config = {
    // Posição
    pos: options.pos || { x: 120, y: k.height() - 120 },
    
    // Aparência
    radius: options.radius || 60,
    bgColor: options.bgColor || [255, 255, 255, 0.2],
    outlineColor: options.outlineColor || [255, 255, 255, 0.6],
    outlineWidth: options.outlineWidth || 4,
    
    // Texto/Ícone
    text: options.text || "↑",
    textSize: options.textSize || 48,
    textColor: options.textColor || [255, 255, 255, 0.8],
    font: options.font || "mania",
    
    // Z-index
    zIndex: options.zIndex || 2000,
    
    // Som
    soundEnabled: options.soundEnabled !== undefined ? options.soundEnabled : true,
    soundName: options.soundName || "ring",
    soundVolume: options.soundVolume || 0.3,
    
    // Comportamento
    buttonName: options.buttonName || "jump",
    alwaysVisible: options.alwaysVisible || false,
    
    // Callbacks customizados
    onPress: options.onPress || null,
    onRelease: options.onRelease || null,
    
    // Visual feedback
    pressedScale: options.pressedScale || 0.9,
    pressedBgColor: options.pressedBgColor || [255, 255, 255, 0.4],
    pressedOutlineWidth: options.pressedOutlineWidth || 6,
    hoverBgColor: options.hoverBgColor || [255, 255, 255, 0.3],
    hoverOutlineWidth: options.hoverOutlineWidth || 5
  };

  // Estado do botão
  let isPressed = false;
  let button = null;
  let icon = null;

  // Criar o botão visual
  const create = () => {
    // Botão principal
    button = k.add([
      k.circle(config.radius),
      k.color(...config.bgColor),
      k.outline(config.outlineWidth, k.Color.fromArray(config.outlineColor)),
      k.anchor("center"),
      k.area(),
      k.pos(config.pos.x, config.pos.y),
      k.fixed(),
      k.z(config.zIndex),
      "mobileJumpButton"
    ]);

    // Adicionar ícone ou texto no botão
    icon = button.add([
      k.text(config.text, { font: config.font, size: config.textSize }),
      k.anchor("center"),
      k.color(...config.textColor)
    ]);

    // Configurar eventos
    setupEvents();

    // Verificar visibilidade
    updateVisibility();

    return button;
  };

  // Configurar todos os eventos do botão
  const setupEvents = () => {
    // Touch events
    button.onTouchStart(() => {
      if (!isPressed) {
        handlePress();
      }
    });

    button.onTouchEnd(() => {
      if (isPressed) {
        handleRelease();
      }
    });

    // Mouse events (para testes em desktop)
    button.onMousePress(() => {
      if (!isPressed) {
        handlePress();
      }
    });

    button.onMouseRelease(() => {
      if (isPressed) {
        handleRelease();
      }
    });

    // Hover effects
    button.onHover(() => {
      if (!isPressed) {
        button.color = k.Color.fromArray(config.hoverBgColor);
        button.outline.width = config.hoverOutlineWidth;
      }
    });

    button.onHoverEnd(() => {
      if (!isPressed) {
        button.color = k.Color.fromArray(config.bgColor);
        button.outline.width = config.outlineWidth;
      }
    });
  };

  // Lógica de pressionar o botão
  const handlePress = () => {
    isPressed = true;
    
    // Visual feedback
    button.color = k.Color.fromArray(config.pressedBgColor);
    button.scale = k.vec2(config.pressedScale);
    button.outline.width = config.pressedOutlineWidth;
    
    // Som de feedback
    if (config.soundEnabled && k.get("soundButton")[0]) {
      k.play(config.soundName, { volume: config.soundVolume });
    }
    
    // Acionar o botão virtual
    k.pressButton(config.buttonName);
    
    // Callback customizado
    if (config.onPress) {
      config.onPress();
    }
  };

  // Lógica de soltar o botão
  const handleRelease = () => {
    isPressed = false;
    
    // Restaurar visual
    button.color = k.Color.fromArray(config.bgColor);
    button.scale = k.vec2(1);
    button.outline.width = config.outlineWidth;
    
    // Soltar o botão virtual
    k.releaseButton(config.buttonName);
    
    // Callback customizado
    if (config.onRelease) {
      config.onRelease();
    }
  };

  // Atualizar visibilidade baseado no dispositivo
  const updateVisibility = () => {
    if (!config.alwaysVisible) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchscreen = k.isTouchscreen && k.isTouchscreen();
      
      if (!isMobile && !isTouchscreen) {
        hide();
      }
    }
  };

  // Métodos públicos
  const show = () => {
    if (button && button.exists()) {
      button.opacity = 1;
      button.area.scale = k.vec2(1);
    }
  };

  const hide = () => {
    if (button && button.exists()) {
      button.opacity = 0;
      button.area.scale = k.vec2(0);
    }
  };

  const destroy = () => {
    if (button && button.exists()) {
      k.destroy(button);
    }
  };

  const setPosition = (x, y) => {
    if (button && button.exists()) {
      button.pos.x = x;
      button.pos.y = y;
    }
  };

  const setScale = (scale) => {
    if (button && button.exists() && !isPressed) {
      button.scale = k.vec2(scale);
    }
  };

  const setText = (newText) => {
    if (icon && icon.exists()) {
      icon.text = newText;
    }
  };

  const setColor = (bgColor, outlineColor) => {
    if (button && button.exists()) {
      if (bgColor) {
        config.bgColor = bgColor;
        if (!isPressed) {
          button.color = k.Color.fromArray(bgColor);
        }
      }
      if (outlineColor) {
        config.outlineColor = outlineColor;
        button.outline.color = k.Color.fromArray(outlineColor);
      }
    }
  };

  const isButtonPressed = () => isPressed;

  const getButton = () => button;

  // Criar o botão automaticamente
  create();

  // Retornar API pública
  return {
    show,
    hide,
    destroy,
    setPosition,
    setScale,
    setText,
    setColor,
    isPressed: isButtonPressed,
    getButton,
    // Recriar o botão com novas opções
    recreate: (newOptions) => {
      destroy();
      Object.assign(config, newOptions);
      create();
    }
  };
}