import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PassoAPasso() {
  const router = useRouter();
  const { passos } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);

  useEffect(() => {
    if (passos) {
      try {
        const passosArray = JSON.parse(passos as string);
        setSteps(passosArray);
      } catch (error) {
        console.error('Erro ao processar os passos:', error);
        router.back();
      }
    } else {
      router.back();
    }
  }, [passos]);

  if (steps.length === 0) {
    return null;
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Modo de Preparo</Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Passo {currentStep + 1} de {steps.length}
          </Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepDescription}>{steps[currentStep]}</Text>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.button, styles.navigationButton, currentStep === 0 && styles.disabledButton]}
            onPress={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            <Text style={styles.buttonText}>Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.navigationButton]}
            onPress={() => {
              if (currentStep === steps.length - 1) {
                router.back();
              } else {
                setCurrentStep(prev => prev + 1);
              }
            }}
          >
            <Text style={styles.buttonText}>
              {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
            </Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#f4511e',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  stepCard: {
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
  stepDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  navigationButton: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
