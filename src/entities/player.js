import k from "../kaplayCtx"

export function makePlayer(pos, characterId = "gleisla") {
  const player = k.add([
    k.sprite(characterId, { anim: "run" }),
    k.scale(4),
    k.area(),
    k.anchor("center"),
    k.pos(pos),
    k.body({ jumpForce: 1700 }),
    {
      characterId,
      ringCollectUI: null,
      setControls() {
        k.onButtonPress("jump", () => {
          if (this.isGrounded()) {
            this.play("jump")
            this.jump()
            k.play("jump", { volume: 0.5 })
          }
        })
      },
      setEvents() {
        this.onGround(() => {
          this.play("run")
        })
      },
    },
  ])

  player.ringCollectUI = player.add([
    k.text("", { font: "mania", size: 24 }),
    k.color(255, 255, 0),
    k.anchor("center"),
    k.pos(30, -10),
  ])

  return player
}
