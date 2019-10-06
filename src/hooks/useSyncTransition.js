import {useRef, useMemo} from 'react';
import {interpolateSequence} from './interpolations';
import {useControler} from './useControler';

export default function useSyncTransition(
  items,
  keyExtractor,
  {from, to, config},
  deps,
) {
  const style = useRef();
  const {
    animation,
    state,
    controledConfig: {arrayAnim},
  } = useControler({from, to, config}, deps);

  const props = useMemo(() => {
    if (state.currentAnim < arrayAnim.length && state.currentAnim > 0) {
      style.current = interpolateSequence(
        arrayAnim,
        animation,
        state,
        config.reverse,
      );
    }
    return style.current;
  }, [state]);
  return items.map(item => {
    const key = keyExtractor(item);
    return {
      item,
      props,
      key,
    };
  });
}
