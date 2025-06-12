import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Planejamento() {
  const router = useRouter();

  const weekDays = [
    { day: 'Segunda', meal: 'Strogonoff de Frango' },
    { day: 'Terça', meal: 'Salada Caesar com Frango' },
    { day: 'Quarta', meal: 'Macarrão à Bolonhesa' },
    { day: 'Quinta', meal: 'Peixe Grelhado com Legumes' },
    { day: 'Sexta', meal: 'Feijoada' },
    { day: 'Sábado', meal: 'Pizza Caseira' },
    { day: 'Domingo', meal: 'Churrasco' },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Planejamento Semanal</Text>

        {weekDays.map((item, index) => (
          <TouchableOpacity
            key={item.day}
            style={styles.dayCard}
            onPress={() => router.push('/tudo/passoapasso')}
          >
            <View style={styles.dayHeader}>
              <Text style={styles.dayText}>{item.day}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {/* Implementar edição */}}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.mealText}>{item.meal}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/tudo/lista-compras')}
        >
          <Text style={styles.buttonText}>Gerar Lista de Compras</Text>
        </TouchableOpacity>
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
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 5,
  },
  editButtonText: {
    color: '#f4511e',
    fontSize: 14,
  },
  mealText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
