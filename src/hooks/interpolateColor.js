import Animated from 'react-native-reanimated';
import {colors} from './color';

const {interpolate, color, Extrapolate, round} = Animated;

const hexToDec = (msb, lsb) => parseInt(`${msb}${lsb}`, 16);

const colorToRgbObj = color => {
  let [_, hexval] = color.split('#');
  if (colors[color]) hexval = colors[color].split('#')[1];
  if (color.indexOf('rgb(') === 0 || color.indexOf('rgba(') === 0) {
    const [r, g, b, a = 1] = color
      .replace(/[rgba\(\)]/g, '')
      .split(',')
      .map(s => Number(s));
    return {r, g, b, a};
  }
  if (hexval && hexval.length === 3)
    hexval = hexval.split('').reduce((acc, cur) => acc + cur + cur, '');
  const [r1, r2, g1, g2, b1, b2] = hexval;
  return {
    r: hexToDec(r1, r2),
    g: hexToDec(g1, g2),
    b: hexToDec(b1, b2),
    a: 1,
  };
};

export const interpolateColor = (
  animVal,
  {inputRange, outputRange, extrapolate = Extrapolate.CLAMP},
) => {
  const {r, g, b, a} = outputRange.map(colorToRgbObj).reduce(
    (acc, cur) => {
      acc.r.push(cur.r);
      acc.g.push(cur.g);
      acc.b.push(cur.b);
      acc.a.push(cur.a);
      return acc;
    },
    {
      r: [],
      g: [],
      b: [],
      a: [],
    },
  );

  const [ri, gi, bi, ai] = [r, g, b, a].map((v, i) => {
    const interpolated = interpolate(animVal, {
      inputRange,
      outputRange: v,
      extrapolate,
    });
    return i < 3 ? round(interpolated) : interpolated;
  });

  return color(ri, gi, bi, ai);
};
