import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { generateRecipe } from '../../config/gemini';
import QuickSuggestionHistoryService, { QuickSuggestion } from '../../services/QuickSuggestionHistoryService';
import WitSpeechService from '../../services/WitSpeechService';
import QuickSuggestionHistory from '../components/QuickSuggestionHistory';

type Receita = {
  id: string;
  titulo: string;
  tempoPreparo: number;
  descricao: string;
  passos?: string[];
};

type InputMode = 'manual' | 'chat';

type ChatStep = {
  question: string;
  placeholder: string;
  keyboardType: 'default' | 'numeric';
  validate: (value: string) => string | null;
};

const chatSteps: ChatStep[] = [
  {
    question: 'Quais ingredientes você tem em casa? (separe por vírgulas)',
    placeholder: 'Ex: arroz, feijão, carne moída',
    keyboardType: 'default',
    validate: (value) => {
      if (!value.trim()) {
        return 'Por favor, informe pelo menos um ingrediente.';
      }
      const ingredients = value.split(',').map(i => i.trim()).filter(Boolean);
      if (ingredients.length === 0) {
        return 'Por favor, informe pelo menos um ingrediente válido.';
      }
      return null;
    }
  },
  {
    question: 'Quanto tempo você tem para a refeição ficar pronta (em minutos)?',
    placeholder: 'Ex: 30',
    keyboardType: 'numeric',
    validate: (value) => {
      if (!value || isNaN(Number(value)) || Number(value) <= 0) {
        return 'Por favor, informe um tempo válido em minutos.';
      }
      return null;
    }
  },
  {
    question: 'Quantas pessoas vão comer?',
    placeholder: 'Ex: 2',
    keyboardType: 'numeric',
    validate: (value) => {
      if (!value || isNaN(Number(value)) || Number(value) <= 0) {
        return 'Por favor, informe um número válido de pessoas.';
      }
      return null;
    }
  }
];

