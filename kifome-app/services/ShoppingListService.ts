import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingItem, ShoppingList } from '../types/user';

const WEEKLY_LIST_KEY = '@kifome:weekly_shopping_list';

/**
 * Serviço para gerenciar a lista de compras semanal
 */
class ShoppingListService {
  /**
   * Gera um ID único para itens da lista
   */
  generateListId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

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
   * Limpa a lista de compras semanal
   */
  async clearWeeklyList(): Promise<void> {
    await AsyncStorage.removeItem(WEEKLY_LIST_KEY);
  }

  /**
   * Atualiza um item na lista semanal
   */
  async updateWeeklyListItem(itemId: string, updates: Partial<ShoppingItem>): Promise<void> {
    const list = await this.getWeeklyList();
    if (!list) return;

    const updatedList = {
      ...list,
      items: list.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    };

    await this.saveWeeklyList(updatedList);
  }

  /**
   * Adiciona novos itens à lista semanal, consolidando com os existentes
   */
  async addItemsToWeeklyList(newItems: ShoppingItem[]): Promise<void> {
    const list = await this.getWeeklyList();
    
    if (!list) {
      // Se não existe lista, cria uma nova
      const newList: ShoppingList = {
        id: this.generateListId(),
        title: 'Lista de Compras Semanal',
        type: 'weekly',
        items: newItems,
        createdAt: Date.now()
      };
      await this.saveWeeklyList(newList);
    } else {
      // Se já existe, adiciona os itens e consolida
      const allItems = [...list.items, ...newItems];
      const consolidatedItems = this.consolidateIngredients(allItems);
      
      await this.saveWeeklyList({
        ...list,
        items: consolidatedItems
      });
    }
  }

  /**
   * Consolida ingredientes iguais em uma lista
   */
  consolidateIngredients(items: ShoppingItem[]): ShoppingItem[] {
    const consolidated = new Map<string, ShoppingItem>();

    // Primeiro passo: normalizar os nomes dos ingredientes
    items.forEach(item => {
      const normalizedName = this.normalizeIngredientName(item.name);
      const key = normalizedName.toLowerCase().trim();
      
      if (consolidated.has(key)) {
        const existing = consolidated.get(key)!;
        const existingQuantity = this.parseQuantity(existing.quantity);
        const newQuantity = this.parseQuantity(item.quantity);

        // Se ambos têm "a gosto", mantém apenas um
        if (item.quantity.toLowerCase().includes('a gosto') || existing.quantity.toLowerCase().includes('a gosto')) {
          existing.quantity = 'a gosto';
        }
        // Se ambos têm unidades compatíveis, soma
        else if (existingQuantity && newQuantity && existingQuantity.unit === newQuantity.unit) {
          existing.quantity = `${existingQuantity.value + newQuantity.value} ${existingQuantity.unit}`;
        }
        // Se não tem unidade ou são unidades diferentes, lista separadamente
        else if (!existingQuantity.unit && !newQuantity.unit) {
          existing.quantity = `${existingQuantity.value + newQuantity.value}`;
        }
        else {
          existing.quantity = `${existing.quantity}, ${item.quantity}`;
        }

        // Adiciona referência à receita se for de uma nova
        if (item.recipeTitle && !existing.recipeTitle?.includes(item.recipeTitle)) {
          existing.recipeTitle = existing.recipeTitle
            ? `${existing.recipeTitle}, ${item.recipeTitle}`
            : item.recipeTitle;
        }
      } else {
        consolidated.set(key, { 
          ...item,
          name: normalizedName // Usa o nome normalizado
        });
      }
    });

    // Converte o Map em array e ordena por nome
    return Array.from(consolidated.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Normaliza o nome do ingrediente removendo quantidades e unidades
   */
  private normalizeIngredientName(name: string): string {
    // Remove números e unidades comuns do início do nome
    return name.replace(/^[\d\s.,]+(xícara|colher|colheres|g|kg|ml|l|unidade|unidades|dente|dentes|maço|maços|a gosto)\s+d[ea]?\s*/i, '')
              .trim()
              .toLowerCase()
              // Capitaliza primeira letra
              .replace(/^[a-z]/, letter => letter.toUpperCase());
  }

  /**
   * Extrai quantidade e unidade de uma string
   */
  private parseQuantity(quantity: string): { value: number; unit: string } {
    if (quantity.toLowerCase().includes('a gosto')) {
      return { value: 0, unit: 'a gosto' };
    }

    const match = quantity.match(/^([\d.,]+)\s*([^\d.,]+)?/);
    if (!match) return { value: 0, unit: '' };

    const value = parseFloat(match[1].replace(',', '.'));
    let unit = (match[2] || '').trim().toLowerCase();

    // Normaliza unidades comuns
    const unitMappings: { [key: string]: string } = {
      'xicara': 'xícara',
      'xicaras': 'xícara',
      'xícaras': 'xícara',
      'colher de sopa': 'colher (sopa)',
      'colheres de sopa': 'colher (sopa)',
      'colher de sobremesa': 'colher (sobremesa)',
      'colheres de sobremesa': 'colher (sobremesa)',
      'colher de cha': 'colher (chá)',
      'colher de chá': 'colher (chá)',
      'colheres de cha': 'colher (chá)',
      'colheres de chá': 'colher (chá)',
      'grama': 'g',
      'gramas': 'g',
      'ml': 'mL',
      'mililitro': 'mL',
      'mililitros': 'mL',
      'litro': 'L',
      'litros': 'L',
      'unidade': 'un',
      'unidades': 'un',
      'dente': 'dente',
      'dentes': 'dente',
      'maco': 'maço',
      'maço': 'maço',
      'macos': 'maço',
      'maços': 'maço'
    };

    unit = unitMappings[unit] || unit;

    return { value, unit };
  }
}

export default new ShoppingListService(); 