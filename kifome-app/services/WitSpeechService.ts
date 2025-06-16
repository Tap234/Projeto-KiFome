import * as FileSystem from 'expo-file-system';
import { WIT_API_URL, WIT_API_VERSION, getWitHeaders, validateWitToken } from '../config/wit';

class WitSpeechService {
  private static instance: WitSpeechService;

  private constructor() {
    validateWitToken();
  }

  public static getInstance(): WitSpeechService {
    if (!WitSpeechService.instance) {
      WitSpeechService.instance = new WitSpeechService();
    }
    return WitSpeechService.instance;
  }

  private async readAudioFile(uri: string): Promise<ArrayBuffer> {
    try {
      // Ler o arquivo como base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Converter base64 para ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (error) {
      console.error('Erro ao ler arquivo de áudio:', error);
      throw new Error('Falha ao ler arquivo de áudio');
    }
  }

  public async recognizeSpeech(audioUri: string): Promise<string> {
    try {
      // Ler e converter o arquivo de áudio
      const audioData = await this.readAudioFile(audioUri);

      // Enviar para o Wit.ai
      const witResponse = await fetch(`${WIT_API_URL}?v=${WIT_API_VERSION}`, {
        method: 'POST',
        headers: {
          ...getWitHeaders('audio/raw'),
          'Transfer-Encoding': 'chunked'
        },
        body: audioData
      });

      if (!witResponse.ok) {
        const errorText = await witResponse.text();
        console.error('Resposta do Wit.ai:', {
          status: witResponse.status,
          statusText: witResponse.statusText,
          body: errorText
        });
        throw new Error(`Erro na API do Wit.ai: ${witResponse.status} - ${errorText}`);
      }

      const data = await witResponse.json();
      
      // Wit.ai retorna o texto reconhecido em data.text
      if (!data.text) {
        throw new Error('Nenhum texto reconhecido');
      }

      return data.text;
    } catch (error) {
      console.error('Erro ao reconhecer fala:', error);
      throw error;
    }
  }
}

export default WitSpeechService; 