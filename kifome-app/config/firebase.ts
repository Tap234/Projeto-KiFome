import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBSi9QXYHsn9rEPBUQWuj7bVp0EByRbnk4",
  authDomain: "projeto-kifome.firebaseapp.com",
  projectId: "projeto-kifome",
  storageBucket: "projeto-kifome.appspot.com",
  messagingSenderId: "285555927985",
  appId: "1:285555927985:web:5b64e3a5e61cdc1ba8eb90",
  measurementId: "G-9P45FF8MNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Configuração específica para React Native
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Isso força o uso de long polling em vez de WebSocket
  cacheSizeBytes: 5242880, // 5MB
});

// Exportar a instância do Firestore
export { db };

