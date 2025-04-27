import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import Feather from "react-native-vector-icons/Feather";
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = useColorScheme() === 'dark';
  

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].icon,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            
            position: 'absolute',
          },
          default: {
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: Colors[colorScheme ?? 'light'].tabBarBackground,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="taskList"
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color }) => <Feather size={28} name="check-square" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="diario"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color }) => <Feather size={28} name="meh" color={color} />,
        }}
      />
      <Tabs.Screen
        name="audioNote"
        options={{
          title: 'Audio',
          tabBarIcon: ({ color }) => <Feather size={28} name="mic" color={color} />,
        }}
      />
      <Tabs.Screen
        name="decision"
        options={{
          title: 'Decisão',
          tabBarIcon: ({ color }) => <Feather size={28} name="shield" color={color} />,
        }}
      />
    </Tabs>
  );
}
function dynamicStyles(isDarkMode: boolean) {
  throw new Error('Function not implemented.');
}



