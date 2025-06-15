import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { generateRecipe } from '../../config/gemini';

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
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      const receitaGerada = await generateRecipe(listaIngredientes, parseInt(tempo));
      setReceitas([{
        id: '1',
        ...receitaGerada
      }]);
    } catch (error) {
      console.error('Erro ao gerar receita:', error);
      Alert.alert('Erro', 'Não foi possível gerar a receita. Tente novamente.');
      setReceitas([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      enableOnAndroid={true}
      enableAutomaticScroll={Platform.OS === 'ios'}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Sugestão Rápida</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Adicionar ingrediente"
          value={ingrediente}
          onChangeText={setIngrediente}
          onSubmitEditing={adicionarIngrediente}
          returnKeyType="done"
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
        <Text style={styles.subtitle}>Tempo Disponível:</Text>
        <TextInput
          style={[styles.input, styles.timeInput]}
          placeholder="Minutos"
          value={tempo}
          onChangeText={setTempo}
          keyboardType="numeric"
          returnKeyType="done"
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
          <Text style={styles.buttonText}>Sugerir Receita</Text>
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
                    params: { recipe: JSON.stringify(item) }
                  })}
                >
                  <Text style={styles.buttonText}>Ver Receita Completa</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </>
      )}
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
    marginTop: 10,
    marginBottom: 0,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});
