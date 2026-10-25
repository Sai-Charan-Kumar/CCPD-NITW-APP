import React, { useEffect, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface FloatingTabItemProps {
  activeColor: string;
  focused: boolean;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

const FloatingTabItem: React.FC<FloatingTabItemProps> = ({
  activeColor,
  focused,
  label,
  icon,
  onPress,
  onLongPress,
  accessibilityLabel,
  testID,
}) => {
  const [animation] = useState(() => new Animated.Value(focused ? 1 : 0));

  useEffect(() => {
    Animated.spring(animation, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
      mass: 0.7,
    }).start();
  }, [animation, focused]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      onLongPress={onLongPress}
      onPress={onPress}
      testID={testID}
      style={styles.item}
    >
      <View style={styles.itemContent}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeBackground,
            {
              backgroundColor: `${activeColor}14`,
              opacity: animation,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.icon,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [9, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {icon}
        </Animated.View>
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: activeColor,
              opacity: animation,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [4, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
};

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  descriptors,
  navigation,
  state,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom + 12, Platform.OS === 'ios' ? 20 : 16),
          paddingTop: 10,
        },
      ]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const focused = state.index === index;
          const activeColor = options.tabBarActiveTintColor ?? COLORS.primaryAccent;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;
          const icon = options.tabBarIcon?.({
            focused,
            color: focused ? activeColor : options.tabBarInactiveTintColor ?? COLORS.textMuted,
            size: 21,
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <FloatingTabItem
              accessibilityLabel={options.tabBarAccessibilityLabel}
              focused={focused}
              icon={icon}
              key={route.key}
              label={label}
              activeColor={activeColor}
              onLongPress={onLongPress}
              onPress={onPress}
              testID={options.tabBarButtonTestID}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    paddingHorizontal: SPACING.xl,
    position: 'absolute',
    right: 0,
  },
  bar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: 'rgba(226, 232, 240, 0.9)',
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    maxWidth: 300,
    minHeight: 54,
    paddingHorizontal: 6,
    paddingVertical: 5,
    width: '100%',
    ...SHADOWS.modal,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  itemContent: {
    alignItems: 'center',
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    minHeight: 50,
    minWidth: 76,
    overflow: 'hidden',
    position: 'relative',
  },
  icon: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    top: 5,
    width: 24,
    zIndex: 1,
  },
  activeBackground: {
    borderRadius: RADIUS.full,
    bottom: 1,
    left: 1,
    position: 'absolute',
    right: 1,
    top: 1,
  },
  label: {
    bottom: 5,
    height: 14,
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    includeFontPadding: false,
    left: 8,
    position: 'absolute',
    right: 8,
    textAlign: 'center',
    zIndex: 1,
  },
});
