import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TouchableWithoutFeedback, View } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export default function TabLayout() {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const NoFeedbackTabButton = ({ children, onPress, onLongPress, accessibilityState, accessibilityLabel, testID }: BottomTabBarButtonProps) => (
    <TouchableWithoutFeedback
      onPress={onPress ?? undefined}
      onLongPress={onLongPress ?? undefined}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>{children}</View>
    </TouchableWithoutFeedback>
  );
  return (
    <Tabs
      screenOptions={{
        animation: 'shift',
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.onSurface,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          height: 70,
          backgroundColor: theme.surface,
          borderRadius: 24,
          marginHorizontal: 16,
          marginBottom: 12,
          left: 0,
          right: 0,
        
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarItemStyle: {
          borderRadius: 24,
          justifyContent: 'center',
          alignItems: 'center',
          height: 56,
          marginVertical: 7,
        },
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
          
          
        },
        tabBarIconStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          
        },
        
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons size={28} name="home-outline" color={color} />
          ),
          tabBarButton: NoFeedbackTabButton,
        }}
      />
      <Tabs.Screen
        name="taskList"
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons size={28} name="check-circle-outline" color={color} />
          ),
          tabBarButton: NoFeedbackTabButton,
        }}
      />
      <Tabs.Screen
        name="diario"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons size={28} name="emoticon-outline" color={color} />
          ),
          tabBarButton: NoFeedbackTabButton,
        }}
      />
      <Tabs.Screen
        name="decision"
        options={{
          title: 'Decisão',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons size={28} name="shield-outline" color={color} />
          ),
          tabBarButton: NoFeedbackTabButton,
        }}
      />
    </Tabs>
  );
}



