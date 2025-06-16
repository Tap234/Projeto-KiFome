import { Stack } from 'expo-router';
import React from 'react';

export default function TudoLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sugestao"
        options={{
          title: 'Sugestão Rápida',
          headerTintColor: '#f4511e',
        }}
      />
      <Stack.Screen
        name="historico"
        options={{
          title: 'Histórico de Sugestões',
          headerTintColor: '#f4511e',
        }}
      />
      <Stack.Screen
        name="lista-temporaria"
        options={{
          title: 'Visualizar Ingredientes',
          headerTintColor: '#f4511e',
        }}
      />
      <Stack.Screen
        name="passoapasso"
        options={{
          title: 'Passo a Passo',
          headerTintColor: '#f4511e',
        }}
      />
      <Stack.Screen
        name="planejamento"
        options={{
          title: 'Planejamento Semanal',
          headerTintColor: '#f4511e',
        }}
      />
      <Stack.Screen
        name="lista-compras"
        options={{
          title: 'Lista de Compras',
          headerTintColor: '#f4511e',
        }}
      />
      <Stack.Screen
        name="voz"
        options={{
          title: 'Modo de Voz',
          headerTintColor: '#f4511e',
        }}
      />
      <Stack.Screen
        name="perfil"
        options={{
          title: 'Meu Perfil',
          headerTintColor: '#f4511e',
        }}
      />
    </Stack>
  );
} 