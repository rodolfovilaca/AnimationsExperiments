import React, {useState} from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';
import Owl from '../../assets/svgs/owl.svg';
import {useSpring, useTransition} from '../hooks';
import Animated from 'react-native-reanimated';
import NavigationBtn from '../components/NavigationBtn';

const {interpolate, Extrapolate, useCode, cond, call, lessOrEq} = Animated;
const {width, height} = Dimensions.get('window');

const Home = props => {
  const [showTitle, setShowTitle] = useState(false);

  const owlTransition = useSpring({
    from: 0,
    to: -height / 2 + 100,
    config: {
      tension: 10,
      friction: 7,
      mass: 1,
      delay: 1000,
    },
  });

  const scaleOwl = interpolate(owlTransition, {
    inputRange: [-height / 2 + 100, 0],
    outputRange: [0.5, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  const owlTranslateX = useSpring({
    from: 0,
    to: -100,
    config: {
      tension: 10,
      friction: 6,
      mass: 1,
      delay: 2000,
    },
  });

  useCode(
    cond(lessOrEq(owlTranslateX, -100), call([], () => setShowTitle(true))),
    [],
  );

  const opacity = useSpring({
    from: 0.1,
    to: 1,
    config: {
      tension: 10,
      friction: 8,
      mass: 1,
      delay: 2400,
    },
  });

  const scaleTitle = interpolate(opacity, {
    inputRange: [0.1, 1],
    outputRange: [0, 2],
    extrapolate: Extrapolate.CLAMP,
  });

  const navigate = screen => props.navigation.push(screen);

  const data = [
    {title: 'InfiniteScroll', onPress: () => navigate('InfiniteScroll')},
    {title: 'InfiniteScroll2', onPress: () => navigate('InfiniteScroll')},
    {title: 'InfiniteScroll3', onPress: () => navigate('InfiniteScroll')},
    {title: 'InfiniteScroll4', onPress: () => navigate('InfiniteScroll')},
    {title: 'InfiniteScroll5', onPress: () => navigate('InfiniteScroll')},
  ];

  const items = useTransition(data, item => item.title, {
    trail: 100,
    from: height,
    to: 0,
    config: {
      tension: 10,
      friction: 6,
      mass: 1,
      delay: 1000,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.titleWrapper,
          {
            transform: [
              {translateY: owlTransition, translateX: owlTranslateX},
              {scale: scaleOwl},
            ],
          },
        ]}>
        <Owl width={200} heigth={200} />
        {showTitle && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: '100%',
                // top: 0,
                right: 0,
                opacity,
              },
              {transform: [{scale: scaleTitle}]},
            ]}>
            <Text style={styles.title}>Animations</Text>
          </Animated.View>
        )}
      </Animated.View>
      {items.map(({item, key, props}) => (
        <Animated.View
          key={key}
          style={[styles.box, {transform: [{translateY: props}]}]}>
          <NavigationBtn item={item} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3d3b6',
  },
  titleWrapper: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    color: '#1d1005',
    textAlign: 'right',
  },
  box: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
