import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // <-- importação aqui

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
  const router = useRouter(); // <-- inicializa o router
  const styles = dynamicStyles(isDarkMode);

  useEffect(() => {
    loadTodayTasks();
  }, []);

  const loadTodayTasks = async () => {
    const data = await AsyncStorage.getItem('tasks');
    if (data) {
      const parsedTasks: Task[] = JSON.parse(data);
      const today = new Date().toISOString().split('T')[0];

      const todaysTasks = parsedTasks.filter(task => {
        return task.dueDate && task.dueDate <= today && !task.completed;
      });
      setTasksToday(todaysTasks);
    }
  };

  const handlePress = () => {
    router.push('/taskList'); // <-- navega para a página
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Feather name="calendar" size={20} color={isDarkMode ? '#FFFFFF' : '#000000'} />
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
    backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
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
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  taskCountCircle: {
    backgroundColor: isDarkMode ? '#095BC0' : '#2786C6',
    borderRadius: 15,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCountText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskListToday;
