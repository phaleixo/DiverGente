import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  FlatList,
  ListRenderItem,
} from "react-native";
import TaskListToday from "@/components/TaskListToday";
import CalendarScreen from "@/components/CalendarScreen";
import TodayDate from "@/components/TodayDate";
import ProfileHeader from "@/components/ProfileHeader";
import { ThemedView } from "@/components/ThemedView";
import Title from "@/components/Title";
import { useTheme } from "@/contexts/ThemeContext";

interface HomeItem {
  id: string;
  render: () => React.ReactNode;
}

export default function HomeScreen() {
  const isDarkMode = useColorScheme() === "dark";
  const { colors } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, theme),
    [isDarkMode, theme]
  );
  const data: HomeItem[] = [
    {
      id: "calendar",
      render: () => <CalendarScreen />,
    },
    {
      id: "tasks",
      render: () => (
        <View style={styles.card}>
          <TaskListToday />
        </View>
      ),
    },
  ];

  const renderItem: ListRenderItem<HomeItem> = ({ item }) => {
    return item.render() as React.ReactElement;
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Title variant="h3" marginTop={20} marginBottom={10}>
                <TodayDate shortMonth />
              </Title>
            </View>
            <ProfileHeader />
          </View>
        }
        contentContainerStyle={{ padding: 15, paddingBottom: 90 }}
      />
    </ThemedView>
  );
}

const dynamicStyles = (isDarkMode: boolean, theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 15,
      paddingTop: 20,
      paddingBottom: 10,
    },
    card: {
      padding: 10,
      marginVertical: 10,
      borderRadius: 15,
      backgroundColor: theme.surface,
      marginHorizontal: 10,
    },
    help: {
      padding: 20,
      borderRadius: 15,
      backgroundColor: theme.surface,
      marginHorizontal: 10,
      marginVertical: 10,
      minHeight: 140,
      justifyContent: "center",
    },
    cardText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.onSurface,
      marginBottom: 5,
    },
    cardSubtext: {
      fontSize: 14,
      color: theme.onSurface,
      marginTop: 10,
      alignItems: "center",
    },
    calm: {
      flexDirection: "row",
      padding: 0,
      justifyContent: "space-between",
      alignItems: "center",
    },
    listContent: {},
    iconButton: {
      padding: 5,
    },
    chevronButton: {
      marginLeft: 8,
      padding: 4,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
  });
