import {useMemo, useRef} from 'react';
import {interpolateSequence} from './interpolations/index';
import {useControler} from './useControler';

export function useSpringSequence({from = {}, to = [], config = {}}, deps) {
  const style = useRef();
  const {
    animation,
    state,
    controledConfig: {arrayAnim},
  } = useControler({from, to, config}, deps);

  return useMemo(() => {
    if (state.currentAnim < arrayAnim.length && state.currentAnim > 0) {
      style.current = interpolateSequence(arrayAnim, animation, state);
    }
    return style.current;
  }, [state]);
}
