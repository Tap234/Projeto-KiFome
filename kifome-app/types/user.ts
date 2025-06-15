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