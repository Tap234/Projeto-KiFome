import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateWeeklyPlan as geminiGenerateWeeklyPlan } from '../../config/gemini';
import { UserPreferences, WeeklyPlan } from '../../types/user';

const STORAGE_KEY = '@user_preferences';
const WEEKLY_PLAN_KEY = '@weekly_plan';

const DAYS = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
} as const;

export default function Planejamento() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prefsData, planData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(WEEKLY_PLAN_KEY),
      ]);

      if (prefsData) {
        setPreferences(JSON.parse(prefsData));
      }
      if (planData) {
        setWeeklyPlan(JSON.parse(planData));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus dados.');
    }
  };

  const savePlan = async (plan: WeeklyPlan) => {
    try {
      await AsyncStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(plan));
      setWeeklyPlan(plan);
    } catch (error) {
      console.error('❌ Erro ao salvar planejamento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o planejamento.');
    }
  };

  const handleGenerateWeeklyPlan = async () => {
    if (!preferences) {
      Alert.alert('Erro', 'Configure suas preferências antes de gerar o planejamento.');
      return;
    }

    setLoading(true);
    try {
      // Lista de restrições para o prompt
      const restrictions = [];
      if (preferences.dietaryRestrictions.isVegetarian) restrictions.push('vegetariano');
      if (preferences.dietaryRestrictions.isGlutenFree) restrictions.push('sem glúten');
      if (preferences.dietaryRestrictions.isLactoseFree) restrictions.push('sem lactose');

      const plan = await geminiGenerateWeeklyPlan(
        preferences.mealPreferences.includeLunch,
        preferences.mealPreferences.includeDinner,
        preferences.mealPreferences.peopleCount,
        preferences.averagePreparationTime,
        restrictions
      );

      await savePlan(plan);
      Alert.alert('Sucesso', 'Planejamento semanal gerado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao gerar planejamento:', error);
      Alert.alert('Erro', 'Não foi possível gerar o planejamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderMealCard = (title: string, recipe: any) => {
    if (!recipe) {
      return (
        <View style={styles.emptyMealCard}>
          <Text style={styles.emptyMealText}>Sem receita para {title.toLowerCase()}</Text>
        </View>
      );
    }

    return (
      <View style={styles.mealCard}>
        <Text style={styles.mealTitle}>{title}</Text>
        <Text style={styles.mealName}>{recipe.titulo}</Text>
        <Text style={styles.mealTime}>Tempo: {recipe.tempoPreparo}</Text>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push({
            pathname: '/tudo/passoapasso',
            params: { recipe: JSON.stringify(recipe) }
          })}
        >
          <Text style={styles.viewButtonText}>Ver Receita</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!preferences) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Configure suas preferências antes de gerar o planejamento.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/tudo/perfil')}
        >
          <Text style={styles.buttonText}>Ir para Preferências</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Planejamento Semanal</Text>

        {weeklyPlan?.semana ? (
          Object.entries(DAYS).map(([key, dayName]) => {
            const day = weeklyPlan.semana[key as keyof WeeklyPlan];
            if (!day) return null;

            return (
              <View key={key} style={styles.dayCard}>
                <Text style={styles.dayText}>{dayName}</Text>
                {preferences.mealPreferences.includeLunch && renderMealCard('Almoço', day.almoco)}
                {preferences.mealPreferences.includeDinner && renderMealCard('Janta', day.janta)}
              </View>
            );
          })
        ) : (
          <Text style={styles.message}>Nenhum planejamento gerado ainda.</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGenerateWeeklyPlan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {weeklyPlan ? 'Gerar Novo Planejamento' : 'Gerar Planejamento'}
            </Text>
          )}
        </TouchableOpacity>

        {weeklyPlan && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/tudo/lista-compras')}
          >
            <Text style={styles.buttonText}>Gerar Lista de Compras</Text>
          </TouchableOpacity>
        )}
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
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  mealCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 5,
  },
  mealName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  mealTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  viewButton: {
    backgroundColor: '#f4511e20',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#f4511e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyMealCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  emptyMealText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
