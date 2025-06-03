import kaplay from "kaplay";

const k = kaplay({
  width: 1920,
  height: 1080,
  letterbox: false,
  background: [0, 0, 0],
  global: false,
  buttons: {
    jump: {
      keyboard: ["space"],
      mouse: "left",
    },
  },
  touchToMouse: false,
  debug: false,
});

export default k;
