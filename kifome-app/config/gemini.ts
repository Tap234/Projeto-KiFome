const GEMINI_API_KEY = 'AIzaSyD0waVFy-MueLS2tbKqBN09gvPC0sVulWc';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

const callGeminiAPI = async (prompt: string): Promise<any> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  const data: GeminiResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Erro ao gerar conteúdo');
  }

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Formato de resposta inválido da API');
  }

  const rawText = data.candidates[0].content.parts[0].text;
  const cleanText = rawText
    .replace(/^`{0,3}json\n?/, '') // Remove o início do bloco JSON e backticks
    .replace(/^{/, '{') // Garante que começa com {
    .replace(/`{0,3}$/, '') // Remove backticks do final
    .trim(); // Remove espaços em branco extras

  try {
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Erro ao fazer parse do JSON:', error);
    throw new Error('Erro ao processar a resposta');
  }
};

export const generateRecipe = async (
  ingredients: string[],
  prepTime: number,
  peopleCount: number,
  restrictions: string[] = []
) => {
  try {
    const restrictionsText = restrictions.length > 0
      ? `Com as seguintes restrições: ${restrictions.join(' e ')}.`
      : '';

    const prompt = `Crie uma receita usando os seguintes ingredientes: ${ingredients.join(', ')}.
O tempo de preparo deve ser de aproximadamente ${prepTime} minutos.
Para ${peopleCount} pessoa${peopleCount > 1 ? 's' : ''}. ${restrictionsText}
Retorne apenas um objeto JSON puro, sem marcadores de código ou formatação extra, no seguinte formato:
{
  "titulo": "Nome da Receita",
  "tempoPreparo": "tempo em minutos",
  "descricao": "Breve descrição da receita",
  "passos": ["passo 1", "passo 2", "..."],
  "ingredientes": ["ingrediente 1 com quantidade", "ingrediente 2 com quantidade", "..."]
}`;

    const recipe = await callGeminiAPI(prompt);

    // Limpa os passos removendo duplicações
    if (recipe.passos) {
      recipe.passos = recipe.passos.filter(
        (passo: string, index: number, array: string[]) =>
          array.indexOf(passo) === index && !passo.includes('(se')
      );
    }

    return recipe;
  } catch (error) {
    console.error('Erro ao gerar receita:', error);
    throw error;
  }
};

export const generateWeeklyPlan = async (
  includeLunch: boolean,
  includeDinner: boolean,
  peopleCount: number,
  prepTime: number,
  restrictions: string[] = []
) => {
  try {
    const meals = [];
    if (includeLunch) meals.push('almoço');
    if (includeDinner) meals.push('janta');

    const restrictionsText = restrictions.length > 0
      ? `Com as seguintes restrições alimentares: ${restrictions.join(' e ')}.`
      : '';

    const prompt = `Gere um plano semanal de refeições para ${meals.join(' e ')}, considerando ${peopleCount} pessoa${peopleCount > 1 ? 's' : ''}.
${restrictionsText}
Cada receita deve poder ser preparada em no máximo ${prepTime} minutos.

Para cada dia e refeição, forneça uma receita diferente das demais, garantindo variedade no cardápio.
Não repita receitas na mesma semana.
Ajuste as quantidades dos ingredientes para o número de pessoas.

IMPORTANTE: Use SEMPRE "almoco" e "janta" (sem acentos) como nomes dos campos.

Retorne apenas um objeto JSON puro, sem marcadores de código ou formatação extra, no seguinte formato:
{
  "semana": {
    "segunda": {
      "almoco": {
        "titulo": "Nome da Receita",
        "tempoPreparo": "tempo em minutos",
        "descricao": "Breve descrição da receita",
        "passos": ["passo 1", "passo 2", "..."],
        "ingredientes": ["ingrediente 1 com quantidade", "ingrediente 2 com quantidade", "..."]
      },
      "janta": { ... }
    },
    "terca": { ... },
    "quarta": { ... },
    "quinta": { ... },
    "sexta": { ... },
    "sabado": { ... },
    "domingo": { ... }
  }
}`;

    console.log('🔄 Gerando planejamento semanal...');
    const weeklyPlan = await callGeminiAPI(prompt);
    console.log('📋 Planejamento recebido:', JSON.stringify(weeklyPlan, null, 2));

    // Verifica se o plano tem a estrutura básica esperada
    if (!weeklyPlan?.semana) {
      console.error('❌ Plano semanal inválido - falta objeto "semana"');
      throw new Error('Formato de resposta inválido: plano semanal não contém objeto "semana"');
    }

    // Estrutura esperada dos dias da semana
    const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    const titles = new Set<string>();

    // Cria um plano vazio com a estrutura correta
    const normalizedPlan = {
      semana: {} as any
    };

    // Normaliza e valida cada dia
    for (const day of days) {
      const dayMeals = weeklyPlan.semana[day] || {};
      normalizedPlan.semana[day] = {
        almoco: null,
        janta: null
      };

      // Processa almoço se necessário
      if (includeLunch) {
        const lunch = dayMeals.almoco;
        if (lunch?.titulo) {
          if (titles.has(lunch.titulo)) {
            console.warn(`⚠️ Receita duplicada detectada: ${lunch.titulo}`);
            continue;
          }
          titles.add(lunch.titulo);
          normalizedPlan.semana[day].almoco = {
            ...lunch,
            passos: lunch.passos?.filter((passo: string) => !passo.includes('(se')) || []
          };
        } else {
          console.warn(`⚠️ Almoço não encontrado para ${day}`);
        }
      }

      // Processa janta se necessário
      if (includeDinner) {
        const dinner = dayMeals.janta;
        if (dinner?.titulo) {
          if (titles.has(dinner.titulo)) {
            console.warn(`⚠️ Receita duplicada detectada: ${dinner.titulo}`);
            continue;
          }
          titles.add(dinner.titulo);
          normalizedPlan.semana[day].janta = {
            ...dinner,
            passos: dinner.passos?.filter((passo: string) => !passo.includes('(se')) || []
          };
        } else {
          console.warn(`⚠️ Janta não encontrada para ${day}`);
        }
      }
    }

    console.log('✅ Planejamento processado com sucesso');
    return normalizedPlan;
  } catch (error) {
    console.error('❌ Erro ao gerar plano semanal:', error);
    throw error;
  }
};