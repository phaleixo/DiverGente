# DiverGente - Equilibre seus pensamentos

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Sobre o Aplicativo

Equilibre seus pensamentos.

Com o **DiverGente**, você pode registrar suas emoções, tarefas a serem realizadas e também notas de áudio. Tenha um espaço pessoal para organizar seus pensamentos e acompanhar seu bem-estar.

## Privacidade

Sua privacidade é muito importante.

Por isso, todos os dados são salvos **apenas no seu aparelho**, garantindo que você tenha total controle sobre suas informações.

Caso queira, você tem a liberdade de **deletar todos os dados armazenados** no aplicativo a qualquer momento.

<p align="center">
  <img src="./assets/images/splash-icon.png" width="150" alt="Ícone do aplicativo DiverGente">
</p>

## Download apk

https://github.com/phaleixo/DiverGente/releases/download/V1.0/DiverGente-V2.0.apk

## Download Code

1. Clone Repository

   ```
   git clone https://github.com/phaleixo/DiverGente.git
   ```

2. Acess folder

   ```bash
   cd DiverGente
   ```

3. Install dependencies

   ```bash
   npm install
   ```

4. Start the app

   ```bash
    npm start
   ```

## Contato

Desenvolvido por [phaleixo](https://github.com/phaleixo).

[![GitHub](https://img.shields.io/badge/GitHub-Profile-blue?style=flat-square&logo=github)](https://github.com/phaleixo)
[![Email](https://img.shields.io/badge/Email-phaleixo@outlook.com.br-red?style=flat-square&logo=mail)](mailto:phaleixo@outlook.com.br)

## Licença

DiverGente v1.0 licenciado sob a [MIT License](https://opensource.org/licenses/MIT).

---

## Dependências (versões das bibliotecas)

- **dependencies**:

  - `@expo/vector-icons`: ^14.0.2
  - `@react-native-async-storage/async-storage`: 2.1.2
  - `@react-navigation/bottom-tabs`: ^7.2.0
  - `@react-navigation/native`: ^7.0.14
  - `expo`: ^53.0.24
  - `expo-blur`: ~14.1.5
  - `expo-constants`: ~17.1.7
  - `expo-document-picker`: ~13.1.6
  - `expo-file-system`: ~18.1.11
  - `expo-font`: ~13.3.2
  - `expo-haptics`: ~14.1.4
  - `expo-linking`: ~7.1.7
  - `expo-router`: ^5.1.7
  - `expo-sharing`: ~13.1.5
  - `expo-splash-screen`: ~0.30.10
  - `expo-status-bar`: ~2.2.3
  - `expo-symbols`: ~0.4.5
  - `expo-web-browser`: ~14.2.0
  - `react`: 19.0.0
  - `react-native`: ^0.79.6
  - `react-native-calendars`: ^1.1311.0
  - `react-native-reanimated`: ~3.17.4
  - `react-native-safe-area-context`: 5.4.0
  - `react-native-screens`: ~4.11.1
  - `react-native-webview`: 13.13.5

- **devDependencies**:
  - `@babel/core`: ^7.25.2
  - `@types/jest`: ^29.5.12
  - `@types/react`: ~19.0.10
  - `@types/react-native-vector-icons`: ^6.4.18
  - `@types/react-test-renderer`: ^18.3.0
  - `jest`: ^29.2.1
  - `jest-expo`: ^53.0.10
  - `typescript`: ^5.3.3

Observação: para publicar na Google Play é recomendado usar `AAB` (app bundle). Para gerar APK com EAS, use `eas.json` com `android.buildType: "apk"` ou rode `eas build -p android --profile <perfil>`.
