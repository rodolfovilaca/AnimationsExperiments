import {useState, useEffect, useCallback} from 'react';
import Animated from 'react-native-reanimated';
import {useLazyRef} from '.';
import {runSpring} from './runners';

const {Value, useCode, set, Clock, SpringUtils, block, proc, debug} = Animated;

const procConfig = proc((animatedStop, stopValue, animatedLoop, loopValue) =>
  block([set(animatedStop, stopValue), set(animatedLoop, loopValue)]),
);

const initialState = {
  currentAnim: 1,
  animationStart: 0,
  animationEnd: 1,
};

export function useControler({from = {}, to = [], config = {}}, deps) {
  const [state, setState] = useState(initialState);

  const animation = useLazyRef(() => new Value(0));
  const clock = useLazyRef(() => new Clock());

  const controledConfig = useLazyRef(() => ({
    loop: new Value(config.loop ? 1 : 0),
    ended: new Value(0),
    stop: new Value(config.stop ? 1 : 0),
    arrayAnim: config.reverse ? [from, ...to].reverse() : [from, ...to],
    reverse: config.reverse === undefined ? false : true,
    mounted: false
  }));

  console.log(controledConfig.arrayAnim);

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
    setState({...initialState});
    animation.setValue(0); // needs to be set after state has been changed and effectively changed
  };

  const reverse = () => {
    controledConfig.ended.setValue(0);
    controledConfig.arrayAnim.reverse();
    controledConfig.reverse = !controledConfig.reverse;
    setState({...initialState});
    animation.setValue(0); // needs to be set after state has been changed and effectively changed
  };

  useEffect(() => {
    if (controledConfig.mounted) {
      reset();
    }
  }, [config.reset]);

  useEffect(() => {
    if (controledConfig.mounted) {
      reverse();
    }
    controledConfig.mounted = true
  }, [config.reverse]);

  const onStep = position => {
    const {currentAnim} = state;
    console.log('onStep');
    if (
      currentAnim === controledConfig.arrayAnim.length - 1 ||
      currentAnim === 0 ||
      controledConfig.arrayAnim.length === 2
    ) {
      if (config.loop) {
        reverse();
      } else if (config.onRest) {
        config.onRest();
      }
    } else if (
      currentAnim > 0 &&
      currentAnim < controledConfig.arrayAnim.length - 1
    ) {
      setState(prevState => ({
        currentAnim: prevState.currentAnim + 1,
        animationStart: prevState.animationStart + 1,
        animationEnd: prevState.animationEnd + 1,
      }));
    }
  };

  const loop = config.loop ? 1 : 0;
  const stopVar = config.stop ? 1 : 0;

  useCode(
    block([
      procConfig(controledConfig.stop, stopVar, controledConfig.loop, loop),
      set(
        animation,
        runSpring(
          clock,
          animation,
          0,
          state.animationEnd,
          springConfig,
          config.delay,
          controledConfig.stop,
          controledConfig.loop,
          controledConfig.ended,
          onStep,
        ),
      ),
    ]),
    [state, config.stop, config.loop],
  );

  return {animation, state, controledConfig, stop, start};
}
