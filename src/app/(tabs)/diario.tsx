import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Animated, Modal, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDiaryEntries, upsertDiaryEntry as sbUpsertDiaryEntry, deleteDiaryEntry as sbDeleteDiaryEntry } from '@/services/supabaseService';
import { Colors } from '@/constants/Colors';
import Card from '@/components/Card';
import FAB from '@/components/FAB';
import Title from '@/components/Title';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DiaryEntry {
  id: number;
  text: string;
  createdAt: string;
  emotion?: string;
}

const emotions = [
  '😊 Feliz', '😢 Triste', '😡 Irritado', '😰 Ansioso', '😴 Cansado', '😌 Calmo', '🤔 Pensativo', '😍 Empolgado'
];

const Diario: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [entryText, setEntryText] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const animation = useRef(new Animated.Value(1)).current;

  const isDarkMode = useColorScheme() === 'dark';
  const styles = dynamicStyles(isDarkMode);

  useEffect(() => {
    loadEntries();
  }, []);

  const sortEntries = useCallback((entryList: DiaryEntry[]) => {
    return [...entryList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, []);

  const addEntry = async () => {
    if (!entryText) return;

    const newEntry: DiaryEntry = {
      id: Date.now(),
      text: entryText,
      createdAt: new Date().toISOString(), // Salva como ISO
      emotion: selectedEmotion,
    };

    const updatedEntries = sortEntries([newEntry, ...entries]);
    setEntries(updatedEntries);
    await AsyncStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    try {
      await sbUpsertDiaryEntry(newEntry as any);
    } catch (e) {
      // ignore sync errors
    }
    setEntryText('');
    setSelectedEmotion('');
    setModalVisible(false);
  };

  const deleteEntry = async (entryId: number) => {
    const updatedEntries = sortEntries(entries.filter(entry => entry.id !== entryId));
    setEntries(updatedEntries);
    await AsyncStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    try {
      await sbDeleteDiaryEntry(entryId);
    } catch (e) {
      // ignore
    }
    setConfirmModalVisible(false);
  };

  const confirmDelete = (entryId: number) => {
    setEntryToDelete(entryId);
    setConfirmModalVisible(true);
  };

  const handleDelete = () => {
    if (entryToDelete !== null) {
      deleteEntry(entryToDelete);
    }
  };

  const loadEntries = async () => {
    try {
      const { data, error } = await fetchDiaryEntries();
      if (data) {
        const mapped = data.map((row: any) => ({
          id: Number(row.id) || Date.now(),
          text: row.text,
          createdAt: row.created_at || new Date().toISOString(),
          emotion: row.emotion || undefined,
        }));
        setEntries(sortEntries(mapped));
        await AsyncStorage.setItem('diaryEntries', JSON.stringify(mapped));
        return;
      }
    } catch (e) {
      // fallback para local
    }

    const data = await AsyncStorage.getItem('diaryEntries');
    if (data) {
      setEntries(sortEntries(JSON.parse(data)));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Evita "Invalid Date"
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background }}>
      <View style={styles.container}>
      <Title variant="h3" marginTop={10} marginBottom={10} marginLeft={20}>
        Emoções
      </Title>
      <View style={styles.bodyContainer}>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Animated.View style={{ transform: [{ scale: animation }] }}>
              <Card
                onPress={() => {}}
                animated={true}
                scale={1}
                contentStyle={styles.entry}
              >
                <View style={styles.entryRow}>
                  <View style={styles.entryContent}>
                    {item.emotion && (
                      <Text style={styles.emotionText}>{item.emotion}</Text>
                    )}
                    <Text style={[styles.entryText, styles.entryTitle]}>{item.text}</Text>
                    <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <View style={styles.entryActions}>
                    <TouchableOpacity
                      onPress={() => confirmDelete(item.id)}
                      style={styles.deleteButton}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={24}
                        color={isDarkMode ? Colors.dark.error : Colors.light.error}
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
                <Text style={styles.modalTitle}>Como você está se sentindo?</Text>
                <View style={styles.emotionsContainer}>
                  {emotions.map((emotion) => {
                    const firstSpace = emotion.indexOf(' ');
                    let emoji = emotion;
                    let label = '';
                    if (firstSpace >= 0) {
                      emoji = emotion.slice(0, firstSpace);
                      label = emotion.slice(firstSpace + 1).trim();
                    }
                    const isSelected = selectedEmotion === emotion;
                    return (
                      <TouchableOpacity
                        key={emotion}
                        style={[
                          styles.emotionButton,
                          isSelected && styles.selectedEmotionButton
                        ]}
                        onPress={() => setSelectedEmotion(isSelected ? '' : emotion)}
                      >
                        <Text style={styles.emotionEmoji}>{emoji}</Text>
                        <Text
                          style={[
                            styles.emotionName,
                            isSelected && { color: isDarkMode ? Colors.dark.onPrimary : Colors.light.onPrimary }
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TextInput
                  placeholder="Escreva sobre seu dia..."
                  placeholderTextColor={isDarkMode ? Colors.dark.outline : Colors.light.outline}
                  value={entryText}
                  onChangeText={setEntryText}
                  style={styles.input}
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity onPress={addEntry} style={styles.modalAddButton}>
                    <Text style={styles.modalAddButtonText}>Salvar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setModalVisible(false); setSelectedEmotion(''); }} style={styles.modalCancelButton}>
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
                <Text style={styles.confirmText}>Tem certeza que deseja excluir esta entrada?</Text>
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
    </SafeAreaView>
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
  entry: {
    flex: 1,
  },
  entryText: {
    fontSize: 16,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    marginBottom: 5,
    lineHeight: 24,
  },
  entryTitle: {
    fontWeight: 'bold',
  },
  entryDate: {
    fontSize: 12,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    marginTop: 2,
  },
  emotionText: {
    fontSize: 18,
    marginBottom: 8,
    color: isDarkMode ? Colors.dark.primary : Colors.light.onSurface,
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
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: isDarkMode ? Colors.dark.shadow : Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '94%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    textAlign: 'left',
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emotionButton: {
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
    overflow: 'visible',
  },
  selectedEmotionButton: {
    backgroundColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
    borderColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
  },
  emotionName: {
    fontSize: 14,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    flexShrink: 0,
  },
  emotionEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    width: '100%',
    textAlignVertical: 'top',
    minHeight: 100,
    maxWidth: '100%',
    minWidth: '100%',
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
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalAddButtonText: {
    color: isDarkMode ? Colors.dark.onPrimary : Colors.light.onPrimary,
    fontSize: 18,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    gap: 10,
  },
  modalCancelButton: {
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
  },
  modalCancelButtonText: {
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    textAlign: 'center',
    fontSize: 16,
  },
  confirmButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryActions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    height: '100%',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: isDarkMode ? Colors.dark.onSecondary : Colors.light.onSecondary,
    borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  entryContent: {
    flex: 1,
  },
});

export default Diario;