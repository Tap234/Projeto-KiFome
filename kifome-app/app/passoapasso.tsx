import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PassoAPasso() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Preparar os ingredientes',
      description: '500g de macarrão\n400g de carne moída\n2 latas de molho de tomate\n1 cebola\n2 dentes de alho\nSal e pimenta a gosto',
    },
    {
      title: 'Cozinhar a massa',
      description: 'Em uma panela grande, ferva água com sal. Adicione o macarrão e cozinhe conforme as instruções da embalagem.',
    },
    {
      title: 'Preparar o molho',
      description: 'Em uma panela, refogue a cebola e o alho. Adicione a carne moída e cozinhe até dourar. Adicione o molho de tomate e tempere a gosto.',
    },
    {
      title: 'Finalizar',
      description: 'Escorra o macarrão e misture com o molho. Sirva quente.',
    },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Macarrão à Bolonhesa</Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Passo {currentStep + 1} de {steps.length}
          </Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.stepDescription}>{steps[currentStep].description}</Text>
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
    marginBottom: 20,
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
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
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
    alignItems: 'center',
  },
  navigationButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
