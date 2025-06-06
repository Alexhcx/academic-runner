export function makeGraduationEnding(k) {
  let isActive = false;
  let backdrop = null;
  let background = null;
  let formandos = null;
  let textDisplay = null;
  let onComplete = null;
  
  // Criar o fundo escuro
  const createBackdrop = () => {
    return k.add([
      k.rect(k.width(), k.height()),
      k.color(0, 0, 0),
      k.opacity(0),
      k.pos(0, 0),
      k.z(1500),
      k.fixed(),
      "graduation-backdrop"
    ]);
  };
  
  // Criar o background de formatura
  const createBackground = () => {
    return k.add([
      k.sprite("formatura"),
      k.anchor("center"),
      k.pos(k.center()),
      k.opacity(0),
      k.z(1510),
      k.fixed(),
      k.scale(1), // Ajuste o scale se necessário
      "graduation-bg"
    ]);
  };
  
  // Criar os formandos
  const createFormandos = () => {
    return k.add([
      k.sprite("formandos"),
      k.anchor("center"),
      k.pos(k.center()),
      k.opacity(0),
      k.z(1520),
      k.fixed(),
      k.scale(4), // Ajuste o scale se necessário
      "graduation-formandos"
    ]);
  };
  
  // Criar o display de texto
  const createTextDisplay = () => {
    return k.add([
      k.text("", {
        font: "mania",
        size: 64,
        width: k.width() - 200,
        align: "center"
      }),
      k.anchor("center"),
      k.pos(k.center().x, k.height() - 150), // Posicionado na parte inferior
      k.opacity(0),
      k.z(1600),
      k.fixed(),
      "graduation-text"
    ]);
  };
  
  // Animar a sequência completa
  const animateSequence = () => {
    // Fade in do backdrop
    k.tween(
      0,
      0.8,
      1,
      (val) => {
        if (backdrop && backdrop.exists()) backdrop.opacity = val;
      },
      k.easings.easeOutQuad
    ).then(() => {
      // Fade in do background
      k.tween(
        0,
        1,
        1,
        (val) => {
          if (background && background.exists()) background.opacity = val;
        },
        k.easings.easeOutQuad
      );
      
      // Fade in dos formandos com um pequeno delay
      k.wait(0.5, () => {
        k.tween(
          0,
          1,
          1,
          (val) => {
            if (formandos && formandos.exists()) formandos.opacity = val;
          },
          k.easings.easeOutQuad
        ).then(() => {
          // Mostrar o texto após os formandos aparecerem
          k.wait(0.5, () => {
            showMessage();
          });
        });
      });
    });
  };
  
  // Mostrar mensagem de parabéns
  const showMessage = () => {
    const message = "Parabéns a todos os formandos! Boa sorte na sua nova jornada.";
    
    if (!textDisplay || !textDisplay.exists()) return;
    
    textDisplay.text = message;
    
    // Fade in do texto
    k.tween(
      0,
      1,
      1,
      (val) => {
        if (textDisplay && textDisplay.exists()) textDisplay.opacity = val;
      },
      k.easings.easeOutQuad
    ).then(() => {
      // Aguardar 3 segundos antes de continuar
      k.wait(3, () => {
        // Fade out de tudo
        fadeOutAll();
      });
    });
  };
  
  // Fazer fade out de todos os elementos
  const fadeOutAll = () => {
    const fadePromises = [];
    
    // Fade out do texto
    if (textDisplay && textDisplay.exists()) {
      fadePromises.push(
        k.tween(
          1,
          0,
          0.5,
          (val) => {
            if (textDisplay.exists()) textDisplay.opacity = val;
          },
          k.easings.easeInQuad
        )
      );
    }
    
    // Fade out dos formandos
    if (formandos && formandos.exists()) {
      fadePromises.push(
        k.tween(
          1,
          0,
          1,
          (val) => {
            if (formandos.exists()) formandos.opacity = val;
          },
          k.easings.easeInQuad
        )
      );
    }
    
    // Fade out do background
    if (background && background.exists()) {
      fadePromises.push(
        k.tween(
          1,
          0,
          1,
          (val) => {
            if (background.exists()) background.opacity = val;
          },
          k.easings.easeInQuad
        )
      );
    }
    
    // Fade out do backdrop
    if (backdrop && backdrop.exists()) {
      k.wait(0.5, () => {
        k.tween(
          0.8,
          0,
          1,
          (val) => {
            if (backdrop.exists()) backdrop.opacity = val;
          },
          k.easings.easeInQuad
        ).then(() => {
          // Chamar callback de conclusão
          if (onComplete) {
            onComplete();
          }
        });
      });
    }
  };
  
  // Iniciar a sequência de formatura
  const start = (onCompleteCallback) => {
    console.log("GraduationEnding.start chamado"); // Debug
    
    if (isActive) return;
    
    isActive = true;
    onComplete = onCompleteCallback;
    
    // Criar elementos visuais
    backdrop = createBackdrop();
    background = createBackground();
    formandos = createFormandos();
    textDisplay = createTextDisplay();
    
    console.log("Elementos de formatura criados"); // Debug
    
    // Iniciar animação
    animateSequence();
  };
  
  // Limpar todos os elementos
  const cleanup = () => {
    isActive = false;
    
    k.get("graduation-backdrop").forEach(obj => k.destroy(obj));
    k.get("graduation-bg").forEach(obj => k.destroy(obj));
    k.get("graduation-formandos").forEach(obj => k.destroy(obj));
    k.get("graduation-text").forEach(obj => k.destroy(obj));
    
    backdrop = null;
    background = null;
    formandos = null;
    textDisplay = null;
    onComplete = null;
  };
  
  return {
    start,
    cleanup,
    isActive: () => isActive
  };
}