import React from 'react';
import Animated from 'react-native-reanimated';
import {
  PanGestureHandler,
  State as GestureState,
} from 'react-native-gesture-handler';
import {useLazyRef, runSpring} from '../hooks';

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
  stopClock,
} = Animated;

const DroppableArea = props => {
  const [onArea, setOnArea] = useState(false);
  const _dragX = useLazyRef(() => new Value(0));
  const clockX = useLazyRef(() => new Clock());

  const _onGestureEvent = event([{nativeEvent: {translationX: _dragX}}], {
    useNativeDriver: true,
  });

  const config = {
    ...SpringUtils.makeConfigFromOrigamiTensionAndFriction({
      ...SpringUtils.makeDefaultConfig(),
      tension: 20,
      friction: new Value(4),
    }),
  };

  const _onHandlerStateChange = event([
    {
      nativeEvent: ({oldState, state, velocityX, translationX: x}) =>
        block([
          cond(eq(state, GestureState.ACTIVE), stopClock(clockX)),
          cond(eq(oldState, GestureState.ACTIVE), [
            debug('==========>', _dragX),
            set(_dragX, runSpring(clockX, x, velocityX, 0, config, 0)),
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
      <Animated.View style={{color: onArea ? 'blue' : 'black'}}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default DroppableArea;
