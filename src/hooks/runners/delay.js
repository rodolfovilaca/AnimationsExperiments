import Animated from 'react-native-reanimated';
import runTiming from './timing';

const {clockRunning, not, cond, Clock, block} = Animated;

export default function runDelay(node, duration) {
  const clock = new Clock();
  return block([
    runTiming({clock, from: 0, to: 1, duration}),
    cond(not(clockRunning(clock)), node),
  ]);
}
