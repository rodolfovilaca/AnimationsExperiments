import React from 'react';
import {StyleSheet, Dimensions, View} from 'react-native';
import {
  PanGestureHandler,
  State as GestureState,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {runSpring} from '../hooks';

const {width, height} = Dimensions.get('window');
const MAX_HEIGHT_TRANS = 300 * 10;
const MAX_WIDTH_TRANS = 200 * 10;
const MAX_TRANS_HORIZONTAL = MAX_WIDTH_TRANS / 2 - 100;
const MAX_TRANS_VERTICAL = MAX_HEIGHT_TRANS / 2 - 150;
const DRAG_TOSS = 0.05;

console.log('MAX_TRANS_HORIZONTAL', MAX_TRANS_HORIZONTAL);
console.log('MAX_TRANS_VERTICAL', MAX_TRANS_VERTICAL);

const data = Array.from(Array(100)).map((_, index) => index);

const {
  Value,
  event,
  add,
  set,
  block,
  cond,
  eq,
  useCode,
  Clock,
  clockRunning,
  not,
  and,
  SpringUtils,
  multiply,
  debug,
  min,
  max,
  stopClock,
  sub,
  call,
  or,
  greaterOrEq,
  interpolate,
  Extrapolate,
  greaterThan,
  lessThan,
  abs,
  neq,
  defined,
  diff,
  divide,
  diffClamp,
} = Animated;

class Scroll extends React.Component {
  constructor(props) {
    super(props);
    const gestureState = new Value(0);
    const drag = new Value(0);
    const offset = new Value(0);
    this.clock = new Clock();
    this.velocity = new Value(0);
    this.trans = new Value(0);
    this.spring = new Value(0);

    this.dest = cond(
      greaterOrEq(this.velocity, 0),
      min(add(multiply(this.velocity, DRAG_TOSS), drag), props.maxTranslate),
      max(add(multiply(this.velocity, DRAG_TOSS), drag), -props.minTranslate),
    );

    this.config = {
      ...SpringUtils.makeConfigFromOrigamiTensionAndFriction({
        ...SpringUtils.makeDefaultConfig(),
        tension: 10,
        friction: new Value(8),
        mass: 1,
      }),
    };

    this._onHandlerStateChange = props.horizontal
      ? event([
          {
            nativeEvent: ({oldState, state, translationX, velocityX: veloX}) =>
              block([
                set(gestureState, state),
                set(this.velocity, veloX),
                set(drag, translationX),
                cond(eq(state, GestureState.END), [
                  debug('state', state),
                  debug('oldState', oldState),
                  set(this.spring, 1),
                ]),
              ]),
          },
          {
            useNativeDriver: true,
          },
        ])
      : event([
          {
            nativeEvent: ({oldState, state, translationY, velocityY: veloY}) =>
              block([
                set(gestureState, state),
                set(this.velocity, veloY),
                set(drag, translationY),
                cond(eq(state, GestureState.END), [
                  debug('state', state),
                  debug('oldState', oldState),
                  set(this.spring, 1),
                ]),
              ]),
          },
          {
            useNativeDriver: true,
          },
        ]);

    this._onGestureEvent = props.horizontal
      ? event([
          {
            nativeEvent: ({state, translationX, velocityX: veloX}) =>
              block([
                set(gestureState, state),
                set(this.velocity, veloX),
                set(drag, translationX),
              ]),
          },
          {
            useNativeDriver: true,
          },
        ])
      : event([
          {
            nativeEvent: ({state, translationY, velocityY: veloY}) =>
              block([
                set(gestureState, state),
                set(this.velocity, veloY),
                set(drag, translationY),
              ]),
          },
          {
            useNativeDriver: true,
          },
        ]);

    this._trans = block([
      cond(
        eq(gestureState, GestureState.ACTIVE),
        [
          stopClock(this.clock),
          set(this.spring, 0),
          set(this.trans, add(this.trans, sub(drag, offset))),
          set(offset, drag),
        ],
        [
          cond(neq(gestureState, -1), [set(offset, 0)]),
          // cond(spring, [
          //   set(trans, runSpring(clock, trans, velocity, dest, config, 0)),
          //   cond(not(clockRunning(clock)), [set(spring, 0)]),
          // ]),
        ],
      ),
      this.trans,
    ]);
  }

  render() {
    return (
      <PanGestureHandler
        ref={this.props.forwardRef}
        maxPointers={1}
        // minDist={20}
        // activeOffset={10}
        // activeOffsetY={40}
        {...this.props}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}>
        <Animated.View style={[styles.container]}>
          <Animated.Code
            exec={block([
              cond(this.spring, [
                debug('this.spring', this.spring),
                debug('this.trans', this.trans),
                debug('this.dest', this.dest),
                set(
                  this.trans,
                  runSpring(
                    this.clock,
                    this.trans,
                    this.velocity,
                    this.dest,
                    this.config,
                    0,
                  ),
                ),
                cond(not(clockRunning(this.clock)), [set(this.spring, 0)]),
              ]),
              this.trans,
            ])}
          />
          {this.props.children(this._trans)}
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'yellow',
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
});

export default Scroll;
