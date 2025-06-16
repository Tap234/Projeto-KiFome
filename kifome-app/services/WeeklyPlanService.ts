
class WeeklyPlanService {
  /**
   * Processa e agrupa ingredientes do planejamento semanal
   * @param weeklyPlan Objeto do planejamento semanal
   * @returns Array de strings com ingredientes agrupados e somados
   */
  static processWeeklyIngredients(weeklyPlan: any): string[] {
    const ingredientMap = new Map<string, { quantity: string; unit: string; name: string; description?: string }>();
    const specialIngredients = new Set<string>();
    const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

    // Coleta todos os ingredientes da semana
    for (const day of days) {
      const dayMeals = weeklyPlan.semana[day];
      const mealTypes = ['almoco', 'janta'];

      for (const mealType of mealTypes) {
        const meal = dayMeals[mealType];
        if (!meal?.ingredientes) continue;

        for (const ingredient of meal.ingredientes) {
          // Limpa e normaliza o ingrediente
          const cleanIngredient = this.cleanIngredientString(ingredient);

          // Processa ingredientes "a gosto" ou sem quantidade
          if (cleanIngredient.toLowerCase().includes('a gosto') || 
              cleanIngredient.toLowerCase().includes('quanto baste') ||
              !this.hasQuantity(cleanIngredient)) {
            specialIngredients.add(this.normalizeIngredientName(cleanIngredient));
            continue;
          }

          // Extrai quantidade, unidade, nome e descrição do ingrediente
          const { quantity, unit, name, description } = this.parseIngredient(cleanIngredient);
          const key = `${name.toLowerCase()}${description ? ` ${description.toLowerCase()}` : ''}`;

          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            if (existing.unit === unit) {
              // Soma as quantidades mantendo o formato fracionário quando necessário
              existing.quantity = this.sumQuantities(existing.quantity, quantity);
            }
          } else {
            ingredientMap.set(key, { quantity, unit, name, description });
          }
        }
      }
    }

    // Converte o Map em array de strings formatadas
    const processedIngredients = Array.from(ingredientMap.values())
      .map(({ quantity, unit, name, description }) => {
        const formattedQuantity = this.formatQuantity(quantity);
        const formattedName = this.formatIngredientName(name);
        const parts = [formattedQuantity];
        
        if (unit) parts.push(unit);
        parts.push(formattedName);
        if (description) parts.push(description);
        
        return parts.join(' ');
      });

    // Adiciona ingredientes especiais (a gosto, etc)
    const specialIngredientsArray = Array.from(specialIngredients);

