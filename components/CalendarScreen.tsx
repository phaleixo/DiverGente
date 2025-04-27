import React, { useState, useMemo, useEffect } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Feather from 'react-native-vector-icons/Feather';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const STORAGE_KEY = '@calendar_events';

const CalendarScreen = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = useMemo(() => dynamicStyles(isDarkMode), [isDarkMode]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [eventText, setEventText] = useState('');
  const [events, setEvents] = useState<{ [date: string]: string[] }>({});
  const [eventToDeleteIndex, setEventToDeleteIndex] = useState<number | null>(null);

  // Carrega os eventos salvos
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const savedEvents = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedEvents) {
          setEvents(JSON.parse(savedEvents));
        }
      } catch (e) {
        console.error('Erro ao carregar eventos:', e);
      }
    };
    loadEvents();
  }, []);

  // Salva os eventos sempre que mudarem
  useEffect(() => {
    const saveEvents = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      } catch (e) {
        console.error('Erro ao salvar eventos:', e);
      }
    };
    saveEvents();
  }, [events]);

  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const onDayPress = (day: { dateString: string }) => {
    if (selectedDate === day.dateString) {
      setEventModalVisible(true);
    } else {
      setSelectedDate(day.dateString);
    }
  };

  const addEvent = () => {
    if (!eventText.trim()) return;

    setEvents((prev) => {
      const updated = { ...prev };
      if (!updated[selectedDate]) {
        updated[selectedDate] = [];
      }
      updated[selectedDate].push(eventText);
      return updated;
    });

    setEventText('');
    setEventModalVisible(false);
  };

  const confirmDeleteEvent = (index: number) => {
    setEventToDeleteIndex(index);
    setConfirmDeleteVisible(true);
  };

  const deleteEvent = () => {
    if (eventToDeleteIndex !== null) {
      setEvents((prev) => {
        const updated = { ...prev };
        if (updated[selectedDate]) {
          updated[selectedDate].splice(eventToDeleteIndex, 1);
          if (updated[selectedDate].length === 0) {
            delete updated[selectedDate];
          }
        }
        return updated;
      });
      setEventToDeleteIndex(null);
      setConfirmDeleteVisible(false);
    }
  };

  const markedDates = {
    ...Object.keys(events).reduce((acc, date) => {
      acc[date] = {
        marked: true,
        dotColor: '#3d85c6',
        selected: selectedDate === date,
        selectedColor: selectedDate === date ? '#3d85c6' : undefined,
      };
      return acc;
    }, {} as any),
    [selectedDate]: {
      ...(events[selectedDate] ? { marked: true, dotColor: '#3d85c6' } : {}),
      selected: true,
      selectedColor: '#3d85c6',
    }
  };

  const calendarTheme = {
    backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
    calendarBackground: isDarkMode ? '#151718' : '#ffffff',
    textSectionTitleColor: '#3d85c6',
    selectedDayBackgroundColor: '#3d85c6',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#3d85c6',
    dayTextColor: isDarkMode ? '#ffffff' : '#2d4150',
    textDisabledColor: '#888',
    dotColor: '#3d85c6',
    selectedDotColor: '#ffffff',
    arrowColor: '#3d85c6',
    monthTextColor: '#3d85c6',
    textDayFontWeight: '300',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={currentMonth}
        onDayPress={onDayPress}
        onMonthChange={(month: { dateString: string }) => setCurrentMonth(month.dateString)}
        markedDates={markedDates}
        theme={calendarTheme}
        style={styles.calendar}
      />

      {selectedDate && events[selectedDate] && (
        <View style={styles.card}>
          <FlatList
            data={events[selectedDate]}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.eventRow}>
                <Text style={styles.eventText}>• {item}</Text>
                <TouchableOpacity onPress={() => confirmDeleteEvent(index)}>
                  <Feather name="trash-2" size={18} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      <Modal visible={eventModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Adicionar evento em {formatDate(selectedDate)}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o evento"
              placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
              value={eventText}
              onChangeText={setEventText}
            />
            <View style={styles.modalButtons}>
              <Button title="Salvar Evento" onPress={addEvent} />
              <View style={styles.space} />
              <Button title="Cancelar" color="gray" onPress={() => setEventModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmDeleteVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalText}>Tem certeza que deseja excluir este evento?</Text>
            <View style={styles.confirmModalButtons}>
              <Button title="Excluir" color="red" onPress={deleteEvent} />
              <View style={styles.space} />
              <Button title="Cancelar" onPress={() => setConfirmDeleteVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const dynamicStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#0a080d' : '#F5F5F5',
      padding: 2,
    },
    calendar: {
      borderRadius: 15,
      overflow: 'hidden',
      marginBottom: 10,
      elevation: 2,
      shadowColor: isDarkMode ? '#000' : '#888',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      padding: 25,
      borderRadius: 15,
    },
    modalTitle: {
      fontSize: 18,
      marginBottom: 15,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#000',
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#ccc',
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderRadius: 8,
    },
    space: {
      width: 10,
    },
    card: {
      padding: 10,
      marginVertical: 5,
      borderRadius: 15,
      backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
      elevation: 2,
      shadowColor: isDarkMode ? '#000' : '#888',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      paddingHorizontal: 15,
    },
    eventRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 5,
    },
    eventText: {
      fontSize: 16,
      color: isDarkMode ? '#FFFFFF' : '#333',
      flex: 1,
    },
    confirmModalContent: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      padding: 25,
      borderRadius: 15,
      alignItems: 'center',
    },
    confirmModalText: {
      fontSize: 18,
      marginBottom: 20,
      color: isDarkMode ? '#FFFFFF' : '#000',
      textAlign: 'center',
    },
    confirmModalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
  });

export default CalendarScreen;