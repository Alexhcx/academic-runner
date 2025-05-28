import k from "../kaplayCtx"

export function makeNote(pos, specificValue = null) {
  // Se um valor específico foi passado, usa ele, senão gera aleatório
  const noteValue = specificValue !== null ? specificValue : k.randi(0, 11)

  const note = k.add([
    k.sprite(`note${noteValue}`),
    k.area(),
    k.scale(1.3),
    k.anchor("center"),
    k.pos(pos),
    k.offscreen(),
    "note",
    {
      value: noteValue,
    },
  ])

  return note
}