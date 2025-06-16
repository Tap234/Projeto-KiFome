import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserPreferences } from '../../types/user';
import { checkAuthStatus } from '../_layout';

const STORAGE_KEY = '@user_preferences';

export default function Perfil() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    mealPreferences: {
      includeLunch: true,
      includeDinner: true,
      peopleCount: 1,
    },
    dietaryRestrictions: '',
    averagePreparationTime: 30,
  });

  // Estados locais para os campos
  const [peopleCountText, setPeopleCountText] = useState(preferences.mealPreferences.peopleCount.toString());
  const [prepTimeText, setPrepTimeText] = useState(preferences.averagePreparationTime.toString());
  const [novaRestricao, setNovaRestricao] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPrefs = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        // Garante que dietaryRestrictions seja sempre uma string
        if (typeof prefs.dietaryRestrictions !== 'string') {
          prefs.dietaryRestrictions = '';
        }
        setPreferences(prefs);
        setPeopleCountText(prefs.mealPreferences.peopleCount.toString());
        setPrepTimeText(prefs.averagePreparationTime.toString());
      }
    } catch (error) {
      console.error('❌ Erro ao carregar preferências:', error);
    }
  };

  const savePreferences = async (newPrefs: UserPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      setPreferences(newPrefs);
    } catch (error) {
      console.error('❌ Erro ao salvar preferências:', error);
      Alert.alert('Erro', 'Não foi possível salvar suas preferências.');
    }
  };

  const handlePeopleCountChange = (text: string) => {
    // Remove caracteres não numéricos
    const cleanText = text.replace(/[^0-9]/g, '');
    setPeopleCountText(cleanText);

    // Atualiza as preferências apenas se houver um número válido
    if (cleanText) {
      const count = parseInt(cleanText);
      savePreferences({
        ...preferences,
        mealPreferences: {
          ...preferences.mealPreferences,
          peopleCount: count,
        }
      });
    }
  };

  const handlePrepTimeChange = (text: string) => {
    // Remove caracteres não numéricos
    const cleanText = text.replace(/[^0-9]/g, '');
    setPrepTimeText(cleanText);

    // Atualiza as preferências apenas se houver um número válido
    if (cleanText) {
      const time = parseInt(cleanText);
      savePreferences({
        ...preferences,
        averagePreparationTime: time,
      });
    }
  };

  const adicionarRestricao = () => {
    if (novaRestricao.trim()) {
      const restricaoFormatada = novaRestricao.trim();
      const restricoesAtuais = preferences?.dietaryRestrictions
        ? preferences.dietaryRestrictions.split(',').map((r: string) => r.trim()).filter(Boolean)
        : [];
      
      const novasRestricoes = [...restricoesAtuais, restricaoFormatada].join(', ');
      
      savePreferences({
        ...preferences,
        dietaryRestrictions: novasRestricoes
      });
      setNovaRestricao('');
    }
  };

  const removerRestricao = (restricaoParaRemover: string) => {
    if (!preferences?.dietaryRestrictions) return;

    const restricoesAtuais = preferences.dietaryRestrictions
      .split(',')
      .map((r: string) => r.trim())
      .filter((r: string) => r !== restricaoParaRemover)
      .join(', ');

    savePreferences({
      ...preferences,
      dietaryRestrictions: restricoesAtuais
    });
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair do app?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setLoading(false),
          },
          {
            text: 'Sim',
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.clear();
                console.log('✅ Usuário deslogado com sucesso');
                
                const isStillAuthenticated = await checkAuthStatus();
                if (isStillAuthenticated) {
                  throw new Error('Falha ao remover dados do usuário');
                }

                console.log('🔄 Redirecionando para tela de login...');
                router.replace('/tudo/login');
                
              } catch (error) {
                console.error('❌ Erro ao fazer logout:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao tentar sair. Tente novamente.');
                setLoading(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar sair. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Meu Perfil</Text>
          <Text style={styles.email}>usuario@exemplo.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências de Refeição</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Incluir Almoço</Text>
            <Switch
              value={preferences.mealPreferences.includeLunch}
              onValueChange={(value) => savePreferences({
                ...preferences,
                mealPreferences: {
                  ...preferences.mealPreferences,
                  includeLunch: value,
                }
              })}
              trackColor={{ false: '#767577', true: '#f4511e' }}
              thumbColor={preferences.mealPreferences.includeLunch ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Incluir Janta</Text>
            <Switch
              value={preferences.mealPreferences.includeDinner}
              onValueChange={(value) => savePreferences({
                ...preferences,
                mealPreferences: {
                  ...preferences.mealPreferences,
                  includeDinner: value,
                }
              })}
              trackColor={{ false: '#767577', true: '#f4511e' }}
              thumbColor={preferences.mealPreferences.includeDinner ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Número de Pessoas</Text>
            <TextInput
              style={styles.input}
              value={peopleCountText}
              onChangeText={handlePeopleCountChange}
              keyboardType="numeric"
              maxLength={2}
              placeholder="1"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Tempo Médio de Preparo (min)</Text>
            <TextInput
              style={styles.input}
              value={prepTimeText}
              onChangeText={handlePrepTimeChange}
              keyboardType="numeric"
              maxLength={3}
              placeholder="30"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restrições Alimentares</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.restrictionInput}
              value={novaRestricao}
              onChangeText={setNovaRestricao}
              placeholder="Ex: Sem frutos do mar, alergia a amendoim"
              placeholderTextColor="#999"
              onSubmitEditing={adicionarRestricao}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={adicionarRestricao}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {preferences?.dietaryRestrictions ? (
            <View>
              {preferences.dietaryRestrictions.split(',').map((restricao: string, index: number) => {
                const restricaoTrim = restricao.trim();
                if (!restricaoTrim) return null;
                
                return (
                  <View key={index} style={styles.restrictionItem}>
                    <Text style={styles.restrictionText}>• {restricaoTrim}</Text>
                    <TouchableOpacity
                      onPress={() => removerRestricao(restricaoTrim)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyText}>Nenhuma restrição informada</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton, loading && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sair</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  preferenceText: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
    width: 60,
    textAlign: 'center',
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  restrictionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#f4511e',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  restrictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  restrictionText: {
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
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#f4511e',
  },
});
