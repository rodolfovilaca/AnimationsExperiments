import {useRef, useState, useEffect, useMemo} from 'react';
import {timing, delay as delayRe} from 'react-native-redash';
import Animated from 'react-native-reanimated';
import {State} from 'react-native-gesture-handler';
import {runSpring} from './useSpring';
import {useSpringSequence, useSpringSequenceAnimated} from './springSequence';
import {transformInterpolationsSequence} from './interpolations';

const {
  Value,
  useCode,
  set,
  Clock,
  SpringUtils,
  divide,
  add,
  multiply,
  interpolate,
} = Animated;

function damping(dt, velocity, mass = 1, damping = 12) {
  const acc = divide(multiply(-1, damping, velocity), mass);
  return set(velocity, add(velocity, multiply(dt, acc)));
}

const EPS = 1e-3;
const EMPTY_FRAMES_THRESHOLDS = 5;

export function useLazyRef(fn) {
  const ref = useRef();
  if (!ref.current) ref.current = fn();
  return ref.current;
}

export function useSpringAsync({from = {}, to = {}, config = {}}, deps) {
  const animation = useLazyRef(() => new Value(0));
  const clock = useLazyRef(() => new Clock());
  const springConfig = {
    ...SpringUtils.makeConfigFromOrigamiTensionAndFriction({
      ...SpringUtils.makeDefaultConfig(),
      tension: config.tension || 10,
      friction: new Value(config.friction || 4),
      mass: config.mass || 1,
    }),
  };
  useCode(
    set(
      animation,
      runSpring(clock, animation, 0, 1, springConfig, config.delay),
    ),
    [...deps],
  );
  return Object.keys(from).reduce((acc, current) => {
    if (current === 'transform') {
      acc[current] = from[current].map((transform, index) => {
        return Object.keys(transform).reduce((acc2, current2) => {
          acc2[current2] = interpolate(animation, {
            inputRange: [0, 1],
            outputRange: [
              transform[current2],
              to['transform'][index][current2],
            ],
          });
          return acc2;
        }, {});
      });
    } else {
      acc[current] = interpolate(animation, {
        inputRange: [0, 1],
        outputRange: [from[current], to[current]],
      });
    }
    return acc;
  }, {});
}

export function useSpring({from, to, config, interpolations}, deps = []) {
  if (Array.isArray(to)) {
    return useSpringSequence({from, to, config, interpolations}, deps);
  } else if (typeof to === 'object') {
    return useSpringAsync({from, to, config}, deps);
  }
  const animation = useLazyRef(() => new Value(config.reverse ? to : from));
  const clock = useLazyRef(() => new Clock());
  const springConfig = {
    ...SpringUtils.makeConfigFromOrigamiTensionAndFriction({
      ...SpringUtils.makeDefaultConfig(),
      tension: config.tension,
      friction: new Value(config.friction),
      mass: config.mass,
    }),
  };
  useCode(
    set(
      animation,
      runSpring(
        clock,
        animation,
        0,
        config.reverse ? from : to,
        springConfig,
        config.delay,
      ),
    ),
    deps,
  );
  return animation;
}

const syncListTransition = (items, keyExtractor, {from, to, config}, deps) => {
  const style = useRef();
  const [animation, state, toArray] = useSpringSequenceAnimated(
    {from, to, config},
    deps,
  );
  const props = useMemo(() => {
    if (state.currentAnim < toArray.length && state.currentAnim > 0) {
      style.current = transformInterpolationsSequence(
        toArray,
        animation,
        state,
        config.reverse,
      );
    }
    return style.current;
  }, [state]);
  return items.map(item => {
    const key = keyExtractor(item);
    return {
      item,
      props,
      key,
    };
  });
};

export function useTransition(
  items,
  keyExtractor,
  {trail, from, to, config},
  deps,
) {
  return trail
    ? items.map((item, index) => {
        const props = useSpring(
          {
            from,
            to,
            config: {
              ...config,
              delay: (config.delay || 0) + (trail || 0) * index,
            },
          },
          deps,
        );
        const key = keyExtractor(item);
        return {
          item,
          props,
          key,
        };
      })
    : syncListTransition(items, keyExtractor, {trail, from, to, config}, deps);
}
