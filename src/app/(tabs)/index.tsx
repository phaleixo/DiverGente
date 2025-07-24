import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, FlatList, ListRenderItem, ListRenderItemInfo } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TaskListToday from '@/components/TaskListToday';
import CalendarScreen from '@/components/CalendarScreen';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import Title from '@/components/Title';


interface HomeItem {
  id: string;
  render: () => React.ReactNode;
}

export default function HomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = useMemo(() => dynamicStyles(isDarkMode), [isDarkMode]);
  const router = useRouter();

  const handlePress = () => {
    router.push('/Configurar');
  };

  const goToCalmaSensorial = () => {
    router.push('/Sensorial');
  };

  const data: HomeItem[] = [
    {
      id: 'calendar',
      render: () => <CalendarScreen />,
    },
    {
      id: 'tasks',
      render: () => (
        <View style={styles.card}>
          <TaskListToday />
        </View>
      ),
    },
    {
      id: 'calma',
      render: () => (
        <View style={styles.help}>
          <View style={styles.calm}>
            <MaterialCommunityIcons name="movie-outline" size={32} color={isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface} />
            <Text style={styles.cardText}>Acesse a Calma Sensorial</Text>
            <TouchableOpacity onPress={goToCalmaSensorial} style={styles.chevronButton} hitSlop={{top:10, bottom:10, left:10, right:10}}>
              <MaterialCommunityIcons name="chevron-right" size={36} color={isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardSubtext}>Vídeos relaxantes para momentos de pausa</Text>
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
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Title variant="h1" marginTop={20} marginBottom={10}>
              DiverGente
            </Title>
            <TouchableOpacity onPress={handlePress} style={styles.iconButton}>
              <MaterialCommunityIcons name="cog-outline" size={24} color={isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface} />
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ padding: 15, paddingBottom: 90 }}
      />
    </ThemedView>
  );
}

const dynamicStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingTop: 20,
      paddingBottom: 10,
    },
    card: {
      padding: 10,
      marginVertical: 10,
      borderRadius: 15,
      backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
      marginHorizontal: 10,

    },
    help: {
      padding: 20,
      borderRadius: 15,
      backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
      marginHorizontal: 10,
      marginVertical: 10,
      minHeight: 140,
      justifyContent: 'center',

    },
    cardText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
      marginBottom: 5,
    },
    cardSubtext: {
      fontSize: 14,
      color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
      marginTop: 10,
      alignItems: 'center',
    },
    calm: {
      flexDirection: 'row',
      padding: 0,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    listContent: {},
    iconButton: {
      padding: 5,
    },
    chevronButton: {
      marginLeft: 8,
      padding: 4,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
