const makeEaseOut = (timing) => (timeFraction) => 1 - timing(1 - timeFraction);

const makeEaseInOut = (timing) => (timeFraction) => {
  if (timeFraction < .5) return timing(2 * timeFraction) / 2;
  return (2 - timing(2 * (1 - timeFraction))) / 2;
}
const easingFct = new Map();

easingFct.set('linear', timeFraction => timeFraction);
easingFct.set('quad', timeFraction => timeFraction ** 2);
easingFct.set('cubic', timeFraction => timeFraction ** 3);
easingFct.set('circ', timeFraction => 1 - Math.sin(Math.acos(timeFraction)));
easingFct.set('back', timeFraction => {
  return Math.pow(timeFraction, 2) * (2.5 * timeFraction - 1.5);
});
easingFct.set('bounce', timeFraction => {
  for (let a = 0, b = 1; 1; a += b, b /= 2) {
    if (timeFraction >= (7 - 4 * a) / 11) {
      return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
    }
  }
});
easingFct.set('elastic', timeFraction => {
  return Math.pow(2, 10 * (timeFraction - 1)) * Math.cos(31.415926535 * timeFraction)
});

easingFct.set('quadOut', makeEaseOut(easingFct.get('quad')));
easingFct.set('cubicOut', makeEaseOut(easingFct.get('cubic')));
easingFct.set('circOut', makeEaseOut(easingFct.get('circ')));
easingFct.set('backOut', makeEaseOut(easingFct.get('back')));
easingFct.set('bounceOut', makeEaseOut(easingFct.get('bounce')));
easingFct.set('elasticOut', makeEaseOut(easingFct.get('elastic')));

easingFct.set('quadInOut', makeEaseInOut(easingFct.get('quad')));
easingFct.set('cubicInOut', makeEaseInOut(easingFct.get('cubic')));
easingFct.set('circInOut', makeEaseInOut(easingFct.get('circ')));
easingFct.set('backInOut', makeEaseInOut(easingFct.get('back')));
easingFct.set('bounceInOut', makeEaseInOut(easingFct.get('bounce')));
easingFct.set('elasticInOut', makeEaseInOut(easingFct.get('elastic')));

export const easings = [...easingFct.keys()];

export default class Tweens{

  constructor() {
    this.tweens = new Set();
  }

  create({
    dur = 1000,
    from = 0,
    to = 1,
    loop = false,
    yoyo = false,
    ease = 'linear',
    animate
  } = {}) {
    ease = easingFct.get(ease);
    const tween = {time: 0, dur, ease, from, to, loop, yoyo, animate};
    this.tweens.add(tween);
    return tween;
  }

  isRunning(tween) {
    return this.tweens.has(tween);
  }

  delete(tween) {
    this.tweens.delete(tween);
  }

  deleteAll() {
    this.tweens = new Set();
  }

  update(dt) {

    for (const tween of this.tweens) {
      tween.time += dt;
      let timeFraction = tween.time / tween.dur;
      if (timeFraction > 1) timeFraction = 1;

      const progress = (tween.to - tween.from) * tween.ease(timeFraction) + tween.from;

      tween.animate(progress);

      if (timeFraction != 1) continue;

      // Manage the end of life of the tween
      if (tween.loop || tween.yoyo) {
        if (tween.yoyo) [tween.to, tween.from] = [tween.from, tween.to];
        if (tween.yoyo && !tween.loop) tween.yoyo = false;
        tween.time = 0;
      } else {
        this.tweens.delete(tween);
      }
    }
  }

}