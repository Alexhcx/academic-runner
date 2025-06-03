import kaplay from "kaplay";

// Função para detectar se é um dispositivo móvel
const isMobile = () => {
  // Verifica user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Verifica se é touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Verifica largura da tela (considera mobile se menor que 768px)
  const isSmallScreen = window.innerWidth < 768;
  
  return mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen);
};

// Detecta se é mobile
const mobile = isMobile();

// Configura os botões baseado no dispositivo
const buttonConfig = {
  jump: {
    keyboard: ["space"],
    ...(mobile ? {} : { mouse: "left" }) // Só adiciona mouse se não for mobile
  },
};

const k = kaplay({
  width: 1920,
  height: 1080,
  letterbox: true,
  background: [0, 0, 0],
  global: false,
  buttons: buttonConfig,
  touchToMouse: !mobile, // Desabilita touchToMouse em mobile
  debug: false,
});

// Exporta também a informação se é mobile para usar em outras partes do código
k.isMobile = mobile;

export default k;