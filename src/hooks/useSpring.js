import Animated from 'react-native-reanimated';
import {runSpring} from './runners';
import {useSpringSequence} from './useSpringSequence';
import {useLazyRef} from '.';

const {Value, useCode, set, Clock, SpringUtils} = Animated;

export default function useSpring({from, to, config}, deps = []) {
  if (Array.isArray(to)) {
    return useSpringSequence({from, to, config}, deps);
  } else if (typeof to === 'object') {
    return useSpringSequence({from, to: [to], config}, deps);
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
