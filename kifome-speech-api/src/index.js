import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { cleanupTempFiles, convertToWav, transcribeAudio } from './audioUtils.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file upload
const upload = multer({
  dest: process.env.TEMP_DIR || join(__dirname, '../tmp'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Enable CORS
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Convert audio to WAV endpoint
app.post('/convert-to-wav', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const wavFile = await convertToWav(req.file.path);

    // Set headers for WAV file download
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', `attachment; filename="converted.wav"`);
    
    // Stream the file
    res.sendFile(wavFile, async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Cleanup temp files after sending
      await cleanupTempFiles([req.file.path, wavFile]);
    });
  } catch (error) {
    console.error('Error converting audio:', error);
    res.status(500).json({ error: 'Failed to convert audio file' });
    await cleanupTempFiles([req.file.path]);
  }
});

// Transcribe audio using Wit.ai endpoint
app.post('/wit-transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const wavFile = await convertToWav(req.file.path);
    const transcript = await transcribeAudio(wavFile);

    // Cleanup temp files
    await cleanupTempFiles([req.file.path, wavFile]);

    res.json({ transcript });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
    await cleanupTempFiles([req.file.path]);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 