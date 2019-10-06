import {useState, useEffect} from 'react';
import Animated from 'react-native-reanimated';
import {useLazyRef} from '.';
import {runSpring} from './runners';

const {Value, useCode, set, Clock, SpringUtils, block} = Animated;

export function useControler({from = {}, to = [], config = {}}, deps) {
  const [state, setState] = useState({
    currentAnim: config.reverse ? to.length - 1 : 1,
    animationStart: 0,
    animationEnd: 1,
  });

  const animation = useLazyRef(() => new Value(0));
  const clock = useLazyRef(() => new Clock());

  const controledConfig = useLazyRef(() => ({
    loop: new Value(config.loop ? 1 : 0),
    ended: new Value(0),
    stop: new Value(0),
    arrayAnim: config.reverse ? [from, ...to].reverse() : [from, ...to],
    reverse: config.reverse,
  }));

  const springConfig = {
    ...SpringUtils.makeConfigFromOrigamiTensionAndFriction({
      ...SpringUtils.makeDefaultConfig(),
      tension: config.tension || 10,
      friction: new Value(config.friction || 4),
      mass: config.mass || 1,
    }),
  };

  const start = () => {
    controledConfig.stop.setValue(0);
  };

  const stop = () => {
    controledConfig.stop.setValue(1);
  };

  const reset = () => {
    controledConfig.ended.setValue(0);
    if (state.animationStart !== 0) {
      setState({
        currentAnim: 1,
        animationStart: 0,
        animationEnd: 1,
      });
      animation.setValue(0); // needs to be set after state has been changed and effectively changed
    }
  };

  const reverse = () => {
    controledConfig.ended.setValue(0);
    controledConfig.arrayAnim.reverse();
    setState({
      currentAnim: 1,
      animationStart: 0,
      animationEnd: 1,
    });
    animation.setValue(0); // needs to be set after state has been changed and effectively changed
  };

  useEffect(() => {
    reset();
  }, [config.reset]);

  useEffect(() => {
    if (config.reverse) {
      reverse();
    }
  }, [config.reverse]);

  useEffect(() => {
    controledConfig.loop.setValue(config.loop ? 1 : 0);
  }, [config.loop]);

  useEffect(() => {
    controledConfig.stop.setValue(config.stop ? 1 : 0);
  }, [config.stop]);

  const onStep = position => {
    const {currentAnim} = state;
    if (
      config.loop &&
      (currentAnim === controledConfig.arrayAnim.length - 1 ||
        currentAnim === 0 ||
        controledConfig.arrayAnim.length === 2)
    ) {
      reverse();
    } else if (
      currentAnim > 0 &&
      currentAnim < controledConfig.arrayAnim.length - 1
    ) {
      console.log('====================> inside reverse', currentAnim);
      setState(prevState => ({
        currentAnim: controledConfig.reverse
          ? prevState.currentAnim - 1
          : prevState.currentAnim + 1,
        animationStart: prevState.animationStart + 1,
        animationEnd: prevState.animationEnd + 1,
      }));
    }
  };

  useCode(
    block([
      set(
        animation,
        runSpring(
          clock,
          animation,
          0,
          state.animationEnd,
          springConfig,
          config.delay,
          onStep,
          controledConfig.stop,
          controledConfig.loop,
          controledConfig.ended,
        ),
      ),
    ]),
    [state],
  );

  return {animation, state, controledConfig, stop, start};
}
