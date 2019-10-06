import Animated from 'react-native-reanimated';
const {interpolate, concat} = Animated;

const getInterpolationNumber = value => {
  return parseInt(value.match(/[-0-9]+/)[0]);
};

const getConcatType = value => {
  return value.match(/[a-z]+/)[0];
};

export default function interpolateAngle(
  animation,
  animationStart,
  animationEnd,
  transformStart,
  transformEnd,
) {
  return concat(
    interpolate(animation, {
      inputRange: [animationStart, animationEnd],
      outputRange: [
        getInterpolationNumber(transformStart),
        getInterpolationNumber(transformEnd),
      ],
    }),
    getConcatType(transformStart),
  );
}
