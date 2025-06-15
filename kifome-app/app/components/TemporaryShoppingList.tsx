import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
  ingredients: string[];
  onClose: () => void;
}

export default function TemporaryShoppingList({ ingredients, onClose }: Props) {
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
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
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

      <Text style={styles.note}>
        Esta é uma lista temporária apenas para sua visualização.
        Os itens marcados/desmarcados não serão salvos.
      </Text>
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
  note: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
}); 