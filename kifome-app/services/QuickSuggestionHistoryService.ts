import { addDoc, collection, deleteDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface QuickSuggestion {
  id?: string;
  userId: string;
  title: string;
  ingredients: string[];
  steps?: string[];
  timestamp: Date;
  checkedItems: { [key: string]: boolean };
}

class QuickSuggestionHistoryService {
  private readonly COLLECTION_NAME = 'historico_sugestoes_rapidas';

  async addSuggestion(userId: string, suggestion: Omit<QuickSuggestion, 'id' | 'userId' | 'timestamp'>): Promise<void> {
    try {
      // Get the current count of suggestions for this user
      const userSuggestionsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(userSuggestionsQuery);
      
      // If there are already 5 suggestions, delete the oldest one
      if (querySnapshot.size >= 5) {
        const oldestDoc = querySnapshot.docs[querySnapshot.size - 1];
        await deleteDoc(oldestDoc.ref);
      }

      // Add the new suggestion
      await addDoc(collection(db, this.COLLECTION_NAME), {
        userId,
        ...suggestion,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error adding quick suggestion to history:', error);
      throw error;
    }
  }

  async getHistory(userId: string): Promise<QuickSuggestion[]> {
    try {
      const historyQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(historyQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as QuickSuggestion[];
    } catch (error) {
      console.error('Error getting quick suggestions history:', error);
      throw error;
    }
  }
}

export default new QuickSuggestionHistoryService(); 