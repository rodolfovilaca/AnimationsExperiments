import React, {Component} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import ScallableCard from '../components/ScallableCard';
import Scroll from '../components/Scroll';
import Animated from 'react-native-reanimated';

const {interpolate, Extrapolate} = Animated;

const {width, height} = Dimensions.get('window');
const MAX_HEIGHT_TRANS = 300 * 10;
const MAX_WIDTH_TRANS = 200 * 10;
const MAX_TRANS_HORIZONTAL = MAX_WIDTH_TRANS / 2;
const MAX_TRANS_VERTICAL = MAX_HEIGHT_TRANS / 2;
const INTERPOLATE_MAX_TRANS_HORIZONTAL = MAX_WIDTH_TRANS / 2 + 500;
const INTERPOLATE_MAX_TRANS_VERTICAL = MAX_HEIGHT_TRANS / 2 + 500;

const data = Array.from(Array(100)).map((_, index) => index);

class InfiniteScrollExample extends Component {
  refHorizontal = React.createRef();
  refVertical = React.createRef();
  render() {
    return (
      <View style={styles.container}>
        <Scroll
          maxTranslate={MAX_TRANS_VERTICAL - 450}
          minTranslate={MAX_TRANS_VERTICAL + 210}
          forwardRef={this.refVertical}
          simultaneousHandlers={this.refHorizontal}>
          {transY => (
            <Scroll
              maxTranslate={MAX_TRANS_HORIZONTAL - 450}
              minTranslate={MAX_TRANS_HORIZONTAL + 900}
              forwardRef={this.refHorizontal}
              simultaneousHandlers={this.refVertical}
              horizontal>
              {transX => (
                <Animated.View
                  style={[
                    {
                      ...StyleSheet.absoluteFillObject,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      top: -MAX_TRANS_VERTICAL / 2 - 50,
                      left: -MAX_TRANS_HORIZONTAL / 2 - 50,
                      width: MAX_WIDTH_TRANS,
                      height: MAX_HEIGHT_TRANS,
                      backgroundColor: 'red',
                    },
                    {
                      transform: [
                        {
                          translateX: interpolate(transX, {
                            inputRange: [
                              -INTERPOLATE_MAX_TRANS_HORIZONTAL,
                              INTERPOLATE_MAX_TRANS_HORIZONTAL,
                            ],
                            outputRange: [
                              -INTERPOLATE_MAX_TRANS_HORIZONTAL,
                              INTERPOLATE_MAX_TRANS_HORIZONTAL,
                            ],
                            extrapolate: Extrapolate.CLAMP,
                          }),
                        },
                        {
                          translateY: interpolate(transY, {
                            inputRange: [
                              -INTERPOLATE_MAX_TRANS_VERTICAL,
                              INTERPOLATE_MAX_TRANS_VERTICAL,
                            ],
                            outputRange: [
                              -INTERPOLATE_MAX_TRANS_VERTICAL,
                              INTERPOLATE_MAX_TRANS_VERTICAL,
                            ],
                            extrapolate: Extrapolate.CLAMP,
                          }),
                        },
                      ],
                    },
                  ]}>
                  {data.map(item => (
                    <ScallableCard item={item} width={200} height={300} />
                  ))}
                </Animated.View>
              )}
            </Scroll>
          )}
        </Scroll>
        {/* <ThrowAnimated>
          <View style={styles.wrapper}>
            {data.map(item => (
              <ScallableCard item={item} width={200} height={300} />
            ))}
          </View>
        </ThrowAnimated> */}
      </View>
    );
  }
}

const BOX_SIZE = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderColor: '#F5FCFF',
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: BOX_SIZE / 2,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default InfiniteScrollExample;
