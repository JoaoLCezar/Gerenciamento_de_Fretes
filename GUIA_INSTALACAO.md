# 🚗 Gerenciamento de Fretes - Guia de Instalação e Uso

## 📋 Índice
1. [Requisitos](#requisitos)
2. [Instalação Rápida](#instalação-rápida)
3. [Configuração do Firebase](#configuração-do-firebase)
4. [Iniciando a Aplicação](#iniciando-a-aplicação)
5. [Testando no Emulador](#testando-no-emulador)
6. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** (com npm 9+)
  - Baixe em: https://nodejs.org/ (versão LTS)
  - Verificar: `node --version` e `npm --version`

- **Git** (já deve estar instalado)
  - Verificar: `git --version`

- **Android Studio** (para emulador Android)
  - Baixe em: https://developer.android.com/studio
  - IMPORTANTE: Instale também o Android SDK e criar um AVD (emulador)
  - Alternativa: Use Expo Go no celular para testes mais rápidos

---

## ⚡ Instalação Rápida

### Opção 1: Usando Script (Windows)
```
1. Abra a pasta do projeto em Windows Explorer
2. Clique com botão direito em "instalar.bat"
3. Escolha "Executar como administrador"
4. Aguarde a instalação completar
```

### Opção 2: Manual via Terminal
```bash
# Abra o PowerShell/CMD na pasta do projeto
cd c:\Users\joaov\OneDrive\Documentos\GitHub\Gerenciamento_de_Fretes

# Instale as dependências
npm install

# (Opcional) Instale Expo CLI globalmente
npm install -g expo-cli
```

---

## 🔐 Configuração do Firebase

### Passo 1: Criar Projeto Firebase

1. Acesse https://console.firebase.google.com/
2. Clique em "Criar projeto"
3. Preencha:
   - Nome do projeto: ex. "Gerenciamento-Fretes"
   - Aceite os termos
   - Clique "Criar projeto" e aguarde

### Passo 2: Criar App Web

1. Na página do projeto, clique em "</>" (web)
2. Nome do app: "Gerenciamento de Fretes Web"
3. Marque "Também configure o Hosting do Firebase"
4. Clique "Registrar app"
5. Copie o config:
```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-xxxxx",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### Passo 3: Atualizar arquivo de configuração

Abra `src/services/firebaseConfig.ts` e substitua:

```typescript
const firebaseConfig = {
  apiKey: "COPIE_DO_FIREBASE_AQUI",
  authDomain: "COPIE_DO_FIREBASE_AQUI",
  projectId: "COPIE_DO_FIREBASE_AQUI",
  storageBucket: "COPIE_DO_FIREBASE_AQUI",
  messagingSenderId: "COPIE_DO_FIREBASE_AQUI",
  appId: "COPIE_DO_FIREBASE_AQUI"
};
```

### Passo 4: Habilitar Firestore

1. No console Firebase, clique em "Firestore Database"
2. Clique "Criar banco de dados"
3. **Modo de início**: Escolha "Iniciar no modo teste"
   - Modo teste = Sem autenticação (para desenvolvimento)
4. **Localização**: Escolha mais próxima (ex. "South America - São Paulo")
5. Clique "Criar"
6. Aguarde o banco ser criado

### Passo 5: Criar Coleção

1. Clique em "+ Iniciar coleção"
2. Nome: `fretes`
3. Clique "Próximo"
4. ID do documento: Deixe "ID automático" marcado
5. Clique "Salvar"

✅ Pronto! Firebase está configurado.

---

## 🚀 Iniciando a Aplicação

### Opção 1: Expo Go (Recomendado para testes rápidos)

```bash
# No terminal, na pasta do projeto
npm start

# Será exibido um QR code no terminal
# Abra o Expo Go no seu celular/emulador e escaneie o QR code
```

### Opção 2: Emulador Android

**Pré-requisito**: Android Studio instalado com emulador configurado

```bash
# Certifique-se de que há um emulador Android aberto

# Execute:
npm run android

# OU use:
expo start --android
```

### Opção 3: Emulador iOS (apenas macOS)

```bash
npm run ios
```

---

## 📱 Testando no Emulador Android

### Se você não tem Android Studio instalado:

1. **Instale Android Studio**: https://developer.android.com/studio
2. Abra Android Studio
3. Clique em "More Actions" → "Virtual Device Manager"
4. Clique "Create device"
5. Selecione um modelo (ex: Pixel 4)
6. Clique "Next" até finalizar
7. Clique o triângulo "Play" para iniciar o emulador

### Usando Expo Go (mais fácil):

1. Abra Google Play Store no emulador Android
2. Procure por "Expo Go"
3. Instale
4. Execute `npm start` no seu PC
5. Escaneie o QR code com o Expo Go

---

## ✅ Testando a Aplicação

### Na tela inicial (Dashboard):
- Você verá 4 cards com estatísticas
- Se não há fretes, mostrará 0

### Na aba "Fretes":
1. Clique em "+ Novo frete"
2. Preencha os dados:
   - Data: 2024-01-30 (formato AAAA-MM-DD)
   - Origem: ex. "São Paulo"
   - Destino: ex. "Rio de Janeiro"
   - Valor: ex. 1500
   - Observações: opcional
3. Clique "Salvar frete"

### Testando Sincronização:
1. Com internet: Frete será sincronizado automaticamente
   - Você verá "Sincronizado" no card
2. Sem internet: Frete fica com status "Offline"
   - Quando voltar online, sincroniza automaticamente
3. Clique em "Sincronizar" para forçar manualmente

---

## 🔍 Troubleshooting

### Erro: "npm: comando não encontrado"
**Solução**: Node.js não está instalado ou não está no PATH
```bash
# Instale Node.js de https://nodejs.org/
# Reinicie o terminal e tente novamente
node --version  # Deve funcionar agora
```

### Erro: "firebaseConfig.ts not found"
**Solução**: O arquivo foi criado automaticamente, mas verifique:
```bash
# Certifique-se de que o arquivo existe:
ls src/services/firebaseConfig.ts

# Se não existir:
npm install
```

### Erro: "Cannot find module 'firebase'"
**Solução**: Reinstale as dependências
```bash
rm -r node_modules package-lock.json
npm install
```

### Erro: "No Android device found"
**Solução**: 
```bash
# Liste dispositivos:
adb devices

# Se vazio, inicie o emulador:
emulator -list-avds  # Lista emuladores
emulator -avd <nome_emulador>  # Inicia
```

### App abre mas está em branco
**Solução**: Aguarde mais alguns segundos, o Expo está compilando
- Se persistir, verifique erros no terminal

### Não consegue sincronizar com Firebase
**Solução**:
1. Verifique se firebaseConfig.ts tem credenciais corretas
2. Verifique se Firestore está habilitado
3. Verifique se a coleção "fretes" foi criada
4. Verifique conexão de internet
5. Abra o console do Expo para ver erros detalhados

---

## 📚 Funcionalidades Principais

### ✅ Dashboard
- Total faturado em todos os fretes
- Quantidade de fretes registrados
- Faturamento do mês atual
- Quantidade no mês atual

### ✅ Gerenciamento de Fretes
- Criar novo frete
- Listar todos os fretes
- Ver status de sincronização
- Atualizar dados
- Deletar fretes

### ✅ Banco de Dados
- **Local (SQLite)**: Funciona offline
- **Nuvem (Firebase)**: Backup automático quando online
- **Sincronização automática**: Detecta internet e sincroniza

---

## 🛡️ Notas de Segurança

⚠️ **IMPORTANTE**: A configuração atual é apenas para desenvolvimento!

Para produção, você deve:
1. Implementar autenticação Firebase
2. Configurar regras de Firestore para proteger dados
3. Usar variáveis de ambiente para credenciais
4. Habilitar CORS apropriadamente

---

## 📞 Suporte

Se tiver problemas:
1. Verifique este guia
2. Consulte [SETUP_REPORT.md](./SETUP_REPORT.md)
3. Verifique [FIREBASE_SETUP.txt](./FIREBASE_SETUP.txt)
4. Consulte a documentação do Expo: https://docs.expo.dev/

---

**Versão**: 1.0.0  
**Data**: 30 de janeiro de 2026  
**Documentação criada para auxílio inicial**
