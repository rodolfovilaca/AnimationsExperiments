import Animated from 'react-native-reanimated';
import {interpolateColor, interpolateTransform} from './index';

const {interpolate, Extrapolate} = Animated;
const isColorInterpolationType = key => /color/gi.test(key);
const isTransformInterpolationType = key => 'transform' === key;

export default function interpolateSequence(sequenceArray, animation, state) {
  const {currentAnim, animationStart, animationEnd} = state;
  const prevAnimation = sequenceArray[currentAnim - 1];
  const currentAnimation = sequenceArray[currentAnim];
  return Object.keys(prevAnimation).reduce((acc, key) => {
    if (isTransformInterpolationType(key)) {
      acc[key] = interpolateTransform(
        prevAnimation[key],
        currentAnimation[key],
        animation,
        state,
      );
    } else if (isColorInterpolationType(key)) {
      acc[key] = interpolateColor(animation, {
        inputRange: [animationStart, animationEnd],
        outputRange: [prevAnimation[key], currentAnimation[key]],
        extrapolate: Extrapolate.CLAMP,
      });
    } else {
      acc[key] = interpolate(animation, {
        inputRange: [animationStart, animationEnd],
        outputRange: [prevAnimation[key], currentAnimation[key]],
      });
    }
    return acc;
  }, {});
}
