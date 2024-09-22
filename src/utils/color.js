import { getRandomInt } from '/utils/math.js';

export function randomHSL(saturation = '50%', lightness = '50%') {
  return `hsl(${getRandomInt(0, 360)}, ${saturation}, ${lightness})`;
}