import { Keyboard, Linking } from 'react-native';
import {
  createNavigationContainerRef,
  DrawerActions,
  StackActions,
  TabActions,
  type LinkingOptions
} from '@react-navigation/native';
import _ from 'lodash';
import { ROUTES, StorageKeyConst, deepLinkFeature, deepLinkPrefixes } from '../constants';
import { checkAndGetParams, type CheckAndGetParamsReturn } from './DeepLinkUtils';
import { logger } from './LoggerUtils';
import { setStorageItem } from './StorageUtils';
import type { UseThemeReturnType } from '../hooks';
import type { RootAppParamList } from '../navigation';
import type { User } from '../types';

/**
 * Creates a ref that can be used to navigate to a new screen.
 *
 * @returns {React.RefObject<NavigationContainerRef>} - A ref that can be used to navigate to a new screen.
 */
export const navigationRef = createNavigationContainerRef<RootAppParamList>();

let navigationTimeout: NodeJS.Timeout;

/**
 * Checks if the navigation is not ready, wait 50 milliseconds and try again, otherwise call the callback
 * function.
 *
 * @param {() => void} moveCallback - This is the function that will be called when the navigation is
 * ready.
 * @returns {void} None
 */
const navigationCheck = (moveCallback: () => void): void => {
  if (navigationTimeout) {
    clearTimeout(navigationTimeout);
  }
  if (navigationRef.isReady()) {
    Keyboard.dismiss();
    moveCallback?.();
  } else {
    navigationTimeout = setTimeout(() => navigationCheck(moveCallback), 50);
  }
};

/**
 * It pops the current screen from the navigation stack
 *
 * @param {object} [root] - The options for the pop action.
 * @param {number} root.screenCount - The number of screens to pop.
 * @param {boolean} root.isPopToTop - Whether to pop to the top of the stack.
 * @param {string} root.routeName - The name of the route to pop to.
 * @param {object} [params] - The params to pass to the screen that is being popped to.
 * @param {object} [options] - Additional options for the pop action.
 * @param {boolean} [options.merge] - Whether to merge the params with the existing params.
 * @returns {void} None
 */
export const navigatePop = (
  {
    screenCount = 0,
    isPopToTop = false,
    routeName = ''
  }: Partial<{
    screenCount: number;
    isPopToTop: boolean;
    routeName: string;
  }>,
  params?: object,
  options?: { merge?: boolean }
): void => {
  navigationCheck(() => {
    if (isPopToTop) {
      navigationRef.dispatch(StackActions.popToTop());
      return;
    }

    if (!_.isNil(routeName) && !_.isEmpty(routeName)) {
      navigationRef.dispatch(StackActions.popTo(routeName, params, options));
      return;
    }

    navigationRef.dispatch(StackActions.pop(screenCount));
  });
};

/**
 * Navigates back one screen in the navigation history, and also sets the params of the screen
 * that the user is navigating back to.
 *
 * @param {object} [params] - The params to set for the screen that the user is navigating back to.
 * @returns {void} None
 */
