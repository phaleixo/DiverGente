import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, useColorScheme,} from'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabaseService from '@/services/supabaseService';
import Title from '@/components/Title';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { colors } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;
  const styles = useMemo(() => createStyles(isDarkMode, theme), [isDarkMode, theme]);

  // Carregar o histórico salvo ao iniciar
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Busca remoto e local, depois faz merge bidirecional
        let remote: any[] = [];
        try {
          const { data, error } = await supabaseService.fetchDecisions();
          if (!error && Array.isArray(data)) remote = data;
        } catch (err) {
          console.debug('fetchDecisions failed:', err);
          remote = [];
        }

        let local: DecisionHistoryItem[] = [];
        try {
          const saved = await AsyncStorage.getItem('@decision_history');
          if (saved) local = JSON.parse(saved);
        } catch (err) {
          console.debug('loading local decision history failed:', err);
          local = [];
        }

        const remoteById: Record<string, any> = {};
        remote.forEach((d) => {
          if (!d || !d.id) return;
          remoteById[d.id.toString()] = d;
        });

        // Items locais que não existem remotamente => subir
        const toSyncLocals: DecisionHistoryItem[] = [];
        local.forEach((l) => {
          if (!l.id) return;
          if (!remoteById[l.id.toString()]) {
            toSyncLocals.push(l);
          }
        });

        // Construir lista final: comece com remotos (mais recentes primeiro), depois locais únicos
        const mappedRemote: DecisionHistoryItem[] = remote.map((d: any) => ({
          id: d.id,
          problem: d.problem,
          positivePoints: d.positive_points ?? [],
          negativePoints: d.negative_points ?? [],
          reflection: d.reflection ?? '',
          overallSentiment: d.overall_sentiment ?? '',
          timestamp: d.created_at ?? new Date().toLocaleString(),
        }));

        const merged = [...mappedRemote];
        // append local-only items
        toSyncLocals.forEach((l) => merged.push(l));

        // ordenar por timestamp/created (tenta parse ISO, senão fallback para string)
        merged.sort((a, b) => {
          const ta = Date.parse(a.timestamp) || 0;
          const tb = Date.parse(b.timestamp) || 0;
          return tb - ta;
        });

        setHistory(merged);

        // Persiste merged localmente
        try {
          await AsyncStorage.setItem('@decision_history', JSON.stringify(merged));
        } catch (err) {
          console.debug('failed to save merged decisions locally', err);
        }

        // Sincroniza locais que faltavam no remoto
        (async () => {
          for (const l of toSyncLocals) {
            try {
              await supabaseService.upsertDecision({
                id: l.id,
                problem: l.problem,
                positivePoints: l.positivePoints,
                negativePoints: l.negativePoints,
                reflection: l.reflection,
                overallSentiment: l.overallSentiment,
                createdAt: new Date().toISOString(),
              });
            } catch (err) {
              console.debug('failed to upsert local decision to remote', err);
            }
          }
        })();
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
    const isSelected = index < rating;
    const starColor = isSelected ? '#FFD700' : theme.outline;
    return (
      <TouchableOpacity key={index} onPress={() => onPress(index + 1)}>
        <MaterialCommunityIcons
          name={isSelected ? "star" : "star-outline"}
          size={24}
          color={starColor}
          style={styles.starIcon}
        />
      </TouchableOpacity>
    );
  };

  const renderPointInput = (pointType: 'positive' | 'negative') => (
    <View style={styles.addPointContainer}>
      <TextInput
        style={[
          styles.addInput,
          {
            backgroundColor: theme.surface,
            color: theme.onSurface,
          },
        ]}
        value={pointType === 'positive' ? newPositivePoint : newNegativePoint}
        onChangeText={(text) =>
          pointType === 'positive' ? setNewPositivePoint(text) : setNewNegativePoint(text)
        }
        placeholder={`Adicionar ponto ${pointType === 'positive' ? 'positivo' : 'negativo'}`}
        placeholderTextColor={theme.outline}
      />
      <TouchableOpacity
        style={[
          styles.addButton,
          {
            backgroundColor: theme.primary,
          },
        ]}
        onPress={() =>
          pointType === 'positive' ? addPositivePoint() : addNegativePoint()
        }
      >
        <MaterialCommunityIcons
          name={pointType === 'positive' ? 'plus' : 'minus'}
          size={24}
          color={theme.onPrimary}
        />
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

    // Tenta sincronizar com Supabase (não bloqueia a UI)
    (async () => {
      try {
        await supabaseService.upsertDecision({
          id: newDecision.id,
          problem: newDecision.problem,
          positivePoints: newDecision.positivePoints,
          negativePoints: newDecision.negativePoints,
          reflection: newDecision.reflection,
          overallSentiment: newDecision.overallSentiment,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.debug('upsertDecision error (saved locally):', err);
      }
    })();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <View>

          <Title variant="h3" marginBottom={10} marginTop={10}>
              Apoio a Decisão
          </Title>
        <FlatList
          data={history}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={renderHistoryItem}
          ListEmptyComponent={<Text style={styles.emptyListText}>Nenhuma decisão salva ainda.</Text>}
          ListHeaderComponent={
            <View style={styles.container}>
              

              <Text style={styles.label}>Problema:</Text>
              <TextInput
                style={styles.input}
                value={problem}
                onChangeText={setProblem}
                placeholder="Descreva o problema"
                placeholderTextColor={theme.outline}
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
                placeholderTextColor={theme.outline}
              />

              <TouchableOpacity style={styles.saveButton} onPress={saveDecision}>
                <Text style={styles.saveButtonText}>Salvar no Histórico</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Histórico de Decisões</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (isDarkMode: boolean, theme: any) =>
  StyleSheet.create({
    container: {
      marginTop: 10,
      padding: 12,
      backgroundColor: theme.background,
      paddingBottom: 80,
      flex: 1,
    },
    label: {
      fontSize: 17,
      color: theme.onSurface,
      marginBottom: 7,
      fontWeight: '500',
    },
    input: {
      borderWidth: 0,
      padding: 18,
      borderRadius: 14,
      marginBottom: 28,
      backgroundColor: theme.surface,
      color: theme.onSurface,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      fontSize: 17,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: theme.onSurface,
      marginTop: 40,
      marginBottom: 18,
      letterSpacing: 0.2,
    },
    addPointContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 10,
    },
    addInput: {
      flex: 1,
      borderWidth: 0,
      padding: 16,
      borderRadius: 12,
      // backgroundColor e color agora são definidos inline para garantir branco/light
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      fontSize: 16,
    },
    addButton: {
      marginLeft: 10,
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 44,
      minHeight: 44,
      // backgroundColor agora é definido inline para garantir primary
    },
    pointCard: {
      backgroundColor: theme.surface,
      padding: 18,
      marginBottom: 14,
      borderRadius: 16,
      elevation: 0,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    pointText: {
      fontSize: 17,
      color: theme.onSurface,
      fontWeight: '500',
    },
    ratingContainer: {
      flexDirection: 'row',
      marginTop: 8,
    },
    starIcon: {
      margin: 3,
    },
    sentimentText: {
      fontSize: 17,
      fontStyle: 'italic',
      color: theme.onSurface,
      marginTop: 22,
      marginBottom: 30,
      textAlign: 'center',
    },
    reflectionInput: {
      height: 90,
      borderWidth: 0,
      padding: 18,
      borderRadius: 14,
      backgroundColor: theme.surface,
      color: theme.onSurface,
      marginBottom: 30,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: theme.primary,
      paddingVertical: 18,
      paddingHorizontal: 32,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 40,
      alignSelf: 'center',
      minWidth: 220,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.10,
      shadowRadius: 6,
    },
    saveButtonText: {
      color: theme.onPrimary,
      fontWeight: 'bold',
      fontSize: 18,
      letterSpacing: 0.5,
    },
    historyCard: {
      backgroundColor: theme.surface,
      padding: 20,
      marginVertical: 18,
      borderRadius: 18,
      elevation: 0,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    historyProblem: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.onSurface,
      marginBottom: 6,
    },
    historySentiment: {
      fontSize: 17,
      color: theme.primary,
      marginBottom: 10,
      fontWeight: '500',
    },
    historyPointsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.onSurface,
      marginTop: 18,
      marginBottom: 6,
    },
    historyPointItem: {
      fontSize: 15,
      color: theme.onSurface,
      marginLeft: 10,
      marginBottom: 3,
    },
    historyReflection: {
      fontSize: 15,
      fontStyle: 'italic',
      color: theme.onSurface,
      marginTop: 12,
      marginBottom: 6,
    },
    historyTimestamp: {
      fontSize: 13,
      color: theme.surface,
      marginTop: 10,
      textAlign: 'right',
    },
    emptyListText: {
      textAlign: 'center',
      fontSize: 19,
      color: theme.onSurface,
      marginTop: 40,
      fontWeight: '400',
    },
  });

export default DecisionScreen;
