import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Modal,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchTasks,
  upsertTask as sbUpsertTask,
  deleteTask as sbDeleteTask,
} from "@/services/supabaseService";
import { Calendar } from "react-native-calendars";
import Card from "@/components/Card";
import FAB from "@/components/FAB";
import Title from "@/components/Title";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

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
  const [taskText, setTaskText] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [confirmModalVisible, setConfirmModalVisible] =
    useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const animation = useRef(new Animated.Value(1)).current;
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [filter, setFilter] = useState<
    "todas" | "naoConcluidas" | "concluidas"
  >("todas");

  const isDarkMode = useColorScheme() === "dark";
  const { colors } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, theme),
    [isDarkMode, theme, colors]
  );

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
      Alert.alert(
        "Atenção",
        "Por favor, selecione a data de vencimento da tarefa."
      );
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
    await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    try {
      await sbUpsertTask(newTask as any);
    } catch (e) {
      // Falha na sincronização — continua funcionando offline
    }
    setTaskText("");
    setDueDate(undefined);
    setShowCalendar(false);
    setModalVisible(false);
  };

  const deleteTask = async (taskId: number) => {
    const updatedTasks = sortTasks(tasks.filter((task) => task.id !== taskId));
    setTasks(updatedTasks);
    await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    try {
      await sbDeleteTask(taskId);
    } catch (e) {
      // ignore
    }
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
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed
              ? new Date().toLocaleString()
              : undefined,
          }
        : task
    );
    const sortedTasks = sortTasks(updatedTasks);
    setTasks(sortedTasks);
    await AsyncStorage.setItem("tasks", JSON.stringify(sortedTasks));
    try {
      const t = sortedTasks.find((t) => t.id === taskId);
      if (t) await sbUpsertTask(t as any);
    } catch (e) {
      // ignore
    }

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
    try {
      const { data, error } = await fetchTasks();
      if (data) {
        const mapped = data.map((row: any) => ({
          id: Number(row.id) || Date.now(),
          text: row.text,
          completed: !!row.completed,
          createdAt: row.created_at
            ? new Date(row.created_at).toLocaleString()
            : new Date().toLocaleString(),
          completedAt: row.completed_at
            ? new Date(row.completed_at).toLocaleString()
            : undefined,
          dueDate: row.due_date || undefined,
        }));
        setTasks(sortTasks(mapped));
        await AsyncStorage.setItem("tasks", JSON.stringify(mapped));
        return;
      }
    } catch (e) {
      // falha na rede / supabase — fallback para local
    }

    const data = await AsyncStorage.getItem("tasks");
    if (data) {
      setTasks(sortTasks(JSON.parse(data)));
    }
  };

  const handleDayPress = (day: any) => {
    const formattedDate = `${day.year}-${String(day.month).padStart(
      2,
      "0"
    )}-${String(day.day).padStart(2, "0")}`;
    setDueDate(formattedDate);
    setShowCalendar(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "todas") return true;
    if (filter === "naoConcluidas") return !task.completed;
    if (filter === "concluidas") return task.completed;
    return true;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Title variant="h3" marginTop={10} marginBottom={10} marginLeft={20}>
          Minhas Tarefas
        </Title>

        {/* Chips de filtro */}
        <View style={styles.chipContainer}>
          <TouchableOpacity
            style={[styles.chip, filter === "todas" && styles.chipSelected]}
            onPress={() => setFilter("todas")}
          >
            <View style={styles.chipTextContainer}>
              <Text
                style={[
                  styles.chipText,
                  filter === "todas" && styles.chipTextSelected,
                ]}
              >
                Todas{" "}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              filter === "naoConcluidas" && styles.chipSelected,
            ]}
            onPress={() => setFilter("naoConcluidas")}
          >
            <View style={styles.chipTextContainer}>
              <Text
                style={[
                  styles.chipText,
                  filter === "naoConcluidas" && styles.chipTextSelected,
                ]}
              >
                Pendentes{"  "}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              filter === "concluidas" && styles.chipSelected,
            ]}
            onPress={() => setFilter("concluidas")}
          >
            <View style={styles.chipTextContainer}>
              <Text
                style={[
                  styles.chipText,
                  filter === "concluidas" && styles.chipTextSelected,
                ]}
              >
                Concluídas{"  "}
              </Text>
            </View>
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
                      <Text
                        style={[
                          styles.taskText,
                          item.completed && styles.completedTaskText,
                          styles.taskTitle,
                        ]}
                      >
                        {item.text}
                      </Text>
                      <Text style={styles.taskDate}>
                        Adicionado em: {item.createdAt}
                      </Text>
                      {item.dueDate && (
                        <Text style={styles.taskDate}>
                          Vencimento: {item.dueDate}
                        </Text>
                      )}
                      {item.completedAt && (
                        <Text style={styles.taskDate}>
                          Concluído em: {item.completedAt}
                        </Text>
                      )}
                    </View>
                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        onPress={() => toggleTaskCompletion(item.id)}
                        style={[
                          styles.completeButton,
                          {
                            backgroundColor: theme.onSecondary,
                            marginBottom: 8,
                            borderColor: theme.outline,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={item.completed ? "check-all" : "check"}
                          size={24}
                          color={theme.sucess}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmDelete(item.id)}
                        style={styles.deleteButton}
                      >
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={24}
                          color={theme.error}
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
                  <Text style={styles.modalTitle}>
                    Adicionar nova tarefa {"    "}
                  </Text>
                  <TextInput
                    placeholder="Digite o título da tarefa"
                    placeholderTextColor={theme.outline}
                    value={taskText}
                    onChangeText={setTaskText}
                    style={styles.input}
                    maxLength={90}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCalendar(true)}
                    style={styles.dueDateButton}
                  >
                    <Text style={styles.dueDateButtonText}>
                      {dueDate
                        ? `Vencimento: ${dueDate}`
                        : "Selecionar Vencimento"}
                    </Text>
                  </TouchableOpacity>

                  <Calendar
                    onDayPress={handleDayPress}
                    markedDates={
                      dueDate
                        ? {
                            [dueDate]: {
                              selected: true,
                              selectedColor: theme.primary,
                            },
                          }
                        : {}
                    }
                    theme={{
                      backgroundColor: theme.background,
                      calendarBackground: theme.background,
                      textSectionTitleColor: theme.onSurface,
                      selectedDayBackgroundColor: theme.primary,
                      selectedDayTextColor: theme.onSurface,
                      todayTextColor: theme.primary,
                      dayTextColor: theme.onSurface,
                      textDisabledColor: theme.onSurface,
                      dotColor: theme.primary,
                      selectedDotColor: theme.onSurface,
                      arrowColor: theme.primary,
                      monthTextColor: theme.onSurface,
                      textDayFontWeight: "400",
                      textMonthFontWeight: "600",
                      textDayHeaderFontWeight: "400",
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
                    <TouchableOpacity
                      onPress={addTask}
                      style={styles.modalAddButton}
                    >
                      <Text style={styles.modalAddButtonText}>Adicionar </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible(false);
                        setShowCalendar(false);
                        setDueDate(undefined);
                      }}
                      style={styles.modalCancelButton}
                    >
                      <Text style={styles.modalCancelButtonText}>
                        Cancelar{" "}
                      </Text>
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
                  <Text style={styles.confirmText}>
                    Tem certeza que deseja excluir esta tarefa?
                  </Text>
                  <View style={styles.confirmButtonRow}>
                    <TouchableOpacity
                      onPress={handleDelete}
                      style={styles.confirmButton}
                    >
                      <Text style={styles.confirmButtonText}>Confirmar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setConfirmModalVisible(false)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </SafeAreaView>
  );
};

