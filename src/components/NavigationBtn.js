import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {BaseButton} from 'react-native-gesture-handler';

const NavigationBtn = ({item: {title, onPress}, ...rest}) => {
  return (
    <BaseButton style={[styles.box]} onPress={onPress} {...rest}>
      <Text style={styles.title}>{title}</Text>
    </BaseButton>
  );
};

const styles = StyleSheet.create({
  box: {
    marginVertical: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  title: {
    color: '#1d1005'
  }
});

export default NavigationBtn;
