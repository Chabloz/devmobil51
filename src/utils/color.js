import { getRandomInt } from '/utils/math.js';

export function randomHSL(saturation = '65%', lightness = '50%') {
  return `hsl(${getRandomInt(0, 360)}, ${saturation}, ${lightness})`;
}