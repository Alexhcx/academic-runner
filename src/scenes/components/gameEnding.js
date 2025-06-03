export function makeGameEnding(k) {
  let isActive = false;
  let currentTextIndex = 0;
  let texts = [];
  let textDisplay = null;
  let onComplete = null;
  let characterName = "";
  let averageScore = 0;
  let isApproved = false;
  
  // Criar o fundo escuro
  const createBackdrop = () => {
    return k.add([
      k.rect(k.width(), k.height()),
      k.color(0, 0, 0),
      k.opacity(0),
      k.pos(0, 0),
      k.z(1500),
      k.fixed(),
      "ending-backdrop"
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
      k.pos(k.center()),
      k.opacity(0),
      k.z(1600),
      k.fixed(),
      "ending-text"
    ]);
  };
  
  // Animar a entrada do texto
  const animateTextIn = (text, callback) => {
    if (!textDisplay || !textDisplay.exists()) return;
    
    textDisplay.text = text;
    textDisplay.opacity = 0;
    
    const fadeInDuration = 0.5;
    const displayDuration = text.length * 0.05 + 1.5; // Tempo baseado no tamanho do texto
    
    // Fade in
    k.tween(
      0,
      1,
      fadeInDuration,
      (val) => {
        if (textDisplay.exists()) textDisplay.opacity = val;
      },
      k.easings.easeOutQuad
    ).then(() => {
      // Aguardar
      k.wait(displayDuration, () => {
        // Fade out
        k.tween(
          1,
          0,
          fadeInDuration,
          (val) => {
            if (textDisplay.exists()) textDisplay.opacity = val;
          },
          k.easings.easeInQuad
        ).then(() => {
          if (callback) callback();
        });
      });
    });
  };
  
  // Processar próximo texto
  const showNextText = () => {
    if (currentTextIndex >= texts.length) {
      // Fim da sequência
      if (onComplete) {
        onComplete(isApproved);
      }
      return;
    }
    
    const currentText = texts[currentTextIndex];
    currentTextIndex++;
    
    // Substituir placeholders
    const processedText = currentText
      .replace("{nome do personagem}", characterName)
      .replace("{média}", averageScore.toFixed(1));
    
    animateTextIn(processedText, showNextText);
  };
  
  // Iniciar a sequência de final
  const start = (playerName, avgScore, onCompleteCallback) => {
    console.log("GameEnding.start chamado com:", playerName, avgScore); // Debug
    
    if (isActive) return;
    
    isActive = true;
    characterName = playerName;
    averageScore = avgScore;
    isApproved = avgScore >= 6;
    onComplete = onCompleteCallback;
    currentTextIndex = 0;
    
    // Definir textos baseado na aprovação
    texts = [
      "{nome do personagem}, parece que você chegou ao final, não é mesmo?",
      "Mas primeiro, vamos dar uma olhada na sua média...",
      "Você conseguiu...",
      "{média}!!!"
    ];
    
    if (isApproved) {
      texts.push(
        "Hum...",
        "Aprovado... Só me resta lhe dar os parabéns.",
        "Boa sorte e boa formatura!!"
      );
    } else {
      texts.push(
        "Hum...",
        "HAHAHHAHAHAHAHHAHAHAA...",
        "Reprovadooooo... Tente de novo!!",
        "Você não vai sair desse loop com essa média.",
        "Boa sorte, você vai precisar."
      );
    }
    
    console.log("Criando elementos visuais..."); // Debug
    
    // Criar elementos visuais
    const backdrop = createBackdrop();
    textDisplay = createTextDisplay();
    
    console.log("Backdrop criado:", backdrop.exists()); // Debug
    console.log("TextDisplay criado:", textDisplay.exists()); // Debug
    
    // Fade in do backdrop
    k.tween(
      0,
      0.8,
      1,
      (val) => {
        if (backdrop.exists()) backdrop.opacity = val;
      },
      k.easings.easeOutQuad
    ).then(() => {
      console.log("Fade in completo, iniciando textos..."); // Debug
      // Iniciar sequência de textos
      k.wait(0.5, showNextText);
    });
  };
  
  // Limpar todos os elementos
  const cleanup = () => {
    isActive = false;
    currentTextIndex = 0;
    texts = [];
    
    k.get("ending-backdrop").forEach(obj => k.destroy(obj));
    k.get("ending-text").forEach(obj => k.destroy(obj));
    
    textDisplay = null;
    onComplete = null;
  };
  
  return {
    start,
    cleanup,
    isActive: () => isActive
  };
}