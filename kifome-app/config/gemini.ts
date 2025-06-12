const GEMINI_API_KEY = 'AIzaSyD0waVFy-MueLS2tbKqBN09gvPC0sVulWc';

export const generateRecipe = async (ingredients: string[], prepTime: number) => {
  try {
    /*const prompt = `Crie uma receita usando os seguintes ingredientes: ${ingredients.join(', ')}. 
    O tempo de preparo deve ser de aproximadamente ${prepTime} minutos. 
    Retorne no formato JSON:
    {
      "titulo": "Nome da Receita",
      "tempoPreparo": tempo em minutos,
      "descricao": "Breve descrição da receita",
      "passos": ["passo 1", "passo 2", ...]
    };*/

    const prompt = `Crie uma receita usando os seguintes ingredientes: ${ingredients.join(', ')}. 
O tempo de preparo deve ser de aproximadamente ${prepTime} minutos. 
Retorne apenas um objeto JSON puro, sem marcadores de código ou formatação extra, no seguinte formato:
{
  "titulo": "Nome da Receita",
  "tempoPreparo": "tempo em minutos",
  "descricao": "Breve descrição da receita",
  "passos": ["passo 1", "passo 2", "..."]
}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    console.log("response", response);
    const data = await response.json();
    console.log("data", data);
    console.log("data.candidates", data.candidates);
    console.log("data.candidates[0]", data.candidates[0]);
    console.log("data.candidates[0].content", data.candidates[0].content);
    console.log("data.candidates[0].content.parts[0].text", data.candidates[0].content.parts[0].text);
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao gerar receita');
    }

    // Verifica se a resposta contém os dados necessários
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Formato de resposta inválido da API');
    }

    try {
      // Obtém o texto da resposta
      const rawText = data.candidates[0].content.parts[0].text;
      
      // Remove os marcadores de código JSON e limpa o texto
      let cleanText = rawText
        .replace(/^`{0,3}json\n?/, '')     // Remove o início do bloco JSON e backticks
        .replace(/^{/, '{')                // Garante que começa com {
        .replace(/`{0,3}$/, '')           // Remove backticks do final
        .trim();                          // Remove espaços em branco extras
      
      console.log("cleanText", cleanText);
      // Remove duplicações e corrige os passos
      const recipe = JSON.parse(cleanText);
      
      console.log("recipe", recipe);
      // Limpa os passos removendo duplicações
      if (recipe.passos) {
        recipe.passos = recipe.passos
          .filter((passo: string, index: number, array: string[]) => {
            // Remove passos duplicados ou incompletos
            return array.indexOf(passo) === index && !passo.includes('(se');
          });
      }

      return recipe;
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      throw new Error('Erro ao processar a resposta da receita');
    }
  } catch (error) {
    console.error('Erro ao gerar receita:', error);
    throw error;
  }
}; 