# DiverGente - Organize sua vida

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-green.svg)](https://reactnative.dev/)

<p align="center">
  <img src="./src/assets/images/splash-icon.png" width="150" alt="Ícone do aplicativo DiverGente">
</p>

## 📱 Sobre o Aplicativo

**DiverGente** é um aplicativo essencial com rotinas para organizar sua vida. Com ele você pode:

- 📅 **Calendário interativo** com visualização de eventos e feriados brasileiros
- ✅ **Lista de tarefas** para organizar seu dia a dia
- 📝 **Diário pessoal** para registrar seus pensamentos e emoções
- 🎯 **Tomada de decisões** com auxílio visual
- 🎨 **Temas personalizáveis** (claro, escuro e variações de cores)

## ✨ Funcionalidades

### 🔐 Autenticação

- Login com **email e senha**
- Login com **Google** (OAuth)
- **Autenticação biométrica** (digital/FaceID)
- Recuperação de senha por email

### 📅 Calendário

- Visualização mensal com eventos
- Marcação de **feriados brasileiros** (pode ser ativado/desativado)
- Adicionar eventos personalizados com cores

### ✅ Tarefas

- Criar, editar e excluir tarefas
- Marcar tarefas como concluídas
- Visualização das tarefas do dia na tela inicial

### 📝 Diário

- Registrar entradas diárias
- Espaço pessoal para reflexões

### 🎯 Decisões

- Ferramenta para auxiliar na tomada de decisões

### ⚙️ Configurações

- **Perfil do usuário** com foto (do Google ou personalizada)
- **Seletor de temas** (múltiplas opções de cores)
- **Tema claro/escuro** automático ou manual
- **Excluir conta** com confirmação segura (senha ou Google)

## 🔒 Privacidade e Segurança

- Dados sincronizados com **Supabase** (backend seguro)
- Autenticação segura com **SecureStore**
- Opção de login biométrico
- **Exclusão completa de conta** disponível

## 📥 Download

### APK (Android)

[Baixar última versão](https://github.com/phaleixo/DiverGente/releases)

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI

### Instalação

1. Clone o repositório

   ```bash
   git clone https://github.com/phaleixo/DiverGente.git
   ```

2. Acesse a pasta

   ```bash
   cd DiverGente
   ```

3. Instale as dependências

   ```bash
   npm install
   ```

4. Configure as variáveis de ambiente

   ```bash
   cp .env.example .env.local
   # Edite .env.local com suas credenciais do Supabase
   ```

5. Inicie o app
   ```bash
   npm start
   ```

### Scripts disponíveis

- `npm start` - Inicia o Expo
- `npm run android` - Inicia no Android
- `npm run ios` - Inicia no iOS
- `npm run web` - Inicia na web
- `npm test` - Executa os testes
- `npm run lint` - Verifica o código

## 🏗️ Tecnologias

- **Framework**: [Expo](https://expo.dev/) SDK 54
- **UI**: [React Native](https://reactnative.dev/) 0.81
- **Navegação**: [Expo Router](https://expo.github.io/router/)
- **Backend**: [Supabase](https://supabase.com/) (Auth + Database)
- **Calendário**: [react-native-calendars](https://github.com/wix/react-native-calendars)
- **Animações**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## 📦 Principais Dependências

| Pacote                    | Versão    | Descrição                     |
| ------------------------- | --------- | ----------------------------- |
| expo                      | ~54.0.27  | Framework principal           |
| @supabase/supabase-js     | ^2.86.0   | Cliente Supabase              |
| expo-router               | ~6.0.17   | Navegação baseada em arquivos |
| expo-local-authentication | ~17.0.8   | Biometria                     |
| expo-auth-session         | ~7.0.10   | OAuth (Google)                |
| expo-secure-store         | ~15.0.8   | Armazenamento seguro          |
| react-native-calendars    | ^1.1311.0 | Componente de calendário      |

## 👤 Contato

Desenvolvido por [phaleixo](https://github.com/phaleixo)

[![GitHub](https://img.shields.io/badge/GitHub-phaleixo-181717?style=flat-square&logo=github)](https://github.com/phaleixo)
[![Email](https://img.shields.io/badge/Email-phaleixo@outlook.com.br-0078D4?style=flat-square&logo=microsoft-outlook)](mailto:phaleixo@outlook.com.br)

## 📄 Licença

DiverGente v3.1.0 licenciado sob a [MIT License](https://opensource.org/licenses/MIT).

---

<p align="center">
  Feito por <a href="https://github.com/phaleixo">phaleixo</a>
</p>
  - `@types/react-test-renderer`: ^18.3.0
  - `jest`: ^29.2.1
  - `jest-expo`: ^53.0.10
  - `typescript`: ^5.3.3

Observação: para publicar na Google Play é recomendado usar `AAB` (app bundle). Para gerar APK com EAS, use `eas.json` com `android.buildType: "apk"` ou rode `eas build -p android --profile <perfil>`.
