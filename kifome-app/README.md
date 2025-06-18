# KiFome Speech API

Backend service for audio conversion and Wit.ai speech transcription, designed to work with the KiFome app.

## Prerequisites

1. Node.js 18+ and npm
2. FFmpeg installed on your system:

### Installing FFmpeg

**Windows:**
1. Download FFmpeg from [FFmpeg Windows Builds](https://github.com/BtbN/FFmpeg-Builds/releases)
2. Extract the zip file
3. Add the `bin` folder to your system's PATH environment variable

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS (using Homebrew):**
```bash
brew install ffmpeg
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
4. Edit `.env` and add your Wit.ai Server Access Token

## Usage

### Start the server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### API Endpoints

1. **Convert Audio to WAV**
   - Endpoint: `POST /convert-to-wav`
   - Content-Type: `multipart/form-data`
   - Body: 
     - `audio`: Audio file (m4a, aac, mp3, wav, etc.)
   - Response: WAV file (audio/wav)

2. **Transcribe Audio**
   - Endpoint: `POST /wit-transcribe`
   - Content-Type: `multipart/form-data`
   - Body:
     - `audio`: Audio file (m4a, aac, mp3, wav, etc.)
   - Response: JSON
     ```json
     {
       "transcript": "transcribed text here"
     }
     ```

### Example Usage with cURL

Convert to WAV:
```bash
curl -X POST -F "audio=@recording.m4a" http://localhost:3000/convert-to-wav --output converted.wav
```

Transcribe audio:
```bash
curl -X POST -F "audio=@recording.m4a" http://localhost:3000/wit-transcribe
```

### Example Usage with Expo/React Native

```javascript
import * as FileSystem from 'expo-file-system';

// After recording audio with expo-av...
const formData = new FormData();
formData.append('audio', {
  uri: audioUri,
  type: 'audio/m4a',
  name: 'recording.m4a'
});

const response = await fetch('http://localhost:3000/wit-transcribe', {
  method: 'POST',
  body: formData,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const { transcript } = await response.json();
console.log('Transcription:', transcript);
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `WIT_AI_SERVER_TOKEN`: Your Wit.ai Server Access Token
- `TEMP_DIR`: Directory for temporary files (optional, defaults to ./tmp)

## Error Handling

The API returns appropriate HTTP status codes:
- 400: Bad Request (no audio file provided)
- 500: Internal Server Error (conversion/transcription failed)

Response format for errors:
```json
{
  "error": "error message here"
}
```
