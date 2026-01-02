import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Alert, type AlertButton } from 'react-native';
import _ from 'lodash';
import {
  checkMultiple,
  openSettings,
  request,
  type Permission,
  type RationaleObject
} from 'react-native-permissions';
import { getTranslatedString } from '../configs';
import { StringConst } from '../constants';
import { asyncTimeout } from '../utils';
import useAppStateOnActive from './useAppStateOnActive';

/**
 * Properties for the rationale options used in permission requests
 *
 * @property {function} [customDialogView] - A custom dialog view function that takes positive and negative button callbacks.
 * @property {string} [buttonNeutral] - Text for the neutral button in the dialog.
 * @property {string} [title] - Title of the rationale dialog.
 * @property {string} [message] - Message of the rationale dialog.
 * @property {string} [buttonPositive] - Text for the positive button in the dialog.
 * @property {string} [buttonNegative] - Text for the negative button in the dialog.
 */
type RationaleOptions = {
  customDialogView?: (buttonPositive: () => void, buttonNegative: () => void) => void;
  buttonNeutral?: string;
} & Partial<RationaleObject>;

/**
 * Properties for the getPermissionResult methos return.
 *
 * @property {PermissionStatus} status - The overall permission status.
 * @property {Array<Permission>} deniedList - List of denied permissions.
 * @property {Array<Permission>} blockedList - List of blocked permissions.
 * @property {Array<Permission>} unavailableList - List of unavailable permissions.
 * @property {Array<Permission>} errorList - List of permissions that encountered errors.
 * @property {Array<Permission>} grantedList - List of granted permissions.
 * @property {Array<Permission>} notGrantedList - List of permissions that are not granted.
 */
interface GetPermissionResultReturnType {
  status: PermissionStatus;
  deniedList: Array<Permission>;
  blockedList: Array<Permission>;
  unavailableList: Array<Permission>;
  errorList: Array<Permission>;
  grantedList: Array<Permission>;
  notGrantedList: Array<Permission>;
}

/**
 * Properties for the usePermission hook.
 *
 * @property {Array<Permission>} [optionTypes] - An array of optional permission types.
 * @property {boolean} [askPermissions=false] - Whether to ask for permissions on mount.
 * @property {boolean} [isMandatory=false] - Whether the permissions are mandatory.
 * @property {RationaleOptions} [requestRationale] - Rationale options for requesting permissions.
 * @property {RationaleOptions} [requestBlocked] - Rationale options for blocked permissions.
 * @property {() => void} [customDialogComplete] - Callback when custom dialog is completed.
 * @property {(permissionList: string) => void} [onError] - Callback for handling errors.
 */
interface UsePermissionProps {
  optionTypes?: Array<Permission>;
  askPermissions?: boolean;
  isMandatory?: boolean;
  requestRationale?: RationaleOptions;
  requestBlocked?: RationaleOptions;
  customDialogComplete?: () => void;
  onError?: (permissionList: string) => void;
}

/**
 * An object that defines various permission statuses.
 * Each status is represented as a string constant.
 * - UNAVAILABLE: The permission is not available on the device.
 * - DENIED: The permission has been denied by the user.
 * - LIMITED: The permission is granted but with limitations.
 * - GRANTED: The permission has been granted by the user.
 * - BLOCKED: The permission has been blocked by the user and cannot be requested again.
 * - ERROR: An error occurred while checking or requesting the permission.
 * - UNKNOWN: The permission status is unknown.
 * - CUSTOM_BLOCKED: A custom condition has blocked the permission request.
 */
const permissionStatus = {
  UNAVAILABLE: 'unavailable',
  DENIED: 'denied',
  LIMITED: 'limited',
  GRANTED: 'granted',
  BLOCKED: 'blocked',
  ERROR: 'error',
  UNKNOWN: 'unknown',
  CUSTOM_BLOCKED: 'custom_blocked'
} as const;

