import React, {useState} from 'react';
import {Dimensions, StyleSheet, View, Text} from 'react-native';
import Svg, {Defs, LinearGradient, Stop, Path} from 'react-native-svg';
import Animated from 'react-native-reanimated';
import {useSpring} from '../hooks';
import PoliceCar from '../../assets/svgs/police-car.svg';
import Warning from '../../assets/svgs/warning.svg';
import Camera from '../../assets/svgs/cctv.svg';

const {interpolate, multiply, useCode, call, round} = Animated;
const {width} = Dimensions.get('window');
const size = width - 32;
const strokeWidth = 20;
const AnimatedPath = Animated.createAnimatedComponent(Path);
const {PI, cos, sin} = Math;
const r = (size - strokeWidth) / 2;
const cx = size / 2;
const cy = size / 2;
const A = PI + PI * 0.6;
const startAngle = PI + PI * 0.3;
const endAngle = 2 * PI - PI * 0.3;
// A rx ry x-axis-rotation large-arc-flag sweep-flag x y
const x1 = cx - r * cos(startAngle);
const y1 = -r * sin(startAngle) + cy;
const x2 = cx - r * cos(endAngle);
const y2 = -r * sin(endAngle) + cy;
const d = `M ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2}`;
const circumference = r * A;

const Counter = ({progress}) => {
  const [progressValue, setProgressValue] = useState(0);
  useCode(
    call([round(multiply(progress, 100))], prog => {
      if (prog !== progressValue) {
        setProgressValue(prog);
      }
    }),
    [],
  );

  return <Text style={styles.textCounter}>{progressValue}</Text>;
};

const SpeedScreen = () => {
  const translatePolice = useSpring({
    from: 400,
    to: 0,
    config: {
      tension: 60,
      friction: 20,
      mass: 1.5,
      delay: 500,
    },
  });

  const translateIncident = useSpring({
    from: 400,
    to: 0,
    config: {
      tension: 60,
      friction: 20,
      mass: 1.5,
      delay: 600,
    },
  });

  const translateInfo = useSpring({
    from: 400,
    to: 0,
    config: {
      tension: 120,
      friction: 20,
      mass: 1.2,
      delay: 900,
    },
  });

  const translateLeft = useSpring({
    from: -200,
    to: 0,
    config: {
      tension: 120,
      friction: 20,
      mass: 1.2,
      delay: 1100,
    },
  });

  const translateBottomUp = interpolate(translateLeft, {
    inputRange: [-200, -199, 0],
    outputRange: [50, 50, 0],
  });

  const opacityBottomUp = interpolate(translateLeft, {
    inputRange: [-200, -199, 0],
    outputRange: [0, 50, 1],
  });

  const opacity = useSpring({
    from: 0,
    to: 1,
    config: {
      tension: 120,
      friction: 8,
      mass: 1,
      delay: 1200,
    },
  });

  const scale = useSpring({
    from: 0.7,
    to: 1,
    config: {
      tension: 120,
      friction: 8,
      mass: 1,
      delay: 1300,
    },
  });

  const progress = useSpring({
    from: 0,
    to: 0.68,
    config: {
      tension: 40,
      friction: 20,
      mass: 2,
      delay: 1500,
    },
  });

  const α = interpolate(progress, {
    inputRange: [0, 1],
    outputRange: [-A, 0],
  });
  const strokeDashoffset = multiply(α, r);
  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          flex: 2,
          justifyContent: 'center',
          marginBottom: 20,
          alignItems: 'center',
          opacity,
          transform: [{scale}],
        }}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="100%" y2="0">
              <Stop offset="0" stopColor="#65efc7" />
              <Stop offset="0.3" stopColor="#a5d4ff" />
              <Stop offset="1" stopColor="#dd94ee" />
            </LinearGradient>
          </Defs>
          <Path
            d={d}
            stroke="#5a6074"
            fill="none"
            strokeDasharray={`${circumference}, ${circumference}`}
            strokeWidth={strokeWidth}
          />
          <AnimatedPath
            stroke="url(#grad)"
            fill="none"
            strokeDasharray={`${circumference}, ${circumference}`}
            {...{d, strokeDashoffset, strokeWidth}}
          />
          <Path
            d={d}
            stroke="#373c54"
            fill="none"
            strokeDasharray={[12, 4]}
            strokeWidth={strokeWidth + 1}
          />
        </Svg>
        <View
          style={{
            position: 'absolute',
            justifyContent: 'center',
            height: '100%',
            alignItems: 'center',
            flexDirection: 'column',
          }}>
          <Text
            style={{
              fontSize: 24,
              color: '#747ea8',
            }}>
            Km/h
          </Text>
          <Counter progress={progress} />
        </View>
      </Animated.View>
      <View style={styles.column}>
        <Animated.View
          style={[
            styles.wrapperInfo,
            {transform: [{translateY: translateInfo}]},
          ]}>
          <Animated.View
            style={[
              styles.leftIcon,
              {transform: [{translateX: translateLeft}]},
            ]}>
            <Camera fill="#9fa4c1" width={40} height={40} />
          </Animated.View>
          <Animated.View
            style={[
              {
                opacity: opacityBottomUp,
                transform: [{translateY: translateBottomUp}],
              },
            ]}>
            <Text style={[styles.text, {color: '#747ea8'}]}>Nearest</Text>
            <Text
              style={[
                styles.text,
                {fontWeight: 'bold', color: '#38fee9', fontSize: 24},
              ]}>
              220m
            </Text>
            <Text style={[styles.text, {color: '#747ea8'}]}>
              Washington St.
            </Text>
          </Animated.View>
        </Animated.View>
        <View style={styles.box}>
          <Animated.View
            style={[
              styles.policeBox,
              {transform: [{translateY: translatePolice}]},
            ]}>
            <PoliceCar fill="#219387" width={40} height={40} />
            <View>
              <Text style={[styles.text, {fontSize: 12}]}>REPORT</Text>
              <Text style={styles.text}>Police</Text>
            </View>
          </Animated.View>
          <Animated.View
            style={[
              styles.warningBox,
              {transform: [{translateY: translateIncident}]},
            ]}>
            <Warning fill="#534ca4" width={40} height={40} />
            <View>
              <Text style={[styles.text, {fontSize: 12}]}>REPORT</Text>
              <Text style={styles.text}>Incident</Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#373c54',
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  box: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  wrapperInfo: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#514e6f',
  },
  leftIcon: {
    padding: 20,
    position: 'absolute',
    left: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#474663',
  },
  policeBox: {
    padding: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#39ddcc',
  },
  warningBox: {
    padding: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#8074fc',
  },
  text: {
    fontSize: 20,
    color: '#fff',
  },
  textCounter: {
    fontSize: 150,
    color: '#fff',
  },
});

export default SpeedScreen;
