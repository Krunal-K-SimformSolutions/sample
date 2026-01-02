import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Calls the provided callback when the app state changes from inactive or background to active.
 *
 * @param {() => void} callback - The function to be called when the app becomes active.
 * @returns {void} None
 */
const useAppStateOnActive = (callback: () => void): void => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        callback();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useAppStateOnActive;
