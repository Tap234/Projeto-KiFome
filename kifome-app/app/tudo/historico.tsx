import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { QuickSuggestion } from '../../services/QuickSuggestionHistoryService';

export default function Historico() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const suggestions = params.suggestions ? JSON.parse(params.suggestions as string) as QuickSuggestion[] : [];

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSuggestionPress = (suggestion: QuickSuggestion) => {
    router.push({
      pathname: '/tudo/passoapasso',
      params: {
        recipe: JSON.stringify({
          id: suggestion.id,
          titulo: suggestion.title,
          passos: suggestion.steps,
          ingredientes: suggestion.ingredients,
          checkedItems: suggestion.checkedItems
        })
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Sugestões</Text>
        <Text style={styles.subtitle}>Últimas 5 sugestões rápidas</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {suggestions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma sugestão no histórico</Text>
        ) : (
          suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionCard}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <Text style={styles.suggestionDate}>
                {formatDate(suggestion.timestamp)}
              </Text>
              <Text style={styles.ingredientsTitle}>Ingredientes:</Text>
              <Text style={styles.ingredientsText}>
                {suggestion.ingredients.join(', ')}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  suggestionCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  suggestionDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  ingredientsText: {
    fontSize: 14,
    color: '#666',
  },
}); 