const dynamicStyles = (isDarkMode: boolean, theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    taskTextContainer: {
      flex: 1,
    },
    taskActions: {
      flexDirection: "column",
      alignItems: "center",
      marginLeft: 10,
    },
    taskText: {
      fontSize: 16,
      color: theme.onSurface,
      marginBottom: 5,
    },
    taskTitle: {
      fontWeight: "bold",
    },
    completedTaskText: {
      textDecorationLine: "line-through",
      color: theme.onSurface,
    },
    taskDate: {
      fontSize: 12,
      color: theme.onSurface,
      marginTop: 2,
    },
    completeButton: {
      padding: 8,
      borderRadius: 10,
      minWidth: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    completedButton: {
      backgroundColor: theme.secondary,
    },
    completeButtonText: {
      color: theme.onPrimary,
      fontSize: 14,
    },
    deleteButton: {
      backgroundColor: theme.onSecondary,
      borderColor: theme.outline,
      borderWidth: 1,
      padding: 8,
      borderRadius: 10,
      minWidth: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    modalBackground: {
      flex: 1,
      backgroundColor: theme.scrim,
      justifyContent: "center",
      alignItems: "center",
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22,
    },
    modalView: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: "94%",
      minHeight: 260,
      maxWidth: "95%",
      justifyContent: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: theme.outline,
      padding: 12,
      borderRadius: 10,
      marginBottom: 14,
      backgroundColor: theme.surface,
      color: theme.onSurface,
      maxWidth: "100%",
      minWidth: "100%",
    },
    dueDateButton: {
      backgroundColor: theme.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      width: "100%",
      alignItems: "center",
    },
    dueDateButtonText: {
      color: theme.onSurface,
      fontSize: 16,
    },
    confirmButton: {
      backgroundColor: theme.error,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 10,
      minWidth: 80,
      alignItems: "center",
    },
    confirmButtonText: {
      color: theme.onError,
      fontSize: 16,
      fontWeight: "bold",
    },
    cancelButton: {
      backgroundColor: theme.secondary,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 10,
      minWidth: 80,
      alignItems: "center",
    },
    cancelButtonText: {
      color: theme.onSecondary,
      fontSize: 16,
      fontWeight: "bold",
    },
    confirmText: {
      fontSize: 18,
      marginBottom: 20,
      textAlign: "center",
      color: theme.onSurface,
    },
    modalAddButton: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      marginRight: 8,
    },
    modalAddButtonText: {
      color: theme.onPrimary,
      fontSize: 16,
      fontWeight: "bold",
    },
    modalCancelButton: {
      backgroundColor: theme.surface,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: theme.outline,
    },
    modalCancelButtonText: {
      color: theme.onSecondary,
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
    confirmButtonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
      color: theme.onSurface,
      textAlign: "left",
      width: "100%",
    },
    modalButtonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 8,
    },
    chipContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 10,
    },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.outline,
      backgroundColor: theme.surface,
      marginHorizontal: 4,
    },
    chipSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    chipTextContainer: {
      paddingRight: 12,
    },
    chipText: {
      color: theme.onSurface,
      fontWeight: "bold",
    },
    chipTextSelected: {
      color: theme.onPrimary,
    },
  });

export default TaskList;
