import k from "../kaplayCtx";

export default function disclaimer() {
  // Add QR Code
  k.add([
    k.sprite("qrcode"),
    k.scale(0.3),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y - 10),
  ]);

  k.add([
    k.text(
      `
        Esse jogo é um projeto da disciplina de FUNDAMENTOS DE JOGOS
        no curso de Análise e Desenvolvimento de Sistemas.
      `,
      { font: "mania", size: 32 }
    ),
  ]);

  k.add([
    k.text("Aperte Espaço/Clique/Toque para jogar", {
      font: "mania",
      size: 64,
    }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 450),
  ]);

  k.onButtonPress("jump", () => k.go("main-menu"));
}
