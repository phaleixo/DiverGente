import { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  useColorScheme,
} from "react-native";
import {
  useRouter,
  useLocalSearchParams,
  useGlobalSearchParams,
} from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "@/config/supabase";
import { Colors } from "@/constants/Colors";

/**
 * Esta tela trata o callback do OAuth (login com Google).
 * Ela processa os tokens recebidos e redireciona o usuário.
 */
export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();
  const isDarkMode = useColorScheme() === "dark";

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Tenta obter a URL completa para extrair os tokens do fragmento
        const url = await Linking.getInitialURL();

        let accessToken =
          (params.access_token as string) ||
          (globalParams.access_token as string);
        let refreshToken =
          (params.refresh_token as string) ||
          (globalParams.refresh_token as string);

        // Se não encontrou nos params, tenta extrair do fragmento da URL
        if (url && (!accessToken || !refreshToken)) {
          const hashIndex = url.indexOf("#");
          if (hashIndex !== -1) {
            const fragment = url.substring(hashIndex + 1);
            const fragmentParams = new URLSearchParams(fragment);
            accessToken =
              accessToken || fragmentParams.get("access_token") || "";
            refreshToken =
              refreshToken || fragmentParams.get("refresh_token") || "";
          }
        }

        if (accessToken && refreshToken) {
          // Define a sessão manualmente com os tokens recebidos
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Erro ao definir sessão:", error);
          } else {
            // Sessão definida com sucesso, aguarda um momento e redireciona
            await new Promise((resolve) => setTimeout(resolve, 500));
            router.replace("/(tabs)");
            return;
          }
        }

        // Se não tem tokens, verifica se já existe uma sessão
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          router.replace("/(tabs)");
          return;
        }

        // Aguarda um momento para a sessão ser processada pelo listener
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verifica novamente
        const { data: sessionData2 } = await supabase.auth.getSession();
        if (sessionData2?.session) {
          router.replace("/(tabs)");
        } else {
          // Sem sessão, volta para login
          router.replace("/auth/Login");
        }
      } catch (error) {
        console.error("Erro no callback de autenticação:", error);
        router.replace("/auth/Login");
      }
    };

    handleCallback();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? Colors.dark.background
            : Colors.light.background,
        },
      ]}
    >
      <ActivityIndicator
        size="large"
        color={isDarkMode ? Colors.dark.primary : Colors.light.primary}
      />
      <Text
        style={[
          styles.text,
          {
            color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
          },
        ]}
      >
        Autenticando...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
});