/**
 * A type that represents the permission status of a current permission.
 * It can take on any of the values defined in the permissionStatus object.
 *
 * @typedef {('unavailable' | 'denied' | 'limited' | 'granted' | 'blocked' | 'error' | 'unknown' | 'custom_blocked')} PermissionStatus - The status of a permission.
 */
type PermissionStatus = (typeof permissionStatus)[keyof typeof permissionStatus];

/*
 * Defining a default value for the options RationaleOptions object.
 */
const defaultOption: RationaleOptions = {
  title: '',
  message: '',
  buttonPositive: '',
  buttonNegative: '',
  buttonNeutral: ''
};

/**
 * Displays a permission dialog to the user based on the rationale provided.
 * If it's the first time and the trigger event is true, the positive action is invoked.
 * If a custom dialog view is provided, it is displayed instead of the default dialog.
 * Otherwise, a default alert dialog is shown if the title, message, and button texts are not empty.
 * If none of the above conditions are met, the positive action is invoked by default.
 *
 * @param {RationaleOptions} rationale - The rationale options for the permission dialog.
 * @param {boolean} isFirstTime - Indicates if it's the first time the dialog is shown.
 * @param {(val: boolean) => void} setIsFirstTime - Function to update the first time state.
 * @param {boolean} isTriggerFirstTimeEvent - Indicates if the first time event should be triggered.
 * @param {() => Promise<void>} onPositive - Callback for the positive action.
 * @param {() => void} onNegative - Callback for the negative action.
 * @returns {void} None
 */
const showPermissionDialog = (
  rationale: RationaleOptions,
  isFirstTime: boolean,
  setIsFirstTime: (val: boolean) => void,
  isTriggerFirstTimeEvent: boolean,
  onPositive: () => Promise<void>,
  onNegative: () => void
): void => {
  const { title, message, buttonPositive, buttonNegative, buttonNeutral, customDialogView } =
    rationale;

  if (isFirstTime && !isTriggerFirstTimeEvent) {
    setIsFirstTime(false);
  }
  if (isFirstTime && isTriggerFirstTimeEvent) {
    onPositive();
    setIsFirstTime(false);
  } else if (!_.isNil(customDialogView)) {
    customDialogView(onPositive, onNegative);
  } else if (
    !_.isEmpty(title) &&
    !_.isEmpty(message) &&
    !_.isEmpty(buttonPositive) &&
    !_.isEmpty(buttonNegative)
  ) {
    const buttons: AlertButton[] = [
      ...(buttonNeutral ? [{ text: buttonNeutral, onPress: onNegative }] : []),
      { text: buttonNegative, onPress: onNegative },
      {
        text: buttonPositive,
        /**
         * Callback function to handle the positive button press.
         *
         * @returns {void}
         */
        onPress: (): void => {
          onPositive();
        }
      }
    ];
    Alert.alert(title ?? '', message ?? '', buttons, { cancelable: false });
  } else {
    onPositive();
  }
};

/**
 * Check and filter multiple permission status.
 *
 * @param {Array<Permission>} types - Array of permissions to check.
 * @param {Array<Permission>} optionTypes - Array of optional permissions.
 * @param {Record<Permission[number], PermissionStatus>} statuses - Record of permission statuses.
 * @returns {GetPermissionResultReturnType} An object containing the overall status and lists of permissions by their statuses.
 */
