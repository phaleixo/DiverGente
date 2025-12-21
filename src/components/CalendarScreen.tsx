import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Modal,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchEvents as sbFetchEvents,
  upsertEvent as sbUpsertEvent,
  deleteEvent as sbDeleteEvent,
} from "@/services/supabaseService";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, LocaleConfig, DateData } from "react-native-calendars";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useHolidays, getHolidaysForYear } from "./HolidayToggle";

// Configuração de localização
LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

const STORAGE_KEY = "@calendar_events";

type Event = {
  id?: string;
  text: string;
  color: string;
};

type EventsByDate = {
  [date: string]: Event[];
};

const CalendarScreen = () => {
  // util: converte hex para rgba com alpha
  const hexToRgba = (hex: string, alpha = 1) => {
    const normalized = hex.replace("#", "");
    const bigint = parseInt(normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Configuração de tema
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { colors, currentTheme } = useTheme();
  const themeColors = isDarkMode ? colors.dark : colors.light;
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, themeColors),
    [isDarkMode, themeColors, colors]
  );
  const calendarKey = useMemo(
    () => currentTheme + "-" + (isDarkMode ? "dark" : "light"),
    [currentTheme, isDarkMode]
  );

  // Estados do calendário
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentMonth, setCurrentMonth] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Estados de eventos
  const [events, setEvents] = useState<EventsByDate>({});
  const [eventModalVisible, setEventModalVisible] = useState<boolean>(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] =
    useState<boolean>(false);
  const [eventToDeleteIndex, setEventToDeleteIndex] = useState<number | null>(
    null
  );

  // Estados do formulário de evento
  const [eventText, setEventText] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(selectedDate);
  const [endDate, setEndDate] = useState<string>(selectedDate);
  const [eventColor, setEventColor] = useState<string>("#2196F3");
  const [showStartCalendar, setShowStartCalendar] = useState<boolean>(false);
  const [showEndCalendar, setShowEndCalendar] = useState<boolean>(false);

  // Cores disponíveis para eventos
  const availableColors = [
    "#2196F3",
    "#4CAF50",
    "#FF9800",
    "#F44336",
    "#9C27B0",
  ];

  // Tema do calendário
  const calendarTheme = useMemo(
    () => ({
      backgroundColor: themeColors.background,
      calendarBackground: themeColors.surface,
      textSectionTitleColor: themeColors.onSurface,
      textSectionTitleDisabledColor: themeColors.onSurfaceDisabled,
      dayTextColor: themeColors.onSurface,
      todayTextColor: themeColors.primary,
      selectedDayTextColor: themeColors.onPrimary,
      monthTextColor: themeColors.onSurface,
      indicatorColor: themeColors.primary,
      selectedDayBackgroundColor: themeColors.primary,
      arrowColor: themeColors.primary,
      disabledArrowColor: themeColors.onSurfaceDisabled,
      textDayFontWeight: "600" as "600",
      textMonthFontWeight: "800" as "800",
      textDayHeaderFontWeight: "800" as "800",
      textDayFontSize: 16,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 14,
      textDisabledColor: themeColors.onSurfaceDisabled,
      dotColor: themeColors.primary,
      selectedDotColor: themeColors.onPrimary,
    }),
    [themeColors, colors]
  );

  // Carregar eventos: espera autenticação; se não autenticado, carrega apenas local
  const { user, loading: authLoading } = useAuth();

  // Hook para feriados
  const { holidaysEnabled } = useHolidays();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Carrega local sempre
        let local: EventsByDate = {};
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          if (saved) local = JSON.parse(saved);
        } catch (err) {
          local = {};
        }

        // Se não autenticado, apenas usa cache local
        if (!user) {
          setEvents(local);
          return;
        }

        // Usuário autenticado: busca remoto e faz merge
        let remoteData: any[] = [];
        try {
          const { data, error } = await sbFetchEvents();
          if (!error && Array.isArray(data)) remoteData = data;
        } catch (err) {
          remoteData = [];
        }

        // debug logs removed

        // Parse remoto em EventsByDate
        const parsedRemote: EventsByDate = {};
        const remoteById: Record<string, { date: string; row: any }> = {};
        remoteData.forEach((row: any) => {
          const date = row.date;
          if (!parsedRemote[date]) parsedRemote[date] = [];
          const ev = {
            id: row.id?.toString(),
            text: row.text,
            color: row.color,
          };
          parsedRemote[date].push(ev);
          if (ev.id) remoteById[ev.id] = { date, row } as any;
        });

        // Encontrar eventos locais que não existem remotamente
        const toSyncLocals: Array<{
          id: string;
          date: string;
          text: string;
          color: string;
        }> = [];
        Object.entries(local).forEach(([date, list]) => {
          list.forEach((ev) => {
            if (!ev.id) {
              // atribui id temporário
              ev.id = `${Date.now()}-${date}`;
            }
            if (!remoteById[ev.id?.toString()]) {
              toSyncLocals.push({
                id: ev.id!.toString(),
                date,
                text: ev.text,
                color: ev.color,
              });
            }
          });
        });

        // Merge: comece com remoto e adicione locais que faltam
        const merged: EventsByDate = { ...parsedRemote };
        Object.entries(local).forEach(([date, list]) => {
          list.forEach((ev) => {
            if (!merged[date]) merged[date] = [];
            if (!merged[date].some((r) => r.id === ev.id))
              merged[date].push(ev);
          });
        });

        setEvents(merged);

        // Persistir localmente o merge
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch (err) {
          // ignore
        }

        // Sincronizar locais ausentes para o Supabase (fire-and-forget por item)
        (async () => {
          for (const ev of toSyncLocals) {
            try {
              await sbUpsertEvent({
                id: ev.id,
                date: ev.date,
                text: ev.text,
                color: ev.color,
              } as any);
            } catch (err) {
              // ignore
            }
          }
        })();
      } catch (e) {
        console.error("Erro ao carregar eventos:", e);
      }
    };

    // Não tenta carregar até que o Auth tenha terminado de checar sessão
    if (!authLoading) loadEvents();
  }, [authLoading, user]);

  // Salvar eventos no armazenamento
  useEffect(() => {
    const saveEvents = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      } catch (e) {
        console.error("Erro ao salvar eventos:", e);
      }
    };
    saveEvents();
  }, [events]);

  // Obter datas entre um intervalo
  const getDatesBetween = (start: string, end: string): string[] => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const dates: string[] = [];

    for (
      let d = new Date(startDateObj);
      d <= endDateObj;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(d.toISOString().split("T")[0]);
    }

    return dates;
  };

  // Adicionar novo evento
  const addEvent = (): void => {
    if (!eventText.trim()) return;

    const dates = getDatesBetween(startDate, endDate);
    const updatedEvents = { ...events };

    dates.forEach((date) => {
      if (!updatedEvents[date]) updatedEvents[date] = [];
      const id = `${Date.now()}-${date}`;
      const newEv: Event = { id, text: eventText, color: eventColor };
      updatedEvents[date].push(newEv);
      // sincroniza com Supabase e registra resultado para debug
      (async () => {
        try {
          const res = await sbUpsertEvent({
            id,
            date,
            text: eventText,
            color: eventColor,
          } as any);
          if (res?.error) {
            // error returned from supabase, handled silently
          }
        } catch (err) {
          console.error("sbUpsertEvent threw", err);
        }
      })();
    });

    setEvents(updatedEvents);
    // persiste imediatamente localmente para evitar perda caso o componente seja remontado
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      } catch (err) {
        // ignore
      }
    })();
    resetEventForm();
    setEventModalVisible(false);
  };

  // Resetar formulário de evento
  const resetEventForm = (): void => {
    setEventText("");
    setStartDate(selectedDate);
    setEndDate(selectedDate);
    setEventColor("#2196F3");
  };

  // Confirmar exclusão de evento
  const confirmDeleteEvent = (index: number): void => {
    setEventToDeleteIndex(index);
    setConfirmDeleteVisible(true);
  };

  // Excluir evento
  const deleteEvent = (): void => {
    if (eventToDeleteIndex === null) return;

    const updated = { ...events };
    if (updated[selectedDate]) {
      const ev = updated[selectedDate][eventToDeleteIndex];
      updated[selectedDate].splice(eventToDeleteIndex, 1);
      if (updated[selectedDate].length === 0) delete updated[selectedDate];
      setEvents(updated);
      if (ev?.id) {
        (async () => {
          try {
            await sbDeleteEvent(ev.id as string);
          } catch (err) {
            console.error("sbDeleteEvent threw", err);
          }
        })();
      }
    }

    setEventToDeleteIndex(null);
    setConfirmDeleteVisible(false);
  };

  // Manipulador de pressionar dia
  const onDayPress = (day: DateData): void => {
    // Primeiro toque: seleciona a data. Segundo toque (mesma data): abre o modal.
    if (day.dateString === selectedDate) {
      // segundo toque no mesmo dia -> abrir modal para inserir evento
      setStartDate(day.dateString);
      setEndDate(day.dateString);
      setEventModalVisible(true);
    } else {
      // primeiro toque em outro dia -> apenas seleciona a data
      setSelectedDate(day.dateString);
      setStartDate(day.dateString);
      setEndDate(day.dateString);
    }
  };

  // Formatar data para exibição
  const formatDate = (date: string): string => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  // Manipulador de seleção de data inicial
  const handleStartDateSelect = (day: DateData): void => {
    setStartDate(day.dateString);
    setShowStartCalendar(false);
    if (new Date(day.dateString) > new Date(endDate)) {
      setEndDate(day.dateString);
    }
  };

  // Manipulador de seleção de data final
  const handleEndDateSelect = (day: DateData): void => {
    if (new Date(day.dateString) >= new Date(startDate)) {
      setEndDate(day.dateString);
      setShowEndCalendar(false);
    }
  };

  // Datas marcadas no calendário
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    // Adicionar feriados se habilitado
    if (holidaysEnabled) {
      const currentYear = new Date(currentMonth).getFullYear();
      // Pegar feriados do ano atual e adjacentes para navegação
      const years = [currentYear - 1, currentYear, currentYear + 1];
      years.forEach((year) => {
        const holidays = getHolidaysForYear(year);
        Object.entries(holidays).forEach(([date, name]) => {
          if (!marks[date]) {
            marks[date] = {
              dots: [{ color: "#FF69B4" }], // Pink para feriados
              marked: true,
              holiday: name,
            };
          } else {
            marks[date].dots = [
              ...(marks[date].dots || []),
              { color: "#FF69B4" },
            ];
            marks[date].holiday = name;
          }
        });
      });
    }

    // Adicionar eventos do usuário
    Object.entries(events).forEach(([date, eventList]) => {
      const dots = eventList.map((e) => ({ color: e.color }));
      if (marks[date]) {
        marks[date].dots = [...(marks[date].dots || []), ...dots];
        marks[date].marked = true;
      } else {
        marks[date] = {
          dots,
          marked: true,
        };
      }
    });

    // Garantir que a data selecionada tenha uma marcação
    if (!marks[selectedDate]) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: themeColors.primary,
      };
    } else {
      marks[selectedDate].selected = true;
      marks[selectedDate].selectedColor = themeColors.primary;
    }

    return marks;
  }, [
    events,
    selectedDate,
    themeColors.primary,
    holidaysEnabled,
    currentMonth,
  ]);

  return (
    <View style={styles.container}>
      {/* Calendário Principal */}
      <View style={styles.calendarWrapper}>
        <Calendar
          key={calendarKey}
          current={currentMonth}
          onDayPress={onDayPress}
          onMonthChange={(month) => setCurrentMonth(month.dateString)}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={calendarTheme}
          style={styles.calendar}
        />
      </View>

      {/* Exibir feriado se a data selecionada for um feriado */}
      {holidaysEnabled && markedDates[selectedDate]?.holiday && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: "#E91E6325",
              marginBottom: 10,
            },
          ]}
        >
          <View style={styles.eventCard}>
            <View style={styles.eventRowLeft}>
              <MaterialCommunityIcons
                name="party-popper"
                size={22}
                color="#ff00f2ff"
                style={{ marginRight: 10, alignSelf: "center" }}
              />
              <Text
                style={[
                  styles.eventText,
                  { color: themeColors.onSurface, fontWeight: "600" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {markedDates[selectedDate].holiday}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Lista de Eventos para a Data Selecionada */}
      {selectedDate && events[selectedDate] && (
        <View style={styles.card}>
          <FlatList
            data={events[selectedDate]}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : `${item.text}-${index}`
            }
            renderItem={({ item, index }) => {
              return (
                <View style={styles.eventCard}>
                  <View style={styles.eventRowLeft}>
                    <MaterialCommunityIcons
                      name="circle"
                      size={12}
                      color={item.color}
                      style={{ marginRight: 10, alignSelf: "center" }}
                    />
                    <Text
                      style={[
                        styles.eventText,
                        { color: themeColors.onSurface },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.text}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => confirmDeleteEvent(index)}>
                    <View style={styles.trashOnColor}>
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={16}
                        color={themeColors.background}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      )}

      {/* Modal de Adição de Evento */}
      <Modal visible={eventModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Adicionar evento de {formatDate(startDate)} a{" "}
                  {formatDate(endDate)}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Digite o evento"
                  value={eventText}
                  onChangeText={setEventText}
                  placeholderTextColor={themeColors.onSurfaceDisabled}
                  maxLength={50}
                />

                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowStartCalendar(true)}
                >
                  <Text style={{ color: themeColors.onSurface }}>
                    Data início: {formatDate(startDate)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowEndCalendar(true)}
                >
                  <Text style={{ color: themeColors.onSurface }}>
                    Data fim: {formatDate(endDate)}
                  </Text>
                </TouchableOpacity>

                {showStartCalendar && (
                  <View style={styles.calendarContainer}>
                    <Calendar
                      current={startDate}
                      onDayPress={handleStartDateSelect}
                      markedDates={{
                        [startDate]: {
                          selected: true,
                          selectedColor: themeColors.primary,
                        },
                      }}
                      theme={calendarTheme}
                    />
                    <Button
                      title="Fechar"
                      onPress={() => setShowStartCalendar(false)}
                    />
                  </View>
                )}

                {showEndCalendar && (
                  <View style={styles.calendarContainer}>
                    <Calendar
                      current={endDate}
                      onDayPress={handleEndDateSelect}
                      markedDates={{
                        [endDate]: {
                          selected: true,
                          selectedColor: themeColors.primary,
                        },
                        ...(new Date(endDate) < new Date(startDate)
                          ? {
                              [startDate]: {
                                selected: true,
                                selectedColor: themeColors.error,
                              },
                            }
                          : {}),
                      }}
                      minDate={startDate}
                      theme={calendarTheme}
                    />
                    <Button
                      title="Fechar"
                      onPress={() => setShowEndCalendar(false)}
                    />
                  </View>
                )}

                <View style={styles.colorPicker}>
                  {availableColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setEventColor(color)}
                      style={[
                        styles.colorOption,
                        {
                          backgroundColor: color,
                          borderColor:
                            eventColor === color
                              ? isDarkMode
                                ? "#ffffff"
                                : "#000000"
                              : themeColors.outline,
                          borderWidth: eventColor === color ? 2 : 1,
                          transform:
                            eventColor === color
                              ? [{ scale: 1.04 }]
                              : [{ scale: 1 }],
                          ...(eventColor === color && isDarkMode
                            ? {
                                shadowColor: "#ffffff",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.12,
                                shadowRadius: 3,
                                elevation: 4,
                              }
                            : {}),
                        },
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <Button
                    title="Salvar Evento"
                    color={themeColors.primary}
                    onPress={addEvent}
                  />
                  <View style={styles.space} />
                  <Button
                    title="Cancelar"
                    color={themeColors.outline}
                    onPress={() => {
                      setEventModalVisible(false);
                      resetEventForm();
                    }}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal visible={confirmDeleteVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalText}>
              Tem certeza que deseja excluir este evento?
            </Text>
            <View style={styles.confirmModalButtons}>
              <Button
                title="Excluir"
                color={themeColors.error}
                onPress={deleteEvent}
              />
              <View style={styles.space} />
              <Button
                title="Cancelar"
                color={themeColors.primary}
                onPress={() => setConfirmDeleteVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Estilos dinâmicos baseados no tema
const dynamicStyles = (isDarkMode: boolean, themeColors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    calendarWrapper: {
      borderRadius: 15,
      overflow: "hidden",
      backgroundColor: themeColors.surface,
      margin: 10,
    },
    calendar: {
      marginBottom: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: themeColors.backdrop,
    },
    modalContent: {
      backgroundColor: themeColors.surface,
      padding: 25,
      borderRadius: 15,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 18,
      marginBottom: 15,
      fontWeight: "bold",
      color: themeColors.onSurface,
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: themeColors.outline,
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      color: themeColors.onSurface,
    },
    calendarContainer: {
      marginBottom: 15,
      borderRadius: 10,
      overflow: "hidden",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    space: {
      width: 10,
    },
    card: {
      padding: 5,
      marginHorizontal: 10,
      borderRadius: 15,
      backgroundColor: themeColors.surface,
    },
    eventRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 5,
      paddingVertical: 5,
    },
    eventRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 8,
    },
    eventText: {
      fontSize: 16,
      fontWeight: "600",
      flex: 1,
      lineHeight: 20,
      alignSelf: "center",
    },
    confirmModalContent: {
      backgroundColor: themeColors.surface,
      padding: 25,
      borderRadius: 15,
      alignItems: "center",
      elevation: 5,
    },
    confirmModalText: {
      fontSize: 18,
      marginBottom: 20,
      color: themeColors.onSurface,
      textAlign: "center",
    },
    confirmModalButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
    },
    trashCircle: {
      backgroundColor: themeColors.error,
      borderRadius: 20,
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
    },
    colorPicker: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 15,
      justifyContent: "center",
    },
    colorOption: {
      width: 30,
      height: 30,
      borderRadius: 15,
      margin: 5,
      borderWidth: 3,
    },
    eventCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 0,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginVertical: 6,
    },
    trashOnColor: {
      backgroundColor: themeColors.primary,
      borderRadius: 16,
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
    },
  });

export default CalendarScreen;
