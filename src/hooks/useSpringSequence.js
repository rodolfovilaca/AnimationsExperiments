import {useMemo} from 'react';
import {interpolateSequence} from './interpolations/index';
import {useControler} from './useControler';
import useLazyRef from './useLazyRef';

export function useSpringSequence({from = {}, to = [], config = {}}, deps) {
  const ref = useLazyRef(() => ({
    cacheTransform: {
      forward: {},
      backwards: {}
    },
    style: {}
  }));
  const {
    animation,
    state,
    controledConfig: {arrayAnim, reverse},
  } = useControler({from, to, config}, deps);

  return useMemo(() => {
    if (state.currentAnim < arrayAnim.length && state.currentAnim > 0) {
      const key = reverse ? 'backwards' : 'forward'
      if(!ref.cacheTransform[key][state.currentAnim]){
        ref.style = interpolateSequence(arrayAnim, animation, state);
        ref.cacheTransform[key][state.currentAnim] = { ...ref.style }
        console.log('not cached', ref.cacheTransform)
      } else {
        console.log('cached', ref.cacheTransform)
        ref.style = ref.cacheTransform[key][state.currentAnim]
      }
    }
    return ref.style;
  }, [state, reverse]);
}
