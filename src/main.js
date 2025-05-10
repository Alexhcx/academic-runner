import k from "./kaplayCtx"
import disclaimer from "./scenes/disclaimer"
import game from "./scenes/game"
import gameover from "./scenes/gameover"
import mainMenu from "./scenes/mainMenu"
import characterSelect from "./scenes/characterSelect"

// Add this global variable at the top of the file, after the imports
let citySfx = null

// Carregando sprites dos personagens
k.loadSprite("chemical-bg", "graphics/chemical-bg.png")
k.loadSprite("platforms", "graphics/platforms.png")

// Gleisla
k.loadSprite("gleisla", "graphics/gleisla.png", {
  sliceX: 8,
  sliceY: 2,
  anims: {
    run: { from: 8, to: 15, loop: true, speed: 20 },
    jump: { from: 0, to: 7, loop: true, speed: 8 },
  },
})

// Tails (usando o mesmo sprite de Sonic temporariamente)
k.loadSprite("nicoly", "graphics/nicoly.png", {
  sliceX: 8,
  sliceY: 2,
  anims: {
    run: { from: 8, to: 15, loop: true, speed: 20 },
    jump: { from: 0, to: 7, loop: true, speed: 8 },
  },
})

// Knuckles (usando o mesmo sprite de Sonic temporariamente)
k.loadSprite("knuckles", "graphics/sonic.png", {
  sliceX: 8,
  sliceY: 2,
  anims: {
    run: { from: 8, to: 15, loop: true, speed: 20 },
    jump: { from: 0, to: 7, loop: true, speed: 8 },
  },
})

// Amy (usando o mesmo sprite de Sonic temporariamente)
k.loadSprite("amy", "graphics/sonic.png", {
  sliceX: 8,
  sliceY: 2,
  anims: {
    run: { from: 8, to: 15, loop: true, speed: 20 },
    jump: { from: 0, to: 7, loop: true, speed: 8 },
  },
})

// Shadow (usando o mesmo sprite de Sonic temporariamente)
k.loadSprite("shadow", "graphics/sonic.png", {
  sliceX: 8,
  sliceY: 2,
  anims: {
    run: { from: 8, to: 15, loop: true, speed: 20 },
    jump: { from: 0, to: 7, loop: true, speed: 8 },
  },
})

k.loadSprite("ring", "graphics/ring.png", {
  sliceX: 3,
  sliceY: 1,
  anims: {
    spin: { from: 0, to: 2, loop: true, speed: 10 },
  },
})
k.loadSprite("motobug", "graphics/motobug.png", {
  sliceX: 5,
  sliceY: 1,
  anims: {
    run: { from: 0, to: 4, loop: true, speed: 8 },
  },
})
k.loadFont("mania", "fonts/mania.ttf")
k.loadSound("destroy", "sounds/Destroy.wav")
k.loadSound("hurt", "sounds/Hurt.wav")
k.loadSound("hyper-ring", "sounds/HyperRing.wav")
k.loadSound("jump", "sounds/Jump.wav")
k.loadSound("ring", "sounds/Ring.wav")
k.loadSound("city", "sounds/city.mp3")

// Registrando as cenas
k.scene("disclaimer", disclaimer)
k.scene("main-menu", mainMenu)
k.scene("character-select", characterSelect)
k.scene("game", game)
k.scene("gameover", gameover)

// Definir personagem padrão
if (!k.getData("selected-character")) {
  k.setData("selected-character", "gleisla")
}

// Modify the end of the file, just before k.go("disclaimer")
// Initialize the city music once and make it available globally
citySfx = k.play("city", { volume: 0.8, loop: true })

// Export the music reference so scenes can access it
window.gameSoundtrack = citySfx

k.go("disclaimer")
