import React from 'react';
import { Image, Text, StyleSheet, ScrollView, Linking, useColorScheme, View } from 'react-native';

const Info: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = dynamicStyles(isDarkMode);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.bodyContainer}>
        <Text style={styles.title}>Sobre o Aplicativo</Text>
        <Text style={styles.content}>
          Equilibre seus pensamentos.
          {'\n'}
          Com o DiverGente, é possível registrar suas emoções, tarefas a serem realizadas e também notas de áudio.
        </Text>
        
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
  backgroundColor: isDarkMode ? '#060606' : '#F5F5F5',
  padding: 20,
  
},

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop:50,
    color: isDarkMode ? '#FFFFFF' : '#000000',
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
    color: isDarkMode ? '#CCCCCC' : '#333333',
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    color: isDarkMode ? '#CCCCCC' : '#333333',
  },
  link: {
    color: isDarkMode ? '#80D8FF' : '#007BFF',
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
export default Info;