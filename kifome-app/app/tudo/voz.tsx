import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Voz() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleListening = () => {
    setIsListening(!isListening);
    // Implementar lógica de reconhecimento de voz
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assistente de Voz</Text>

      <View style={styles.transcriptContainer}>
        <Text style={styles.transcriptText}>
          {transcript || 'Toque no botão abaixo e fale o que você gostaria de cozinhar hoje...'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.micButton, isListening && styles.micButtonActive]}
        onPress={toggleListening}
      >
        <View style={styles.micIcon}>
          {/* Adicionar ícone de microfone aqui */}
        </View>
      </TouchableOpacity>

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Comandos de Voz:</Text>
        <Text style={styles.helpText}>• "Quero fazer uma receita com..."</Text>
        <Text style={styles.helpText}>• "Mostre receitas que levam..."</Text>
        <Text style={styles.helpText}>• "Quanto tempo leva para fazer..."</Text>
        <Text style={styles.helpText}>• "Adicione à lista de compras..."</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 30,
  },
  transcriptContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    minHeight: 120,
    marginBottom: 30,
    justifyContent: 'center',
  },
  transcriptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  micButtonActive: {
    backgroundColor: '#e04000',
    transform: [{ scale: 1.1 }],
  },
  micIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  helpContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  helpText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
});
