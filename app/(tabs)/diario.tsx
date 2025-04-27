import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Modal, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAB,} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';


interface Entry {
  id: number;
  emotion: string;
  note: string;
  date: string;
  time: string;
}

const EMOTIONS = [
  { emoji: '😀', name: 'Feliz' },
  { emoji: '😊', name: 'Satisfeito' },
  { emoji: '😐', name: 'Neutro' },
  { emoji: '😔', name: 'Triste' },
  { emoji: '😢', name: 'Muito Triste' },
  { emoji: '😡', name: 'Raiva' }
];

const DiarioEmocoes: React.FC = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [note, setNote] = useState<string>('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  const isDarkMode = useColorScheme() === 'dark';
  const styles = dynamicStyles(isDarkMode);

  useEffect(() => {
    loadEntries();
  }, []);

  const saveEntry = async () => {
    if (!selectedEmotion) {
      return;
    }

    const now = new Date();
    const newEntry: Entry = {
      id: Date.now(),
      emotion: selectedEmotion,
      note,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString()
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    await AsyncStorage.setItem('diario', JSON.stringify(updatedEntries));

    setSelectedEmotion(null);
    setNote('');
    setModalVisible(false);
  };

  const loadEntries = async () => {
    const data = await AsyncStorage.getItem('diario');
    if (data) {
      setEntries(JSON.parse(data));
    }
  };

  const confirmDelete = (id: number) => {
    setEntryToDelete(id);
    setDeleteModalVisible(true);
  };

  const deleteEntry = async () => {
    if (entryToDelete !== null) {
      const updatedEntries = entries.filter(entry => entry.id !== entryToDelete);
      setEntries(updatedEntries);
      await AsyncStorage.setItem('diario', JSON.stringify(updatedEntries));
      setDeleteModalVisible(false);
      setEntryToDelete(null);
    }
  };

  return (

    <View style={styles.container}>
      <Text style={styles.title}>Diário</Text>
      <View style={styles.bodyContainer}>

        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.entryCard}>
              <View style={styles.entryContent}>
                <Text style={styles.entryEmotion}>{item.emotion}</Text>
                {item.note && <Text style={styles.entryNote}>{item.note}</Text>}
                <Text style={styles.entryDate}>{item.date} às {item.time}</Text>
              </View>
              <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
                <Icon name="trash-2" size={20} color={isDarkMode ? '#FFFFFF' : '#333333'} />
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        />
    </View>
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Como você está se sentindo hoje?</Text>
            <View style={styles.emotionContainer}>
              {EMOTIONS.map((emotion) => (
                <TouchableOpacity
                  key={emotion.emoji}
                  onPress={() => setSelectedEmotion(emotion.emoji)}
                  style={[
                    styles.emotionButton,
                    selectedEmotion === emotion.emoji && styles.selectedEmotionButton
                  ]}
                >
                  <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                  <Text style={styles.emotionName}>{emotion.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              placeholder="Adicione uma nota (opcional)"
              placeholderTextColor={isDarkMode ? '#999' : '#CCC'}
              value={note}
              onChangeText={(text) => setNote(text)}
              style={styles.input}
            />
            <TouchableOpacity onPress={saveEntry} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tem certeza que deseja excluir?</Text>
            <TouchableOpacity onPress={deleteEntry} style={styles.deleteConfirmButton}>
              <Text style={styles.deleteConfirmButtonText}>Excluir</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    marginTop:20,
    marginBottom:10,
    padding:20,
    marginLeft:0,
    color: isDarkMode ? '#FFFFFF' : '#2786C6',
    fontWeight:'bold',
  },
  subHeaderText: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
    color: isDarkMode ? '#FFFFFF' : '#687076',
  },
  entryCard: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 15,
    backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
    margin: 5,
    elevation: 2,
    shadowColor: isDarkMode ? '#000' : '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryContent: {
    flex: 1,
    marginRight:10,
  },
  entryEmotion: {
    padding: 5,
    marginBottom:10,
    fontSize: 24,
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  entryDate: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontSize: 12,
    fontWeight:'bold',
    marginTop:15,
  },
  entryNote: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontSize: 18,
  },
  deleteButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    backgroundColor: isDarkMode ? '#060606' : '#F5F5F5',
  },
  deleteButtonText: {
    marginLeft: 5,
    color: isDarkMode ? '#FFFFFF' : '#475569',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 0,
    backgroundColor: isDarkMode ? '#095BC0' : '#2786C6',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  emotionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  emotionButton: {
    margin: 5,
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 10,
    padding: 10,
    backgroundColor: isDarkMode ? '#0a080d' : '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedEmotionButton: {
    borderWidth: 2,
    borderColor: isDarkMode ? '#0a080d' : '#F5F5F5',
  },
  emotionEmoji: {
    fontSize: 30,
  },
  emotionName: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderColor: isDarkMode ? '#333' : '#CCC',
    color: isDarkMode ? '#FFFFFF' : '#000000',
    backgroundColor: isDarkMode ? '#333' : '#FFF',
  },
  saveButton: {
    backgroundColor: isDarkMode ? '#095BC0' : '#2786C6',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'red',
    textAlign: 'center',
  },
  deleteConfirmButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  deleteConfirmButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default DiarioEmocoes;