const getPermissionResult = (
  types: Array<Permission>,
  optionTypes: Array<Permission>,
  statuses: Record<Permission[number], PermissionStatus>
): GetPermissionResultReturnType => {
  const tempOptionTypes: Array<Permission> = optionTypes ?? [];
  const grantedList: Array<Permission> = types.filter(
    (type) =>
      statuses[type] === permissionStatus.GRANTED ||
      statuses[type] === permissionStatus.LIMITED ||
      tempOptionTypes.includes(type)
  );
  const notGrantedList: Array<Permission> = types.filter(
    (type) =>
      statuses[type] !== permissionStatus.GRANTED &&
      statuses[type] !== permissionStatus.LIMITED &&
      tempOptionTypes.indexOf(type) <= -1
  );
  const deniedList: Array<Permission> = types.filter(
    (type) => statuses[type] === permissionStatus.DENIED && tempOptionTypes.indexOf(type) <= -1
  );
  const blockedList: Array<Permission> = types.filter(
    (type) => statuses[type] === permissionStatus.BLOCKED && tempOptionTypes.indexOf(type) <= -1
  );
  const customBlockedList: Array<Permission> = types.filter(
    (type) =>
      statuses[type] === permissionStatus.CUSTOM_BLOCKED && tempOptionTypes.indexOf(type) <= -1
  );
  const unavailableList: Array<Permission> = types.filter(
    (type) => statuses[type] === permissionStatus.UNAVAILABLE && tempOptionTypes.indexOf(type) <= -1
  );
  const errorList: Array<Permission> = types.filter(
    (type) => statuses[type] === permissionStatus.ERROR && tempOptionTypes.indexOf(type) <= -1
  );
  let status: PermissionStatus;
  if (customBlockedList.length > 0) {
    status = permissionStatus.CUSTOM_BLOCKED;
  } else if (blockedList.length > 0) {
    status = permissionStatus.BLOCKED;
  } else if (deniedList.length > 0) {
    status = permissionStatus.DENIED;
  } else if (unavailableList.length > 0) {
    status = permissionStatus.UNAVAILABLE;
  } else if (errorList.length > 0) {
    status = permissionStatus.ERROR;
  } else if (grantedList.length === types.length) {
    status = permissionStatus.GRANTED;
  } else {
    status = permissionStatus.UNKNOWN;
  }
  return {
    status,
    blockedList,
    deniedList,
    unavailableList,
    errorList,
    grantedList,
    notGrantedList
  };
};

/**
 * Properties for the showToastMessage function.
 *
 * @property {string} [message] - The message to be displayed in the toast.
 * @property {PermissionStatus} [status] - The status of the permission.
 * @property {Array<Permission>} [notGrantedList] - List of permissions that are not granted.
 * @property {boolean} [isMandatory] - Indicates if the permission is mandatory.
 * @property {RefObject<PermissionStatus | undefined>} [permissionStatusRef] - A ref to store the permission status.
 * @property {(permissionList: string) => void} [onError] - Callback function to handle errors.
 */
interface ShowToastMessageProps {
  message?: string;
  status?: PermissionStatus;
  notGrantedList?: Array<Permission>;
  isMandatory?: boolean;
  permissionStatusRef?: RefObject<PermissionStatus | undefined>;
  onError?: (permissionList: string) => void;
}

const optionPermission: Array<string> = [];

/**
 * Displays a toast message indicating the status of permissions.
 *
 * @param {ShowToastMessageProps} props - The properties for displaying the toast message.
 * @returns {void} None
 */
const showToastMessage = ({
  message,
  status,
  notGrantedList,
  isMandatory,
  permissionStatusRef,
  onError
}: ShowToastMessageProps): void => {
  if (status !== undefined && permissionStatusRef?.current) {
    permissionStatusRef.current = status;
  }
  let permissionStings;
  if (_.isEmpty(message) && notGrantedList && notGrantedList.length > 0 && isMandatory) {
    const list = notGrantedList.map((p) =>
      p.replaceAll('android.permission.', '').replaceAll('ios.permission.', '')
    );
    permissionStings = list.join(', ');
    message = getTranslatedString(StringConst.Common.errPermissionNotGranted, {
      list: permissionStings
    });
  }
  if (!_.includes(optionPermission, permissionStings)) {
    ToastHolder.toastMessage({
      text2: message ?? '',
      type: ToastType.error
    });
  }
  onError?.(permissionStings ?? '');
};

/**
 * A custom hook that manages permissions in a React Native application.
 * It checks the status of specified permissions, requests them if necessary,
 * and handles the user's response through dialogs.
 *
 * @param {Permission | Array<Permission> | undefined} types - The permission(s) to be managed.
 * @param {() => void} [onGranted=() => {}] - Callback function to be executed when permissions are granted.
 * @param {UsePermissionProps} [options] - Additional options for managing permissions.
 * @returns {() => Promise<void>} A function that requests the specified permissions when called.
 */
