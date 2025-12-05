import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TouchableWithoutFeedback, View, StatusBar,} from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';




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
    <>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <AuthGate />
      <Tabs
        screenOptions={{
          animation: 'shift',
          tabBarActiveTintColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
          tabBarInactiveTintColor: isDarkMode ? Colors.dark.secondary : Colors.light.secondary,
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            height: 80,
            backgroundColor: theme.surface,
            borderRadius: 12,
            marginHorizontal: 12,
            marginBottom: 12,
            left: 0,
            right: 0,
            borderTopWidth: 0,
            borderWidth: 0,
            borderColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowColor: 'transparent',
            overflow: 'visible',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
          tabBarItemStyle: {
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            flex: 1,
            marginTop: 18,
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
        <Tabs.Screen
          name="Configurar"
          options={{
            title: 'Configure',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons size={28} name="cog-outline" color={color} />
            ),
            tabBarButton: NoFeedbackTabButton,
          }}
        />
      </Tabs>
    </>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      // redirect to auth login route outside of render
      try {
        router.replace('/auth/Login');
      } catch (e) {}
    }
  }, [loading, user, router]);

  if (loading) return null;
  return null;
}




