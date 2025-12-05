import React, { useState } from 'react';
import { Image, Text, StyleSheet, ScrollView, Linking, useColorScheme, View, TouchableWithoutFeedback, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import DataBackupRestore from '@/components/DataBackupRestore';
import Title from '@/components/Title';
import ProfileHeader from '@/components/ProfileHeader';
import SignOutButton from '@/components/SignOutButton';


const Config: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = dynamicStyles(isDarkMode);
  
  return (
    
    <SafeAreaView style={{flex: 1, backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background}}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { flexGrow: 1 }]}> 
        <View style={styles.bodyContainer}>
          <Title variant="h3" marginBottom={20}>
            Perfil
          </Title>
          <ProfileHeader size={100} layout="below" />
          <SignOutButton />
        <DataBackupRestore />
        
      
        <Image
          source={require('../../assets/images/icon.png')} 
          style={styles.localImage}
        />
        <Text style={styles.footer}>
          DiverGente v3.0 licenciado sob a MIT License.
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
    padding: 2,
    marginBottom: 80,
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
    marginBottom: 40,
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
  logoutButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
  },
  logoutText: {
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    fontWeight: '600',
  },
  logoutTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
  },
  logoutIconImage: {
    width: 40,
    height: 40,
    borderRadius: 40,
    overflow: 'hidden',
  },
  signOutButton: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
    backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
  },
  signOutText: {
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    fontWeight: '600',
  },
});
export default Config;