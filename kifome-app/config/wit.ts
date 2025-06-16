import Constants from 'expo-constants';

// O token deve ser definido em app.config.js ou .env
const WIT_TOKEN = Constants.expoConfig?.extra?.witToken || '';

export const WIT_API_URL = 'https://api.wit.ai/speech';
export const WIT_API_VERSION = '20240320';

export const getWitHeaders = (contentType: string = 'audio/wav') => ({
  'Authorization': `Bearer ${WIT_TOKEN}`,
  'Content-Type': contentType,
  'Accept': 'application/json',
});

export const validateWitToken = () => {
  if (!WIT_TOKEN) {
    throw new Error('Wit.ai token não encontrado. Configure o token em app.config.js ou .env');
  }
  return true;
}; 