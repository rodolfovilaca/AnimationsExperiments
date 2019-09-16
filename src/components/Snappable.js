import React from 'react';
import {Dimensions} from 'react-native';
import Animated from 'react-native-reanimated';
import {
  PanGestureHandler,
  RotationGestureHandler,
  State as GestureState,
} from 'react-native-gesture-handler';
import {useLazyRef, runSpring} from '../hooks';

const {width, height} = Dimensions.get('window');

const {
  Value,
  event,
  interpolate,
  eq,
  SpringUtils,
  Clock,
  cond,
  set,
  block,
  debug,
  call,
  greaterOrEq,
  stopClock,
  useCode,
  not,
  and,
  add,
  clockRunning,
} = Animated;

const Snappable = props => {
  const _dragX = useLazyRef(() => new Value(0));
  const _dragY = useLazyRef(() => new Value(0));
  const snapY = useLazyRef(() => new Value(0));
  const snapX = useLazyRef(() => new Value(0));
  const offsetX = useLazyRef(() => new Value(0));
  const offsetY = useLazyRef(() => new Value(0));
  const valY = useLazyRef(() => new Value(0));
  const valX = useLazyRef(() => new Value(0));
  const absY = useLazyRef(() => new Value(0));
  const velocityY = useLazyRef(() => new Value(0));
  const velocityX = useLazyRef(() => new Value(0));
  const clockX = useLazyRef(() => new Clock());
  const clockY = useLazyRef(() => new Clock());
  // const _transX = interpolate(_dragX, {
  //   inputRange: [-100, -50, 0, 50, 100],
  //   outputRange: [-30, -10, 0, 10, 30],
  // });
  const _onGestureEvent = event(
    [
      {
        nativeEvent: {
          translationY: y => set(_dragY, add(offsetY, y)),
          translationX: _dragX,
          velocityY,
          velocityX,
        },
      },
    ],
    {
      useNativeDriver: true,
    },
  );

  const config = {
    ...SpringUtils.makeConfigFromOrigamiTensionAndFriction({
      ...SpringUtils.makeDefaultConfig(),
      tension: 60,
      friction: new Value(4),
    }),
  };

  useCode(
    block([
      cond(snapX, [
        set(_dragX, runSpring(clockX, valX, velocityX, 0, config, 0)),
        set(offsetY, 0),
        cond(not(clockRunning(clockX)), set(snapX, 0)),
      ]),
    ]),
    [],
  );

  useCode(
    block([
      cond(snapY, [
        cond(
          greaterOrEq(absY, height / 2),
          [
            // debug('if =============>', absY),
            debug('if =============>', _dragY),
            set(_dragY, runSpring(clockY, valY, velocityY, 200, config, 0)),
            set(offsetY, add(offsetY, 200)),
          ],
          [
            // debug('else =============>', absY),
            debug('else =============>', _dragY),
            set(_dragY, runSpring(clockY, valY, velocityY, -200, config, 0)),
            set(offsetY, add(offsetY, -200)),
          ],
        ),
        cond(not(clockRunning(clockY)), set(snapY, 0)),
      ]),
    ]),
    [],
  );

  const _onHandlerStateChange = event([
    {
      nativeEvent: ({
        oldState,
        state,
        absoluteY,
        translationY: y,
        translationX: x,
      }) =>
        block([
          cond(eq(state, GestureState.ACTIVE), [
            stopClock(clockX),
            set(snapX, 0),
          ]),
          cond(eq(state, GestureState.ACTIVE), [
            stopClock(clockY, set(snapY, 0)),
          ]),
          cond(eq(oldState, GestureState.ACTIVE), [
            set(valY, x),
            set(valY, y),
            set(absY, absoluteY),
            set(snapX, 1),
            set(snapY, 1),
          ]),
        ]),
    },
    {useNativeDriver: true},
  ]);

  const {children} = props;
  return (
    <PanGestureHandler
      {...props}
      maxPointers={1}
      onGestureEvent={_onGestureEvent}
      onHandlerStateChange={_onHandlerStateChange}>
      <Animated.View
        style={{transform: [{translateY: _dragY, translateX: _dragX}]}}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default Snappable;
