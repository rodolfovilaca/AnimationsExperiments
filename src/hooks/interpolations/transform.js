import interpolateAngle from './angle';
import interpolateStyle from './styles';

const isConcatNeeded = key => {
  return /rotate|skew/gi.test(key);
};

export default function interpolateTransform(
  prevTransformArray,
  currentTransformArray,
  animation,
  state,
) {
  const {animationStart, animationEnd} = state;
  return prevTransformArray.map((prevTransform, index) => {
    const currentTransform = currentTransformArray[index];
    return Object.keys(prevTransform).reduce((transformAcc, transformKey) => {
      if (isConcatNeeded(transformKey)) {
        transformAcc[transformKey] = interpolateAngle(
          animation,
          animationStart,
          animationEnd,
          prevTransform[transformKey],
          currentTransform[transformKey],
        );
      } else {
        transformAcc[transformKey] = interpolateStyle(
          animation,
          animationStart,
          animationEnd,
          prevTransform[transformKey],
          currentTransform[transformKey],
        );
      }
      return transformAcc;
    }, {});
  });
}
