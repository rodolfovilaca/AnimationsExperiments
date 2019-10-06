import {useSpring} from './useSpring';
import useSyncTransition from './useSyncTransition';

export default function useTransition(
  items,
  keyExtractor,
  {trail, from, to, config},
  deps,
) {
  return trail
    ? items.map((item, index) => {
        const props = useSpring(
          {
            from,
            to,
            config: {
              ...config,
              delay: (config.delay || 0) + (trail || 0) * index,
            },
          },
          deps,
        );
        const key = keyExtractor(item);
        return {
          item,
          props,
          key,
        };
      })
    : useSyncTransition(items, keyExtractor, {trail, from, to, config}, deps);
}
