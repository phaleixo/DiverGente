import React from 'react';
import { Image, Text, StyleSheet, ScrollView, Linking, useColorScheme, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import DataBackupRestore from '@/components/DataBackupRestore';
import Title from '@/components/Title';

const Config: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const styles = dynamicStyles(isDarkMode);

  return (
    
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background}}>
      <ScrollView contentContainerStyle={[styles.container]}> 
        <View style={styles.bodyContainer}>
          <Title variant="h3" marginBottom={10}>
            Configurações e Backup
          </Title>
        <DataBackupRestore />
        
        <Text style={styles.title}>Privacidade</Text>
        <Text style={styles.content}>
          Todos os dados são salvos apenas no aparelho, e você tem total controle sobre eles.
          Caso queira, é possível deletar todos os dados armazenados.
        </Text>
        <Image
          source={require('../../assets/images/icon.png')} 
          style={styles.localImage}
        />
        <Text style={styles.footer}>
          DiverGente v2.0 licenciado sob a MIT License.
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
    padding: 2,
    marginBottom: 40,
    
  },
bodyContainer: {
  flex: 1,
  backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
  padding: 20,
  
},

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop:0,
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
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