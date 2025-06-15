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
    dietaryRestrictions: {
      isVegetarian: false,
      isGlutenFree: false,
      isLactoseFree: false,
    },
    averagePreparationTime: 30,
    darkMode: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPrefs = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
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
              value={preferences.mealPreferences.peopleCount.toString()}
              onChangeText={(value) => {
                const count = parseInt(value) || 1;
                savePreferences({
                  ...preferences,
                  mealPreferences: {
                    ...preferences.mealPreferences,
                    peopleCount: count,
                  }
                });
              }}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Tempo Médio de Preparo (min)</Text>
            <TextInput
              style={styles.input}
              value={preferences.averagePreparationTime.toString()}
              onChangeText={(value) => {
                const time = parseInt(value) || 30;
                savePreferences({
                  ...preferences,
                  averagePreparationTime: time,
                });
              }}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restrições Alimentares</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Vegetariano</Text>
            <Switch
              value={preferences.dietaryRestrictions.isVegetarian}
              onValueChange={(value) => savePreferences({
                ...preferences,
                dietaryRestrictions: {
                  ...preferences.dietaryRestrictions,
                  isVegetarian: value,
                }
              })}
              trackColor={{ false: '#767577', true: '#f4511e' }}
              thumbColor={preferences.dietaryRestrictions.isVegetarian ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Sem Glúten</Text>
            <Switch
              value={preferences.dietaryRestrictions.isGlutenFree}
              onValueChange={(value) => savePreferences({
                ...preferences,
                dietaryRestrictions: {
                  ...preferences.dietaryRestrictions,
                  isGlutenFree: value,
                }
              })}
              trackColor={{ false: '#767577', true: '#f4511e' }}
              thumbColor={preferences.dietaryRestrictions.isGlutenFree ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Sem Lactose</Text>
            <Switch
              value={preferences.dietaryRestrictions.isLactoseFree}
              onValueChange={(value) => savePreferences({
                ...preferences,
                dietaryRestrictions: {
                  ...preferences.dietaryRestrictions,
                  isLactoseFree: value,
                }
              })}
              trackColor={{ false: '#767577', true: '#f4511e' }}
              thumbColor={preferences.dietaryRestrictions.isLactoseFree ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Modo Escuro</Text>
            <Switch
              value={preferences.darkMode}
              onValueChange={(value) => savePreferences({
                ...preferences,
                darkMode: value,
              })}
              trackColor={{ false: '#767577', true: '#f4511e' }}
              thumbColor={preferences.darkMode ? '#fff' : '#f4f3f4'}
            />
          </View>
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
