import AppConst from './AppConst';
import { ROUTES } from './NavigationRoutesConst';

const domain: Array<string> = [
  AppConst.deepLinkHost1,
  AppConst.deepLinkHost2,
  AppConst.deepLinkHost3,
  AppConst.deepLinkHost4
];

const domainVariants: Array<string> = domain.flatMap((d) => [
  `${d}//`,
  `https://${d}`,
  `http://${d}`
]);

export const DEEP_LINK_SCHEMA = `${AppConst.appScheme}://`;
export const OTHER_DEEP_LINK_SCHEMAS = Object.freeze({
  NOTI_HOME_URL: `${DEEP_LINK_SCHEMA}home`
});

export const deepLinkPrefixes: Array<string> = [
  DEEP_LINK_SCHEMA,
  ...Object.values(OTHER_DEEP_LINK_SCHEMAS),
  ...domainVariants
];

export const justOpenAppDeepLinks: Array<string> = [DEEP_LINK_SCHEMA, ...domainVariants];

export const commonDeepLinkKeys = Object.freeze({
  home: 'home'
});

export const deepLinkFeature = Object.freeze({
  none: 'none',
  [commonDeepLinkKeys.home]: commonDeepLinkKeys.home
});

const allDeepLinkParamCommonKeys = Object.freeze({
  [commonDeepLinkKeys.home]: commonDeepLinkKeys.home
});

export const deepLinkParamKeys = Object.freeze({
  ...allDeepLinkParamCommonKeys
});

export const deepLinkParamKeyMappers: Record<keyof typeof deepLinkParamKeys, string> =
  Object.freeze({
    ...allDeepLinkParamCommonKeys
  });

export const deepLinkNavigationMappings: Array<{
  urls: string[];
  key: keyof typeof commonDeepLinkKeys;
  // @TODO: update type any with proper params type based on BranchParams
  suffix: string | ((p: any) => string);
  extraKeys: Array<keyof typeof deepLinkParamKeys>;
  isRequiredUrl: boolean;
}> = [
  {
    urls: [OTHER_DEEP_LINK_SCHEMAS.NOTI_HOME_URL],
    key: commonDeepLinkKeys.home,
    suffix: `${ROUTES.RootHome}/${ROUTES.Home}`,
    extraKeys: [],
    isRequiredUrl: false
  }
];
