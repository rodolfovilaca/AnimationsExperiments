import Animated, {Easing} from 'react-native-reanimated';

const {
  Value,
  set,
  clockRunning,
  cond,
  stopClock,
  startClock,
  block,
  proc,
  timing,
  call,
  debug,
} = Animated;

const stateProc = proc(
  (value, dest, finished, position, time, frameTime, toValue) =>
    block([
      set(finished, 0),
      set(time, 0),
      set(position, value),
      set(frameTime, 0),
      set(toValue, dest),
    ]),
);

const timingProc = proc(
  (clock, finished, position, time, frameTime, toValue, duration) =>
    timing(
      clock,
      {
        finished,
        position,
        time,
        frameTime,
      },
      {
        toValue,
        duration,
        easing: Easing.linear,
      },
    ),
);

function timingAnim(clock, state, config) {
  return timingProc(
    clock,
    state.finished,
    state.position,
    state.time,
    state.frameTime,
    config.toValue,
    config.duration,
  );
}

export default function runTiming({
  clock,
  from,
  to,
  onFinish,
  duration,
  easing,
}) {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    duration: duration,
    toValue: new Value(0),
    easing: easing || Easing.inOut(Easing.ease),
  };

  return block([
    cond(clockRunning(clock), 0, [
      stateProc(
        from,
        to,
        state.finished,
        state.position,
        state.time,
        state.frameTime,
        config.toValue,
      ),
      startClock(clock),
    ]),
    timingAnim(clock, state, config),
    cond(
      state.finished,
      stopClock(clock),
      debug('=========> running delay', state.finished),
      // block([
      //   stopClock(clock),
      //   call([], () => {
      //     if (onFinish) onFinish();
      //   }),
      // ]),
    ),
    state.position,
  ]);
}
