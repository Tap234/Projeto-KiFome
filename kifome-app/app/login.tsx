import AsyncStorage from '@react-native-async-storage/async-storage';
import SHA256 from 'crypto-js/sha256';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebase';
import { testFirestoreConnection } from '../utils/firestore-test';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        return Alert.alert('Erro', 'Por favor, preencha todos os campos');
      }

      setLoading(true);

      // Buscar usuário pelo email
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setLoading(false);
        return Alert.alert('Erro', 'Usuário não encontrado');
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      // Verificar senha usando SHA256
      const passwordHash = SHA256(password).toString();
      if (passwordHash !== userData.passwordHash) {
        setLoading(false);
        return Alert.alert('Erro', 'Senha incorreta');
      }

      // Garantir que o userId é uma string válida
      const userId = String(userDoc.id);
      console.log('🔐 Login bem-sucedido, salvando userId:', userId);

      try {
        // Limpar qualquer dado antigo do AsyncStorage
        await AsyncStorage.clear();
        
        // Salvar o novo userId
        await AsyncStorage.setItem('userId', userId);
        
        // Verificar se foi salvo corretamente
        const savedUserId = await AsyncStorage.getItem('userId');
        console.log('✅ Verificação do userId salvo:', savedUserId);
        
        if (savedUserId !== userId) {
          throw new Error('Falha ao salvar userId');
        }

        // Primeiro mostrar a mensagem de sucesso
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        
        // Depois redirecionar para home com um pequeno delay
        setTimeout(() => {
          console.log('🔄 Redirecionando para home...');
          router.replace('/');
        }, 500);
      } catch (storageError) {
        console.error('❌ Erro ao salvar no AsyncStorage:', storageError);
        Alert.alert('Erro', 'Falha ao salvar dados de login. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao realizar o login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const result = await testFirestoreConnection();
      
      if (result.success) {
        Alert.alert(
          'Teste bem-sucedido',
          `Escrita: ID ${result.writeId}\nLeitura: ${result.readCount} documentos`
        );
      } else {
        Alert.alert('Erro no teste', result.error);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      Alert.alert('Erro', 'Falha ao testar conexão com o Firestore');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.testButton]}
        onPress={handleTestConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Testar Conexão</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push('/signup')}
        disabled={loading}
      >
        <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#f4511e',
  },
  input: {
    width: '100%',
    maxWidth: 300,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: '#f4511e',
    fontSize: 14,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    marginTop: 10,
  },
});
