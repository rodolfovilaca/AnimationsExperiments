import {useScreens} from 'react-native-screens';
import createNativeStackNavigator from 'react-native-screens/createNativeStackNavigator';
import {createAppContainer} from 'react-navigation';
import Home from './src/screens/home';
import InfiniteScrollExample from './src/screens/infiniteScroll';
import SpeedScreen from './src/screens/speed';

useScreens();

const appStack = createNativeStackNavigator(
  {
    Home: {
      screen: Home,
    },
    InfiniteScroll: {
      screen: InfiniteScrollExample,
    },
    SpeedScreen: {
      screen: SpeedScreen,
    },
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
    // transparentCard: true,
    // mode: 'modal',
  },
);

export default createAppContainer(appStack);
