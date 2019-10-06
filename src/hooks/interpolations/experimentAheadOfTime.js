import Animated from 'react-native-reanimated';

const {interpolate} = Animated;

export const transformInterpolations = to => {
  return Object.keys(to[0]).reduce((acc, current) => {
    if (current === 'transform') {
      acc[current] = [
        Object.keys(to[0][current][0]).reduce((tranform, keyTransform) => {
          tranform[keyTransform] = to.reduce(
            (tranformObj, currentObj, index) => {
              tranformObj.inputRange.push(index);
              tranformObj.outputRange.push(
                currentObj[current][0][keyTransform],
              );
              return tranformObj;
            },
            {
              inputRange: [],
              outputRange: [],
            },
          );
          return tranform;
        }, {}),
      ];
    } else {
      acc[current] = to.reduce(
        (accInterpolate, currentObj, index) => {
          accInterpolate.inputRange.push(index);
          accInterpolate.outputRange.push(currentObj[current]);
          return accInterpolate;
        },
        {
          inputRange: [],
          outputRange: [],
        },
      );
    }
    return acc;
  }, {});
};

export const toInterpolationsAnimations = (interpolation, animation) => {
  return Object.keys(interpolation).reduce((acc, current) => {
    if (current === 'transform') {
      acc[current] = [
        Object.keys(interpolation[current][0]).reduce(
          (tranform, keyTransform) => {
            tranform[keyTransform] = interpolate(
              animation,
              interpolation[current][0][keyTransform],
            );
            return tranform;
          },
          {},
        ),
      ];
    } else {
      acc[current] = interpolate(animation, interpolation[current]);
    }
    return acc;
  }, {});
};
