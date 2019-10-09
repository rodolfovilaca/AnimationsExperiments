import Animated from 'react-native-reanimated';
import {useSpringSequence} from './useSpringSequence';
import { useControler } from './useControler';

const {interpolate} = Animated;

export default function useSpring({from, to, config}, deps = []) {
  if (Array.isArray(to)) {
    return useSpringSequence({from, to, config}, deps);
  } else if (typeof to === 'object') {
    return useSpringSequence({from, to: [to], config}, deps);
  }
  const { animation } = useControler({from: 0, to: [1], config}, deps);
  return interpolate(animation, {
    inputRange: [0,1],
    outputRange: config.reverse ? [to, from] : [from, to],
  })
}
