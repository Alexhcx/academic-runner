import k from "../kaplayCtx";
import { makeGameEnding } from "../scenes/components/gameEnding";
import { makePlayer } from "../entities/player";
import { makeMotobug } from "../entities/motobug";
import { makeNote } from "../entities/note";
import { makeTextShadow } from "../scenes/components/textBackgroundShadow";
import { makeGameControls } from "../scenes/components/gameControls";
import { makeEasyMode } from "../scenes/components/easyMode";

import rankingView from "./components/rankingView";
import { gameUI } from "../ui/gameUI";

export default function game() {
  
  const citySfx = window.gameSoundtrack;
  if (citySfx && citySfx.paused) {
    citySfx.paused = false;
  }
  k.setGravity(3100);

  // Define que estamos na cena do jogo
  k.setData('current-scene', 'game');
  
  // Dispara evento para atualizar a UI
  window.dispatchEvent(new Event('sceneChanged'));

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
      backgrounds: ["fase01-01", "fase01-02", "fase01-03", 
                    "fase01-01", "fase01-02", "fase01-03", 
                    "fase01-01", "fase01-02", "fase01-03",
                    "fase01-01", "fase01-02", "fase01-03"],
      platform: "platforms"
    },
    {
      name: "Fase 2", 
      backgrounds: ["fase02-01", "fase02-02", "fase02-03", 
                    "fase02-01", "fase02-02", "fase02-03", 
                    "fase02-01", "fase02-02", "fase02-03",
                    "fase02-01", "fase02-02", "fase02-03"],
      platform: "platforms02"
    },
    {
      name: "Fase 3",
      backgrounds: ["fase03-01", "fase03-02", "fase03-03", 
                    "fase03-01", "fase03-02", "fase03-03", 
                    "fase03-01", "fase03-02", "fase03-03",
                    "fase03-01", "fase03-02", "fase03-03"],
      platform: "platforms03"
    },
    {
      name: "Fase 4",
      backgrounds: ["fase04-01", "fase04-02", "fase04-03", 
                    "fase04-01", "fase04-02", "fase04-03", 
                    "fase04-01", "fase04-02", "fase04-03",
                    "fase04-01", "fase04-02", "fase04-03"],
      platform: "platforms04"
    }
  ];

  let currentPhaseIndex = 0;
  let isTransitioning = false;
  
  // Variáveis de controle para o game ending
  let gameEndingStarted = false;
  let enemySpawnActive = true;
  let noteSpawnActive = true;

  k.scene("ranking-view", rankingView)
  
  // Classe para gerenciar o background scrolling
  class BackgroundManager {
    constructor() {
      this.layers = []; // Array para múltiplas camadas de background
      this.currentPhase = phases[currentPhaseIndex];
      this.bgWidth = 1920 * bgScale;
      this.platformWidth = 0;
      this.scrollX = 0;
      this.initialized = false;
      this.transitionStartX = 0;
      this.fadeOverlay = null;
    }

    init() {
      makeTextShadow()
      
      // Calcular largura da plataforma
      const tempPlat = k.add([
        k.sprite(this.currentPhase.platform),
        k.scale(platformScale),
        k.opacity(0)
      ]);
      this.platformWidth = tempPlat.width * platformScale;
      k.destroy(tempPlat);
      
      // Criar a primeira camada
      this.createLayer(0);
      this.initialized = true;
    }

    createLayer(layerIndex) {
      const layer = {
        index: layerIndex,
        phase: this.currentPhase,
        bgPieces: [],
        platformPieces: [],
        opacity: layerIndex === 0 ? bgOpacity : 0,
        destroying: false,
        startX: 0
      };

      // Criar backgrounds
      let xPos = 0;
      this.currentPhase.backgrounds.forEach((bgSprite, index) => {
        const bg = k.add([
          k.sprite(bgSprite),
          k.pos(xPos, bgY),
          k.scale(bgScale),
          k.opacity(layer.opacity),
          k.z(-100 + layerIndex),
          "background",
          `layer-${layerIndex}`,
          { index, originalX: xPos, layer: layerIndex }
        ]);
        
        layer.bgPieces.push(bg);
        xPos += this.bgWidth;
      });

      // Adicionar cópia do primeiro background para loop
      const firstBgCopy = k.add([
        k.sprite(this.currentPhase.backgrounds[0]),
        k.pos(xPos, bgY),
        k.scale(bgScale),
        k.opacity(layer.opacity),
        k.z(-100 + layerIndex),
        "background",
        `layer-${layerIndex}`,
        { index: this.currentPhase.backgrounds.length, originalX: xPos, layer: layerIndex }
      ]);
      layer.bgPieces.push(firstBgCopy);

      layer.totalWidth = this.bgWidth * this.currentPhase.backgrounds.length;

      // Criar plataformas
      const numPlatforms = Math.ceil(layer.totalWidth / this.platformWidth) + 2;
      xPos = 0;
      const platOpacity = layer.opacity === 0 ? 0 : 1;
      
      for (let i = 0; i < numPlatforms; i++) {
        const platform = k.add([
          k.sprite(this.currentPhase.platform),
          k.pos(xPos, platformY),
          k.scale(platformScale),
          k.opacity(platOpacity),
          k.z(-50 + layerIndex),
          "platform",
          `layer-${layerIndex}`,
          { index: i, originalX: xPos, layer: layerIndex }
        ]);
        layer.platformPieces.push(platform);
        xPos += this.platformWidth;
      }

      this.layers.push(layer);
      return layer;
    }

    update(speed) {
      if (!this.initialized) return;

      this.scrollX += speed;

      // Atualizar todas as camadas
      this.layers.forEach((layer, layerIdx) => {
        if (layer.destroying) return;

        const layerScrollX = this.scrollX - layer.startX;

        // Mover backgrounds
        layer.bgPieces.forEach(bg => {
          if (bg.exists()) {
            bg.pos.x = bg.originalX - layerScrollX;
          }
        });

        // Mover plataformas com loop
        layer.platformPieces.forEach(platform => {
          if (platform.exists()) {
            platform.pos.x = platform.originalX - layerScrollX;
            
            if (platform.pos.x + this.platformWidth < 0) {
              const maxX = Math.max(...layer.platformPieces.map(p => p.originalX));
              platform.originalX = maxX + this.platformWidth;
              platform.pos.x = platform.originalX - layerScrollX;
            }
          }
        });

        // Verificar se completou o ciclo da fase atual (apenas para a camada ativa)
        if (layerIdx === 0 && layerScrollX >= layer.totalWidth) {
          console.log(`Fase ${currentPhaseIndex} completa!`); // Debug
          this.onPhaseComplete();
        }
      });
    }

    async onPhaseComplete() {
      if (isTransitioning) return;
      
      // Verificar se chegou na fase "fim" (índice 4)
      if (currentPhaseIndex === 3 && !gameEndingStarted) {
        gameEndingStarted = true;
        // Chamar a função handleGameEnding que está fora da classe
        handleGameEnding();
        return;
      }
      
      const nextPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      
      if (nextPhaseIndex === 0) {
//         console.log("Completou todas as fases! Reiniciando ciclo...");
      }

//       console.log(`Iniciando transição: ${phases[currentPhaseIndex].name} → ${phases[nextPhaseIndex].name}`);
      this.startSeamlessTransition(nextPhaseIndex);
    }

    startSeamlessTransition(newPhaseIndex) {
      if (isTransitioning) return;
      isTransitioning = true;

      const oldPhase = currentPhaseIndex;
      currentPhaseIndex = newPhaseIndex;
      this.currentPhase = phases[newPhaseIndex];

      // Guardar a posição atual do scroll
      this.transitionStartX = this.scrollX;

      // Criar nova camada invisível
      const newLayer = this.createLayer(this.layers.length);
      newLayer.startX = this.scrollX;

      // Criar fade overlay se não existir
      if (!this.fadeOverlay) {
        this.fadeOverlay = k.add([
          k.rect(k.width(), k.height()),
          k.color(0, 0, 0),
          k.opacity(0),
          k.pos(0, 0),
          k.z(900),
          k.fixed()
        ]);
      }

      // Fazer o fade gradual
      const fadeDuration = 1.0;
      const fadeSteps = 60;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        const progress = currentStep / fadeSteps;
        
        // Fade overlay para escurecer
        if (this.fadeOverlay && this.fadeOverlay.exists()) {
          this.fadeOverlay.opacity = Math.sin(progress * Math.PI) * 0.8;
        }

        // Fade out da camada antiga
        if (this.layers[0]) {
          this.layers[0].bgPieces.forEach(bg => {
            if (bg.exists()) bg.opacity = bgOpacity * (1 - progress);
          });
          this.layers[0].platformPieces.forEach(plat => {
            if (plat.exists()) plat.opacity = 1 - progress;
          });
        }

        // Fade in da nova camada
        if (newLayer) {
          newLayer.bgPieces.forEach(bg => {
            if (bg.exists()) bg.opacity = bgOpacity * progress;
          });
          newLayer.platformPieces.forEach(plat => {
            if (plat.exists()) plat.opacity = progress;
          });
        }

        if (currentStep >= fadeSteps) {
          clearInterval(fadeInterval);
          
          // Remover fade overlay
          if (this.fadeOverlay && this.fadeOverlay.exists()) {
            this.fadeOverlay.opacity = 0;
          }

          // Destruir camada antiga
          if (this.layers[0]) {
            this.destroyLayer(this.layers[0]);
            this.layers.shift(); // Remove a primeira camada
          }

          // Resetar scrollX relativo à nova camada
          this.layers[0].startX = 0;
          this.scrollX = this.scrollX - this.transitionStartX;

          stageInfoText.text = this.currentPhase.name;
          isTransitioning = false;
//           console.log("Transição concluída!");
        }
      }, fadeDuration * 1000 / fadeSteps);
    }

    destroyLayer(layer) {
      layer.destroying = true;
      
      layer.bgPieces.forEach(bg => {
        if (bg && bg.exists()) {
          k.destroy(bg);
        }
      });
      
      layer.platformPieces.forEach(platform => {
        if (platform && platform.exists()) {
          k.destroy(platform);
        }
      });
      
      layer.bgPieces = [];
      layer.platformPieces = [];
    }

    destroy() {
      this.layers.forEach(layer => {
        this.destroyLayer(layer);
      });
      this.layers = [];
      
      if (this.fadeOverlay && this.fadeOverlay.exists()) {
        k.destroy(this.fadeOverlay);
      }
    }
  }

  const gameEnding = makeGameEnding(k);

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

  // Criar o componente Easy Mode
  const easyMode = makeEasyMode();

  // UI Elements
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
    k.color(0, 255, 0),
    k.fixed(),
  ]);

  // Sistema de preview da próxima nota
  let currentNoteValue = k.randi(0, 11);
  let nextNoteValue = k.randi(0, 11);

  let nextNotePreview = k.add([
    k.sprite(`note${easyMode.isEnabled() ? 10 : currentNoteValue}`),
    k.pos(1851, 162),
    k.anchor("center"),
    k.scale(1.5),
    k.fixed(),
  ]);

  // Inicializar Easy Mode com callback para atualizar preview
  easyMode.init((isEnabled) => {
    // Atualizar o preview da nota quando o modo mudar
    if (nextNotePreview && nextNotePreview.exists()) {
      k.destroy(nextNotePreview);
    }
    nextNotePreview = k.add([
      k.sprite(`note${isEnabled ? 10 : currentNoteValue}`),
      k.pos(1851, 162),
      k.anchor("center"),
      k.scale(1.5),
      k.fixed(),
    ]);
  });

  // Botão de Main Menu
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

  // NOVO: Botão de Ranking ao lado do Main Menu
  const rankingButton = k.add([
    k.rect(150, 60, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 215, 0])), // Dourado
    k.anchor("center"),
    k.area(),
    k.pos(1620, 40), // Posicionado à esquerda do Main Menu
    k.fixed(),
  ]);

  rankingButton.add([
    k.text("RANKING", { font: "mania", size: 32 }),
    k.anchor("center"),
  ]);

  rankingButton.onHover(() => {
    rankingButton.outline.width = 6;
    rankingButton.color = k.Color.fromArray([0, 0, 0, 0.9]);
  });

  rankingButton.onHoverEnd(() => {
    rankingButton.outline.width = 4;
    rankingButton.color = k.Color.fromArray([0, 0, 0, 0.7]);
  });

  rankingButton.onClick(() => {
    k.play("ring", { volume: 0.5 });
    // Salvar estado atual do jogo antes de ir para o ranking
    k.setData("game-state", {
      score: averageScore,
      notes: notesCollected,
      zeroNotes: zeroNotesCount,
      phase: currentPhaseIndex,
      character: selectedCharacter
    });
    k.go("ranking-view"); // Você precisará criar esta cena
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

    if (zeroNotesCount >= 5) {
      zeroNotesText.color = k.Color.fromArray([255, 0, 0]); // Red
    } else if (zeroNotesCount >= 4) {
      zeroNotesText.color = k.Color.fromArray([255, 165, 0]); // Orange
    } else if (zeroNotesCount >= 3) {
      zeroNotesText.color = k.Color.fromArray([255, 255, 0]); // Yellow
    } else if (zeroNotesCount >= 2) {
      zeroNotesText.color = k.Color.fromArray([0, 100, 0]); // Dark Green
    } else if (zeroNotesCount >= 1) {
      zeroNotesText.color = k.Color.fromArray([0, 255, 0]); // Green
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
  let gameSpeed = 1500;
  k.loop(1, () => {
    if (gameSpeed < 5000) {
      gameSpeed += 25;
    }
  });

  // Spawn de inimigos
  const spawnMotoBug = () => {
    if (!enemySpawnActive) return; // Para de spawnar se o jogo acabou
    
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
    if (!noteSpawnActive) return; // Para de spawnar se o jogo acabou
    
    const note = makeNote(
      k.vec2(k.width() + 50, k.randi(650, 745)),
      easyMode.isEnabled() ? 10 : currentNoteValue
    );

    note.onUpdate(() => {
      note.move(-gameSpeed, 0);
    });

    note.onExitScreen(() => {
      if (note.pos.x < -note.width) {
        k.destroy(note);
      }
    });

    // Atualizar o preview com a próxima nota
    currentNoteValue = nextNoteValue;
    nextNoteValue = easyMode.isEnabled() ? 10 : k.randi(0, 11);

    if (nextNotePreview && nextNotePreview.exists()) {
      k.destroy(nextNotePreview);
    }
    nextNotePreview = k.add([
      k.sprite(`note${easyMode.isEnabled() ? 10 : currentNoteValue}`),
      k.pos(1851, 162),
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

  // Função handleGameEnding movida para fora da classe
  const handleGameEnding = () => {
    console.log("Iniciando game ending..."); // Debug
    
    // Parar spawn de inimigos e notas
    enemySpawnActive = false;
    noteSpawnActive = false;
    
    // Destruir inimigos e notas existentes
    k.get("enemy").forEach(enemy => k.destroy(enemy));
    k.get("note").forEach(note => k.destroy(note));
    
    // Esconder preview da próxima nota
    if (nextNotePreview && nextNotePreview.exists()) {
      k.destroy(nextNotePreview);
    }
    
    // Parar a música - corrigido
    if (citySfx && citySfx.paused !== undefined) {
      citySfx.paused = true;
    }
    
    // Obter nome do personagem
    const characterNames = {
      "nicoly": "Nicoly",
      "gleisla": "Gleisla",
      "alexandre": "Alexandre",
      "edvaldo": "Edvaldo",
      "alberto": "Alberto",
    };
      
    const playerName = characterNames[selectedCharacter] || "Jogador";
    
    console.log(`Iniciando sequência para ${playerName} com média ${averageScore}`); // Debug
    
    // Parar o movimento do background
    gameSpeed = 0;
    
    // Iniciar sequência de final
    gameEnding.start(playerName, averageScore, (approved) => {
      console.log(`Final concluído - Aprovado: ${approved}`); // Debug
      
      // INTEGRAÇÃO COM RANKING: Salvar pontuação no ranking
      let rankings = k.getData("rankings") || [];
      
      const newEntry = {
        score: averageScore,
        character: selectedCharacter,
        characterName: playerName,
        timestamp: Date.now(),
        isGameEnding: true // Marca que veio do game ending
      };
      
      rankings.push(newEntry);
      
      // Ordena e pega top 10
      rankings = rankings
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      // Salva o ranking atualizado
      k.setData("rankings", rankings);
      
      // Salva o score atual para uso na tela de gameover
      k.setData("current-score", averageScore);
      
      if (approved) {
        // Aprovado - ir para tela de gameover (que mostrará aprovado)
        k.go("gameover");
      } else {
        // Reprovado - ir para tela de gameover (que mostrará reprovado)
        k.go("gameover");
      }
    });
  };

  // Limpar recursos ao sair da cena
  k.onSceneLeave(() => {
    easyMode.cleanup(); // Limpar o componente Easy Mode
    gameUI.hide(); // Hide UI when leaving game scene
    gameControls.cleanup();
    bgManager.destroy();
    gameEnding.cleanup();
  });

  // Update principal
  k.onUpdate(() => {
    if (player.isGrounded()) scoreMultiplier = 0;

    const backgroundSpeed = gameSpeed * 0.5;
    
    // Atualizar o background manager
    bgManager.update(backgroundSpeed * k.dt());
  });
}