import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList } from 'react-native';
import { WebView } from 'react-native-webview';


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
    <View style={styles.container}>
      <FlatList
        data={videoList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const dynamicStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#0a080d' : '#F5F5F5',
      paddingHorizontal: 15,
      paddingTop: 60,
    },
    header: {
      fontSize: 26,
      fontWeight: 'bold',
      color: isDarkMode ? '#095BC0' : '#2786C6',
      marginBottom: 20,
      textAlign: 'center',
    },
    listContent: {
      paddingBottom: 20,
    },
    videoContainer: {
      marginBottom: 20,
      borderRadius: 15,
      overflow: 'hidden',
      backgroundColor: isDarkMode ? '#151718' : '#FFFFFF',
      padding: 10,
      elevation: 2,
      shadowColor: isDarkMode ? '#000' : '#888',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    videoTitle: {
      fontSize: 18,
      color: isDarkMode ? '#f8fafc' : '#1e293b',
      marginBottom: 10,
      fontWeight: '600',
    },
    video: {
      width: '100%',
      height: 200,
    },
  });
