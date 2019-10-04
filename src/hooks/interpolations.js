import Animated from 'react-native-reanimated';
import {interpolateColor} from './interpolateColor';

const {interpolate, concat, Extrapolate} = Animated;

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

export const transformInterpolationsSequence = (
  to,
  animation,
  state,
  reverse,
) => {
  const {currentAnim, animationStart, animationEnd} = state;
  return Object.keys(to[currentAnim - 1]).reduce((acc, key) => {
    if (key === 'transform') {
      acc[key] = to[currentAnim - 1][key].map((transform, index) => {
        return Object.keys(transform).reduce((transformAcc, transformKey) => {
          if (/rotate|skew/gi.test(transformKey)) {
            transformAcc[transformKey] = concat(
              interpolate(animation, {
                inputRange: [animationStart, animationEnd],
                outputRange: reverse
                  ? [
                      parseInt(
                        to[currentAnim][key][index][transformKey].match(
                          /[-0-9]+/,
                        )[0],
                      ),
                      parseInt(transform[transformKey].match(/[-0-9]+/)[0]),
                    ]
                  : [
                      parseInt(transform[transformKey].match(/[-0-9]+/)[0]),
                      parseInt(
                        to[currentAnim][key][index][transformKey].match(
                          /[-0-9]+/,
                        )[0],
                      ),
                    ],
              }),
              transform[transformKey].match(/[a-z]+/)[0],
            );
          } else {
            transformAcc[transformKey] = interpolate(animation, {
              inputRange: [animationStart, animationEnd],
              outputRange: reverse
                ? [
                    to[currentAnim][key][index][transformKey],
                    transform[transformKey],
                  ]
                : [
                    transform[transformKey],
                    to[currentAnim][key][index][transformKey],
                  ],
            });
          }
          return transformAcc;
        }, {});
      });
    } else if (/color/gi.test(key)) {
      acc[key] = interpolateColor(animation, {
        inputRange: [animationStart, animationEnd],
        outputRange: reverse
          ? [to[currentAnim][key], to[currentAnim - 1][key]]
          : [to[currentAnim - 1][key], to[currentAnim][key]],
        extrapolate: Extrapolate.CLAMP,
      });
    } else {
      acc[key] = interpolate(animation, {
        inputRange: [animationStart, animationEnd],
        outputRange: reverse
          ? [to[currentAnim][key], to[currentAnim - 1][key]]
          : [to[currentAnim - 1][key], to[currentAnim][key]],
      });
    }
    return acc;
  }, {});
};
