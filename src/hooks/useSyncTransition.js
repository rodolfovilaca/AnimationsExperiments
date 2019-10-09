import {useMemo} from 'react';
import {interpolateSequence} from './interpolations';
import {useControler} from './useControler';
import useLazyRef from './useLazyRef';

export default function useSyncTransition(
  items,
  keyExtractor,
  {from, to, config},
  deps,
) {
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

  const props = useMemo(() => {
    if (state.currentAnim < arrayAnim.length && state.currentAnim > 0) {
      const key = reverse ? 'backwards' : 'forward'
      if(!ref.cacheTransform[key][state.currentAnim]){
        ref.style = interpolateSequence(arrayAnim, animation, state);
        ref.cacheTransform[key][state.currentAnim] = { ...ref.style }
        console.log('not cached', key, state.currentAnim)
      } else {
        console.log('cached', key, state.currentAnim)
        ref.style = ref.cacheTransform[key][state.currentAnim]
      }
    }
    return ref.style;
  }, [state, reverse]);
  return items.map(item => {
    const key = keyExtractor(item);
    return {
      item,
      props,
      key,
    };
  });
}
