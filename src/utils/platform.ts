import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = isIOS || isAndroid;

export const WEB_MAX_WIDTH = 1200;
export const WEB_SIDEBAR_WIDTH = 220;
export const WEB_CONTENT_MAX = 860;

export function useIsWeb() {
  return Platform.OS === 'web';
}
