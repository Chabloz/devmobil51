export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function moduloEuclidian(op1, op2) {
  return ((op1 % op2) + op2) % op2;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export const TAU = 2 * Math.PI;