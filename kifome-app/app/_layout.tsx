// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Lista de rotas que não precisam de autenticação
const publicRoutes = ['tudo/login', 'tudo/signup'];

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

    const currentPath = segments.join('/');
    const inPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
    console.log('🔒 Status de autenticação:', { isAuthenticated, inPublicRoute, currentPath });

    const handleNavigation = async () => {
      try {
        // Re-verificar autenticação antes de redirecionar
        const isCurrentlyAuthenticated = await checkAuthStatus();
        
        if (isCurrentlyAuthenticated !== isAuthenticated) {
          setIsAuthenticated(isCurrentlyAuthenticated);
          return;
        }

        // Se estiver na rota raiz (/), não redireciona
        if (currentPath === '') {
          return;
        }

        if (isAuthenticated && inPublicRoute) {
          console.log('🔄 Usuário autenticado em rota pública, redirecionando para home...');
          router.replace('/');
        } else if (!isAuthenticated && !inPublicRoute && currentPath !== '') {
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
          name="tudo"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
