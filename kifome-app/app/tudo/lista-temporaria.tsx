import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ShoppingListService from '../../services/ShoppingListService';

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

  const addToWeeklyList = async () => {
    try {
      // Cria itens da lista de compras a partir dos ingredientes
      const items = ingredients.map(ingrediente => ({
        id: ShoppingListService.generateListId(),
        name: ingrediente.split(' ')[0], // Pega o nome do ingrediente
        quantity: ingrediente.split(' ').slice(1).join(' '), // Pega a quantidade
        checked: false,
        recipeTitle
      }));

      // Adiciona os itens à lista semanal
      await ShoppingListService.addItemsToWeeklyList(items);
      Alert.alert(
        'Sucesso',
        'Ingredientes adicionados à lista de compras semanal!',
        [
          { text: 'OK' },
          { text: 'Ver Lista', onPress: () => router.push('/tudo/lista-compras') }
        ]
      );
    } catch (error) {
      console.error('Erro ao adicionar à lista semanal:', error);
      Alert.alert('Erro', 'Não foi possível adicionar os ingredientes à lista de compras.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Compras</Text>
        <Text style={styles.subtitle}>{recipeTitle}</Text>
        <Text style={styles.note}>
          Esta é uma lista temporária apenas para sua visualização.{'\n'}
          Os itens marcados/desmarcados não serão salvos.
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {ingredients.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum ingrediente na lista</Text>
        ) : (
          <View style={styles.itemsContainer}>
            {ingredients.map((ingredient, index) => (
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
            ))}
          </View>
        )}
      </ScrollView>

      {ingredients.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addToWeeklyList}
          >
            <Text style={styles.buttonText}>
              Adicionar à Lista Semanal
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  itemsContainer: {
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 