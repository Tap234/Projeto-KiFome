import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Converts an audio file to WAV format with Wit.ai specifications
 * @param {string} inputPath - Path to input audio file
 * @returns {Promise<string>} Path to converted WAV file
 */
export const convertToWav = async (inputPath) => {
  const outputPath = join(dirname(inputPath), `${Date.now()}_converted.wav`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .audioChannels(1) // Mono
      .audioFrequency(16000) // 16kHz
      .audioCodec('pcm_s16le') // 16-bit PCM
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};

/**
 * Transcribes audio using Wit.ai Speech API
 * @param {string} audioPath - Path to WAV audio file
 * @returns {Promise<string>} Transcribed text
 */
export const transcribeAudio = async (audioPath) => {
  const witToken = process.env.WIT_AI_SERVER_TOKEN;
  if (!witToken) {
    throw new Error('WIT_AI_SERVER_TOKEN environment variable is not set');
  }

  const audioData = await fs.readFile(audioPath);

  const response = await fetch('https://api.wit.ai/speech?v=20240616', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${witToken}`,
      'Content-Type': 'audio/wav',
    },
    body: audioData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Wit.ai API error: ${error}`);
  }

  const data = await response.json();
  return data.text || '';
};

/**
 * Cleans up temporary files
 * @param {string[]} filePaths - Array of file paths to delete
 */
export const cleanupTempFiles = async (filePaths) => {
  for (const path of filePaths) {
    try {
      await fs.unlink(path);
    } catch (error) {
      console.error(`Error deleting file ${path}:`, error);
    }
  }
}; 