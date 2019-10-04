import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useTransition, useSpring} from '../hooks';
import Animated from 'react-native-reanimated';
import {ScrollView} from 'react-native-gesture-handler';
// import { TouchableOpacity } from 'react-native-gesture-handler';
const {height, width} = Dimensions.get('window');

const NiceFoldableExample = () => {
  const [reverse, set] = useState(false);
  const props = useSpring({
    from: {
      transform: [{ rotateX: '0deg', translateY: 0 }],
    },
    to: [
      {
        transform: [{ rotateX: '-180deg', translateY: -80 }],
      },
    //   {
    //     transform: [{ perspective, rotateX, scale }],
    //   },
    //   {
    //     transform: [{ perspective, rotateX, scale }],
    //   },
    ],
    config: {
      stop: reverse,
      delay: 2000
    },
  });
  // const list = useTransition(
  //   data,
  //   item => item.name,
  //   {
  //     trail: 50,
  //     from: {
  //       opacity: 0,
  //       transform: [{}],
  //     },
  //     to: [
  //       { opacity: 1, transform: [{}]},
  //       {
  //         opacity: 1,
  //         transform: [{}],
  //       },
  //       {
  //         opacity: 1,
  //         transform: [{}],
  //       },
  //     ],
  //     config: {
  //       reverse,
  //       tension: 120,
  //       friction: 6,
  //       mass: 1,
  //       delay: 200,
  //     },
  //   },
  //   [reverse],
  // );
  return (
    <ScrollView style={{flex: 1}} contentContainerStyle={{flex: 1}}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => set(prevState => !prevState)}>
          <Text style={{color: '#fff'}}>In/Out</Text>
        </TouchableOpacity>
        <Animated.View style={[styles.card, props]}>
          <Image
            style={styles.image}
            source={{
              uri:
                'https://pbs.twimg.com/profile_images/1174066757151219712/lEEalRTJ_400x400.jpg',
            }}
          />
          <Text>rodolfo</Text>
        </Animated.View>
        {/* {list.map(({item, key, props}) => (
          <Animated.View key={key} style={[styles.card, props]}>
            <Image style={styles.image} source={{uri: item.uri}} />
            <Text>{item.name}</Text>
          </Animated.View>
        ))} */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    height: 80,
    backgroundColor: '#fff',
  },
  image: {
    borderRadius: 25,
    width: 50,
    height: 50,
  },
});

export default NiceFoldableExample;

const data = [
  {
    name: 'kzzzf',
    uri:
      'https://pbs.twimg.com/profile_images/1064786289311010816/zD2FlyxR_400x400.jpg',
  },
  {
    name: '0xca0a',
    uri:
      'https://pbs.twimg.com/profile_images/1051050638195482624/Q3dOn3o9_400x400.jpg',
  },
  {
    name: 'wcandillon',
    uri:
      'https://pbs.twimg.com/profile_images/1155077242936053760/hfkFd7AL_400x400.jpg',
  },
  {
    name: 'osdnk',
    uri:
      'https://pbs.twimg.com/profile_images/1175456331035238402/0xg_UQ6y_400x400.jpg',
  },
  {
    name: 'satya164',
    uri:
      'https://pbs.twimg.com/profile_images/1162955469129838594/RheW-Tfc_400x400.jpg',
  },
];
