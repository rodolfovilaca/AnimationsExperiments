import {useMemo, useState, useRef, useEffect} from 'react';
import Animated from 'react-native-reanimated';
import {useLazyRef} from '.';
import {runSpring} from './useSpring';
import {transformInterpolationsSequence} from './interpolations';

const {Value, useCode, set, Clock, SpringUtils, block} = Animated;

export function useSpringSequenceAnimated(
  {from = {}, to = [], config = {}},
  deps,
) {
  to = [from, ...to];
  const [state, setState] = useState({
    currentAnim: config.reverse ? to.length - 1 : 1,
    animationStart: 0,
    animationEnd: 1,
  });

  const animation = useLazyRef(() => new Value(0));
  const clock = useLazyRef(() => new Clock());
  const stopAnimation = useLazyRef(() => new Value(0));
  const ended = useLazyRef(() => new Value(0));
  const springConfig = {
    ...SpringUtils.makeConfigFromOrigamiTensionAndFriction({
      ...SpringUtils.makeDefaultConfig(),
      tension: config.tension || 10,
      friction: new Value(config.friction || 4),
      mass: config.mass || 1,
    }),
  };

  const reset = () => {
    ended.setValue(0);
    if (state.animationStart !== 0) {
      setState(prevState => ({
        currentAnim: config.reset ? 1 : config.reverse ?  prevState.currentAnim - 1 : prevState.currentAnim + 1,
        animationStart: 0,
        animationEnd: 1,
      }));
      animation.setValue(0); // needs to be set after state has been changed and effectively changed
    }
  };

  useEffect(() => {
    reset();
  }, [config.reverse, config.reset]);

  useEffect(() => {
    stopAnimation.setValue(config.stop ? 1 : 0);
  }, [config.stop]);

  const onFinish = position => {
    // if (config.reverse) {
      if (state.currentAnim > 0 && state.currentAnim < to.length) {
        console.log('====================> inside reverse', state.currentAnim)
        setState(prevState => ({
          currentAnim: config.reverse ? prevState.currentAnim - 1 : prevState.currentAnim + 1,
          animationStart: prevState.animationStart + 1,
          animationEnd: prevState.animationEnd + 1,
        }));
      }
    // } else {
    //   if (state.currentAnim < to.length - 1) {
    //     setState(prevState => ({
    //       currentAnim: prevState.currentAnim + 1,
    //       animationStart: prevState.animationStart + 1,
    //       animationEnd: prevState.animationEnd + 1,
    //     }));
    //   }
    // }
    if (
      config.loop &&
      (state.currentAnim === to.length || state.currentAnim === 0)
    ) {
      console.log('====================> inside loop reset', state.currentAnim)
      ended.setValue(0);
      setState(prevState => console.log(prevState) || ({
        currentAnim: prevState.currentAnim === to.length ? prevState.currentAnim - 1 : prevState.currentAnim + 1,
        animationStart: 0,
        animationEnd: 1,
      }));
      animation.setValue(0); // needs to be set after state has been changed and effectively changed
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
          onFinish,
          stopAnimation,
        ),
      ),
    ]),
    [state],
  );

  return [animation, state, to];
}

export function useSpringSequence({from = {}, to = [], config = {}}, deps) {
  const style = useRef();
  const [animation, state, toArray] = useSpringSequenceAnimated(
    {from, to, config},
    deps,
  );

  return useMemo(() => {
    if (state.currentAnim < toArray.length && state.currentAnim > 0) {
      style.current = transformInterpolationsSequence(
        toArray,
        animation,
        state,
        config.reverse,
      );
    }
    return style.current;
  }, [state]);
}
