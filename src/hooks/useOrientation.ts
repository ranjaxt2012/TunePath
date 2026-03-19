import { useWindowDimensions } from 'react-native';

/**
 * Hook to detect screen orientation.
 * Returns isLandscape flag and dimensions.
 */
export function useOrientation() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  return { isLandscape, width, height };
}
