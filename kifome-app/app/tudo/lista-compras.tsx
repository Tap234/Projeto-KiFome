import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ShoppingListService from '../../services/ShoppingListService';
import { ShoppingList } from '../../types/user';

export default function ListaCompras() {
  const router = useRouter();
  const [weeklyList, setWeeklyList] = useState<ShoppingList | null>(null);

  // Carrega a lista ao iniciar
  useEffect(() => {
    loadList();
  }, []);

  // Carrega a lista semanal
  const loadList = async () => {
    try {
      const weekly = await ShoppingListService.getWeeklyList();
      setWeeklyList(weekly);
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
    }
  };

  // Alterna o estado de um item
  const handleItemToggle = async (itemId: string) => {
    try {
      if (weeklyList) {
        const updatedList = {
          ...weeklyList,
          items: weeklyList.items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
        await ShoppingListService.saveWeeklyList(updatedList);
        setWeeklyList(updatedList);
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Compras Semanal</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {!weeklyList || weeklyList.items.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhum item na lista semanal.{'\n'}
            Gere um planejamento semanal primeiro!
          </Text>
        ) : (
          <View style={styles.itemsContainer}>
            {weeklyList.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemRow}
                onPress={() => handleItemToggle(item.id)}
              >
                <View style={[styles.checkbox, item.checked && styles.checked]} />
                <View style={styles.itemInfo}>
                  <Text style={[
                    styles.itemName,
                    item.checked && styles.checkedText
                  ]}>
                    {item.name}
                  </Text>
                  {item.quantity && (
                    <Text style={[
                      styles.itemQuantity,
                      item.checked && styles.checkedText
                    ]}>
                      {item.quantity}
                    </Text>
                  )}
                  {item.recipeTitle && (
                    <View style={styles.recipeContainer}>
                      <Icon name="pot-steam" size={14} color="#666" />
                      <Text style={styles.recipeTitle}>
                        {item.recipeTitle}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  itemsContainer: {
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  checked: {
    backgroundColor: '#f4511e',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  recipeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontStyle: 'italic',
  },
});
