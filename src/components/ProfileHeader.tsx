import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const STORAGE_PREFIX = "@profile_image_";

interface ProfileHeaderProps {
  size?: number; // diameter of the avatar in px
  layout?: "left" | "below"; // 'left' = row (name to the right), 'below' = column (name under image)
  containerStyle?: ViewStyle;
  nameStyle?: TextStyle;
  imageStyle?: ImageStyle;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  size = 32,
  layout = "left",
  containerStyle,
  nameStyle,
  imageStyle,
}) => {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { colors } = useTheme();
  const theme = useMemo(
    () => (isDarkMode ? colors.dark : colors.light),
    [isDarkMode, colors]
  );
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const key = STORAGE_PREFIX + user.id;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(key);
        if (saved) setImageUri(saved);
      } catch (e) {
        console.warn("Erro ao carregar imagem de perfil", e);
      }
    })();
  }, [user]);

  if (!user) return null;

  // Pega apenas o primeiro nome
  const fullName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const displayName = fullName.split(" ")[0];

  // Pega a foto do Google (avatar_url ou picture)
  const googleAvatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  // Usa a imagem salva localmente, ou a foto do Google como fallback
  const profileImage = imageUri || googleAvatarUrl;

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Permita acesso às fotos para escolher uma imagem."
        );
        return;
      }

      const mediaTypes = (ImagePicker as any).MediaType?.Images ?? undefined;
      const options: any = {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      };
      if (mediaTypes) options.mediaTypes = mediaTypes;

      const result = await ImagePicker.launchImageLibraryAsync(options);

      // @ts-ignore
      const canceled = result.canceled ?? result.cancelled ?? false;
      if (!canceled) {
        // @ts-ignore
        const uri = result.assets?.[0]?.uri ?? result.uri;
        if (uri) {
          setImageUri(uri as string);
          const key = STORAGE_PREFIX + user.id;
          await AsyncStorage.setItem(key, uri as string);
        }
      }
    } catch (e) {
      console.warn("Erro ao escolher imagem", e);
    }
  };

  const isRow = layout === "left";
  const avatarSize = Math.max(24, size);
  const borderRadius = avatarSize / 2;

  return (
    <View style={[{ alignItems: "center", marginBottom: 4 }, containerStyle]}>
      <TouchableOpacity
        onPress={pickImage}
        style={{
          flexDirection: isRow ? "row" : "column",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}
        activeOpacity={0.8}
      >
        {isRow && layout === "left" ? (
          // name to the left of the avatar
          <>
            <Text
              style={[
                {
                  marginRight: 8,
                  marginTop: 0,
                  color: theme.onSurface,
                  fontWeight: "900",
                  fontSize: Math.max(14, Math.round(avatarSize / 2.6)),
                },
                nameStyle,
              ]}
            >
              {displayName + " "}
            </Text>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={[
                  { width: avatarSize, height: avatarSize, borderRadius },
                  imageStyle,
                ]}
              />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={Math.round(avatarSize)}
                color={theme.onSurface}
              />
            )}
          </>
        ) : (
          // default: avatar then name (useful if layout === 'right' or column)
          <>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={[
                  { width: avatarSize, height: avatarSize, borderRadius },
                  imageStyle,
                ]}
              />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={Math.round(avatarSize)}
                color={theme.onSurface}
              />
            )}
            <Text
              style={[
                {
                  marginLeft: isRow ? 8 : 0,
                  marginTop: isRow ? 0 : 8,
                  color: theme.onSurface,
                  fontWeight: "600",
                  fontSize: Math.max(12, Math.round(avatarSize / 2.6)),
                },
                nameStyle,
              ]}
            >
              {displayName + " "}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeader;