    // Combina e ordena todos os ingredientes
    return [...processedIngredients, ...specialIngredientsArray]
      .sort((a, b) => this.normalizeIngredientName(a).localeCompare(this.normalizeIngredientName(b)));
  }

  /**
   * Limpa e padroniza a string do ingrediente
   */
  private static cleanIngredientString(ingredient: string): string {
    return ingredient
      .replace(/(\d+)([a-zA-Z])/g, '$1 $2') // Adiciona espaço entre número e letra
      .replace(/\s+/g, ' ') // Remove espaços múltiplos
      .trim();
  }

  /**
   * Verifica se uma string de ingrediente contém quantidade
   */
  private static hasQuantity(ingredient: string): boolean {
    return /^\d+([.,]\d+)?(\s*\+\s*\d+\/\d+)?/.test(ingredient.trim());
  }

  /**
   * Normaliza o nome do ingrediente removendo quantidades e unidades
   */
  private static normalizeIngredientName(ingredient: string): string {
    return ingredient
      .replace(/^\d+([.,]\d+)?(\s*\+\s*\d+\/\d+)?\s*(g|kg|ml|l|xícara|xícaras|colher|colheres|unidade|unidades|dente|dentes|maço|maços|a gosto|quanto baste)\s+d[ea]?\s*/i, '')
      .trim()
      .toLowerCase()
      .replace(/^[a-z]/, letter => letter.toUpperCase());
  }

  /**
   * Formata o nome do ingrediente com capitalização apropriada
   */
  private static formatIngredientName(name: string): string {
    // Lista de palavras que devem permanecer em minúsculo
    const lowercaseWords = ['de', 'do', 'da', 'dos', 'das', 'para', 'em', 'com'];
    
    // Lista de nomes próprios e siglas que devem manter maiúsculas
    const properNouns = ['Hortelã', 'Sour cream', 'Cream cheese'];
    
    // Verifica se é um nome próprio
    const properNoun = properNouns.find(pn => name.toLowerCase() === pn.toLowerCase());
    if (properNoun) return properNoun;

    return name.toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !lowercaseWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
      })
      .join(' ');
  }

  /**
   * Extrai quantidade, unidade, nome e descrição de um ingrediente
   */
  private static parseIngredient(ingredient: string): { 
    quantity: string; 
    unit: string; 
    name: string;
    description?: string;
  } {
    // Padrão para capturar quantidade (incluindo frações), unidade, nome e descrição opcional
    const match = ingredient.match(
      /^(\d+(?:\s*\+\s*\d+\/\d+)?|\d+\/\d+)\s*([^\d\s]+)?\s+(.+?)(?:\s+(picad[oa]|cortad[oa]|em\s+cubos|em\s+rodelas|em\s+fatias|ralad[oa]))?$/
    );
    
    if (!match) {
      return {
        quantity: '1',
        unit: '',
        name: this.normalizeIngredientName(ingredient)
      };
    }

    const [, quantity, unit = '', name, description = ''] = match;

    // Normaliza unidades comuns
    const unitMappings: { [key: string]: string } = {
      'g': 'g',
      'grama': 'g',
      'gramas': 'g',
      'kg': 'kg',
      'ml': 'ml',
      'l': 'L',
      'litro': 'L',
      'litros': 'L',
      'xicara': 'xícara',
      'xicaras': 'xícara',
      'xícaras': 'xícara',
      'colher': 'colher',
      'colheres': 'colher',
      'unidade': 'un',
      'unidades': 'un',
      'dente': 'dente',
      'dentes': 'dente',
      'maco': 'maço',
      'macos': 'maço',
      'maço': 'maço',
      'maços': 'maço'
    };

    return {
      quantity: quantity.trim(),
      unit: unitMappings[unit.toLowerCase()] || unit,
      name: this.formatIngredientName(name.trim()),
      description: description ? description.trim() : undefined
    };
  }

  /**
   * Soma duas quantidades, mantendo o formato fracionário quando necessário
   */
  private static sumQuantities(q1: string, q2: string): string {
    // Função auxiliar para converter fração em decimal
    const fractionToDecimal = (fraction: string): number => {
      const parts = fraction.split('/');
      return parts.length === 2 ? parseInt(parts[0]) / parseInt(parts[1]) : parseFloat(fraction);
    };

    // Função auxiliar para converter decimal em fração
    const decimalToFraction = (decimal: number): string => {
      if (Number.isInteger(decimal)) return decimal.toString();
      
      const whole = Math.floor(decimal);
      const fractional = decimal - whole;
      
      // Converte para fração usando denominadores comuns na culinária
      const denominators = [2, 3, 4, 8];
      for (const denominator of denominators) {
        const numerator = Math.round(fractional * denominator);
        if (Math.abs(fractional - numerator/denominator) < 0.01) {
          if (whole > 0) {
            return `${whole} + ${numerator}/${denominator}`;
          }
          return `${numerator}/${denominator}`;
        }
      }
      
      return decimal.toFixed(2);
    };

    // Processa cada quantidade
    const processQuantity = (q: string): number => {
      if (q.includes('+')) {
        const [whole, fraction] = q.split('+').map(p => p.trim());
        return parseInt(whole) + fractionToDecimal(fraction);
      }
      return fractionToDecimal(q);
    };

    const sum = processQuantity(q1) + processQuantity(q2);
    return decimalToFraction(sum);
  }

  /**
   * Formata a quantidade para exibição
   */
  private static formatQuantity(quantity: string): string {
    if (quantity.includes('+')) {
      return quantity.split('+').map(p => p.trim()).join(' + ');
    }
    return quantity;
  }
}

export default WeeklyPlanService; 