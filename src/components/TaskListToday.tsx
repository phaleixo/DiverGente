import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTasks as sbFetchTasks } from '@/services/supabaseService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
}

const TaskListToday: React.FC = () => {
  const [tasksToday, setTasksToday] = useState<Task[]>([]);
  const isDarkMode = useColorScheme() === 'dark';
  const router = useRouter();
  const styles = dynamicStyles(isDarkMode);

  useFocusEffect(
    useCallback(() => {
      loadTodayTasks();
    }, [])
  );

  const loadTodayTasks = async () => {
    try {
      // Tenta carregar do Supabase primeiro
      try {
        const { data, error } = await sbFetchTasks();
        if (!error && Array.isArray(data)) {
          const mapped = data.map((row: any) => ({
            id: Number(row.id) || Date.now(),
            text: row.text,
            completed: !!row.completed,
            createdAt: row.created_at || new Date().toLocaleString(),
            completedAt: row.completed_at || undefined,
            dueDate: row.due_date || undefined,
          }));
          const today = new Date().toISOString().split('T')[0];
          const todaysTasks = mapped.filter(task => task.dueDate && task.dueDate <= today && !task.completed);
          setTasksToday(todaysTasks);
          // também atualiza cache local
          await AsyncStorage.setItem('tasks', JSON.stringify(mapped));
          return;
        }
      } catch (err) {
        // supabase falhou — continua com fallback local
        // console.debug('sbFetchTasks failed', err);
      }

      const data = await AsyncStorage.getItem('tasks');
      if (data) {
        const parsedTasks: Task[] = JSON.parse(data);
        const today = new Date().toISOString().split('T')[0];

        const todaysTasks = parsedTasks.filter(task => {
          return task.dueDate && task.dueDate <= today && !task.completed;
        });
        setTasksToday(todaysTasks);
      } else {
        setTasksToday([]);
      }
    } catch (e) {
      console.error('Erro ao carregar tarefas de hoje:', e);
      setTasksToday([]);
    }
  };

  const handlePress = () => {
    router.push('/taskList');
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="calendar-month"
            size={20}
            color={isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface}
          />
          <Text style={styles.headerText}>Tarefas de Hoje</Text>
          <View style={styles.taskCountCircle}>
            <Text style={styles.taskCountText}>{tasksToday.length}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const dynamicStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
    marginTop: 7,
    paddingHorizontal: 5,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
  },
  taskCountCircle: {
    backgroundColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCountText: {
    color: isDarkMode ? Colors.light.onPrimary : Colors.light.onPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TaskListToday;
