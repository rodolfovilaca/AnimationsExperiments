import {useRef} from 'react';
import {timing, delay} from 'react-native-redash';
import Animated from 'react-native-reanimated';
import {State} from 'react-native-gesture-handler';

const {
  Value,
  useCode,
  set,
  Clock,
  clockRunning,
  cond,
  stopClock,
  spring,
  startClock,
  SpringUtils,
  divide,
  diff,
  block,
  eq,
  add,
  sub,
  multiply,
  lessThan,
  abs,
  greaterThan,
  debug,
} = Animated;

// const {
//   event,
//   Value,
//   Clock,
//   lessThan,
//   greaterThan,
//   divide,
//   diff,
//   abs,
//   block,
//   startClock,
//   stopClock,
//   cond,
//   add,
//   sub,
//   multiply,
//   eq,
//   set,
// } = Animated;

function damping(dt, velocity, mass = 1, damping = 12) {
  const acc = divide(multiply(-1, damping, velocity), mass);
  return set(velocity, add(velocity, multiply(dt, acc)));
}

const EPS = 1e-3;
const EMPTY_FRAMES_THRESHOLDS = 5;

function stopWhenNeeded(dt, position, velocity, clock) {
  const ds = diff(position);
  const noMovementFrames = new Value(0);

  return cond(
    lessThan(abs(ds), EPS),
    [
      set(noMovementFrames, add(noMovementFrames, 1)),
      cond(
        greaterThan(noMovementFrames, EMPTY_FRAMES_THRESHOLDS),
        stopClock(clock),
      ),
    ],
    set(noMovementFrames, 0),
  );
}

export function runSpring(
  clock,
  value,
  velocity,
  dest,
  springConfig,
  delayDuration,
) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const duration = new Value(delayDuration);

  const config = {
    toValue: new Value(0),
    ...springConfig,
  };

  return [
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.velocity, velocity),
      set(config.toValue, dest),
      set(state.position, value),
      cond(
        greaterThan(duration, 0),
        delay(startClock(clock), delayDuration),
        startClock(clock),
      ),
    ]),
    spring(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ];
}

function spring2(dt, position, velocity, anchor, mass = 1, tension = 300) {
  const dist = sub(position, anchor);
  const acc = divide(multiply(-1, tension, dist), mass);
  return set(velocity, add(velocity, multiply(dt, acc)));
}

export function interaction(gestureTranslation, gestureState) {
  const dragging = new Value(0);
  const start = new Value(0);
  const position = new Value(0);
  const anchor = new Value(0);
  const velocity = new Value(0);

  const clock = new Clock();
  const dt = divide(diff(clock), 1000);

  const step = cond(
    eq(gestureState, State.ACTIVE),
    [
      cond(dragging, 0, [set(dragging, 1), set(start, position)]),
      set(anchor, add(start, gestureTranslation)),

      // spring attached to pan gesture "anchor"
      spring2(dt, position, velocity, anchor),
      damping(dt, velocity),
    ],
    [
      set(dragging, 0),
      startClock(clock),
      spring2(
        dt,
        position,
        velocity,
        add(multiply(velocity, dt), gestureTranslation),
      ),
      damping(dt, velocity),
    ],
  );

  return block([
    step,
    set(position, add(position, multiply(velocity, dt))),
    stopWhenNeeded(dt, position, velocity, clock),
    position,
  ]);
}

export function useLazyRef(fn) {
  const ref = useRef();
  if (!ref.current) ref.current = fn();
  return ref.current;
}

export function useSpring({from, to, config}) {
  const animation = useLazyRef(() => new Value(from));
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
      runSpring(clock, animation, 0, to, springConfig, config.delay),
    ),
    [],
  );
  return animation;
}

export function useTransition(items, keyExtractor, {trail, from, to, config}) {
  return items.map((item, index) => {
    const props = useSpring({
      from,
      to,
      config: {
        ...config,
        delay: (config.delay || 0) + trail * index,
      },
    });
    const key = keyExtractor(item);
    return {
      item,
      props,
      key,
    };
  });
}
