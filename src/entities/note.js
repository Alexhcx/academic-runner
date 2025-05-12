import k from "../kaplayCtx"

export function makeNote(pos) {
  // Gera um valor aleatório de nota entre 0 e 10
  const noteValue = k.randi(0, 11) // 0 a 10

  const note = k.add([
    k.sprite(`note${noteValue}`), // Usa o sprite correspondente ao valor da nota
    k.area(),
    k.scale(1.3),
    k.anchor("center"),
    k.pos(pos),
    k.offscreen(),
    "note", // Tag para identificar como nota
    {
      value: noteValue, // Armazenar o valor da nota para cálculo posterior
    },
  ])

  return note
}