export const navigateBack = (params?: object): void => {
  navigationCheck(() => {
    if (navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
    if (!_.isNil(params) && !_.isEmpty(params)) {
      navigationRef.setParams(params);
    }
  });
};

/**
 * Sets the params of the current screen.
 *
 * @param {object} [params] - The params to set for the current screen.
 * @returns {void} None
 */
export const navigateSetParams = (params?: object): void => {
  navigationCheck(() => {
    if (!_.isNil(params) && !_.isEmpty(params)) {
      navigationRef.setParams(params);
    }
  });
};

/**
 * It will replace the current screen with the screen you want to navigate to
 *
 * @param {string} routeName - The name of the route to navigate to.
 * @param {object} [params] - This is an object that contains the parameters you want to pass to the next screen.
 * @returns {void} None
 */
export const navigateWithReplace = (routeName: string, params?: object): void => {
  navigationCheck(() => {
    const replaceAction = StackActions.replace(routeName, params);
    navigationRef.dispatch(replaceAction);
  });
};

/**
 * Navigates to the given routeName with the given params.
 *
 * @param {object} root - The root object contains the stackName and routeName.
 * @param {string} root.stackName - The name of the stack you want to navigate to.
 * @param {string} root.routeName - The name of the route you want to navigate to.
 * @param {object} [params] - This is an object that contains the parameters you want to pass to the next screen.
 * @param {object} [options] - Additional options for navigation.
 * @param {boolean} [options.merge] - Whether to merge the params with the existing params.
 * @param {boolean} [options.pop] - Whether to pop the current screen before navigating.
 * @returns {void} None
 */
export const navigateWithParam = (
  {
    stackName,
    routeName
  }: {
    stackName?: string;
    routeName: string;
  },
  params?: object,
  options?: { merge?: boolean; pop?: boolean }
): void => {
  navigationCheck(() => {
    if (!_.isNil(stackName) && !_.isEmpty(stackName)) {
      navigationRef.navigate(
        stackName,
        {
          screen: routeName,
          params,
          options
        },
        options
      );
      return;
    }

    navigationRef.navigate(routeName, params, options);
  });
};

/**
 * Navigate to a new route with a push action.
 *
 * @param {string} routeName - the name of the route to navigate to
 * @param {object} [params] - This is an object that contains the parameters you want to pass to the next screen
 * @returns {void} None
 */
export const navigateWithPush = (routeName: string, params?: object): void => {
  navigationCheck(() => {
    const pushAction = StackActions.push(routeName, params);
    navigationRef.dispatch(pushAction);
  });
};

/**
 * Preloads the given routeName with the given params.
 *
 * @param {string} routeName - The name of the route to navigate to.
 * @param {object} [params] - The params to pass to the route.
 * @returns {void} None
 */
export const navigateWithPreload = (routeName: string, params?: object): void => {
  navigationCheck(() => {
    navigationRef.preload(routeName, params);
  });
};

/**
 * It resets the navigation stack to the given routeName with the given params.
 *
 * @param {object} root - The root object contains the stackName and routeName.
 * @param {string} root.stackName - The name of the stack you want to navigate to.
 * @param {string} root.routeName - The name of the route you want to navigate to.
 * @param {number} [root.index=0] - The index of the route to navigate to.
 * @param {Array<any>} [root.routes=[]] - An array of routes to navigate to.
 * @param {object} [params] - This is an object that contains the parameters you want to pass to the next screen.
 * @param {object} [options] - Additional options for navigation.
 * @param {boolean} [options.merge] - Whether to merge the params with the existing params.
 * @param {boolean} [options.pop] - Whether to pop the current screen before navigating.
 * @returns {void} None
 */
export function navigateWithReset(
  {
    stackName,
    routeName,
    index = 0,
    routes = []
  }: {
    stackName: string;
    routeName: string;
    index?: number;
    routes?: Array<any>;
  },
  params?: object,
  options?: { merge?: boolean; pop?: boolean }
): void {
  navigationCheck(() => {
    navigationRef.reset({
      index: index,
      routes: [
        ...routes,
        {
          name: stackName,
          state: { routes: [{ name: routeName, params, options }] }
        }
      ]
    });
  });
}

/**
 * Opens the drawer.
 *
 * @returns {void} None
 */
export function navigateOpenDrawer(): void {
  navigationCheck(() => {
    const openAction = DrawerActions.openDrawer();
    navigationRef.dispatch(openAction);
  });
}

/**
 * Closes the drawer if it is open.
 *
 * @returns {void} None
 */
export function navigateCloseDrawer(): void {
  navigationCheck(() => {
    const closeAction = DrawerActions.closeDrawer();
    navigationRef.dispatch(closeAction);
  });
}

/**
 * Toggles the drawer on the left side of the screen.
 *
 * @returns {void} None
 */
export function navigateToggleDrawer(): void {
  navigationCheck(() => {
    const toggleAction = DrawerActions.toggleDrawer();
    navigationRef.dispatch(toggleAction);
  });
}

/**
 * Navigates to the given route in the drawer.
 *
 * @param {string} routeName - the name of the route to navigate to
 * @param {object} [params] - the params to pass to the route
 * @returns {void} None
 */
export function navigateJumpToDrawer(routeName: string, params?: object): void {
  navigationCheck(() => {
    const jumpToAction = DrawerActions.jumpTo(routeName, params);
    navigationRef.dispatch(jumpToAction);
  });
}

/**
 * Navigates to the given tab.
 *
 * @param {string} routeName - the name of the tab to navigate to
 * @param {object} [params] - the params to pass to the tab
 * @returns {void} None
 */
export function navigateJumpToTab(routeName: string, params?: object): void {
  navigationCheck(() => {
    const jumpToAction = TabActions.jumpTo(routeName, params);
    navigationRef.dispatch(jumpToAction);
  });
}

/**
 * Checks if it is possible to go back in the navigation stack.
 *
 * @returns {boolean} Returns true if the navigation stack is ready and there is a previous screen, false otherwise.
 */
export function canGoBack(): boolean {
  return navigationRef.isReady() && navigationRef.canGoBack();
}

/**
 * Determines the default navigation flow based on the user's verification status, subscription status,
 * and onboarding status. It navigates to different screens such as OTP verification, home, login,
 * or onboarding based on certain conditions.
 *
 * @param {User} user - The user object containing details about the user's verification and subscription status.
 * @returns {void} Navigates the user to the appropriate screen based on the conditions.
 */
export const handleDefaultNavigationFlow = (user: User) => {
  const isLoggedIn = user.isVerified;
  if (isLoggedIn === true) {
    navigateWithReset({
      stackName: ROUTES.RootHome,
      routeName: ROUTES.Home
    });
  } else {
    navigateWithReset({
      stackName: ROUTES.RootAuth,
      routeName: ROUTES.Login
    });
  }
};

/**
 * It checks if the url is a deep link, and if it is, it checks if it's a toast message, and if it is,
 * it shows the toast message, and if it's not, it returns the deep link
 *
 * @param {USer} user - The user object.
 * @param {string} url - The URL to be handled.
 * @param {BranchParams} [params] - The parameters from Branch.io deep link.
 * @returns {string | undefined} A string representing the deep link or undefined if not applicable.
 */
export const handleUrlLink = (user: User, url: string, params?: any): string | undefined => {
  const details: CheckAndGetParamsReturn = checkAndGetParams(url, params);
  logger.d('handleUrlLink', { details, url, params });
  if (!_.isEmpty(details)) {
    const isLoggedIn = user.isVerified;
    logger.d('isLoggedIn', { isLoggedIn, details });
    const afterLoginEvent: Array<string> = [deepLinkFeature.home];

    if (isLoggedIn && afterLoginEvent.includes(details.feature ?? '')) {
      return details.deepLink;
    } else {
      setStorageItem<CheckAndGetParamsReturn>(StorageKeyConst.deepLink, details);
    }
  }
  return undefined;
};

/**
 * It returns a deep linking configuration object that tells the app how to handle deep links
 *
 * @param {User} user - The user object.
 * @returns {LinkingOptions<ReactNavigation.RootParamList>} A function that returns an object.
 */
export const getLinkConfiguration = (user: User): LinkingOptions<ReactNavigation.RootParamList> => {
  /**
   * Retrieves the initial URL used to open the app.
   *
   * @returns {Promise<string | null>} A promise that resolves to the initial URL or null if not available.
   */
  const getInitialURL = async (): Promise<string | null> => {
    // Fallback: React Native linking
    const url = await Linking.getInitialURL();
    const link = handleUrlLink(user, url ?? '');
    logger.d('getInitialURL', { url, link });
    if (_.isNil(link) || _.isEmpty(link)) {
      handleDefaultNavigationFlow(user);
    }
    return link ?? null;
  };

  /**
   * It takes a callback function that is called when the app is opened via a deep link.
   * The callback function is called with the URL that was used to open the app.
   * The URL is processed by the `handleUrlLink` function to remove any unnecessary
   * characters from the URL, such as the scheme and host.
   * If the URL is empty, the default navigation flow is used.
   *
   * @param {(url: string) => void} listener - A callback function that is called when the app is opened via a deep link.
   * @returns {() => void} A function that removes the event listener when called.
   */
  const subscribe = (listener: (url: string) => void): (() => void) => {
    /**
     * It takes an object with a url property and returns a function that takes a url and calls the
     * listener function with the url.
     *
     * @param {object} param - An object containing the URL and optional parameters.
     * @param {url} param.url - The URL that was received.
     * @param {BranchParams} [param.params] - The parameters from Branch.io deep link.
     * @returns {void} None
     */
    const onReceiveURL = ({ url, params }: { url: string; params?: any }): void => {
      const link = handleUrlLink(user, url ?? '', params);
      logger.d('onReceiveURL', { url, params, link });
      listener(link ?? '');
    };

    // Listen to incoming links from deep linking
    const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      // Clean up the event listeners
      linkingSubscription.remove();
    };
  };

  const config: LinkingOptions<ReactNavigation.RootParamList> = {
    enabled: true,
    prefixes: deepLinkPrefixes,
    getInitialURL,
    subscribe,

    config: {
      screens: {
        [ROUTES.RootHome]: {
          path: ROUTES.RootHome,
          initialRouteName: ROUTES.Home,
          screens: {
            [ROUTES.Home]: `${ROUTES.Home}`
          }
        },
        [ROUTES.RootAuth]: {
          path: ROUTES.RootAuth,
          initialRouteName: ROUTES.Login,
          screens: {
            [ROUTES.Login]: `${ROUTES.Login}`
          }
        }
      }
    }
  };

  return config;
};

