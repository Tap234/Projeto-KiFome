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
import ShoppingListComponent from '../components/ShoppingListComponent';

export default function ListaCompras() {
  const router = useRouter();
  const [weeklyList, setWeeklyList] = useState<ShoppingList | null>(null);
  const [singleLists, setSingleLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveList] = useState<'weekly' | 'single'>('weekly');

  // Carrega as listas ao iniciar
  useEffect(() => {
    loadLists();
  }, []);

  // Carrega todas as listas
  const loadLists = async () => {
    try {
      const weekly = await ShoppingListService.getWeeklyList();
      const single = await ShoppingListService.getAllSingleLists();
      
      setWeeklyList(weekly);
      setSingleLists(single);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    }
  };

  // Alterna o estado de um item
  const handleItemToggle = async (listType: 'weekly' | 'single', listId: string, itemId: string) => {
    try {
      if (listType === 'weekly' && weeklyList) {
        const updatedList = {
          ...weeklyList,
          items: weeklyList.items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
        await ShoppingListService.saveWeeklyList(updatedList);
        setWeeklyList(updatedList);
      } else {
        const targetList = singleLists.find(list => list.id === listId);
        if (targetList) {
          const updatedList = {
            ...targetList,
            items: targetList.items.map(item =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          };
          await ShoppingListService.saveSingleList(updatedList);
          setSingleLists(prev =>
            prev.map(list => list.id === listId ? updatedList : list)
          );
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  // Remove uma lista avulsa
  const handleDeleteList = async (listId: string) => {
    try {
      await ShoppingListService.deleteSingleList(listId);
      setSingleLists(prev => prev.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Erro ao deletar lista:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Listas de Compras</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeList === 'weekly' && styles.activeTab]}
            onPress={() => setActiveList('weekly')}
          >
            <Text style={[
              styles.tabText,
              activeList === 'weekly' && styles.activeTabText
            ]}>
              Lista Semanal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeList === 'single' && styles.activeTab]}
            onPress={() => setActiveList('single')}
          >
            <Text style={[
              styles.tabText,
              activeList === 'single' && styles.activeTabText
            ]}>
              Listas Avulsas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeList === 'weekly' ? (
        weeklyList ? (
          <ShoppingListComponent
            list={weeklyList}
            onItemToggle={(itemId) => handleItemToggle('weekly', weeklyList.id, itemId)}
          />
        ) : (
          <Text style={styles.emptyText}>
            Nenhuma lista semanal disponível.{'\n'}
            Gere um planejamento semanal primeiro!
          </Text>
        )
      ) : (
        <ScrollView>
          {singleLists.length > 0 ? (
            singleLists.map(list => (
              <ShoppingListComponent
                key={list.id}
                list={list}
                onItemToggle={(itemId) => handleItemToggle('single', list.id, itemId)}
                onDeleteList={() => handleDeleteList(list.id)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              Nenhuma lista avulsa disponível.{'\n'}
              Gere uma lista a partir de uma receita!
            </Text>
          )}
        </ScrollView>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#f4511e',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#f4511e',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
