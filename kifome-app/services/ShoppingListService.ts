import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingItem, ShoppingList } from '../types/user';

const WEEKLY_LIST_KEY = '@kifome:weekly_shopping_list';
const SINGLE_LISTS_KEY = '@kifome:single_shopping_lists';

/**
 * Serviço para gerenciar listas de compras
 * Mantém listas semanais e avulsas separadas
 */
class ShoppingListService {
  /**
   * Salva a lista de compras semanal
   */
  async saveWeeklyList(list: ShoppingList): Promise<void> {
    await AsyncStorage.setItem(WEEKLY_LIST_KEY, JSON.stringify(list));
  }

  /**
   * Obtém a lista de compras semanal
   */
  async getWeeklyList(): Promise<ShoppingList | null> {
    const data = await AsyncStorage.getItem(WEEKLY_LIST_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Salva uma lista de compras avulsa
   */
  async saveSingleList(list: ShoppingList): Promise<void> {
    const lists = await this.getAllSingleLists();
    const existingIndex = lists.findIndex(l => l.id === list.id);
    
    if (existingIndex >= 0) {
      lists[existingIndex] = list;
    } else {
      lists.push(list);
    }

    await AsyncStorage.setItem(SINGLE_LISTS_KEY, JSON.stringify(lists));
  }

  /**
   * Obtém todas as listas de compras avulsas
   */
  async getAllSingleLists(): Promise<ShoppingList[]> {
    const data = await AsyncStorage.getItem(SINGLE_LISTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Remove uma lista de compras avulsa
   */
  async deleteSingleList(listId: string): Promise<void> {
    const lists = await this.getAllSingleLists();
    const updatedLists = lists.filter(list => list.id !== listId);
    await AsyncStorage.setItem(SINGLE_LISTS_KEY, JSON.stringify(updatedLists));
  }

  /**
   * Consolida ingredientes iguais em uma lista
   */
  consolidateIngredients(items: ShoppingItem[]): ShoppingItem[] {
    const consolidated = new Map<string, ShoppingItem>();

    items.forEach(item => {
      const key = item.name.toLowerCase().trim();
      if (consolidated.has(key)) {
        // Tenta somar as quantidades se possível
        const existing = consolidated.get(key)!;
        const existingNum = this.extractNumber(existing.quantity);
        const newNum = this.extractNumber(item.quantity);

        if (existingNum !== null && newNum !== null) {
          existing.quantity = `${existingNum + newNum}${this.extractUnit(existing.quantity)}`;
        } else {
          // Se não conseguir somar, mantém as quantidades separadas
          existing.quantity = `${existing.quantity}, ${item.quantity}`;
        }

        // Adiciona referência à receita se for de uma nova
        if (item.recipeTitle && !existing.recipeTitle?.includes(item.recipeTitle)) {
          existing.recipeTitle = existing.recipeTitle
            ? `${existing.recipeTitle}, ${item.recipeTitle}`
            : item.recipeTitle;
        }
      } else {
        consolidated.set(key, { ...item });
      }
    });

    return Array.from(consolidated.values());
  }

  /**
   * Extrai o número de uma string de quantidade
   */
  private extractNumber(quantity: string): number | null {
    const match = quantity.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  }

  /**
   * Extrai a unidade de uma string de quantidade
   */
  private extractUnit(quantity: string): string {
    const match = quantity.match(/[a-zA-Z]+/);
    return match ? match[0] : '';
  }

  /**
   * Gera um ID único para uma lista
   */
  generateListId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default new ShoppingListService(); 