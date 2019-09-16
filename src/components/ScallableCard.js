import React from 'react';
import {StyleSheet, Text} from 'react-native';
import Animated from 'react-native-reanimated';

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const ScallableCard = props => {
  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: props.width,
          height: props.height,
          backgroundColor: getRandomColor(),
        },
      ]}>
      <Text>{props.item}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScallableCard;
