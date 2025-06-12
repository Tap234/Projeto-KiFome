import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const testFirestoreConnection = async () => {
  try {
    // Teste de escrita
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, {
      timestamp: new Date().toISOString(),
      test: true
    });
    console.log('✅ Teste de escrita bem-sucedido:', testDoc.id);

    // Teste de leitura
    const querySnapshot = await getDocs(testCollection);
    console.log('✅ Teste de leitura bem-sucedido, documentos encontrados:', querySnapshot.size);

    return {
      success: true,
      writeId: testDoc.id,
      readCount: querySnapshot.size
    };
  } catch (error) {
    console.error('❌ Erro no teste do Firestore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}; 