import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { checkAuthStatus } from '../_layout';

export default function Perfil() {
  const router = useRouter();
  const [isVegetarian, setIsVegetarian] = React.useState(false);
  const [isGlutenFree, setIsGlutenFree] = React.useState(false);
  const [isLactoseFree, setIsLactoseFree] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  const [loading, setLoading] = useState(false);

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
                // Limpar todos os dados do AsyncStorage
                await AsyncStorage.clear();
                console.log('✅ Usuário deslogado com sucesso');
                
                // Verificar se realmente foi limpo
                const isStillAuthenticated = await checkAuthStatus();
                if (isStillAuthenticated) {
                  throw new Error('Falha ao remover dados do usuário');
                }

                // Redirecionar para login
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
          <Text style={styles.sectionTitle}>Preferências Alimentares</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Vegetariano</Text>
            <Switch
              value={isVegetarian}
              onValueChange={setIsVegetarian}
              trackColor={{ false: '#767577', true: '#f4511e' }}
              thumbColor={isVegetarian ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Sem Glúten</Text>
            <Switch
              value={isGlutenFree}
              onValueChange={setIsGlutenFree}
              trackColor={{ false: '#767577', true: '#f4511e' }}
              thumbColor={isGlutenFree ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Sem Lactose</Text>
            <Switch
              value={isLactoseFree}
              onValueChange={setIsLactoseFree}
              trackColor={{ false: '#767577', true: '#f4511e' }}
              thumbColor={isLactoseFree ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Modo Escuro</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#f4511e' }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
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
    backgroundColor: '#ff4444',
    marginTop: 30,
  },
});
