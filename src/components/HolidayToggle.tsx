import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Switch, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/contexts/ThemeContext";

const HOLIDAYS_ENABLED_KEY = "@holidays_enabled";

// Feriados nacionais brasileiros (fixos)
export const BRAZILIAN_HOLIDAYS: { [date: string]: string } = {
  // Janeiro
  "01-01": "Ano Novo",
  // Abril
  "04-21": "Tiradentes",
  // Maio
  "05-01": "Dia do Trabalho",
  // Setembro
  "09-07": "Independência do Brasil",
  // Outubro
  "10-12": "Nossa Senhora Aparecida",
  // Novembro
  "11-02": "Finados",
  "11-15": "Proclamação da República",
  "11-20": "Dia da Consciência Negra",
  // Dezembro
  "12-25": "Natal",
};

// Função para calcular a Páscoa (Algoritmo de Meeus/Jones/Butcher)
const calculateEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

// Função para obter feriados móveis de um ano específico
const getMovableHolidays = (year: number): { [date: string]: string } => {
  const easter = calculateEaster(year);
  const holidays: { [date: string]: string } = {};

  // Carnaval (47 dias antes da Páscoa - segunda e terça)
  const carnavalTerca = new Date(easter);
  carnavalTerca.setDate(easter.getDate() - 47);
  const carnavalSegunda = new Date(carnavalTerca);
  carnavalSegunda.setDate(carnavalTerca.getDate() - 1);

  // Sexta-feira Santa (2 dias antes da Páscoa)
  const sextaSanta = new Date(easter);
  sextaSanta.setDate(easter.getDate() - 2);

  // Corpus Christi (60 dias após a Páscoa)
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  holidays[formatDate(carnavalSegunda)] = "Carnaval";
  holidays[formatDate(carnavalTerca)] = "Carnaval";
  holidays[formatDate(sextaSanta)] = "Sexta-feira Santa";
  holidays[formatDate(easter)] = "Páscoa";
  holidays[formatDate(corpusChristi)] = "Corpus Christi";

  return holidays;
};

// Função para obter todos os feriados de um ano
export const getHolidaysForYear = (
  year: number
): { [date: string]: string } => {
  const holidays: { [date: string]: string } = {};

  // Adicionar feriados fixos
  Object.entries(BRAZILIAN_HOLIDAYS).forEach(([monthDay, name]) => {
    holidays[`${year}-${monthDay}`] = name;
  });

  // Adicionar feriados móveis
  const movableHolidays = getMovableHolidays(year);
  Object.assign(holidays, movableHolidays);

  return holidays;
};

// Hook para usar o estado de feriados
export const useHolidays = () => {
  const [holidaysEnabled, setHolidaysEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHolidaysSetting();
  }, []);

  const loadHolidaysSetting = async () => {
    try {
      const value = await AsyncStorage.getItem(HOLIDAYS_ENABLED_KEY);
      if (value !== null) {
        setHolidaysEnabled(JSON.parse(value));
      }
    } catch (e) {
      console.error("Erro ao carregar configuração de feriados:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleHolidays = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(HOLIDAYS_ENABLED_KEY, JSON.stringify(value));
      setHolidaysEnabled(value);
    } catch (e) {
      console.error("Erro ao salvar configuração de feriados:", e);
    }
  };

  return { holidaysEnabled, toggleHolidays, loading };
};

// Componente de toggle para configurações
const HolidayToggle: React.FC = () => {
  const isDarkMode = useColorScheme() === "dark";
  const { colors } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, theme),
    [isDarkMode, theme]
  );

  const { holidaysEnabled, toggleHolidays, loading } = useHolidays();

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Feriados Nacionais</Text>
          <Text style={styles.subtitle}>
            Exibir feriados brasileiros no calendário
          </Text>
        </View>
        <Switch
          value={holidaysEnabled}
          onValueChange={toggleHolidays}
          trackColor={{ false: theme.outline, true: theme.primary + "80" }}
          thumbColor={holidaysEnabled ? theme.primary : theme.surface}
        />
      </View>
    </View>
  );
};

const dynamicStyles = (isDarkMode: boolean, theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    textContainer: {
      flex: 1,
      marginRight: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.onSurface,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      color: theme.onSurfaceVariant,
    },
  });

export default HolidayToggle;
