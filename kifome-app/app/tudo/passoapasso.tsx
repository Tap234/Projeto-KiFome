import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ShoppingListService from '../../services/ShoppingListService';
import { Recipe, ShoppingList } from '../../types/user';

// Define the type for a single step
interface Step {
  texto: string;
  tempo: number | null;
}

export default function PassoAPasso() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  // Parse the recipe and steps from the route params
  useEffect(() => {
    try {
      if (!params.recipe) {
        throw new Error('Nenhuma receita foi fornecida');
      }

      // Parse the recipe from params
      const recipeData = JSON.parse(params.recipe as string) as Recipe;
      setRecipe(recipeData);

      if (!Array.isArray(recipeData.passos)) {
        throw new Error('A receita não contém passos válidos');
      }

      // Map the steps to the correct format
      const validatedSteps = recipeData.passos.map(step => {
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
      console.error('Erro ao processar a receita:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar a receita. Voltando para a tela anterior.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [params.recipe]);

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

  // Função para gerar lista de compras da receita
  const generateShoppingList = async () => {
    if (!recipe) return;

    try {
      // Cria itens da lista de compras a partir dos ingredientes
      const items = recipe.ingredientes.map(ingrediente => ({
        id: ShoppingListService.generateListId(),
        name: ingrediente.split(' ')[0], // Pega o nome do ingrediente
        quantity: ingrediente.split(' ').slice(1).join(' '), // Pega a quantidade
        checked: false,
        recipeTitle: recipe.titulo
      }));

      // Cria a nova lista de compras
      const newList: ShoppingList = {
        id: ShoppingListService.generateListId(),
        title: `Lista para ${recipe.titulo}`,
        type: 'single',
        items,
        createdAt: Date.now()
      };

      // Salva a lista
      await ShoppingListService.saveSingleList(newList);
      Alert.alert('Sucesso', 'Lista de compras gerada com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar lista de compras:', error);
      Alert.alert('Erro', 'Não foi possível gerar a lista de compras.');
    }
  };

  if (!recipe || steps.length === 0) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const isTimerStep = Boolean(currentStepData.tempo);

  const handleGenerateShoppingList = () => {
    if (!recipe.ingredientes) return;

    router.push({
      pathname: '/tudo/lista-temporaria',
      params: {
        ingredients: JSON.stringify(recipe.ingredientes),
        title: recipe.titulo
      }
    });
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>{recipe.titulo}</Text>
        
        <View style={styles.recipeInfo}>
          <Text style={styles.prepTime}>Tempo de Preparo: {recipe.tempoPreparo}</Text>
          {recipe.servings && (
            <Text style={styles.prepTime}>Serve: {recipe.servings} {recipe.servings > 1 ? 'pessoas' : 'pessoa'}</Text>
          )}
          <Text style={styles.description}>{recipe.descricao}</Text>
        </View>

        <View style={styles.ingredientsContainer}>
          <Text style={styles.sectionTitle}>Ingredientes:</Text>
          {recipe.ingredientes.map((ingrediente, index) => (
            <Text key={index} style={styles.ingredientText}>• {ingrediente}</Text>
          ))}
          
          <TouchableOpacity
            style={styles.listButton}
            onPress={handleGenerateShoppingList}
          >
            <Text style={styles.buttonText}>Gerar Lista de Compras</Text>
          </TouchableOpacity>
        </View>
        
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
    color: '#f4511e',
    marginBottom: 15,
    textAlign: 'center',
  },
  recipeInfo: {
    marginBottom: 20,
  },
  prepTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  ingredientsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  ingredientText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  progressContainer: {
    marginBottom: 15,
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
  timerContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    color: '#f4511e',
    fontWeight: 'bold',
  },
  timerButton: {
    backgroundColor: '#f4511e20',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  timerButtonText: {
    color: '#f4511e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  navigationButton: {
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listButton: {
    backgroundColor: '#f4511e',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
});
