import k from "../../kaplayCtx";

export function makeTextShadow() {
  // const backShadowDebugText = k.add([
  //   k.rect(532, 32),
  //   k.color(0, 0, 0, 0.7),
  //   k.opacity(0.5),
  //   k.anchor("center"),
  //   k.area(),
  //   k.pos(1645, 110),
  // ]);

  const backShadowMedia = k.add([
    k.rect(320, 72, { radius: 5 }),
    k.color(0, 0, 0, 0.7),
    k.opacity(0.5),
    k.anchor("center"),
    k.area(),
    k.pos(167, 45),
  ]);

  const backShadowNote = k.add([
    k.rect(120, 125, { radius: 4 }),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.area(),
    k.anchor("center"),
    k.outline(2, k.Color.fromArray([255, 255, 255])),
    k.pos(1845, 160),
  ]);

  // const backShadowNextNote = k.add([
  //   k.rect(365, 60, { radius: 5 }),
  //   k.color(0, 0, 0, 0.7),
  //   k.opacity(0.5),
  //   k.anchor("center"),
  //   k.area(),
  //   k.pos(998, 45),
  // ]);

  // Shadow for stage info text
  const backShadowStage = k.add([
    k.rect(200, 38, { radius: 5 }),
    k.color(0, 0, 0, 0.7),
    k.opacity(0.5),
    k.area(),
    k.pos(8, 137),
  ]);

  // Shadow for notes collected text
  const backShadowNotes = k.add([
    k.rect(200, 38, { radius: 5 }),
    k.color(0, 0, 0, 0.7),
    k.opacity(0.5),
    k.area(),
    k.pos(8, 96),
  ]);

  // Shadow for zero notes text
  const backShadowZeroNotes = k.add([
    k.rect(280, 38, { radius: 5 }),
    k.color(0, 0, 0, 0.7),
    k.opacity(0.5),
    k.area(),
    k.pos(8, 178),
  ]);

  return backShadowMedia, backShadowNote, backShadowStage, backShadowNotes, backShadowZeroNotes;
}
