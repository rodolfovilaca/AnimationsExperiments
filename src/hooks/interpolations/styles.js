import Animated from 'react-native-reanimated';
const {interpolate} = Animated;
export default function interpolateStyle(
  animation,
  inputStart,
  inputEnd,
  outputStart,
  outputEnd,
) {
  return interpolate(animation, {
    inputRange: [inputStart, inputEnd],
    outputRange: [outputStart, outputEnd],
  });
}
