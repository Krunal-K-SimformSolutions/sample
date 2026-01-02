import { useEffect, useRef } from 'react';

/**
 * A timeout hook that calls a function after a specified delay.
 *
 * @param {() => void} callback - the function to call after the delay
 * @param {number | undefined} delay - the delay in milliseconds
 * @returns {void} None
 */
const useTimeout = (callback: () => void, delay?: number): void => {
  const savedCallback = useRef<() => void>(undefined);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    /**
     * A function that is called every time the timeout is updated.
     *
     * @returns {void} None
     */
    const tick = (): void => {
      savedCallback.current?.();
    };

    if ((delay ?? -1) >= 0) {
      const id = setTimeout(tick, delay);
      return () => clearTimeout(id);
    } else {
      return undefined;
    }
  }, [delay]);
};

export default useTimeout;