const usePermission = (
  types: Permission | Array<Permission> | undefined,
  onGranted: () => void = () => {},
  {
    optionTypes = [],
    askPermissions = false,
    isMandatory = false,
    requestRationale = defaultOption,
    requestBlocked = defaultOption,
    customDialogComplete = () => {},
    onError = () => {}
  }: UsePermissionProps = {}
): (() => Promise<void>) => {
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  const permissionStatusRef = useRef<PermissionStatus>(undefined);
  const localTypes = useMemo(() => {
    return (Array.isArray(types) ? types : [types]).filter((type) => type !== undefined);
  }, [types]);

  /**
   * Requests multiple permissions and returns their statuses.
   *
   * @param {Array<Permission>} requestTypes - The permissions to request.
   * @returns {Promise<Record<Permission[number], PermissionStatus>>} A promise that resolves to the statuses of the requested permissions.
   */
  const requestMultiplePermissions = useCallback(
    async (
      requestTypes: Array<Permission>
    ): Promise<Record<Permission[number], PermissionStatus>> => {
      let statuses: Record<Permission[number], PermissionStatus> = {};
      let errorOccurred = false;
      let errorMessage = '';
      for (const type of requestTypes) {
        try {
          const status = await asyncTimeout(request(type), 1000, permissionStatus.CUSTOM_BLOCKED);
          statuses = { ...statuses, [type]: status };
        } catch (error: any) {
          if (
            error === permissionStatus.CUSTOM_BLOCKED ||
            error.message === permissionStatus.CUSTOM_BLOCKED
          ) {
            statuses = { ...statuses, [type]: permissionStatus.CUSTOM_BLOCKED };
          } else {
            statuses = { ...statuses, [type]: permissionStatus.ERROR };
            if (!errorOccurred) {
              errorOccurred = true;
              errorMessage = error.message;
            }
          }
        }
      }
      if (errorOccurred) {
        showToastMessage({
          message: errorMessage,
          isMandatory,
          permissionStatusRef,
          onError
        });
      }

      return statuses;
    },
    [isMandatory, onError]
  );

  /**
   * Handles the positive action for permission requests.
   *
   * @param {boolean} isBlocked - Indicates if the permission is blocked.
   * @returns {Promise<void>} A promise that resolves when the action is complete.
   */
  const handlePositivePress = useCallback<(isBlocked: boolean) => Promise<void>>(
    async (isBlocked: boolean): Promise<void> => {
      if (localTypes) {
        try {
          if (isBlocked) {
            await openSettings('application');
          }
          const statuses = await (isBlocked ? checkMultiple : requestMultiplePermissions)(
            localTypes
          );
          const { status, notGrantedList } = getPermissionResult(localTypes, optionTypes, statuses);
          if (status === permissionStatus.GRANTED || status === permissionStatus.LIMITED) {
            onGranted();
            permissionStatusRef.current = permissionStatus.GRANTED;
            customDialogComplete();
          } else if (status === permissionStatus.CUSTOM_BLOCKED) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            askBlockedPermissions();
          } else {
            showToastMessage({
              status,
              notGrantedList,
              isMandatory,
              permissionStatusRef,
              onError
            });
          }
        } catch (error: any) {
          showToastMessage({
            message: error.message,
            status: permissionStatus.ERROR,
            isMandatory,
            permissionStatusRef,
            onError
          });
        }
      } else {
        onGranted();
        customDialogComplete();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      customDialogComplete,
      isMandatory,
      localTypes,
      onError,
      onGranted,
      optionTypes,
      requestMultiplePermissions
    ]
  );

  /**
   * Handles the blocked permissions by showing the blocked dialog.
   *
   * @returns {void} None
   */
  const askBlockedPermissions = useCallback<() => void>(() => {
    /**
     * It returns a function that resolves the promise returned by onPressGet().
     *
     * @returns {void} None
     */
    const onPressNegative = (): void => {
      customDialogComplete();
    };

    /**
     * It returns a function that resolves the promise returned by onPressAsk().
     *
     * @returns {Promise<void>} A promise that resolves when the positive action is handled.
     */
    const onPressPositive = async (): Promise<void> => {
      await handlePositivePress(true);
    };

    showPermissionDialog(
      requestBlocked,
      isFirstTime,
      setIsFirstTime,
      false,
      onPressPositive,
      onPressNegative
    );
  }, [requestBlocked, isFirstTime, customDialogComplete, handlePositivePress]);

  const askDeniedPermissions = useCallback(() => {
    /**
     * It returns a function that resolves the promise returned by onPressGet().
     *
     * @returns {void} None
     */
    const onPressNegative = (): void => {
      customDialogComplete();
    };

    /**
     * It returns a function that resolves the promise returned by onPressAsk().
     *
     * @returns {Promise<void>} A promise that resolves when the positive action is handled.
     */
    const onPressPositive = async (): Promise<void> => {
      await handlePositivePress(false);
    };

    showPermissionDialog(
      requestRationale,
      isFirstTime,
      setIsFirstTime,
      true,
      onPressPositive,
      onPressNegative
    );
  }, [requestRationale, isFirstTime, customDialogComplete, handlePositivePress]);

  const requestPermissions = useCallback(async () => {
    if (!localTypes) {
      onGranted();
      return;
    }

    if (permissionStatusRef.current === permissionStatus.BLOCKED) {
      askBlockedPermissions();
      return;
    }

    if (permissionStatusRef.current === permissionStatus.DENIED) {
      askDeniedPermissions();
      return;
    }

    if (
      permissionStatusRef.current === permissionStatus.GRANTED ||
      permissionStatusRef.current === permissionStatus.LIMITED
    ) {
      onGranted();
      return;
    }

    try {
      const statuses = await requestMultiplePermissions(localTypes);
      const { status, notGrantedList } = getPermissionResult(localTypes, optionTypes, statuses);
      if (status === permissionStatus.GRANTED || status === permissionStatus.LIMITED) {
        onGranted();
        permissionStatusRef.current = permissionStatus.GRANTED;
      } else if (status === permissionStatus.CUSTOM_BLOCKED) {
        askBlockedPermissions();
      } else {
        showToastMessage({
          status,
          notGrantedList,
          isMandatory,
          permissionStatusRef,
          onError
        });
      }
    } catch (error: any) {
      showToastMessage({
        message: error.message,
        status: permissionStatus.ERROR,
        isMandatory,
        permissionStatusRef,
        onError
      });
    }
  }, [
    localTypes,
    onGranted,
    askBlockedPermissions,
    askDeniedPermissions,
    requestMultiplePermissions,
    optionTypes,
    isMandatory,
    onError
  ]);

  const checkPermissions = useCallback(
    async (isAsk: boolean = false) => {
      if (localTypes) {
        try {
          const statuses = await checkMultiple(localTypes);
          const { status } = getPermissionResult(localTypes, optionTypes, statuses);
          if (status === permissionStatus.GRANTED || status === permissionStatus.LIMITED) {
            permissionStatusRef.current = permissionStatus.GRANTED;
          } else {
            permissionStatusRef.current = status;
          }

          if (isAsk) {
            requestPermissions();
          }
        } catch {
          permissionStatusRef.current = permissionStatus.ERROR;
          if (isAsk) {
            requestPermissions();
          }
        }
      } else {
        permissionStatusRef.current = permissionStatus.GRANTED;
        if (isAsk) {
          requestPermissions();
        }
      }
    },
    [localTypes, optionTypes, requestPermissions]
  );

  useEffect(() => {
    checkPermissions(askPermissions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAppStateOnActive(() => {
    checkPermissions();
  });

  return requestPermissions;
};

export default usePermission;
