import { useEffect, useRef } from 'react';

/**
 * previous hook to get the previous value of a state variable.
 *
 * @param {T} value - the value to get the previous value of.
 * @returns {T | undefined} the previous value of the state variable.
 */
const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export default usePrevious;
