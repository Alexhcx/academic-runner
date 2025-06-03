import k from "../kaplayCtx";
import { makePlayer } from "../entities/player";
import { makeMotobug } from "../entities/motobug";
import { makeNote } from "../entities/note";
// import { makeTextShadow } from "../scenes/components/textBackgroundShadow";
import { makeGameControls } from "../scenes/components/gameControls";
import { makeMobileJumpButton } from "./components/mobileButtons";

export default function game() {
  // Log para verificar o estado inicial
  console.log("=== INICIANDO CENA GAME ===");
  console.log("Cor de fundo do canvas:", k.getBackground());
  
  const citySfx = window.gameSoundtrack;
  if (citySfx && citySfx.paused) {
    citySfx.paused = false;
  }
  k.setGravity(3100);

  // Configurações do Background
  const bgY = -26;
  const bgOpacity = 0.8;
  const bgScale = 2;
  const platformY = 450;
  const platformScale = 4;

  // Sistema de gerenciamento de cenários
  const phases = [
    {
      name: "Fase 1",
      backgrounds: ["fase01-01", "fase01-02", "fase01-03", "fase01-01", "fase01-02", "fase01-03", "fase01-01", "fase01-02", "fase01-03"],
      platform: "platforms"
    },
    {
      name: "Fase 2", 
      backgrounds: ["fase02-01", "fase02-02", "fase02-03", "fase02-01", "fase02-02", "fase02-03", "fase02-01", "fase02-02", "fase02-03"],
      platform: "platforms02"
    },
    {
      name: "Fase 3",
      backgrounds: ["fase03-01", "fase03-02", "fase03-03", "fase03-01", "fase03-02", "fase03-03", "fase03-01", "fase03-02", "fase03-03"],
      platform: "platforms03"
    },
    {
      name: "Fase 4",
      backgrounds: ["fase04-01", "fase04-02", "fase04-03", "fase04-01", "fase04-02", "fase04-03", "fase04-01", "fase04-02", "fase04-03"],
      platform: "platforms04"
    }
  ];

  let currentPhaseIndex = 0;
  let isTransitioning = false;
  
  // Classe para gerenciar o background scrolling
  class BackgroundManager {
    constructor() {
      this.bgPieces = [];
      this.platformPieces = [];
      this.currentPhase = phases[currentPhaseIndex];
      this.bgWidth = 1920 * bgScale; // 1920 é a largura original da imagem
      this.platformWidth = 0;
      this.totalWidth = 0;
      this.scrollX = 0;
      this.initialized = false;
    }

    init() {
      console.log("BackgroundManager.init() - Iniciando...");
      this.createInitialPieces();
      this.initialized = true;
      console.log("BackgroundManager.init() - Completo. Total de bgs:", this.bgPieces.length, "Total de plataformas:", this.platformPieces.length);
    }

    createInitialPiecesWithOpacity(initialOpacity = bgOpacity) {
      console.log("createInitialPiecesWithOpacity() - Iniciando com opacidade:", initialOpacity);
      
      // Limpar arrays
      this.bgPieces = [];
      this.platformPieces = [];

      // Calcular largura da plataforma
      const tempPlat = k.add([
        k.sprite(this.currentPhase.platform),
        k.scale(platformScale),
        k.opacity(0)
      ]);
      this.platformWidth = tempPlat.width * platformScale;
      k.destroy(tempPlat);

      console.log("Larguras calculadas - bgWidth:", this.bgWidth, "platformWidth:", this.platformWidth);

      // Criar todas as peças de background da fase em sequência
      let xPos = 0;
      this.currentPhase.backgrounds.forEach((bgSprite, index) => {
        console.log(`Criando background ${index}: ${bgSprite} na posição X:${xPos} com opacidade:${initialOpacity}`);
        
        const bg = k.add([
          k.sprite(bgSprite),
          k.pos(xPos, bgY),
          k.scale(bgScale),
          k.opacity(initialOpacity),
          k.z(-100),
          "background",
          { index, originalX: xPos }
        ]);
        
        // Forçar visibilidade
        bg.visible = true;
        
        console.log(`Background ${index} criado. Opacidade real:`, bg.opacity, "Visible:", bg.visible);
        this.bgPieces.push(bg);
        xPos += this.bgWidth;
      });

      // Adicionar uma cópia do primeiro background no final para loop seamless
      const firstBgCopy = k.add([
        k.sprite(this.currentPhase.backgrounds[0]),
        k.pos(xPos, bgY),
        k.scale(bgScale),
        k.opacity(initialOpacity),
        k.z(-100),
        "background",
        { index: this.currentPhase.backgrounds.length, originalX: xPos }
      ]);
      this.bgPieces.push(firstBgCopy);

      this.totalWidth = this.bgWidth * this.currentPhase.backgrounds.length;
      console.log("Total width calculado:", this.totalWidth);

      // Criar plataformas suficientes para cobrir todo o percurso
      const numPlatforms = Math.ceil(this.totalWidth / this.platformWidth) + 2;
      xPos = 0;
      const platOpacity = initialOpacity === 0 ? 0 : 1;
      
      console.log(`Criando ${numPlatforms} plataformas com opacidade:`, platOpacity);
      
      for (let i = 0; i < numPlatforms; i++) {
        const platform = k.add([
          k.sprite(this.currentPhase.platform),
          k.pos(xPos, platformY),
          k.scale(platformScale),
          k.opacity(platOpacity),
          k.z(-50),
          "platform",
          { index: i, originalX: xPos }
        ]);
        this.platformPieces.push(platform);
        xPos += this.platformWidth;
      }
      
      console.log("createInitialPiecesWithOpacity() - Completo. Bgs criados:", this.bgPieces.length);
    }

    createInitialPieces() {
      console.log("createInitialPieces() - Chamando createInitialPiecesWithOpacity com bgOpacity:", bgOpacity);
      this.createInitialPiecesWithOpacity(bgOpacity);
    }

    update(speed) {
      if (!this.initialized || isTransitioning) return;

      this.scrollX += speed;

      // Verificar estado dos backgrounds periodicamente
      if (Math.floor(this.scrollX) % 1000 === 0) {
        console.log("UPDATE CHECK - scrollX:", this.scrollX, "bgPieces:", this.bgPieces.length);
        if (this.bgPieces.length > 0 && this.bgPieces[0].exists()) {
          console.log("  Primeiro BG - opacity:", this.bgPieces[0].opacity, "visible:", this.bgPieces[0].visible, "z:", this.bgPieces[0].z);
        }
      }

      // Mover backgrounds
      this.bgPieces.forEach(bg => {
        if (bg.exists()) {
          bg.pos.x = bg.originalX - this.scrollX;
        }
      });

      // Mover plataformas com loop
      this.platformPieces.forEach(platform => {
        if (platform.exists()) {
          platform.pos.x = platform.originalX - this.scrollX;
          
          // Se a plataforma saiu completamente da tela pela esquerda
          if (platform.pos.x + this.platformWidth < 0) {
            // Reposicionar no final
            const maxX = Math.max(...this.platformPieces.map(p => p.originalX));
            platform.originalX = maxX + this.platformWidth;
            platform.pos.x = platform.originalX - this.scrollX;
          }
        }
      });

      // Verificar se completou o ciclo da fase atual
      if (this.scrollX >= this.totalWidth) {
        this.scrollX = 0;
        this.onPhaseComplete();
      }
    }

    async onPhaseComplete() {
      // Passar para a próxima fase
      const nextPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      
      // Se voltou para a fase 1, significa que completou todas as fases
      if (nextPhaseIndex === 0) {
        console.log("Completou todas as fases! Reiniciando ciclo...");
      }

      console.log(`onPhaseComplete: Indo de ${currentPhaseIndex} para ${nextPhaseIndex}`);
      await this.transitionToPhase(nextPhaseIndex);
    }

    async transitionToPhase(newPhaseIndex) {
      if (isTransitioning) return;
      isTransitioning = true;

      const oldPhaseIndex = currentPhaseIndex;
      currentPhaseIndex = newPhaseIndex;
      
      console.log(`\n=== INÍCIO DA TRANSIÇÃO ===`);
      console.log(`Transição: ${phases[oldPhaseIndex].name} → ${phases[newPhaseIndex].name}`);
      console.log(`bgOpacity global:`, bgOpacity);

      // PASSO 1: Criar fade overlay preto
      console.log("PASSO 1: Criando fade overlay...");
      const fadeOverlay = k.add([
        k.rect(k.width(), k.height()),
        k.color(0, 0, 0),
        k.opacity(0),
        k.pos(0, 0),
        k.z(900),
        k.fixed()
      ]);

      // PASSO 2: Fade to black
      console.log("PASSO 2: Fade to black...");
      await new Promise(resolve => {
        k.tween(0, 1, 0.5, (v) => {
          if (fadeOverlay.exists()) fadeOverlay.opacity = v;
        }, k.easings.easeInOutCubic).onEnd(() => {
          console.log("Fade to black completo. Overlay opacity:", fadeOverlay.opacity);
          resolve();
        });
      });

      // PASSO 3: Destruir cenário antigo enquanto tela está preta
      console.log("PASSO 3: Destruindo cenário antigo...");
      console.log("Backgrounds antes da destruição:", this.bgPieces.length);
      this.destroy();
      console.log("Backgrounds após destruição:", this.bgPieces.length);

      // PASSO 4: Criar novo cenário
      console.log("PASSO 4: Criando novo cenário...");
      this.currentPhase = phases[newPhaseIndex];
      this.scrollX = 0;
      console.log("Nova fase selecionada:", this.currentPhase.name);
      console.log("bgOpacity antes de criar:", bgOpacity);
      
      this.createInitialPieces();
      
      console.log("Novo cenário criado. Total de bgs:", this.bgPieces.length);
      console.log("Opacidades dos novos backgrounds:");
      this.bgPieces.forEach((bg, i) => {
        console.log(`  BG ${i}: opacity = ${bg.opacity}`);
      });

      // PASSO 5: Fade from black
      console.log("PASSO 5: Fade from black...");
      await new Promise(resolve => {
        k.tween(1, 0, 0.5, (v) => {
          if (fadeOverlay.exists()) fadeOverlay.opacity = v;
        }, k.easings.easeInOutCubic).onEnd(() => {
          console.log("Fade from black completo");
          resolve();
        });
      });

      // PASSO 6: Remover overlay
      console.log("PASSO 6: Removendo overlay...");
      k.destroy(fadeOverlay);

      // TESTE: Criar um background de teste para verificar se backgrounds funcionam
      console.log("TESTE: Criando background de teste vermelho...");
      const testBg = k.add([
        k.rect(200, 200),
        k.color(255, 0, 0),
        k.pos(100, 100),
        k.opacity(0.5),
        k.z(-99),
        "test-bg"
      ]);
      
      k.wait(2, () => {
        console.log("Removendo background de teste");
        k.destroy(testBg);
      });

      // Verificação final
      console.log("VERIFICAÇÃO FINAL:");
      console.log("Backgrounds existentes:", this.bgPieces.length);
      this.bgPieces.forEach((bg, i) => {
        if (bg.exists()) {
          console.log(`  BG ${i}: existe = true, opacity = ${bg.opacity}, pos.x = ${bg.pos.x}, visible = ${bg.visible}`);
        } else {
          console.log(`  BG ${i}: existe = false`);
        }
      });

      stageInfoText.text = this.currentPhase.name;
      isTransitioning = false;
      console.log(`=== FIM DA TRANSIÇÃO ===\n`);
    }

    destroy() {
      console.log("destroy() - Iniciando destruição...");
      console.log("Backgrounds a destruir:", this.bgPieces.length);
      console.log("Plataformas a destruir:", this.platformPieces.length);
      
      // Destruir todos os backgrounds
      this.bgPieces.forEach((bg, index) => {
        if (bg && bg.exists()) {
          console.log(`  Destruindo BG ${index}`);
          bg.opacity = 0; // Garantir que fique invisível antes de destruir
          k.destroy(bg);
        }
      });
      
      // Destruir todas as plataformas
      this.platformPieces.forEach((platform, index) => {
        if (platform && platform.exists()) {
          console.log(`  Destruindo Platform ${index}`);
          platform.opacity = 0; // Garantir que fique invisível antes de destruir
          k.destroy(platform);
        }
      });
      
      // Limpar arrays
      this.bgPieces = [];
      this.platformPieces = [];
      
      console.log("destroy() - Completo");
    }
  }

  // Criar manager de background
  const bgManager = new BackgroundManager();
  bgManager.init();

  // Criar player
  const selectedCharacter = k.getData("selected-character") || "gleisla";
  const player = makePlayer(k.vec2(200, 745), selectedCharacter);
  player.z = 1000;
  player.setControls();
  player.setEvents();

  const gameControls = makeGameControls();
  gameControls.init();

  // USAR O COMPONENTE DE BOTÃO MOBILE
  const jumpButton = makeMobileJumpButton({
    pos: { x: 120, y: k.height() - 120 },
    radius: 60,
    bgColor: [255, 255, 255, 0.2],
    outlineColor: [255, 255, 255, 0.6],
    outlineWidth: 4,
    text: "↑",
    textSize: 48,
    textColor: [255, 255, 255, 0.8],
    zIndex: 2000,
    buttonName: "jump",
    soundName: "ring",
    soundVolume: 0.3,
    pressedBgColor: [255, 255, 255, 0.4],
    pressedOutlineWidth: 6,
    hoverBgColor: [255, 255, 255, 0.3],
    hoverOutlineWidth: 5
  });

  // UI Elements
  // makeTextShadow();
  
  const stageInfoText = k.add([
    k.text(phases[currentPhaseIndex].name, {
      font: "mania",
      size: 36,
    }),
    k.pos(20, 140),
    k.fixed(),
  ]);

  const controlsText = k.add([
    k.text("Pressione Espaço/Clique/Toque para Pular!", {
      font: "mania",
      size: 64,
    }),
    k.anchor("center"),
    k.pos(k.center()),
    k.fixed(),
  ]);

  const dismissControlsAction = k.onButtonPress("jump", () => {
    k.destroy(controlsText);
    dismissControlsAction.cancel();
  });

  // Sistema de pontuação
  const scoreText = k.add([
    k.text("MÉDIA: 0.0", { font: "mania", size: 72 }),
    k.pos(20, 12),
    k.fixed(),
  ]);

  const notesCollectedText = k.add([
    k.text("NOTAS: 0", { font: "mania", size: 36 }),
    k.pos(20, 100),
    k.fixed(),
  ]);

  let zeroNotesCount = 0;
  const maxZeroNotes = 5;

  const zeroNotesText = k.add([
    k.text("NOTAS ZERO: 0/5", { font: "mania", size: 36 }),
    k.pos(20, 180),
    k.color(255, 100, 100),
    k.fixed(),
  ]);

  // Debug info
  const debugText = k.add([
    k.text("", { font: "mania", size: 24 }),
    k.pos(20, 220),
    k.color(255, 255, 255),
    k.fixed(),
  ]);

  // Sistema de preview da próxima nota
  let nextNoteValue = k.randi(0, 11);
  let nextNoteAfterThat = k.randi(0, 11);

  let nextNotePreview = k.add([
    k.sprite(`note${nextNoteValue}`),
    k.pos(1000, 140),
    k.anchor("center"),
    k.scale(1.5),
    k.fixed(),
  ]);

  const backButton = k.add([
    k.rect(172, 60, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(1820, 40),
    k.fixed(),
  ]);

  backButton.add([
    k.text("MAIN MENU", { font: "mania", size: 32 }),
    k.anchor("center"),
  ]);

  backButton.onHover(() => {
    backButton.outline.width = 6;
    backButton.color = k.Color.fromArray([0, 0, 0, 0.9]);
  });

  backButton.onHoverEnd(() => {
    backButton.outline.width = 4;
    backButton.color = k.Color.fromArray([0, 0, 0, 0.7]);
  });

  backButton.onClick(() => {
    k.play("ring", { volume: 0.5 });
    k.go("main-menu");
  });

  // Variáveis de pontuação
  let totalScore = 0;
  let notesCollected = 0;
  let averageScore = 0;
  let scoreMultiplier = 0;

  // Colisão com notas
  player.onCollide("note", (note) => {
    k.play("ring", { volume: 0.5 });
    totalScore += note.value;
    notesCollected++;
    averageScore = notesCollected > 0 ? totalScore / notesCollected : 0;

    scoreText.text = `MÉDIA: ${averageScore.toFixed(1)}`;
    notesCollectedText.text = `NOTAS: ${notesCollected}`;

    player.ringCollectUI.text = `+${note.value}`;
    k.wait(1, () => {
      player.ringCollectUI.text = "";
    });

    k.destroy(note);
  });

  // Colisão com inimigos
  player.onCollide("enemy", (enemy) => {
    if (!player.isGrounded()) {
      k.play("destroy", { volume: 0.5 });
      k.play("hyper-ring", { volume: 0.5 });
      k.destroy(enemy);
      player.play("jump");
      player.jump();
      scoreMultiplier += 1;

      const bonus = 6;
      totalScore += bonus;
      notesCollected += 1;
      averageScore = totalScore / notesCollected;

      scoreText.text = `MÉDIA: ${averageScore.toFixed(1)}`;
      notesCollectedText.text = `NOTAS: ${notesCollected}`;

      if (scoreMultiplier === 1) player.ringCollectUI.text = `+${bonus}`;
      if (scoreMultiplier > 1)
        player.ringCollectUI.text = `x${scoreMultiplier}`;
      k.wait(1, () => {
        player.ringCollectUI.text = "";
      });
      return;
    }

    k.play("hurt", { volume: 0.5 });
    k.destroy(enemy);
    zeroNotesCount++;
    totalScore += 0;
    notesCollected++;
    averageScore = notesCollected > 0 ? totalScore / notesCollected : 0;

    scoreText.text = `MÉDIA: ${averageScore.toFixed(1)}`;
    notesCollectedText.text = `NOTAS: ${notesCollected}`;
    zeroNotesText.text = `NOTAS ZERO: ${zeroNotesCount}/${maxZeroNotes}`;

    if (zeroNotesCount >= 4) {
      zeroNotesText.color = k.Color.fromArray([255, 0, 0]);
    } else if (zeroNotesCount >= 3) {
      zeroNotesText.color = k.Color.fromArray([255, 165, 0]);
    } else if (zeroNotesCount >= 2) {
      zeroNotesText.color = k.Color.fromArray([255, 255, 0]);
    }

    player.ringCollectUI.text = `+0`;
    k.wait(1, () => {
      player.ringCollectUI.text = "";
    });

    gameSpeed = gameSpeed * 0.9;

    if (zeroNotesCount >= maxZeroNotes) {
      k.setData("current-score", averageScore);
      if (citySfx && !citySfx.paused) {
        citySfx.paused = true;
      }
      k.play("hurt", { volume: 0.8 });
      k.wait(0.5, () => {
        k.go("gameover");
      });
      return;
    }
  });

  // Velocidade do jogo
  let gameSpeed = 1200;
  k.loop(1, () => {
    if (gameSpeed < 5000) {
      gameSpeed += 50;
    }
  });

  // Spawn de inimigos
  const spawnMotoBug = () => {
    const motobug = makeMotobug(k.vec2(k.width() + 50, 777));
    motobug.onUpdate(() => {
      const currentSpeed = gameSpeed;
      motobug.move(-(currentSpeed + 100), 0);
    });

    motobug.onExitScreen(() => {
      if (motobug.pos.x < -motobug.width) {
        k.destroy(motobug);
      }
    });

    const waitTime = k.rand(1.5, 3.5);
    k.wait(waitTime, spawnMotoBug);
  };

  spawnMotoBug();

  // Spawn de notas
  const spawnNote = () => {
    const note = makeNote(
      k.vec2(k.width() + 50, k.randi(650, 745)),
      nextNoteValue
    );

    note.onUpdate(() => {
      note.move(-gameSpeed, 0);
    });

    note.onExitScreen(() => {
      if (note.pos.x < -note.width) {
        k.destroy(note);
      }
    });

    nextNoteValue = nextNoteAfterThat;
    nextNoteAfterThat = k.randi(0, 11);

    if (nextNotePreview && nextNotePreview.exists()) {
      k.destroy(nextNotePreview);
    }
    nextNotePreview = k.add([
      k.sprite(`note${nextNoteValue}`),
      k.pos(1000, 83),
      k.anchor("center"),
      k.scale(1.5),
      k.fixed(),
    ]);

    const waitTime = k.rand(0.8, 2.5);
    k.wait(waitTime, spawnNote);
  };

  spawnNote();

  // Plataforma de chão
  k.add([
    k.rect(k.width(), 300),
    k.opacity(0),
    k.area(),
    k.pos(0, 840),
    k.body({ isStatic: true }),
    "platform",
  ]);

  // Limpar recursos ao sair da cena
  k.onSceneLeave(() => {
    jumpButton.destroy();
    gameControls.cleanup();
  });

  // Update principal
  k.onUpdate(() => {
    if (player.isGrounded()) scoreMultiplier = 0;

    const backgroundSpeed = gameSpeed * 0.5;
    
    // Atualizar o background manager
    bgManager.update(backgroundSpeed * k.dt());

    // Atualizar debug info
    if (bgManager.initialized && !isTransitioning) {
      const progress = (bgManager.scrollX / bgManager.totalWidth) * 100;
      const currentBg = Math.floor(bgManager.scrollX / bgManager.bgWidth);
      const bgName = phases[currentPhaseIndex].backgrounds[currentBg] || phases[currentPhaseIndex].backgrounds[0];
      debugText.text = `Progresso: ${progress.toFixed(1)}% | Atual: ${bgName}`;
    }
    
    // Verificar se há algo cobrindo os backgrounds (uma vez por segundo)
    if (k.time() % 1 < 0.016) { // aproximadamente uma vez por segundo
      const allObjects = k.get("*");
      const objectsAboveBg = allObjects.filter(obj => obj.z > -100 && obj.z < 0);
      if (objectsAboveBg.length > 0) {
        console.log("AVISO: Objetos entre background e câmera:", objectsAboveBg.length);
        objectsAboveBg.forEach(obj => {
          console.log("  - Z:", obj.z, "Opacity:", obj.opacity, "Tags:", obj.tags);
        });
      }
    }
  });
}