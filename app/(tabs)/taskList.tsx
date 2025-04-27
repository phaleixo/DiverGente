import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Animated, Modal, StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { FAB } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskText, setTaskText] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const animation = useRef(new Animated.Value(1)).current;
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const isDarkMode = useColorScheme() === 'dark';
  const styles = dynamicStyles(isDarkMode);

  useEffect(() => {
    loadTasks();
  }, []);

  const sortTasks = useCallback((taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      if (a.completed && !b.completed) {
        return 1;
      }
      if (!a.completed && b.completed) {
        return -1;
      }
      return 0;
    });
  }, []);

  const addTask = async () => {
    if (!taskText) return;

    const newTask: Task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt: new Date().toLocaleString(),
      dueDate: dueDate,
    };

    const updatedTasks = sortTasks([newTask, ...tasks]);
    setTasks(updatedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setTaskText('');
    setDueDate(undefined);
    setShowCalendar(false);
    setModalVisible(false);
  };

  const deleteTask = async (taskId: number) => {
    const updatedTasks = sortTasks(tasks.filter(task => task.id !== taskId));
    setTasks(updatedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setConfirmModalVisible(false);
  };

  const confirmDelete = (taskId: number) => {
    setTaskToDelete(taskId);
    setConfirmModalVisible(true);
  };

  const handleDelete = () => {
    if (taskToDelete !== null) {
      deleteTask(taskToDelete);
    }
  };

  const toggleTaskCompletion = async (taskId: number) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toLocaleString() : undefined }
        : task
    );
    const sortedTasks = sortTasks(updatedTasks);
    setTasks(sortedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(sortedTasks));

    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadTasks = async () => {
    const data = await AsyncStorage.getItem('tasks');
    if (data) {
      setTasks(sortTasks(JSON.parse(data)));
    }
  };

  const handleDayPress = (day: any) => {
    const formattedDate = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
    setDueDate(formattedDate);
    setShowCalendar(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas</Text>
      <View style={styles.bodyContainer}>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Animated.View style={{ transform: [{ scale: animation }] }}>
              <View style={styles.taskContainer}>
                <TouchableOpacity
                  onPress={() => toggleTaskCompletion(item.id)}
                  style={[styles.task, item.completed && styles.completedTask]}
                >
                  <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>
                    {item.text}
                  </Text>
                  <Text style={styles.taskDate}>Adicionado em: {item.createdAt}</Text>
                  {item.dueDate && (
                    <Text style={styles.taskDate}>Vencimento: {item.dueDate}</Text>
                  )}
                  {item.completedAt && (
                    <Text style={styles.taskDate}>Concluído em: {item.completedAt}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
                  <Icon name="trash-2" size={20} color={isDarkMode ? '#FFFFFF' : '#333333'} />
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          showsVerticalScrollIndicator={false}
        />
        <FAB
          style={styles.fab}
          icon="plus"
          color='#ffffff'
          onPress={() => setModalVisible(true)}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalBackground}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TextInput
                  placeholder="Adicionar nova tarefa"
                  placeholderTextColor={isDarkMode ? '#999' : '#CCC'}
                  value={taskText}
                  onChangeText={setTaskText}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.dueDateButton}>
                  <Text style={styles.dueDateButtonText}>
                    {dueDate ? `Vencimento: ${dueDate}` : 'Selecionar Vencimento'}
                  </Text>
                </TouchableOpacity>

                {showCalendar && (
                  <Calendar
                    onDayPress={handleDayPress}
                    markedDates={dueDate ? { [dueDate]: { selected: true, selectedColor: 'blue' } } : {}}
                    theme={{
                      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                      calendarBackground: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                      textDayFontFamily: 'monospace',
                      textMonthFontFamily: 'monospace',
                      textDayHeaderFontFamily: 'monospace',
                      textDayFontSize: 16,
                      textMonthFontSize: 16,
                      textDayHeaderFontSize: 16,
                      dayTextColor: isDarkMode ? '#FFFFFF' : '#000000',
                      monthTextColor: isDarkMode ? '#FFFFFF' : '#000000',
                      textDayHeaderColor: isDarkMode ? '#999' : '#687076',
                      selectedDayBackgroundColor: 'blue',
                      selectedDayTextColor: 'white',
                      arrowColor: isDarkMode ? '#FFFFFF' : '#000000',
                    }}
                  />
                )}

                <TouchableOpacity onPress={addTask} style={styles.modalAddButton}>
                  <Text style={styles.modalAddButtonText}>Adicionar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setModalVisible(false); setShowCalendar(false); setDueDate(undefined); }} style={styles.modalCancelButton}>
                  <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={confirmModalVisible}
          onRequestClose={() => {
            setConfirmModalVisible(!confirmModalVisible);
          }}
        >
          <View style={styles.modalBackground}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.confirmText}>Tem certeza que deseja excluir esta tarefa?</Text>
                <TouchableOpacity onPress={handleDelete} style={styles.confirmButton}>
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmModalVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const dynamicStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
    backgroundColor: isDarkMode ? '#0a080d' : '#F5F5F5',
  },
  bodyContainer: {
    flex: 1,
    padding: 7,
    marginTop: 60,
  },
  title: {
    alignItems:'center',
    alignContent:'center',
    fontSize: 28,
    fontWeight:'bold',
    marginBottom:-20,
    marginTop:40,
    marginLeft:20,
    color: isDarkMode ? '#FFFFFF' : '#2786C6',
  },

  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginVertical: 10,
    padding: 10,
    backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
    borderRadius: 10,
    margin: 5,
    elevation: 2,
    shadowColor: isDarkMode ? '#000' : '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  task: {
    flex: 1,
    padding: 10,
    borderRadius: 15,
    backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
  },
  completedTask: {
    backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
  },
  taskText: {
    fontSize: 18,
    fontWeight:'bold',
    marginBottom: 10,
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: isDarkMode ? '#4CAF50' : 'green',
  },
  taskDate: {
    fontSize: 12,
    color: isDarkMode ? '#999' : 'gray',
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#0a080d' : '#F5F5F5',
    padding: 10,
    borderRadius: 15,
  },
  deleteButtonText: {
    marginLeft: 5,
    color: isDarkMode ? '#FFFFFF' : '#475569',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 18,
    right: 0,
    bottom: 0,
    backgroundColor: isDarkMode ? '#095BC0' : '#2786C6',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    fontSize: 22,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
    width: '100%',
    height: 60,
    backgroundColor: isDarkMode ? '#333' : '#FFFFFF',
    borderColor: isDarkMode ? '#444' : '#CCC',
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  dueDateButton: {
    borderWidth: 1,
    borderColor: isDarkMode ? '#444' : '#CCC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#333' : '#EEE',
  },
  dueDateButtonText: {
    fontSize: 18,
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  modalAddButton: {
    backgroundColor: isDarkMode ? '#095BC0' : '#2786C6',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalAddButtonText: {
    color: 'white',
    fontSize: 18,
  },
  modalCancelButton: {
    marginTop: 10,
  },
  modalCancelButtonText: {
    color: isDarkMode ? '#FF4444' : 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  confirmText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  confirmButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: isDarkMode ? '#4CAF50' : 'blue',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default TaskList;