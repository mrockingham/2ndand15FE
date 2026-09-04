import { createContext, useContext } from 'react';
import type { MutableRefObject } from 'react';

export const ProgressContext = createContext<MutableRefObject<number> | null>(
  null,
);

export const useAnimationProgressRef = (): MutableRefObject<number> => {
  const ref = useContext(ProgressContext);
  if (ref === null)
    throw new Error(
      'useAnimationProgressRef must be used within AnimationDriver',
    );
  return ref;
};
