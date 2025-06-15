import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface QuickSuggestion {
  id?: string;
  userId: string;
  title: string;
  ingredients: string[];
  steps?: string[];
  timestamp: Date;
  checkedItems: { [key: string]: boolean };
  servings: number;
}

class QuickSuggestionHistoryService {
  private readonly COLLECTION_NAME = 'historico_sugestoes_rapidas';

  async addSuggestion(userId: string, suggestion: Omit<QuickSuggestion, 'id' | 'userId' | 'timestamp'>): Promise<void> {
    try {
      // Get the current count of suggestions for this user
      const userSuggestionsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(userSuggestionsQuery);
      const suggestions = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // If there are already 5 suggestions, delete the oldest one
      if (suggestions.length >= 5) {
        const oldestDoc = suggestions[suggestions.length - 1];
        await deleteDoc(doc(db, this.COLLECTION_NAME, oldestDoc.id));
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
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(historyQuery);
      const suggestions = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);

      return suggestions as QuickSuggestion[];
    } catch (error) {
      console.error('Error getting quick suggestions history:', error);
      throw error;
    }
  }
}

export default new QuickSuggestionHistoryService(); 