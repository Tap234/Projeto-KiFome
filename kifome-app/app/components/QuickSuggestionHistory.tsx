import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QuickSuggestion } from '../../services/QuickSuggestionHistoryService';

interface Props {
  suggestions: QuickSuggestion[];
  onClose: () => void;
}

export default function QuickSuggestionHistory({ suggestions, onClose }: Props) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR', {
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
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Sugestões</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {suggestions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma sugestão no histórico</Text>
        ) : (
          suggestions.map((suggestion, index) => (
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
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
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