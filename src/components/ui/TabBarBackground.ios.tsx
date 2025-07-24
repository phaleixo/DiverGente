import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MODERN_TABBAR_HEIGHT = 70;

export default function BlurTabBarBackground() {
  return (
    <View style={styles.wrapper} pointerEvents="box-only">
      <BlurView
        tint="systemChromeMaterial"
        intensity={100}
        style={styles.blur}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    height: MODERN_TABBAR_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
});

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
