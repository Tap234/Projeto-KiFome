// Este arquivo serve apenas para cobrir a rota /tudo.
// Não altera nem interfere no index.tsx da raiz (/app/index.tsx).
// Redireciona automaticamente para a tela de sugestão rápida.

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function TudoIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para a tela principal do grupo tudo
    router.replace('/');
  }, []);

  // Mostra um loading enquanto redireciona
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#f4511e" />
    </View>
  );
} 