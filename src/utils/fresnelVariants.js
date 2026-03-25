// utils/fresnelVariants.js

export const FRESNEL_VARIANTS = {

  "road": {
    intensity: 1.0,
    chromaBoost: 1.5,
    colorFront: [0.5, 0.02, 0.6],
    colorMid:   [1.0, 0.0, 0.0],
    colorEdge:  [0.97, 0.84, 0.09]
  },

  "sapphire": {
    intensity: 1.0,
    chromaBoost: 1.5,
    colorFront: [0.47, 0.77, 0.79],
    colorMid:   [0.09, 0.11, 0.30],
    colorEdge:  [0.42, 0.12, 0.4]
  },

  "24k": {
    intensity: 1.0,
    chromaBoost: 1.5,
    colorFront: [0.87, 0.65, 0.25],
    colorMid:   [0.87, 0.56, 0.16],
    colorEdge:  [0.53, 0.59, 0.4]
  },

  "black": {
    intensity: 0.0,
    chromaBoost: 0.0,
    colorFront: [0.05, 0.05, 0.05],
    colorMid:   [0.0, 0.0, 0.0],
    colorEdge:  [0.0, 0.0, 0.0]
  }

};