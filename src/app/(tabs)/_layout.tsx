import Tabs from "expo-router/tabs";
import React, { useMemo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TouchableWithoutFeedback, View, StatusBar, Platform } from "react-native";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const isDarkMode = useColorScheme() === "dark";
  const { colors } = useTheme();
  const theme = useMemo(
    () => (isDarkMode ? colors.dark : colors.light),
    [isDarkMode, colors]
  );
  const insets = useSafeAreaInsets();

  
  const bottomMargin =
    Platform.OS === "android" ? Math.max(12, insets.bottom + 12) : 12;

  const iconMarginTop =
    Platform.OS === "android" ? (insets.bottom > 28 ? 46 : 28) : 36;

  const NoFeedbackTabButton = ({
    children,
    onPress,
    onLongPress,
    accessibilityState,
    accessibilityLabel,
    testID,
  }: BottomTabBarButtonProps) => (
    <TouchableWithoutFeedback
      onPress={onPress ?? undefined}
      onLongPress={onLongPress ?? undefined}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
  return (
    <>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />
      <AuthGate />
      <Tabs
        screenOptions={{
          animation: "none",
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.outline,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            height: 70,
            backgroundColor: theme.surface,
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: bottomMargin,
            borderTopWidth: 0,
            borderWidth: 0,
            borderColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowColor: "transparent",
            flexDirection: "row",
            justifyContent: "center",
          },
          tabBarItemStyle: {
            borderRadius: 24,
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          },
          tabBarActiveBackgroundColor: isDarkMode
            ? "transparent"
            : theme.primary + "15",
          tabBarInactiveBackgroundColor: "transparent",
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarIconStyle: {
            justifyContent: "center",
            alignItems: "center",
            marginTop: iconMarginTop,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                size={28}
                name="home-outline"
                color={color}
              />
            ),
            tabBarButton: NoFeedbackTabButton,
          }}
        />
        <Tabs.Screen
          name="taskList"
          options={{
            title: "Tarefas",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                size={28}
                name="check-circle-outline"
                color={color}
              />
            ),
            tabBarButton: NoFeedbackTabButton,
          }}
        />
        <Tabs.Screen
          name="diario"
          options={{
            title: "Diario",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                size={28}
                name="emoticon-outline"
                color={color}
              />
            ),
            tabBarButton: NoFeedbackTabButton,
          }}
        />
        <Tabs.Screen
          name="decision"
          options={{
            title: "Decisão",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                size={28}
                name="shield-outline"
                color={color}
              />
            ),
            tabBarButton: NoFeedbackTabButton,
          }}
        />
        <Tabs.Screen
          name="Configurar"
          options={{
            title: "Configure",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                size={28}
                name="cog-outline"
                color={color}
              />
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
        router.replace("/auth/Login");
      } catch (e) {}
    }
  }, [loading, user, router]);

  if (loading) return null;
  return null;
}
