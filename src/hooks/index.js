import {useRef, useState, useEffect, useMemo} from 'react';
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
  not,
  call,
  defined,
  and,
  interpolate,
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

// function stopWhenNeeded(dt, position, velocity, clock) {
//   const ds = diff(position);
//   const noMovementFrames = new Value(0);

//   return cond(
//     lessThan(abs(ds), EPS),
//     [
//       set(noMovementFrames, add(noMovementFrames, 1)),
//       cond(
//         greaterThan(noMovementFrames, EMPTY_FRAMES_THRESHOLDS),
//         stopClock(clock),
//       ),
//     ],
//     set(noMovementFrames, 0),
//   );
// }

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
        and(defined(duration), greaterThan(duration, 0)),
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

// function stopWhenNeeded(position) {
//  const ds = diff(position);
//  const noMovementFrames = new Value(0);

//  return cond(
//    lessThan(abs(ds), EPS),
//    [
//      set(noMovementFrames, add(noMovementFrames, 1)),
//      cond(
//        greaterThan(noMovementFrames, EMPTY_FRAMES_THRESHOLDS),
//        1,
//        0
//      ),
//    ],
//    0
//  );
// }

export function useSpringSequence({from = {}, to = [], config = {}}, deps) {
  to = [from, ...to];
  // to = config.reverse ? to.reverse() : to;
  // const currentAnim = useMemo(() => new Value(config.reverse ? to.length - 2 : 1), [...deps]);
  // const animationStart = useMemo(() => new Value(config.reverse ? to.length - 1 : 0), [...deps]);
  // const animationEnd = useMemo(() => new Value(config.reverse ? to.length - 2 : 1), [...deps]);
  const isReverse = useMemo(() => new Value(config.reverse ? 1 : 0), [
    config.reverse,
  ]);
  const [state, setState] = useState({
    currentAnim: config.reverse ? to.length - 1 : 1,
    animationStart: 0,
    animationEnd: 1,
  });
  
  // console.log(config.reverse, state)
  // const animation = useLazyRef(() => new Value(0));
  const animation = useLazyRef(() => new Value(0));
  const style = useRef();
  const clock = useLazyRef(() => new Clock());
  const ended = useLazyRef(() => new Value(0));
  const springConfig = {
    ...SpringUtils.makeConfigFromOrigamiTensionAndFriction({
      ...SpringUtils.makeDefaultConfig(),
      tension: config.tension || 10,
      friction: new Value(config.friction || 4),
      mass: config.mass || 1,
    }),
  };
  const endCondition = to.length - 1;
  // console.log(state.animationEnd, endCondition);

  useEffect(() => {
    // if (state.currentAnim < to.length - 1 && state.currentAnim > 0) {
    ended.setValue(0);
    if(state.animationStart !== 0){
      setState(prevState => ({
        // currentAnim: config.reverse ? to.length - 1 : 1,
        currentAnim: prevState.currentAnim,
        animationStart: 0,
        animationEnd: 1,
      }));
      animation.setValue(0)
    }
    // }
  }, [...deps]);

  // useEffect(() => animation.setValue(0),[state])

  useCode(
    block([
      set(
        animation,
        runSpring(
          clock,
          animation,
          0,
          state.animationEnd,
          springConfig,
          config.delay,
        ),
      ),
      cond(eq(animation, endCondition), [
        set(ended, 1),
      ]),
      // cond(not(ended), [
      //   cond(lessThan(abs(sub(animation, animationEnd)), 1e-5), [
      //     call([animation], () => {
      //       setState(prevState => ({
      //         current: prevcurrent + 1,
      //         animationStart: prevanimationStart + 1,
      //         animationEnd: prevanimationEnd + 1,
      //       }))
      //     })
      //   ])
      // ])
      cond(and(eq(animation, state.animationEnd), not(ended)), [
        // debug('============>', animation),
        cond(
          isReverse,
          [
            // debug('============> isReverse', isReverse),
            call([], () => {
              // console.log('setState ===========>', state.currentAnim)
              if (state.currentAnim < to.length && state.currentAnim > 0) {
                setState(prevState => ({
                  currentAnim: prevState.currentAnim - 1,
                  animationStart: prevState.animationStart + 1,
                  animationEnd: prevState.animationEnd + 1,
                }));
              }
            }),
            // set(currentAnim, sub(currentAnim, 1)),
            // set(animationStart, sub(animationStart, 1)),
            // set(animationEnd, sub(animationEnd, 1)),
          ],
          [
            call([], () => {
              if (state.currentAnim < to.length - 1 && state.currentAnim > 0) {
                setState(prevState => ({
                  currentAnim: prevState.currentAnim + 1,
                  animationStart: prevState.animationStart + 1,
                  animationEnd: prevState.animationEnd + 1,
                }));
              }
            }),
            // set(currentAnim, add(currentAnim, 1)),
            // set(animationStart, add(animationStart, 1)),
            // set(animationEnd, add(animationEnd, 1)),
          ],
        ),
      ]),
    ]),
    [state],
  );

  return useMemo(() => {
    const currentAnimation = state.currentAnim;
    console.log(currentAnimation);
    if (currentAnimation < to.length && currentAnimation > 0) {
      style.current = Object.keys(to[currentAnimation - 1]).reduce(
        (acc, current) => {
          // console.log(acc, current)
          if (config.reverse) {
            // console.log({
            //   inputRange: [state.animationStart, state.animationEnd],
            //   outputRange: [
            //     to[currentAnimation - 1][current],
            //     to[currentAnimation][current],
            //   ],
            // });
          }
          if (current === 'transform') {
            acc[current] = to[currentAnimation - 1][current].map(
              (transform, index) => {
                return Object.keys(transform).reduce((acc2, current2) => {
                  acc2[current2] = interpolate(animation, {
                    inputRange: [state.animationStart, state.animationEnd],
                    outputRange: config.reverse
                      ? [
                          transform[current2],
                          to[currentAnimation]['transform'][index][current2],
                        ].reverse()
                      : [
                          transform[current2],
                          to[currentAnimation]['transform'][index][current2],
                        ],
                  });
                  return acc2;
                }, {});
              },
            );
          } else {
            acc[current] = interpolate(animation, {
              inputRange: [state.animationStart, state.animationEnd],
              outputRange: config.reverse
                ? [
                    to[currentAnimation - 1][current],
                    to[currentAnimation][current],
                  ].reverse()
                : [
                    to[currentAnimation - 1][current],
                    to[currentAnimation][current],
                  ],
            });
          }
          return acc;
        },
        {},
      );
    }
    return style.current;
  }, [state]);
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

export function useSpring({from, to, config}, deps = []) {
  if (Array.isArray(to)) {
    return useSpringSequence({from, to, config}, deps);
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
    [...deps],
  );
  return animation;
}

export function useTransition(
  items,
  keyExtractor,
  {trail, from, to, config},
  deps,
) {
  return items.map((item, index) => {
    const props = useSpring(
      {
        from,
        to,
        config: {
          ...config,
          delay: (config.delay || 0) + trail * index,
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
  });
}
