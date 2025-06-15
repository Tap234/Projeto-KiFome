import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ShoppingList } from '../../types/user';

interface Props {
  list: ShoppingList;
  onItemToggle: (itemId: string) => void;
  onDeleteList?: () => void;  // Opcional - apenas para listas avulsas
}

/**
 * Componente reutilizável para exibição de listas de compras
 * Pode ser usado tanto para lista semanal quanto para listas avulsas
 */
export default function ShoppingListComponent({ list, onItemToggle, onDeleteList }: Props) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{list.title}</Text>
        {list.type === 'single' && onDeleteList && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDeleteList}
          >
            <Text style={styles.deleteButtonText}>Excluir Lista</Text>
          </TouchableOpacity>
        )}
      </View>

      {list.items.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum item na lista</Text>
      ) : (
        <View style={styles.itemsContainer}>
          {list.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
              onPress={() => onItemToggle(item.id)}
            >
              <View style={[styles.checkbox, item.checked && styles.checked]} />
              <View style={styles.itemInfo}>
                <Text style={[
                  styles.itemName,
                  item.checked && styles.checkedText
                ]}>
                  {item.name}
                </Text>
                <Text style={[
                  styles.itemQuantity,
                  item.checked && styles.checkedText
                ]}>
                  {item.quantity}
                </Text>
                {item.recipeTitle && (
                  <Text style={styles.recipeTitle}>
                    Receita: {item.recipeTitle}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  itemsContainer: {
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  recipeTitle: {
    fontSize: 12,
    color: '#f4511e',
    marginTop: 4,
    fontStyle: 'italic',
  },
}); 