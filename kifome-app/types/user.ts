export interface UserPreferences {
  mealPreferences: {
    includeLunch: boolean;
    includeDinner: boolean;
    peopleCount: number;
  };
  dietaryRestrictions: {
    isVegetarian: boolean;
    isGlutenFree: boolean;
    isLactoseFree: boolean;
  };
  averagePreparationTime: number; // in minutes
  darkMode: boolean;
}

export interface Recipe {
  titulo: string;
  tempoPreparo: string;
  descricao: string;
  passos: string[];
  ingredientes: string[];
  servings?: number;
}

export interface DayMeals {
  almoco: Recipe | null;
  janta: Recipe | null;
}

export interface WeeklyPlan {
  semana: {
    segunda: DayMeals;
    terca: DayMeals;
    quarta: DayMeals;
    quinta: DayMeals;
    sexta: DayMeals;
    sabado: DayMeals;
    domingo: DayMeals;
  };
}

/**
 * Representa um item em uma lista de compras
 */
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  recipeId?: string;  // ID da receita de origem (opcional)
  recipeTitle?: string;  // Título da receita de origem (opcional)
}

/**
 * Representa uma lista de compras completa
 */
export interface ShoppingList {
  id: string;
  title: string;
  type: 'weekly' | 'single';  // weekly para semanal, single para receita única
  items: ShoppingItem[];
  createdAt: number;
  weekId?: string;  // ID da semana do planejamento (apenas para type='weekly')
  recipeId?: string;  // ID da receita (apenas para type='single')
} 