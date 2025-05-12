import k from "../kaplayCtx"
import { makePlayer } from "../entities/player"

export default function mainMenu() {
  if (!k.getData("best-score")) k.setData("best-score", 0)

  // Reset gravity to prevent character falling
  k.setGravity(0)

  // --- Lógica do Background similar ao game.js ---
  const bgY = -26; // Mesma posição Y do game.js, ajuste se necessário
  const bgOpacity = 0.8; // Mesma opacidade do game.js
  const bgScale = 2; // Mesma escala do game.js
  const backgroundSpeed = 100; // Velocidade de movimento do background no menu

  // Adiciona a primeira peça do background para obter sua largura real (escalada)
  const bg1 = k.add([
    k.sprite("fase01"),
    k.pos(0, bgY),
    k.scale(bgScale),
    k.opacity(bgOpacity),
  ]);
  // ATENÇÃO: Em game.js, actualBgWidth é bg1.width + 5720.
  // Isso parece ser um valor específico para aquela cena ou imagem.
  // Se "fase01" é para ser uma imagem contínua, actualBgWidth deve ser apenas bg1.width.
  // Se houver um espaço ou uma razão para o +5720, você precisará replicar isso aqui ou ajustar.
  // Para um loop contínuo padrão, usaremos bg1.width.
  const actualBgWidth = bg1.width + 5720;

  // Adiciona a segunda peça do background, posicionada à direita da primeira
  const bg2 = k.add([
    k.sprite("fase01"),
    k.pos(actualBgWidth, bgY), // Posiciona logo após a primeira
    k.scale(bgScale),
    k.opacity(bgOpacity),
  ]);

  // Array para gerenciar as peças do background
  const backgroundPieces = [bg1, bg2];
  // --- Fim da lógica do Background ---

  // Botões do menu
  const playButton = k.add([
    k.rect(400, 100, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.center().x, k.center().y - 150),
    "clickable",
  ])

  playButton.add([k.text("JOGAR", { font: "mania", size: 48 }), k.anchor("center"), k.pos(0, 0)])

  const selectCharButton = k.add([
    k.rect(600, 100, { radius: 8 }),
    k.color(0, 0, 0, 0.7),
    k.outline(4, k.Color.fromArray([255, 255, 255])),
    k.anchor("center"),
    k.area(),
    k.pos(k.center().x, k.center().y - 20),
    "clickable",
  ])

  selectCharButton.add([k.text("SELECIONAR PERSONAGEM", { font: "mania", size: 48 }), k.anchor("center"), k.pos(0, 0)])

  // Eventos de clique
  playButton.onClick(() => {
    k.play("jump", { volume: 0.5 })
    k.go("game")
  })

  selectCharButton.onClick(() => {
    k.play("ring", { volume: 0.5 })
    k.go("character-select")
  })

  // Efeitos hover
  playButton.onHover(() => {
    playButton.outline.width = 6
    playButton.color = k.Color.fromArray([0, 0, 0, 0.9])
  })

  playButton.onHoverEnd(() => {
    playButton.outline.width = 4
    playButton.color = k.Color.fromArray([0, 0, 0, 0.7])
  })

  selectCharButton.onHover(() => {
    selectCharButton.outline.width = 6
    selectCharButton.color = k.Color.fromArray([0, 0, 0, 0.9])
  })

  selectCharButton.onHoverEnd(() => {
    selectCharButton.outline.width = 4
    selectCharButton.color = k.Color.fromArray([0, 0, 0, 0.7])
  })

  // Atalho de teclado
  k.onButtonPress("jump", () => k.go("game"))

  // Plataformas (a lógica de loop delas parece diferente e mais complexa,
  // focando apenas no background por enquanto, conforme solicitado)
  const platforms = [
    k.add([k.sprite("platforms"), k.pos(0, 450), k.scale(4)]),
    k.add([k.sprite("platforms"), k.pos(384, 450), k.scale(4)]),
  ]

  k.add([k.text("ACADEMIC RUNNER", { font: "mania", size: 96 }), k.anchor("center"), k.pos(k.center().x, 200)])

  // With this code to display all characters:
  // Array of all available characters
  const allCharacters = ["gleisla", "nicoly", "alexandre", "edvaldo", "alberto"]
  const selectedCharacter = k.getData("selected-character") || "gleisla"

  // Create all characters and position them one in front of the other
  const characterSpacing = 150 // Space between characters
  const startX = 655 // Starting X position
  const characterY = 741 // Y position for all characters

  // Create an array to hold all character objects
  const menuPlayers = []

  // Create each character
  allCharacters.forEach((charId, index) => {
    // Position each character with spacing
    const charX = startX + index * characterSpacing

    // Create the character
    const player = makePlayer(k.vec2(charX, characterY), charId)

    // Remove physics body to prevent falling
    if (player.body) {
      player.body.destroy()
    }

    // Highlight the selected character
    if (charId === selectedCharacter) {
      player.scaleTo = 4.5 // Make selected character slightly larger
    }

    menuPlayers.push(player)
  })

  // A constante gameSpeed não existe aqui, use backgroundSpeed para o parallax do fundo
  // A velocidade das plataformas (-gameSpeed) no mainMenu.js original era muito alta (4000)
  // Vou usar uma velocidade mais lenta para as plataformas também, ou você pode ajustar.
  const platformLoopSpeed = 200; // Ajuste conforme necessário

  k.onUpdate(() => {
    // --- Loop do Background ---
    for (const bg of backgroundPieces) {
      bg.move(-backgroundSpeed, 0) // Usa a backgroundSpeed definida

      if (bg.pos.x + actualBgWidth <= 0) {
        // Move esta peça para a direita, após a outra peça.
        // Como temos duas peças, ela se move duas larguras para frente de sua posição atual ANTES do reposicionamento.
        // Ou, mais simples, a nova posição X é a posição X da outra peça + a largura da outra peça.
        // Para garantir que funcione corretamente, encontramos a peça mais à direita e colocamos esta depois dela.
        let rightmostX = -Infinity;
        for (const otherBg of backgroundPieces) {
            if (otherBg !== bg && otherBg.pos.x > rightmostX) {
                rightmostX = otherBg.pos.x;
            }
        }
        bg.pos.x = rightmostX + actualBgWidth;
      }
    }
    // --- Fim do Loop do Background ---

    // Lógica das plataformas (mantendo a original do mainMenu.js, mas com velocidade ajustada)
    // Certifique-se de que platforms[0].width * 4 é a largura correta que você deseja usar para o loop.
    // Em game.js, a largura da plataforma era platformWidth = platforms[0].width
    const platformVisualWidth = platforms[0].width; // Usando a largura real da sprite escalada

    platforms[0].move(-platformLoopSpeed, 0);
    platforms[1].moveTo(platforms[0].pos.x + platformVisualWidth, 450);

    if (platforms[0].pos.x + platformVisualWidth < 0) {
        platforms[0].pos.x = platforms[1].pos.x + platformVisualWidth;
        platforms.push(platforms.shift());
    }
  })
}