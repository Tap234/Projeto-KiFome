import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define the type for a single step
interface Step {
  texto: string;
  tempo: number | null;
}

export default function PassoAPasso() {
  const router = useRouter();
  const { passos } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  // Parse the steps from the route params
  useEffect(() => {
    if (passos) {
      try {
        // Parse the JSON string into an array
        const passosArray = JSON.parse(passos as string);
        
        // Validate that passosArray is actually an array
        if (!Array.isArray(passosArray)) {
          throw new Error('Passos deve ser um array');
        }

        // Map the steps to the correct format
        const validatedSteps = passosArray.map(step => {
          // If step is already an object with texto and tempo
          if (typeof step === 'object' && step !== null && 'texto' in step) {
            return {
              texto: String(step.texto),
              tempo: step.tempo !== undefined && step.tempo !== null ? Number(step.tempo) : null
            };
          }
          
          // If step is a string (from Gemini API)
          if (typeof step === 'string') {
            // Extract time if mentioned in the step (e.g., "Cozinhe por 5 minutos")
            const timeMatch = step.match(/(\d+)\s*minutos?/i);
            return {
              texto: step,
              tempo: timeMatch ? Number(timeMatch[1]) : null
            };
          }

          // Fallback for any other case
          return {
            texto: String(step),
            tempo: null
          };
        });

        setSteps(validatedSteps);
      } catch (error) {
        console.error('Erro ao processar os passos:', error);
        router.back();
      }
    } else {
      router.back();
    }
  }, [passos]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Handle timer logic
  const startTimer = useCallback(() => {
    const currentStepData = steps[currentStep];
    if (!currentStepData?.tempo) return;

    // Convert minutes to seconds if needed
    const initialTime = currentStepData.tempo * 60;
    setTimeLeft(initialTime);
    setTimerActive(true);

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(id);
          setTimerActive(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setIntervalId(id);
  }, [currentStep, steps]);

  // Clean up timer when moving to next/previous step
  const cleanupTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimeLeft(null);
    setTimerActive(false);
  }, [intervalId]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle navigation between steps
  const handleNavigation = (direction: 'next' | 'prev') => {
    cleanupTimer();
    if (direction === 'prev') {
      setCurrentStep(prev => Math.max(0, prev - 1));
    } else {
      if (currentStep === steps.length - 1) {
        router.back();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  if (steps.length === 0) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const isTimerStep = Boolean(currentStepData.tempo);

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
          <Text style={styles.stepDescription}>{currentStepData.texto}</Text>
          
          {isTimerStep && (
            <View style={styles.timerContainer}>
              {timeLeft !== null ? (
                <Text style={styles.timerText}>
                  Tempo restante: {formatTime(timeLeft)}
                </Text>
              ) : (
                <TouchableOpacity
                  style={styles.timerButton}
                  onPress={startTimer}
                >
                  <Text style={styles.timerButtonText}>
                    Iniciar Timer ({currentStepData.tempo} min)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.navigationButton,
              currentStep === 0 && styles.disabledButton
            ]}
            onPress={() => handleNavigation('prev')}
            disabled={currentStep === 0}
          >
            <Text style={styles.buttonText}>Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.navigationButton,
              (timerActive && isTimerStep) && styles.disabledButton
            ]}
            onPress={() => handleNavigation('next')}
            disabled={timerActive && isTimerStep}
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
  timerContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  timerButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 18,
    color: '#f4511e',
    fontWeight: 'bold',
  },
});
