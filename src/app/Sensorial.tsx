import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Colors } from '@/constants/Colors';


// Definindo os vídeos do YouTube
const videoList = [
  {
    id: '1',
    title: '',
    url: 'https://www.youtube.com/embed/VLYyPHrwtXg',
  },
  {
    id: '2',
    title: '',
    url: 'https://www.youtube.com/embed/9rJbmCvI19I',
  },
];

export default function CalmaSensorialScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = useMemo(() => dynamicStyles(isDarkMode), [isDarkMode]);

  // Definir cores do header
  const headerBg = isDarkMode ? Colors.dark.surface : Colors.light.surface;
  const headerColor = isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface;

  const renderItem = ({ item }: { item: typeof videoList[0] }) => (
    <View style={styles.videoContainer}>
      <Text style={styles.videoTitle}>{item.title}</Text>
      <WebView
        style={styles.video}
        source={{ uri: item.url }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{
        title: 'Calma Sensorial',
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: headerColor,
        headerTitleStyle: { color: headerColor },
      }} />
      <View style={styles.container}>
        <FlatList
          data={videoList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </>
  );
}

const dynamicStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
      paddingHorizontal: 15,
      marginTop: 0,
    },

    listContent: {
      paddingBottom: 20,
    },
    videoContainer: {
      marginTop: 20,
      marginBottom: 20,
      borderRadius: 15,
      overflow: 'hidden',
      backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
      padding: 10,
      elevation: 2,
      shadowColor: isDarkMode ? Colors.dark.shadow : Colors.light.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    videoTitle: {
      fontSize: 18,
      color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
      marginBottom: 10,
      fontWeight: '600',
    },
    video: {
      width: '100%',
      height: 200,
    },
  });
