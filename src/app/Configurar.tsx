import React from 'react';
import { Image, Text, StyleSheet, ScrollView, Linking, useColorScheme, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import DataBackupRestore from '@/components/DataBackupRestore';

const Config: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const styles = dynamicStyles(isDarkMode);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background}}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 6 }]}> 
        <View style={styles.bodyContainer}>
        <DataBackupRestore />
        
        <Text style={styles.title}>Privacidade</Text>
        <Text style={styles.content}>
          Sua privacidade é muito importante.
          {'\n'}
          Por isso todos os dados são salvos apenas no aparelho, e você tem total controle sobre eles.
          {'\n'}
          Caso queira, é possível deletar todos os dados armazenados.
        </Text>
        <Image
          source={require('../assets/images/icon.png')} 
          style={styles.localImage}
        />
        <Text style={styles.footer}>
          DiverGente v1.0 licenciado sob a MIT License.
          {'\n'}
          Desenvolvido por phaleixo.
          {'\n'}
          GitHub: <Text style={styles.link} onPress={() => Linking.openURL('https://github.com/phaleixo')}>https://github.com/phaleixo</Text>
          {'\n'}
          Email: <Text style={styles.link} onPress={() => Linking.openURL('mailto:phaleixo@outlook.com.br')}>phaleixo@outlook.com.br</Text>
          {'\n'}
        </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Função para gerar estilos dinâmicos
const dynamicStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
    
  },
bodyContainer: {
  flex: 1,
  backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
  padding: 20,
  
},

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop:50,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
  },
  link: {
    color: isDarkMode ? Colors.dark.primary : Colors.light.primary,
  },
  localImage: {
    width: 96,
    height: 96,
    borderRadius: 10,
    marginBottom: 20,
    alignContent: 'center',
    alignSelf: 'center',
  },
});
export default Config;