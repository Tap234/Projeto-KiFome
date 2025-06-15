import { useRouter } from 'expo-router';
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
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { generateRecipe } from '../../config/gemini';
import QuickSuggestionHistoryService, { QuickSuggestion } from '../../services/QuickSuggestionHistoryService';
import QuickSuggestionHistory from '../components/QuickSuggestionHistory';
import TemporaryShoppingList from '../components/TemporaryShoppingList';

type Receita = {
  id: string;
  titulo: string;
  tempoPreparo: number;
  descricao: string;
  passos?: string[];
};

export default function Sugestao() {
  const router = useRouter();
  const [ingrediente, setIngrediente] = useState('');
  const [listaIngredientes, setListaIngredientes] = useState<string[]>([]);
  const [tempo, setTempo] = useState('');
  const [numeroPessoas, setNumeroPessoas] = useState('1');
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [history, setHistory] = useState<QuickSuggestion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Carregar histórico ao montar o componente
  useEffect(() => {
    loadHistory();
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

  async function sugerirReceita() {
    if (listaIngredientes.length === 0) {
      Alert.alert('Erro', 'Por favor, adicione alguns ingredientes primeiro!');
      return;
    }

    if (!tempo || parseInt(tempo) <= 0) {
      Alert.alert('Erro', 'Por favor, informe um tempo válido!');
      return;
    }

    if (!numeroPessoas || parseInt(numeroPessoas) <= 0) {
      Alert.alert('Erro', 'Por favor, informe um número válido de pessoas!');
      return;
    }

    setLoading(true);

    try {
      const receitaGerada = await generateRecipe(listaIngredientes, parseInt(tempo), parseInt(numeroPessoas));
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
        servings: parseInt(numeroPessoas) // Adicionando número de pessoas ao histórico
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
        onPress={sugerirReceita}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Gerar Sugestão</Text>
        )}
      </TouchableOpacity>

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

      {/* Modal do Histórico */}
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

      {/* Modal da Lista de Compras */}
      <Modal
        visible={showShoppingList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShoppingList(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TemporaryShoppingList
              ingredients={listaIngredientes}
              onClose={() => setShowShoppingList(false)}
            />
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
