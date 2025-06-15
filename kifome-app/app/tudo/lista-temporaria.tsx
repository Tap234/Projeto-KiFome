import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ListaTemporaria() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const ingredients = params.ingredients ? JSON.parse(params.ingredients as string) as string[] : [];
  const recipeTitle = params.title as string;
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Compras</Text>
        <Text style={styles.subtitle}>{recipeTitle}</Text>
        <Text style={styles.note}>
          Esta é uma lista temporária apenas para sua visualização.{'\n'}
          Os itens marcados/desmarcados não serão salvos.{'\n'}
          Para lista permanente, use o Planejamento Semanal.
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {ingredients.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum ingrediente na lista</Text>
        ) : (
          ingredients.map((ingredient, index) => (
            <TouchableOpacity
              key={index}
              style={styles.itemRow}
              onPress={() => toggleItem(ingredient)}
            >
              <View style={[styles.checkbox, checkedItems[ingredient] && styles.checked]} />
              <Text style={[
                styles.itemText,
                checkedItems[ingredient] && styles.checkedText
              ]}>
                {ingredient}
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
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  note: {
    fontSize: 12,
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f4511e',
    marginRight: 12,
  },
  checked: {
    backgroundColor: '#f4511e',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
}); 