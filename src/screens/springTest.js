import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useSpring} from '../hooks';
import Animated from 'react-native-reanimated';

const SpringTest = () => {
  const styleBlack = useSpring({
    from: {
      width: 100,
      transform: [{translateX: 200, translateY: 400, scale: 1}],
    },
    to: [
      {width: 200, transform: [{translateX: 0, translateY: 0, scale: 2}]},
      {width: 100, transform: [{translateX: 0, translateY: -200, scale: 1}]},
      {width: 20, transform: [{translateX: 10, translateY: -200, scale: 1}]},
    ],
    config: {
      tension: 120,
      friction: 8,
      mass: 1,
      delay: 1000,
    },
  });
  const styleRed = useSpring({
    from: {width: 50,opacity: 1,transform: [{translateX: 0, translateY: 0, scale: 1}]},
    to: [
      {opacity: 1,width: 200,transform: [{translateX: 0, translateY: -400, scale: 2}]},
      {opacity: 0.5,width: 100,transform: [{translateX: 0, translateY: -200, scale: 1}]},
      {opacity: 0,width: 20,transform: [{translateX: 0, translateY: 200, scale: 1}]},
    ],
    config: {
      tension: 50,
      friction: 4,
      mass: 1,
    },
  });
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.black, styleBlack]}></Animated.View>
      <Animated.View style={[styles.red, styleRed]}></Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  black: {
    backgroundColor: 'black',
    height: 100,
  },
  red: {
    backgroundColor: 'red',
    height: 100,
  },
});

export default SpringTest;
