import k from "../kaplayCtx";

export default function disclaimer() {
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
    k.pos(k.center()),
  ]);

  k.onButtonPress("jump", () => k.go("main-menu"));
}
