import Animated from 'react-native-reanimated';
import runDelay from './delay';

const {
  Value,
  set,
  clockRunning,
  cond,
  stopClock,
  spring,
  startClock,
  block,
  greaterThan,
  call,
  defined,
  and,
  not,
  proc,
  sub,
  debug,
} = Animated;

const stateProc = proc(
  (value, dest, finished, position, time, velocity, velocityStart, toValue) =>
    block([
      set(finished, 0),
      set(time, 0),
      set(velocity, velocityStart),
      set(toValue, dest),
      set(position, value),
    ]),
);

const springProc = proc(
  (
    clock,
    finished,
    position,
    time,
    velocity,
    toValue,
    damping,
    mass,
    stiffness,
    overshootClamping,
    restSpeedThreshold,
    restDisplacementThreshold,
  ) =>
    spring(
      clock,
      {finished, position, time, velocity},
      {
        toValue,
        damping,
        mass,
        stiffness,
        overshootClamping,
        restDisplacementThreshold,
        restSpeedThreshold,
      },
    ),
);

function springAnim(clock, state, config) {
  return springProc(
    clock,
    state.finished,
    state.position,
    state.time,
    state.velocity,
    config.toValue,
    config.damping,
    config.mass,
    config.stiffness,
    config.overshootClamping,
    config.restSpeedThreshold,
    config.restDisplacementThreshold,
  );
}

const delayPresent = proc(duration =>
  and(defined(duration), greaterThan(duration, 0)),
);

const procEnd = proc((calledFinish, statePosition, onFinish) =>
  cond(not(calledFinish), [
    set(calledFinish, 1),
    call([statePosition], ([position]) => {
      if (onFinish) onFinish(position);
    }),
  ]),
);

export default function runSpring(
  clock,
  value,
  velocity,
  dest,
  springConfig,
  delayDuration,
  onFinish,
  stop,
  loop,
  ended,
) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const duration = new Value(delayDuration || 0);
  const calledFinish = new Value(0);

  const config = {
    toValue: new Value(0),
    ...springConfig,
  };

  return [
    cond(clockRunning(clock), cond(stop, stopClock(clock)), [
      stateProc(
        value,
        dest,
        state.finished,
        state.position,
        state.time,
        state.velocity,
        velocity,
        config.toValue,
      ),
      cond(
        not(stop),
        cond(
          delayPresent(duration),
          runDelay(startClock(clock), delayDuration),
          startClock(clock),
        ),
      ),
    ]),
    springAnim(clock, state, config),
    cond(state.finished, [
      cond(
        and(loop, ended),
        stateProc(
          state.position,
          dest,
          state.finished,
          state.position,
          state.time,
          state.velocity,
          velocity,
          config.toValue,
        ),
        stopClock(clock),
      ),
      cond(not(calledFinish), [
        set(calledFinish, 1),
        call([state.position], ([position]) => {
          if (onFinish) onFinish(position);
        }),
      ]),
    ]),
    // debug('outside loop', state.position),
    state.position,
  ];
}
