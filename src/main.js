import k from "./kaplayCtx"
import disclaimer from "./scenes/disclaimer"
import game from "./scenes/game"
import gameover from "./scenes/gameover"
import mainMenu from "./scenes/mainMenu"
import characterSelect from "./scenes/characterSelect"
import { gameUI } from "./ui/gameUI"

let citySfx = null

k.loadSprite("fase01-01", "graphics/fasesjpg/0101.jpg")
k.loadSprite("fase01-02", "graphics/fasesjpg/0102.jpg")
k.loadSprite("fase01-03", "graphics/fasesjpg/0103.jpg")
k.loadSprite("fase02-01", "graphics/fasesjpg/0201.jpg")
k.loadSprite("fase02-02", "graphics/fasesjpg/0202.jpg")
k.loadSprite("fase02-03", "graphics/fasesjpg/0203.jpg")
k.loadSprite("fase03-01", "graphics/fasesjpg/0301.jpg")
k.loadSprite("fase03-02", "graphics/fasesjpg/0302.jpg")
k.loadSprite("fase03-03", "graphics/fasesjpg/0303.jpg")
k.loadSprite("fase04-01", "graphics/fasesjpg/0401.jpg")
k.loadSprite("fase04-02", "graphics/fasesjpg/0402.jpg")
k.loadSprite("fase04-03", "graphics/fasesjpg/0403.jpg")
k.loadSprite("formatura", "graphics/fasesjpg/prom.png")
k.loadSprite("formandos", "graphics/perg.png")
k.loadSprite("platforms", "graphics/fasesjpg/platforms.png")
k.loadSprite("platforms02", "graphics/fasesjpg/platforms02.png")
k.loadSprite("platforms03", "graphics/fasesjpg/platforms03.png")
k.loadSprite("platforms04", "graphics/fasesjpg/platforms04.png")
k.loadSprite("qrcode","graphics/qrcode.png")

// Gleisla
k.loadSprite("gleisla", "graphics/gleisla.png", {
  sliceX: 8,
  sliceY: 2,
  anims: {
    run: { from: 8, to: 15, loop: true, speed: 20 },
    jump: { from: 0, to: 7, loop: true, speed: 8 },
  },
})

// Nicoly
k.loadSprite("nicoly", "graphics/nicoly.png", {
  sliceX: 8,
  sliceY: 2,
  anims: {
    run: { from: 8, to: 15, loop: true, speed: 20 },
    jump: { from: 0, to: 7, loop: true, speed: 8 },
  },
})

// Alexandre
k.loadSprite("alexandre", "graphics/alexandre.png", {
  sliceX: 8,
  sliceY: 2,
  anims: {
    run: { from: 8, to: 15, loop: true, speed: 20 },
    jump: { from: 0, to: 7, loop: true, speed: 8 },
  },
})

// Edvaldo
k.loadSprite("edvaldo", "graphics/edvaldo.png", {
  sliceX: 8,
  sliceY: 2,
  anims: {
    run: { from: 8, to: 15, loop: true, speed: 20 },
    jump: { from: 0, to: 7, loop: true, speed: 8 },
  },
})

// Alberto
k.loadSprite("alberto", "graphics/alberto.png", {
  sliceX: 8,
  sliceY: 2,
  anims: {
    run: { from: 8, to: 15, loop: true, speed: 20 },
    jump: { from: 0, to: 7, loop: true, speed: 8 },
  },
})

// Carregando sprites das notas (0 a 10)
for (let i = 0; i <= 10; i++) {
  k.loadSprite(`note${i}`, `graphics/notas/nota${i}.png`,{
    sliceX: 3,
    sliceY: 1,
    anims: {
      spin: { from: 0, to: 2, loop: true, speed: 10 },
      },
  })
}

// logica e o sprite do ring não está mais sendo usado.
// k.loadSprite("ring", "graphics/ring.png", {
//   sliceX: 3,
//   sliceY: 1,
//   anims: {
//     spin: { from: 0, to: 2, loop: true, speed: 10 },
//   },
// })

k.loadSprite("motobug", "graphics/motobug.png", {
  sliceX: 8,
  sliceY: 1,
  anims: {
    run: { from: 0, to: 7, loop: true, speed: 8 },
  },
})
k.loadFont("mania", "fonts/mania.ttf")
k.loadSound("destroy", "sounds/Destroy.wav")
k.loadSound("hurt", "sounds/Hurt.wav")
k.loadSound("hyper-ring", "sounds/HyperRing.wav")
k.loadSound("jump", "sounds/Jump.wav")
k.loadSound("ring", "sounds/Ring.wav")
k.loadSound("city", "sounds/city.mp3")

// Registra as cenas
k.scene("disclaimer", disclaimer)
k.scene("main-menu", mainMenu)
k.scene("character-select", characterSelect)
k.scene("game", game)
k.scene("gameover", gameover)

// Define personagem padrão
if (!k.getData("selected-character")) {
  k.setData("selected-character", "gleisla")
}

// Modify the end of the file, just before k.go("disclaimer")
// Initialize the city music once and make it available globally
citySfx = k.play("city", { volume: 0.8, loop: true })

// Export the music reference so scenes can access it
window.gameSoundtrack = citySfx

k.go("disclaimer")
