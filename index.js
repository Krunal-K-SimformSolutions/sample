import './app/configs/TranslationConfig';

import { AppRegistry, Text, TextInput, LogBox } from 'react-native';
import App from './app/App';
import { name as appName } from './app.json';

// Disable font scaling globally
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

// This is the default configuration for LogBox
LogBox.ignoreAllLogs(true);
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Support for defaultProps will be removed from function components'
]);

AppRegistry.registerComponent(appName, () => App);
