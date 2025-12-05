import React, { useState, useMemo } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, useColorScheme } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

const STORAGE_KEYS = {
  calendar: '@calendar_events',
  tasks: 'tasks',
  diary: 'diaryEntries',
  decision: '@decision_history',
};

const DataBackupRestore = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const styles = useMemo(() => dynamicStyles(themeColors), [themeColors]);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);

  // Salvar arquivo JSON
  const handleExportFile = async () => {
    setLoadingExport(true);
    try {
      const data: Record<string, any> = {};
      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        const value = await AsyncStorage.getItem(storageKey);
        data[key] = value ? JSON.parse(value) : null;
      }
      const json = JSON.stringify(data, null, 2);
      const fileUri = (FileSystem as any).documentDirectory + 'divergente-backup.json';
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
    } catch (e) {
      Alert.alert('Erro', 'Falha ao exportar arquivo: ' + e);
    }
    setLoadingExport(false);
  };

  // Importar de arquivo JSON
  const handleImportFile = async () => {
    setLoadingImport(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled || !result.assets || !result.assets[0]?.uri) {
        setLoadingImport(false);
        return;
      }
      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      const data = JSON.parse(content);
      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        if (data[key] !== undefined) {
          await AsyncStorage.setItem(storageKey, JSON.stringify(data[key]));
        }
      }
      Alert.alert('Importado!', 'Os dados foram importados com sucesso. Reinicie o app para ver as alterações.');
    } catch (e) {
      Alert.alert('Erro', 'Falha ao importar arquivo: ' + e);
    }
    setLoadingImport(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backup de Dados</Text>
      <Text style={styles.desc}>Exporte ou importe seus dados do calendário, tarefas, diário e decisões usando um arquivo JSON.</Text>
      <View style={styles.section}>
        <Button title={loadingExport ? 'Exportando...' : 'Exportar para arquivo'} onPress={handleExportFile} disabled={loadingExport || loadingImport} color={themeColors.primary} />
      </View>
      <View style={styles.section}>
        <Button title={loadingImport ? 'Importando...' : 'Importar de arquivo'} onPress={handleImportFile} disabled={loadingExport || loadingImport} color={themeColors.primary} />
      </View>
    </View>
  );
};

const dynamicStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: themeColors.background,
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: themeColors.onSurface,
  },
  desc: {
    fontSize: 14,
    marginBottom: 0,
    textAlign: 'center',
    color: themeColors.onSurface,
  },
  section: {
    marginBottom: 10,
  },
});

export default DataBackupRestore; 