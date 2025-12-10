import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { firestore, storage, auth } from '../services/firebase.service';
import { logAnalyticsEvent, AnalyticsEvent } from '../services/analytics.service';
import toast from 'react-hot-toast';

/**
 * Data management utilities
 * Handles data export, cache clearing, and deletion
 * Adapted from cap2cal's dataManagement.ts
 */

export const exportUserData = async (userId: string): Promise<void> => {
  try {
    // Fetch all user conversations
    const conversationsRef = collection(firestore, `users/${userId}/conversations`);
    const conversationsSnapshot = await getDocs(conversationsRef);

    const conversations = [];
    for (const convDoc of conversationsSnapshot.docs) {
      const conversationData = convDoc.data();

      // Fetch messages for this conversation
      const messagesRef = collection(
        firestore,
        `users/${userId}/conversations/${convDoc.id}/messages`
      );
      const messagesSnapshot = await getDocs(messagesRef);

      const messages = messagesSnapshot.docs.map((msgDoc) => ({
        role: msgDoc.data().role,
        text: msgDoc.data().text,
        createdAt: msgDoc.data().createdAt?.toDate().toISOString(),
        isCrisis: msgDoc.data().isCrisisResponse || false,
      }));

      conversations.push({
        id: convDoc.id,
        title: conversationData.title,
        createdAt: conversationData.createdAt?.toDate().toISOString(),
        messageCount: messages.length,
        messages,
      });
    }

    // Build export JSON
    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      appVersion: '0.1.0',
      conversations,
      settings: {
        hapticsEnabled: localStorage.getItem('hapticsEnabled'),
        analyticsEnabled: localStorage.getItem('analyticsEnabled'),
        soundEffectsEnabled: localStorage.getItem('soundEffectsEnabled'),
        pinkNoiseVolume: localStorage.getItem('pinkNoiseVolume'),
      },
    };

    // Create JSON blob and trigger download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anxiety-buddy-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logAnalyticsEvent(AnalyticsEvent.DATA_EXPORTED);
    toast.success('Data exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
    logAnalyticsEvent(AnalyticsEvent.DATA_EXPORT_FAILED);
    toast.error('Export failed. Please try again.');
  }
};

export const clearLocalStorage = async (): Promise<void> => {
  try {
    // Clear audio cache
    localStorage.removeItem('audioCache');

    // Delete old audio files from Cloud Storage (older than 7 days)
    // This is a placeholder - actual implementation would need Cloud Function

    logAnalyticsEvent(AnalyticsEvent.CACHE_CLEARED);
    toast.success('Cache cleared successfully');
  } catch (error) {
    console.error('Clear cache failed:', error);
    logAnalyticsEvent(AnalyticsEvent.CACHE_CLEAR_FAILED);
    toast.error('Failed to clear cache');
  }
};

export const deleteAllUserData = async (userId: string): Promise<void> => {
  try {
    // 1. Delete all conversations and messages
    const conversationsRef = collection(firestore, `users/${userId}/conversations`);
    const conversationsSnapshot = await getDocs(conversationsRef);

    for (const convDoc of conversationsSnapshot.docs) {
      // Delete messages
      const messagesRef = collection(
        firestore,
        `users/${userId}/conversations/${convDoc.id}/messages`
      );
      const messagesSnapshot = await getDocs(messagesRef);

      for (const msgDoc of messagesSnapshot.docs) {
        await deleteDoc(msgDoc.ref);
      }

      // Delete conversation
      await deleteDoc(convDoc.ref);
    }

    // 2. Delete all audio files from Cloud Storage
    const audioRef = ref(storage, `audio-messages/${userId}`);
    try {
      const audioList = await listAll(audioRef);
      for (const item of audioList.items) {
        await deleteObject(item);
      }
    } catch (error) {
      // Ignore if folder doesn't exist
    }

    // 3. Clear localStorage (except settings)
    const keysToKeep = [
      'hapticsEnabled',
      'analyticsEnabled',
      'soundEffectsEnabled',
      'pinkNoiseVolume',
      'i18nextLng',
    ];
    Object.keys(localStorage).forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    logAnalyticsEvent(AnalyticsEvent.DATA_DELETED);
    toast.success('All data deleted');
  } catch (error) {
    console.error('Delete failed:', error);
    logAnalyticsEvent(AnalyticsEvent.DATA_DELETE_FAILED);
    toast.error('Deletion failed. Please try again.');
  }
};

export const deleteUserAccount = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // 1. Delete all user data
    await deleteAllUserData(user.uid);

    // 2. Delete Firebase Auth user
    await user.delete();

    logAnalyticsEvent(AnalyticsEvent.ACCOUNT_DELETED);
    toast.success('Account deleted. Goodbye.');

    // 3. Reload app (clears all state)
    setTimeout(() => window.location.reload(), 1000);
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      toast.error('Please sign in again to delete your account');
      // TODO: Trigger re-authentication flow
    } else {
      console.error('Account deletion failed:', error);
      logAnalyticsEvent(AnalyticsEvent.ACCOUNT_DELETE_FAILED);
      toast.error('Account deletion failed. Please try again.');
    }
  }
};
