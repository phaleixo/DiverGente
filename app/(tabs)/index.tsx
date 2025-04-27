import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, FlatList, ListRenderItem, ListRenderItemInfo } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import TaskListToday from '@/components/TaskListToday';
import CalendarScreen from '@/components/CalendarScreen';

// Defina a interface para o tipo dos itens na FlatList
interface FlatListItem {
  id: string;
  renderItem: () => React.ReactNode;
}

export default function HomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = useMemo(() => dynamicStyles(isDarkMode), [isDarkMode]);
  const router = useRouter();

  const handlePress = () => {
    router.push('/Sobre');
  };

  const goToCalmaSensorial = () => {
    router.push('/Sensorial');
  };

  const data: FlatListItem[] = useMemo(() => [
    { id: 'calendar', renderItem: () => <CalendarScreen /> },
    { id: 'tasks', renderItem: () => (
        <View style={styles.card}>
          <TaskListToday />
        </View>
      )
    },
    { id: 'calma', renderItem: () => (
        <TouchableOpacity style={styles.help} onPress={goToCalmaSensorial}>
          <View style={styles.calm}>
            <Feather name="film" size={36} color={isDarkMode ? '#FFFFFF' : '#00000'} />
            <Text style={styles.cardText}>Acesse a Calma Sensorial</Text>
            <Feather name="chevron-right" size={36} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </View>
          <Text style={styles.cardSubtext}>Vídeos relaxantes para momentos de pausa</Text>
        </TouchableOpacity>
      )
    },
  ], [styles]);

  const renderItem: ListRenderItem<FlatListItem> = ({ item }: ListRenderItemInfo<FlatListItem>) => {
    return item.renderItem() as React.ReactElement | null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DiverGente</Text>
        <TouchableOpacity onPress={handlePress}>
          <Feather name="more-vertical" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const dynamicStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#0a080d' : '#F5F5F5',
      padding: 15,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginRight: 10,
      marginLeft: 10,
      marginTop: 30,
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#2786C6',
    },
    card: {
      padding: 10,
      marginVertical: 10,
      borderRadius: 15,
      backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
      marginHorizontal: 5,
      elevation: 2,
      shadowColor: isDarkMode ? '#000' : '#888',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    help: {
      padding: 20,
      marginVertical: 10,
      borderRadius: 10,
      backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
      marginHorizontal: 5,
      minHeight: 140,
      justifyContent: 'center',
      elevation: 2,
      shadowColor: isDarkMode ? '#000' : '#888',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    cardText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#FFFFFF' : '#1e293b',
      marginBottom: 5,
    },
    cardSubtext: {
      fontSize: 14,
      color: isDarkMode ? '#94a3b8' : '#475569',
      marginTop: 10,
      alignItems: 'center',
    },
    calm: {
      flexDirection: 'row',
      padding: 0,
      justifyContent: 'space-between',
      alignItems: 'center',

    },
  });