/**
 * Generates a theme configuration object based on the provided theme mode and dark mode flag.
 *
 * @param {UseThemeReturnType<void>} root - An object containing theme mode and dark mode flag.
 * @param {boolean} root.isDark - A boolean indicating whether dark mode is enabled.
 * @param {ColorsType} root.colors - An object containing color definitions for various UI elements.
 * @param {FontFamilyType} root.fontFamily - An object containing font family definitions for different font weights.
 * @returns {ReactNavigation.Theme} An object containing font settings, dark mode status, and color palette for navigation components.
 */
export const themeConfig = ({
  isDark,
  colors,
  fontFamily
}: UseThemeReturnType<void>): ReactNavigation.Theme => ({
  fonts: {
    heavy: { fontFamily: fontFamily.bold, fontWeight: '900' },
    bold: { fontFamily: fontFamily.bold, fontWeight: '700' },
    medium: { fontFamily: fontFamily.medium, fontWeight: '500' },
    regular: { fontFamily: fontFamily.regular, fontWeight: '400' }
  },
  dark: isDark,
  colors: {
    primary: colors.primary.primary_500,
    background: colors.base.appBackground,
    card: colors.base.appBackground,
    text: colors.base.whiteText,
    border: colors.base.border,
    notification: colors.base.whiteText
  }
});
