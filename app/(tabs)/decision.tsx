import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Point {
  id: string;
  text: string;
  rating: number;
}

interface DecisionHistoryItem {
  id: string;
  problem: string;
  positivePoints: Point[];
  negativePoints: Point[];
  reflection: string;
  overallSentiment: string;
  timestamp: string;
}

const DecisionScreen = () => {
  const [problem, setProblem] = useState('');
  const [positivePoints, setPositivePoints] = useState<Point[]>([]);
  const [negativePoints, setNegativePoints] = useState<Point[]>([]);
  const [newPositivePoint, setNewPositivePoint] = useState('');
  const [newNegativePoint, setNewNegativePoint] = useState('');
  const [reflection, setReflection] = useState('');
  const [history, setHistory] = useState<DecisionHistoryItem[]>([]);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = useMemo(() => createStyles(isDarkMode), [isDarkMode]);

  // Carregar o histórico salvo ao iniciar
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem('@decision_history');
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    };

    loadHistory();
  }, []);

  // Salvar o histórico sempre que ele for atualizado
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem('@decision_history', JSON.stringify(history));
      } catch (error) {
        console.error('Erro ao salvar histórico:', error);
      }
    };

    if (history.length > 0) {
      saveHistory();
    }
  }, [history]);

  const renderStar = (rating: number, index: number, onPress: (newRating: number) => void) => {
    const starColor = index < rating ? '#FFD700' : (isDarkMode ? '#666' : '#ccc');
    return (
      <TouchableOpacity key={index} onPress={() => onPress(index + 1)}>
        <Feather name="star" size={20} color={starColor} style={styles.starIcon} />
      </TouchableOpacity>
    );
  };

  const renderPointInput = (pointType: 'positive' | 'negative') => (
    <View style={styles.addPointContainer}>
      <TextInput
        style={styles.addInput}
        value={pointType === 'positive' ? newPositivePoint : newNegativePoint}
        onChangeText={(text) =>
          pointType === 'positive' ? setNewPositivePoint(text) : setNewNegativePoint(text)
        }
        placeholder={`Adicionar ponto ${pointType === 'positive' ? 'positivo' : 'negativo'}`}
        placeholderTextColor={isDarkMode ? '#888' : '#bbb'}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          pointType === 'positive' ? addPositivePoint() : addNegativePoint()
        }
      >
        <Feather name={pointType === 'positive' ? 'plus' : 'minus'} size={24} color={isDarkMode ? '#eee' : '#333'} />
      </TouchableOpacity>
    </View>
  );

  const renderPointCard = (point: Point, onRatingChange: (newRating: number) => void) => (
    <View key={point.id} style={styles.pointCard}>
      <Text style={styles.pointText}>{point.text}</Text>
      <View style={styles.ratingContainer}>
        {[0, 1, 2, 3, 4].map(index =>
          renderStar(point.rating, index, () => onRatingChange(index + 1))
        )}
      </View>
    </View>
  );

  const addPositivePoint = () => {
    if (newPositivePoint.trim() && positivePoints.length < 5) {
      setPositivePoints([...positivePoints, { id: Date.now().toString() + '-pos', text: newPositivePoint, rating: 0 }]);
      setNewPositivePoint('');
    }
  };

  const addNegativePoint = () => {
    if (newNegativePoint.trim() && negativePoints.length < 5) {
      setNegativePoints([...negativePoints, { id: Date.now().toString() + '-neg', text: newNegativePoint, rating: 0 }]);
      setNewNegativePoint('');
    }
  };

  const updatePositiveRating = (id: string, newRating: number) => {
    setPositivePoints(positivePoints.map(p => p.id === id ? { ...p, rating: newRating } : p));
  };

  const updateNegativeRating = (id: string, newRating: number) => {
    setNegativePoints(negativePoints.map(p => p.id === id ? { ...p, rating: newRating } : p));
  };

  const calculateScore = (): { positive: number; negative: number } => {
    const positiveScore = positivePoints.reduce((sum, point) => sum + point.rating, 0);
    const negativeScore = negativePoints.reduce((sum, point) => sum + point.rating, 0);
    return { positive: positiveScore, negative: negativeScore };
  };

  const getOverallSentiment = (): string => {
    const { positive, negative } = calculateScore();
    if (positive > negative) return 'Geralmente Positivo';
    if (negative > positive) return 'Geralmente Negativo';
    return 'Neutro ou Balanceado';
  };

  const saveDecision = () => {
    if (!problem.trim()) return;

    const overallSentiment = getOverallSentiment();
    const newDecision: DecisionHistoryItem = {
      id: Date.now().toString(),
      problem,
      positivePoints: [...positivePoints],
      negativePoints: [...negativePoints],
      reflection,
      overallSentiment,
      timestamp: new Date().toLocaleString(),
    };
    setHistory([newDecision, ...history]);
    setProblem('');
    setPositivePoints([]);
    setNegativePoints([]);
    setNewPositivePoint('');
    setNewNegativePoint('');
    setReflection('');
  };

  const renderHistoryItem = ({ item }: { item: DecisionHistoryItem }) => (
    <View style={styles.historyCard}>
      <Text style={styles.historyProblem}>{item.problem}</Text>
      <Text style={styles.historySentiment}>{`Avaliação: ${item.overallSentiment}`}</Text>

      <Text style={styles.historyPointsTitle}>Pontos Positivos:</Text>
      {item.positivePoints.map(p => (
        <Text key={p.id} style={styles.historyPointItem}>{p.text} ({p.rating} estrelas)</Text>
      ))}

      <Text style={styles.historyPointsTitle}>Pontos Negativos:</Text>
      {item.negativePoints.map(p => (
        <Text key={p.id} style={styles.historyPointItem}>{p.text} ({p.rating} estrelas)</Text>
      ))}

      {!!item.reflection && (
        <Text style={styles.historyReflection}>{`Reflexão: ${item.reflection}`}</Text>
      )}
      <Text style={styles.historyTimestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <FlatList
      data={history}
      keyExtractor={item => item.id}
      renderItem={renderHistoryItem}
      ListEmptyComponent={<Text style={styles.emptyListText}>Nenhuma decisão salva ainda.</Text>}
      ListHeaderComponent={
        <View style={styles.container}>
          <Text style={styles.title}>Apoio a Decisão</Text>

          <Text style={styles.label}>Problema:</Text>
          <TextInput
            style={styles.input}
            value={problem}
            onChangeText={setProblem}
            placeholder="Descreva o problema"
            placeholderTextColor={isDarkMode ? '#888' : '#bbb'}
          />

          <Text style={styles.sectionTitle}>Pontos Positivos</Text>
          {positivePoints.map(p => renderPointCard(p, (r) => updatePositiveRating(p.id, r)))}
          {positivePoints.length < 5 && renderPointInput('positive')}

          <Text style={styles.sectionTitle}>Pontos Negativos</Text>
          {negativePoints.map(p => renderPointCard(p, (r) => updateNegativeRating(p.id, r)))}
          {negativePoints.length < 5 && renderPointInput('negative')}

          <Text style={styles.sentimentText}>Avaliação Geral: {getOverallSentiment()}</Text>

          <Text style={styles.sectionTitle}>Reflexão</Text>
          <TextInput
            style={styles.reflectionInput}
            multiline
            value={reflection}
            onChangeText={setReflection}
            placeholder="Reflexão final sobre a decisão..."
            placeholderTextColor={isDarkMode ? '#888' : '#bbb'}
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveDecision}>
            <Text style={styles.saveButtonText}>Salvar no Histórico</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Histórico de Decisões</Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
};

const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      padding: 30,
      backgroundColor: isDarkMode ? '#0a080d' : '#F5F5F5',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#2786C6',
      marginBottom: 10,
      marginTop:20,
    },
    label: {
      fontSize: 16,
      color: isDarkMode ? '#FFF' : '#333',
      marginBottom: 5,
    },
    input: {
      borderColor: isDarkMode ? '#444' : '#ddd',
      borderWidth: 1,
      padding: 10,
      borderRadius: 5,
      marginBottom: 20,
      backgroundColor: isDarkMode ? '#222' : '#FFF',
      color: isDarkMode ? '#FFF' : '#000',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFF' : '#333',
      marginTop: 20,
      marginBottom: 10,
    },
    addPointContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    addInput: {
      flex: 1,
      borderColor: isDarkMode ? '#444' : '#ddd',
      borderWidth: 1,
      padding: 10,
      borderRadius: 5,
      backgroundColor: isDarkMode ? '#222' : '#FFF',
      color: isDarkMode ? '#FFF' : '#000',
    },
    addButton: {
      marginLeft: 10,
      padding: 10,
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      borderRadius: 5,
    },
    pointCard: {
      backgroundColor: isDarkMode ? '#333' : '#FFF',
      padding: 10,
      marginBottom: 10,
      borderRadius: 5,
      elevation: 2,
    },
    pointText: {
      fontSize: 16,
      color: isDarkMode ? '#FFF' : '#000',
    },
    ratingContainer: {
      flexDirection: 'row',
    },
    starIcon: {
      margin: 2,
    },
    sentimentText: {
      fontSize: 16,
      fontStyle: 'italic',
      color: isDarkMode ? '#FFF' : '#333',
      marginTop: 10,
      marginBottom: 20,
    },
    reflectionInput: {
      height: 80,
      borderColor: isDarkMode ? '#444' : '#ddd',
      borderWidth: 1,
      padding: 10,
      borderRadius: 5,
      backgroundColor: isDarkMode ? '#222' : '#FFF',
      color: isDarkMode ? '#FFF' : '#000',
      marginBottom: 20,
    },
    saveButton: {
      backgroundColor: '#095BC0',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
    historyCard: {
      backgroundColor: isDarkMode ? '#333' : '#FFF',
      padding: 10,
      marginVertical: 10,
      borderRadius: 5,
      elevation: 2,
    },
    historyProblem: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFF' : '#000',
    },
    historySentiment: {
      fontSize: 16,
      color: isDarkMode ? '#FFF' : '#555',
    },
    historyPointsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFF' : '#000',
      marginTop: 10,
    },
    historyPointItem: {
      fontSize: 14,
      color: isDarkMode ? '#CCC' : '#333',
    },
    historyReflection: {
      fontSize: 14,
      fontStyle: 'italic',
      color: isDarkMode ? '#CCC' : '#666',
      marginTop: 10,
    },
    historyTimestamp: {
      fontSize: 12,
      color: isDarkMode ? '#888' : '#999',
      marginTop: 5,
    },
    emptyListText: {
      textAlign: 'center',
      fontSize: 18,
      color: isDarkMode ? '#FFF' : '#555',
      marginTop: 20,
    },
  });

export default DecisionScreen;
