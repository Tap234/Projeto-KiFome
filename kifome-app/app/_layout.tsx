// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Lista de rotas que não precisam de autenticação
const publicRoutes = ['login', 'signup'];

// Função global para verificar autenticação
export const checkAuthStatus = async () => {
  await AsyncStorage.flushGetRequests();
  const userId = await AsyncStorage.getItem('userId');
  return !!userId;
};

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação inicial
  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar autenticação quando a rota muda
  useEffect(() => {
    if (!segments[0]) return;
    checkAuth();
  }, [segments]);

  // Gerenciar navegação baseado no estado de autenticação
  useEffect(() => {
    if (isLoading) return;

    const inPublicRoute = segments[0] && publicRoutes.includes(segments[0]);
    console.log('🔒 Status de autenticação:', { isAuthenticated, inPublicRoute, currentRoute: segments[0] });

    const handleNavigation = async () => {
      try {
        // Re-verificar autenticação antes de redirecionar
        const isCurrentlyAuthenticated = await checkAuthStatus();
        
        if (isCurrentlyAuthenticated !== isAuthenticated) {
          setIsAuthenticated(isCurrentlyAuthenticated);
          return;
        }

        if (isAuthenticated && inPublicRoute) {
          console.log('🔄 Usuário autenticado em rota pública, redirecionando para home...');
          router.replace('/');
        } else if (!isAuthenticated && !inPublicRoute) {
          console.log('🔄 Usuário não autenticado em rota privada, redirecionando para login...');
          router.replace('/tudo/login');
        }
      } catch (error) {
        console.error('❌ Erro na navegação:', error);
      }
    };

    handleNavigation();
  }, [isAuthenticated, segments, isLoading]);

  const checkAuth = async () => {
    try {
      console.log('🔍 Verificando autenticação...');
      const isCurrentlyAuthenticated = await checkAuthStatus();
      console.log('📱 Status de autenticação:', isCurrentlyAuthenticated);
      setIsAuthenticated(isCurrentlyAuthenticated);
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f4511e" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'KiFOme',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: 'Cadastro',
          }}
        />
        <Stack.Screen
          name="sugestao"
          options={{
            title: 'Sugestão Rápida',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="planejamento"
          options={{
            title: 'Planejamento Semanal',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="passoapasso"
          options={{
            title: 'Modo Preparo',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="perfil"
          options={{
            title: 'Meu Perfil',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="lista-compras"
          options={{
            title: 'Lista de Compras',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="voz"
          options={{
            title: 'Assistente de Voz',
            headerBackVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