export default function Sugestao() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [step, setStep] = useState(1);
  const [chatIngredients, setChatIngredients] = useState('');
  const [chatPrepTime, setChatPrepTime] = useState('');
  const [chatPeopleCount, setChatPeopleCount] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Estados existentes
  const [ingrediente, setIngrediente] = useState('');
  const [listaIngredientes, setListaIngredientes] = useState<string[]>([]);
  const [tempo, setTempo] = useState('');
  const [numeroPessoas, setNumeroPessoas] = useState('1');
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<QuickSuggestion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  
  // Carregar histórico ao montar o componente
  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    // Solicitar permissões ao montar o componente
    const setupPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permissão Necessária',
            'Precisamos da permissão do microfone para usar o reconhecimento de voz.'
          );
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      } catch (error) {
        console.error('Erro ao solicitar permissões:', error);
      }
    };

    setupPermissions();

    // Limpar recursos ao desmontar
    return () => {
      if (recording) {
        try {
          recording.stopAndUnloadAsync();
          setRecording(null);
        } catch (error) {
          console.error('Erro ao limpar gravação:', error);
        }
      }
    };
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      // TODO: Substituir '123' pelo userId real do usuário logado
      const suggestions = await QuickSuggestionHistoryService.getHistory('123');
      setHistory(suggestions);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico de sugestões.');
    } finally {
      setLoadingHistory(false);
    }
  };

  function adicionarIngrediente() {
    if (ingrediente.trim() !== '') {
      setListaIngredientes(prev => [...prev, ingrediente.trim()]);
      setIngrediente('');
    }
  }

  function removerIngrediente(index: number) {
    setListaIngredientes(prev => prev.filter((_, i) => i !== index));
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = async () => {
    try {
      // Verificar se já existe uma gravação ativa
      if (recording) {
        console.warn('Já existe uma gravação ativa!');
        return;
      }

      // Verificar permissões
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos da permissão do microfone para usar o reconhecimento de voz.');
        return;
      }

      // Garantir que o modo de áudio está configurado corretamente
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Feedback tátil e sonoro ao iniciar
      Vibration.vibrate(100);
      await Speech.speak('Pode falar', {
        language: 'pt-BR',
        pitch: 1,
        rate: 0.9,
      });

      setIsListening(true);
      setTranscript('Ouvindo...');

      // Configurar e iniciar gravação com formato compatível com Wit.ai
      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      });
      setRecording(newRecording);

      // Parar a gravação após 5 segundos
      setTimeout(stopListening, 5000);

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o reconhecimento de voz. Tente novamente.');
      setIsListening(false);
      setTranscript('');
      // Garantir que o estado de gravação está limpo em caso de erro
      setRecording(null);
    }
  };

  const stopListening = async () => {
    try {
      if (!isListening || !recording) return;

      // Feedback tátil ao parar
      Vibration.vibrate(50);
      setTranscript('Processando...');

      // Parar gravação e obter URI
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Limpar o estado de gravação imediatamente após parar
      setRecording(null);
      setIsListening(false);

      if (uri) {
        try {
          // Enviar para o Wit.ai
          const witService = WitSpeechService.getInstance();
          const recognizedText = await witService.recognizeSpeech(uri);

          // Falar a resposta reconhecida
          await Speech.speak('Entendi: ' + recognizedText, {
            language: 'pt-BR',
            pitch: 1,
            rate: 0.9,
          });

          setTranscript(recognizedText);
          setCurrentValue(recognizedText);
        } catch (error) {
          console.error('Erro ao processar áudio:', error);
          Alert.alert('Erro', 'Não foi possível processar o áudio. Tente novamente.');
          setTranscript('');
        } finally {
          // Limpar o arquivo de gravação
          try {
            await FileSystem.deleteAsync(uri);
          } catch (error) {
            console.error('Erro ao limpar arquivo de gravação:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      Alert.alert('Erro', 'Não foi possível processar o áudio. Tente novamente.');
      setTranscript('');
    } finally {
      // Garantir que os estados estão limpos mesmo em caso de erro
      setIsListening(false);
      setRecording(null);
    }
  };

  const getCurrentValue = () => {
    switch (step) {
      case 1:
        return chatIngredients;
      case 2:
        return chatPrepTime;
      case 3:
        return chatPeopleCount;
      default:
        return '';
    }
  };

  const setCurrentValue = (value: string) => {
    switch (step) {
      case 1:
        setChatIngredients(value);
        break;
      case 2:
        setChatPrepTime(value);
        break;
      case 3:
        setChatPeopleCount(value);
        break;
    }
  };

  const handleChatNext = () => {
    const currentStep = chatSteps[step - 1];
    const currentValue = getCurrentValue();
    const error = currentStep.validate(currentValue);

    if (error) {
      Alert.alert('Erro', error);
      return;
    }

    if (step === 3) {
      // Preparar dados para gerar receita
      const ingredients = chatIngredients.split(',').map(i => i.trim()).filter(Boolean);
      sugerirReceita(ingredients, parseInt(chatPrepTime), parseInt(chatPeopleCount));
    } else {
      setStep(prev => prev + 1);
      setTranscript('');
    }
  };

  const handleChatInputSubmit = () => {
    if (!loading) {
      handleChatNext();
    }
  };

  async function sugerirReceita(ingredientsList?: string[], prepTime?: number, peopleCount?: number) {
    const ingredients = ingredientsList || listaIngredientes;
    const time = prepTime || parseInt(tempo);
    const people = peopleCount || parseInt(numeroPessoas);

    if (ingredients.length === 0) {
      Alert.alert('Erro', 'Por favor, adicione alguns ingredientes primeiro!');
      return;
    }

    if (!time || time <= 0) {
      Alert.alert('Erro', 'Por favor, informe um tempo válido!');
      return;
    }

    if (!people || people <= 0) {
      Alert.alert('Erro', 'Por favor, informe um número válido de pessoas!');
      return;
    }

    setLoading(true);

    try {
      const receitaGerada = await generateRecipe(ingredients, time, people);
      const novaReceita = {
        id: '1',
        ...receitaGerada
      };
      setReceitas([novaReceita]);

      // Salvar no histórico
      await QuickSuggestionHistoryService.addSuggestion('123', { // TODO: Substituir '123' pelo userId real
        title: novaReceita.titulo,
        ingredients: novaReceita.ingredientes,
        steps: novaReceita.passos,
        checkedItems: {},
        servings: people
      });

      // Recarregar histórico
      await loadHistory();
    } catch (error) {
      console.error('Erro ao gerar receita:', error);
      Alert.alert('Erro', 'Não foi possível gerar a receita. Tente novamente.');
      setReceitas([]);
    } finally {
      setLoading(false);
    }
  }

  const navigateToHistory = () => {
    router.push({
      pathname: '/tudo/historico',
      params: { suggestions: JSON.stringify(history) }
    });
  };

  const resetChat = () => {
    setStep(1);
    setChatIngredients('');
    setChatPrepTime('');
    setChatPeopleCount('');
    setTranscript('');
    setIsListening(false);
  };

  const switchMode = (mode: InputMode) => {
    setInputMode(mode);
    if (mode === 'chat') {
      resetChat();
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      enableOnAndroid={true}
      enableAutomaticScroll={Platform.OS === 'ios'}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={navigateToHistory}
          disabled={loadingHistory}
        >
          {loadingHistory ? (
            <ActivityIndicator size="small" color="#f4511e" />
          ) : (
            <Text style={styles.historyButtonText}>Histórico</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Sugestão Rápida</Text>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, inputMode === 'manual' && styles.modeButtonActive]}
          onPress={() => switchMode('manual')}
        >
          <Text style={[styles.modeButtonText, inputMode === 'manual' && styles.modeButtonTextActive]}>
            Modo Manual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, inputMode === 'chat' && styles.modeButtonActive]}
          onPress={() => switchMode('chat')}
        >
          <Text style={[styles.modeButtonText, inputMode === 'chat' && styles.modeButtonTextActive]}>
            Modo Chat
          </Text>
        </TouchableOpacity>
      </View>

      {inputMode === 'manual' ? (
        <>
          <Text style={styles.subtitle}>Adicione os ingredientes disponíveis:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite um ingrediente"
              value={ingrediente}
              onChangeText={setIngrediente}
              onSubmitEditing={adicionarIngrediente}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={adicionarIngrediente}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>

          {listaIngredientes.length > 0 && (
            <View style={styles.ingredientesContainer}>
              <Text style={styles.subtitle}>Seus Ingredientes:</Text>
              {listaIngredientes.map((item, index) => (
                <View key={index} style={styles.ingredienteItem}>
                  <Text style={styles.ingredienteText}>• {item}</Text>
                  <TouchableOpacity
                    onPress={() => removerIngrediente(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.timeContainer}>
            <Text style={styles.subtitle}>Tempo máximo de preparo (minutos):</Text>
            <TextInput
              style={[styles.input, styles.timeInput]}
              placeholder="Ex: 30"
              value={tempo}
              onChangeText={setTempo}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.subtitle}>Quantas pessoas vão comer?</Text>
            <TextInput
              style={[styles.input, styles.timeInput]}
              placeholder="Ex: 2"
              value={numeroPessoas}
              onChangeText={setNumeroPessoas}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => sugerirReceita()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Gerar Sugestão</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.chatContainer}>
          <View style={styles.chatBox}>
            <Text style={styles.chatQuestion}>{chatSteps[step - 1].question}</Text>
            
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptText}>
                {transcript || 'Toque e segure o botão do microfone para falar...'}
              </Text>
            </View>

            <TextInput
              style={styles.chatInput}
              value={getCurrentValue()}
              onChangeText={setCurrentValue}
              placeholder={chatSteps[step - 1].placeholder}
              placeholderTextColor="#999"
              keyboardType={chatSteps[step - 1].keyboardType}
              multiline={step === 1}
              onSubmitEditing={handleChatInputSubmit}
              returnKeyType={step === 3 ? 'done' : 'next'}
            />

            <TouchableOpacity
              style={[styles.micButton, isListening && styles.micButtonActive]}
              onPressIn={startListening}
              onPressOut={stopListening}
              disabled={loading || recording !== null}
            >
              <View style={[styles.micIcon, isListening && styles.micIconActive]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleChatNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {step === 3 ? 'Gerar Sugestão' : 'Próximo'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {receitas.length > 0 && (
        <>
          <Text style={styles.resultadoTitle}>🍽 Receitas Sugeridas:</Text>
          {receitas.map(item => (
            <View key={item.id} style={styles.receitaContainer}>
              <Text style={styles.receitaTitle}>{item.titulo}</Text>
              {item.tempoPreparo > 0 && (
                <Text style={styles.receitaInfo}>Tempo de preparo: {item.tempoPreparo} min</Text>
              )}
              <Text style={styles.receitaText}>{item.descricao}</Text>
              {item.titulo !== 'Erro' && item.passos && (
                <TouchableOpacity
                  style={[styles.button, styles.verReceitaButton]}
                  onPress={() => router.push({
                    pathname: '/tudo/passoapasso',
                    params: {
                      recipe: JSON.stringify({
                        ...item,
                        servings: parseInt(numeroPessoas)
                      })
                    }
                  })}
                >
                  <Text style={styles.buttonText}>Ver Receita Completa</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </>
      )}

      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {loadingHistory ? (
              <ActivityIndicator size="large" color="#f4511e" />
            ) : (
              <QuickSuggestionHistory
                suggestions={history}
                onClose={() => setShowHistory(false)}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  historyButton: {
    backgroundColor: '#f4511e20',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  historyButtonText: {
    color: '#f4511e',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#f4511e',
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f4511e',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#f4511e',
  },
  modeButtonText: {
    fontSize: 16,
    color: '#f4511e',
    fontWeight: 'bold',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  chatContainer: {
    marginTop: 20,
  },
  chatBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  chatQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  transcriptContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    minHeight: 60,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  transcriptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  chatInput: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 50,
    marginBottom: 15,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  micButtonActive: {
    backgroundColor: '#e04000',
    transform: [{ scale: 1.1 }],
    borderWidth: 3,
    borderColor: '#fff',
  },
  micIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  micIconActive: {
    backgroundColor: '#ff9c9c',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginRight: 10,
  },
  timeInput: {
    marginRight: 0,
    textAlign: 'center',
    width: '50%',
  },
  addButton: {
    backgroundColor: '#f4511e',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientesContainer: {
    marginBottom: 20,
  },
  ingredienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  ingredienteText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    color: '#f4511e',
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultadoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  receitaContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  receitaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  receitaInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  receitaText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  verReceitaButton: {
    marginBottom: 0,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
  },
});
