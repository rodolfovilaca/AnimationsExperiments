import React from 'react';
import {StyleSheet, Dimensions, Animated} from 'react-native';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
// import Animated from 'react-native-reanimated';

const {width, height} = Dimensions.get('window');
const MAX_HEIGHT_TRANS = 300 * 10;
const MAX_WIDTH_TRANS = 200 * 10;
const MAX_TRANS_HORIZONTAL = MAX_WIDTH_TRANS / 2;
const MAX_TRANS_VERTICAL = MAX_HEIGHT_TRANS / 2;
const DRAG_TOSS = 0.05;

const {Value, spring, parallel} = Animated;

class ThrowAnimated extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transX: new Value(0),
      transY: new Value(0),
    };

    this._onHandlerStateChange = event => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        this.state.transX.setOffset(0);
        this.state.transY.setOffset(0);
      }
      if (event.nativeEvent.oldState === State.ACTIVE) {
        const endOffsetX =
          event.nativeEvent.velocityX > 0
            ? Math.min(
                event.nativeEvent.translationX +
                  DRAG_TOSS * event.nativeEvent.velocityX,
                MAX_TRANS_HORIZONTAL - 100,
              )
            : Math.max(
                event.nativeEvent.translationX +
                  DRAG_TOSS * event.nativeEvent.velocityX,
                -MAX_TRANS_HORIZONTAL + 315,
              );

        const endOffsetY =
          event.nativeEvent.velocityY > 0
            ? Math.min(
                event.nativeEvent.translationY +
                  DRAG_TOSS * event.nativeEvent.velocityY,
                MAX_TRANS_VERTICAL - 150,
              )
            : Math.max(
                event.nativeEvent.translationY +
                  DRAG_TOSS * event.nativeEvent.velocityY,
                -MAX_TRANS_VERTICAL + 510,
              );

        parallel([
          spring(this.state.transX, {
            velocity: event.nativeEvent.velocityX,
            tension: 100,
            friction: 10,
            toValue: endOffsetX,
          }),
          spring(this.state.transY, {
            velocity: event.nativeEvent.velocityY,
            tension: 100,
            friction: 10,
            toValue: endOffsetY,
          }),
        ]).start(() => {
          this.state.transX.setOffset(endOffsetX);
          this.state.transY.setOffset(endOffsetY);
        });
      }
    };

    this._onGestureEvent = Animated.event([
      {
        nativeEvent: {
          translationX: this.state.transX,
          translationY: this.state.transY,
        },
      },
    ]);
  }

  render() {
    return (
      <PanGestureHandler
        maxPointers={1}
        activeOffsetX={20}
        activeOffsetY={40}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}
        avgTouches>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                {
                  translateY: this.state.transY,
                },
                {translateX: this.state.transX},
              ],
            },
          ]}>
          {this.props.children}
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width: MAX_WIDTH_TRANS,
    height: MAX_HEIGHT_TRANS,
    top: -MAX_HEIGHT_TRANS / 2 + 150,
    left: -MAX_WIDTH_TRANS / 2 + 100,
  },
});

export default ThrowAnimated;
