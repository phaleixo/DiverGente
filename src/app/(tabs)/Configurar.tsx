import React from "react";
import {
  Image,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Title from "@/components/Title";
import ProfileHeader from "@/components/ProfileHeader";
import SignOutButton from "@/components/SignOutButton";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import ThemePicker from "@/components/ThemePicker";
import HolidayToggle from "@/components/HolidayToggle";
import { useTheme } from "@/contexts/ThemeContext";

const Config: React.FC = () => {
  const isDarkMode = useColorScheme() === "dark";
  const { colors } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;
  const styles = dynamicStyles(isDarkMode, theme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
      >
        <View style={styles.bodyContainer}>
          <Title variant="h3" marginBottom={20}>
            Perfil
          </Title>
          <ProfileHeader size={100} layout="below" />
          <SignOutButton />
          <ThemePicker />
          <HolidayToggle />

          <Image
            source={require("../../assets/images/splash-icon.png")}
            style={styles.localImage}
          />
          <Text style={styles.footer}>
            DiverGente v3.1.0 licenciado sob a MIT License.
            {"\n"}
            Desenvolvido por phaleixo.
            {"\n"}
            GitHub:{" "}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("https://github.com/phaleixo")}
            >
              https://github.com/phaleixo
            </Text>
            {"\n"}
            Email:{" "}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("mailto:phaleixo@outlook.com.br")}
            >
              phaleixo@outlook.com.br
            </Text>
            {"\n"}
          </Text>
          <DeleteAccountButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Função para gerar estilos dinâmicos
const dynamicStyles = (isDarkMode: boolean, theme: any) =>
  StyleSheet.create({
    container: {
      padding: 2,
      paddingBottom: 100,
    },
    bodyContainer: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },

    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      marginTop: 0,
      color: theme.onSurface,
      textAlign: "center",
    },
    content: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 15,
      color: theme.onSurface,
    },
    footer: {
      fontSize: 14,
      textAlign: "center",
      color: theme.onSurface,
      marginBottom: 40,
    },
    link: {
      color: theme.primary,
    },
    localImage: {
      width: 96,
      height: 96,
      borderRadius: 10,
      marginBottom: 5,
      marginTop: 10,
      alignContent: "center",
      alignSelf: "center",
    },
    logoutButton: {
      alignSelf: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.outline,
      backgroundColor: theme.surface,
    },
    logoutText: {
      color: theme.onSurface,
      fontWeight: "600",
    },
    logoutTopRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.outline,
      backgroundColor: theme.surface,
    },
    logoutIconImage: {
      width: 40,
      height: 40,
      borderRadius: 40,
      overflow: "hidden",
    },
    signOutButton: {
      marginTop: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.outline,
      backgroundColor: theme.surface,
    },
    signOutText: {
      color: theme.onSurface,
      fontWeight: "600",
    },
  });
export default Config;
