import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Animated, Modal, StyleSheet, useColorScheme, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { Colors } from '@/constants/Colors';
import Card from '@/components/Card';
import FAB from '@/components/FAB';
import Title from '@/components/Title';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [filter, setFilter] = useState<'todas' | 'naoConcluidas' | 'concluidas'>('todas');

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

    if (!dueDate) {
      Alert.alert('Atenção', 'Por favor, selecione a data de vencimento da tarefa.');
      return;
    }

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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'todas') return true;
    if (filter === 'naoConcluidas') return !task.completed;
    if (filter === 'concluidas') return task.completed;
    return true;
  });

  return (
    <View style={styles.container}>
      <Title variant="h1" marginTop={40} marginBottom={10} marginLeft={20}>
        Tarefas
      </Title>

      {/* Chips de filtro */}
      <View style={styles.chipContainer}>
        <TouchableOpacity
          style={[
            styles.chip,
            filter === 'todas' && styles.chipSelected
          ]}
          onPress={() => setFilter('todas')}
        >
          <Text style={[
            styles.chipText,
            filter === 'todas' && styles.chipTextSelected
          ]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
            filter === 'naoConcluidas' && styles.chipSelected
          ]}
          onPress={() => setFilter('naoConcluidas')}
        >
          <Text style={[
            styles.chipText,
            filter === 'naoConcluidas' && styles.chipTextSelected
          ]}>Não concluídas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
            filter === 'concluidas' && styles.chipSelected
          ]}
          onPress={() => setFilter('concluidas')}
        >
          <Text style={[
            styles.chipText,
            filter === 'concluidas' && styles.chipTextSelected
          ]}>Concluídas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bodyContainer}>
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Animated.View style={{ transform: [{ scale: animation }] }}>
              <Card
                animated={true}
                scale={1}
                contentStyle={[
                  styles.task,
                  item.completed && styles.completedTask,
                ]}
              >
                <View style={styles.taskContent}>
                  <View style={styles.taskTextContainer}>
                    <Text style={[
                      styles.taskText,
                      item.completed && styles.completedTaskText,
                      styles.taskTitle
                    ]}>
                      {item.text}
                    </Text>
                    <Text style={styles.taskDate}>Adicionado em: {item.createdAt}</Text>
                    {item.dueDate && (
                      <Text style={styles.taskDate}>Vencimento: {item.dueDate}</Text>
                    )}
                    {item.completedAt && (
                      <Text style={styles.taskDate}>Concluído em: {item.completedAt}</Text>
                    )}
                  </View>
                  <View style={styles.taskActions}>
                    <TouchableOpacity 
                      onPress={() => toggleTaskCompletion(item.id)}
                      style={[
                        styles.completeButton,
                        { 
                          backgroundColor: isDarkMode ? Colors.dark.sucess : Colors.light.sucess,
                          marginBottom: 8,
                        }
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.completed ? 'check-all' : 'check'}
                        size={24}
                        color={isDarkMode ? Colors.dark.onPrimary : Colors.light.onPrimary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => confirmDelete(item.id)}
                      style={styles.deleteButton}
                    >
                      <MaterialCommunityIcons 
                        name="trash-can-outline" 
                        size={24} 
                        color={isDarkMode ? Colors.dark.onError : Colors.light.onError} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
        <FAB
          onPress={() => setModalVisible(true)}
          icon="plus"
          style={{ bottom: 100 }}
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
                <Text style={styles.modalTitle}>Adicionar nova tarefa</Text>
                <TextInput
                  placeholder="Digite o título da tarefa"
                  placeholderTextColor={isDarkMode ? Colors.dark.outline : Colors.light.outline}
                  value={taskText}
                  onChangeText={setTaskText}
                  style={styles.input}
                  maxLength={30}
                />
                <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.dueDateButton}>
                  <Text style={styles.dueDateButtonText}>
                    {dueDate ? `Vencimento: ${dueDate}` : 'Selecionar Vencimento'}
                  </Text>
                </TouchableOpacity>

                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={dueDate ? { [dueDate]: { selected: true, selectedColor: isDarkMode ? Colors.dark.primary : Colors.light.primary } } : {}}
                  theme={{
                    backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
                    calendarBackground: isDarkMode ? Colors.dark.background : Colors.light.background,
                    textSectionTitleColor: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
                    selectedDayBackgroundColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
                    selectedDayTextColor: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
                    todayTextColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
                    dayTextColor: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
                    textDisabledColor: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
                    dotColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
                    selectedDotColor: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
                    arrowColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
                    monthTextColor: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
                    textDayFontWeight: '400',
                    textMonthFontWeight: '600',
                    textDayHeaderFontWeight: '400',
                    textDayFontSize: 15,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 13,
                  }}
                  style={{
                    borderRadius: 12,
                    marginBottom: 8,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderWidth: 0,
                  }}
                />

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity onPress={addTask} style={styles.modalAddButton}>
                    <Text style={styles.modalAddButtonText}>Adicionar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setShowCalendar(false);
                      setDueDate(undefined);
                    }}
                    style={styles.modalCancelButton}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
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
                <View style={styles.confirmButtonRow}>
                  <TouchableOpacity onPress={handleDelete} style={styles.confirmButton}>
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setConfirmModalVisible(false)} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
    padding: 2,
    marginTop: 10,
  },
  bodyContainer: {
    flex: 1,
    padding: 7,
    marginTop: 10,
  },
  task: {
    flex: 1,
  },
  completedTask: {
    opacity: 0.6,
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskActions: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 10,
  },
  taskText: {
    fontSize: 16,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    marginBottom: 5,
  },
  taskTitle: {
    fontWeight: 'bold',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
  },
  taskDate: {
    fontSize: 12,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    marginTop: 2,
  },
  completeButton: {
    padding: 8,
    borderRadius: 10,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedButton: {
    backgroundColor: isDarkMode ? Colors.dark.secondary : Colors.light.secondary,
  },
  completeButtonText: {
    color: isDarkMode ? Colors.dark.onPrimary : Colors.light.onPrimary,
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: isDarkMode ? Colors.dark.error : Colors.light.error,
    padding: 8,
    borderRadius: 10,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.dark.scrim : Colors.light.scrim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: isDarkMode ? Colors.dark.shadow : Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 320,
    minHeight: 280,
    maxWidth: '95%',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    width: '100%',
  },
  dueDateButton: {
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  dueDateButtonText: {
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: isDarkMode ? Colors.dark.error : Colors.light.error,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: isDarkMode ? Colors.dark.onError : Colors.light.onError,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: isDarkMode ? Colors.dark.secondary : Colors.light.secondary,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: isDarkMode ? Colors.dark.onSecondary : Colors.light.onSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
  },
  modalAddButton: {
    backgroundColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  modalAddButtonText: {
    color: isDarkMode ? Colors.dark.onPrimary : Colors.light.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    backgroundColor: isDarkMode ? Colors.dark.secondary : Colors.light.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  modalCancelButtonText: {
    color: isDarkMode ? Colors.dark.onSecondary : Colors.light.onSecondary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
    marginHorizontal: 4,
  },
  chipSelected: {
    backgroundColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
    borderColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
  },
  chipText: {
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    fontWeight: 'bold',
  },
  chipTextSelected: {
    color: isDarkMode ? Colors.dark.onPrimary : Colors.light.onPrimary,
  },
});

export default TaskList;