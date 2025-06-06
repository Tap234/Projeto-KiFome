import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ListaCompras() {
  const router = useRouter();
  const [items, setItems] = useState([
    { id: 1, name: 'Macarrão', quantity: '500g', checked: false },
    { id: 2, name: 'Carne Moída', quantity: '400g', checked: false },
    { id: 3, name: 'Molho de Tomate', quantity: '2 latas', checked: false },
    { id: 4, name: 'Cebola', quantity: '1 unidade', checked: false },
    { id: 5, name: 'Alho', quantity: '2 dentes', checked: false },
    { id: 6, name: 'Sal', quantity: 'a gosto', checked: false },
    { id: 7, name: 'Pimenta', quantity: 'a gosto', checked: false },
  ]);

  const toggleItem = (id: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Lista de Compras</Text>

        <View style={styles.listContainer}>
          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, item.checked && styles.checkedItem]}
              onPress={() => toggleItem(item.id)}
            >
              <View style={styles.checkbox}>
                {item.checked && <View style={styles.checked} />}
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, item.checked && styles.checkedText]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQuantity, item.checked && styles.checkedText]}>
                  {item.quantity}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {/* Implementar compartilhamento */}}
        >
          <Text style={styles.buttonText}>Compartilhar Lista</Text>
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
  listContainer: {
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  checkedItem: {
    backgroundColor: '#f5f5f5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f4511e',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f4511e',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  button: {
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
