import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NewAppScreen } from '@react-native/new-app-screen';
import { initSentry } from './configs';

// Initialize Sentry for error tracking
// This should be called before any other imports that might throw errors
// to ensure that Sentry can capture them.
initSentry();

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

/**
 * the main content of the app
 *
 * @returns {JSX.Element} the app content
 */
function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen templateFileName="App.tsx" safeAreaInsets={safeAreaInsets} />
    </View>
  );
}

/**
 * the main app component
 *
 * @returns {JSX.Element} the app
 */
function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
