import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import i18next from 'i18next';
import { firestore, storage, auth } from '../services/firebase.service';
import { logAnalyticsEvent, AnalyticsEvent } from '../services/analytics.service';
import { isNativePlatform } from './platform';
import { showToast } from './toast';

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

    // Fetch all daily logs (Tide Log journal entries)
    const dailyLogsRef = collection(firestore, `users/${userId}/daily_logs`);
    const dailyLogsSnapshot = await getDocs(dailyLogsRef);

    const dailyLogs = dailyLogsSnapshot.docs.map((logDoc) => ({
      id: logDoc.id,
      date: logDoc.data().date,
      mood_depth: logDoc.data().mood_depth,
      weather: logDoc.data().weather,
      note_text: logDoc.data().note_text,
      is_released: logDoc.data().is_released,
      createdAt: logDoc.data().createdAt?.toDate().toISOString(),
      updatedAt: logDoc.data().updatedAt?.toDate().toISOString(),
    }));

    // Fetch all journal entries (Depths free-form journal)
    const journalEntriesRef = collection(firestore, `users/${userId}/journal_entries`);
    const journalEntriesSnapshot = await getDocs(journalEntriesRef);

    const journalEntries = journalEntriesSnapshot.docs.map((entryDoc) => ({
      id: entryDoc.id,
      date: entryDoc.data().date,
      sessions: entryDoc.data().sessions?.map((session: any) => ({
        id: session.id,
        text: session.text,
        wordCount: session.wordCount,
        startedAt: session.startedAt?.toDate?.()?.toISOString() || session.startedAt,
        fixedAt: session.fixedAt?.toDate?.()?.toISOString() || session.fixedAt,
      })),
      createdAt: entryDoc.data().createdAt?.toDate().toISOString(),
      updatedAt: entryDoc.data().updatedAt?.toDate().toISOString(),
    }));

    // Build export JSON
    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      appVersion: '0.1.0',
      conversations,
      dailyLogs,
      journalEntries,
      settings: {
        hapticsEnabled: localStorage.getItem('hapticsEnabled'),
        analyticsEnabled: localStorage.getItem('analyticsEnabled'),
        soundEffectsEnabled: localStorage.getItem('soundEffectsEnabled'),
        pinkNoiseVolume: localStorage.getItem('pinkNoiseVolume'),
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const filename = `anxiety-buddy-data-${new Date().toISOString().split('T')[0]}.json`;

    if (isNativePlatform()) {
      // Native: Save to cache and share
      try {
        const result = await Filesystem.writeFile({
          path: filename,
          data: jsonString,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        // Use Share API to let user save/share the file
        await Share.share({
          title: 'Anxiety Buddy Data Export',
          text: i18next.t('toasts.dataExported'),
          url: result.uri,
          dialogTitle: 'Save your data',
        });

        // Clean up cache file after sharing (delayed)
        setTimeout(async () => {
          try {
            await Filesystem.deleteFile({
              path: filename,
              directory: Directory.Cache,
            });
          } catch {
            // Ignore cleanup errors
          }
        }, 60000); // Clean up after 1 minute
      } catch (fsError) {
        console.error('Native file save failed, falling back to web:', fsError);
        // Fallback to web download
        downloadAsWebFile(jsonString, filename);
      }
    } else {
      // Web: Use browser download
      downloadAsWebFile(jsonString, filename);
    }

    logAnalyticsEvent(AnalyticsEvent.DATA_EXPORTED);
    showToast.success(i18next.t('toasts.dataExported'));
  } catch (error) {
    console.error('Export failed:', error);
    logAnalyticsEvent(AnalyticsEvent.DATA_EXPORT_FAILED);
    showToast.error(i18next.t('toasts.exportFailed'));
  }
};

/**
 * Helper function for web-based file download
 */
const downloadAsWebFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const clearLocalStorage = async (): Promise<void> => {
  try {
    // Clear audio cache
    localStorage.removeItem('audioCache');

    // Delete old audio files from Cloud Storage (older than 7 days)
    // This is a placeholder - actual implementation would need Cloud Function

    logAnalyticsEvent(AnalyticsEvent.CACHE_CLEARED);
    showToast.success(i18next.t('toasts.cacheCleared'));
  } catch (error) {
    console.error('Clear cache failed:', error);
    logAnalyticsEvent(AnalyticsEvent.CACHE_CLEAR_FAILED);
    showToast.error(i18next.t('toasts.clearCacheFailed'));
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

    // 2. Delete all daily logs
    const dailyLogsRef = collection(firestore, `users/${userId}/daily_logs`);
    const dailyLogsSnapshot = await getDocs(dailyLogsRef);

    for (const logDoc of dailyLogsSnapshot.docs) {
      await deleteDoc(logDoc.ref);
    }

    // 3. Delete all audio files from Cloud Storage
    const audioRef = ref(storage, `audio-messages/${userId}`);
    try {
      const audioList = await listAll(audioRef);
      for (const item of audioList.items) {
        await deleteObject(item);
      }
    } catch (error) {
      // Ignore if folder doesn't exist
    }

    // 4. Clear localStorage (except settings)
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
    showToast.success(i18next.t('toasts.dataDeleted'));
  } catch (error) {
    console.error('Delete failed:', error);
    logAnalyticsEvent(AnalyticsEvent.DATA_DELETE_FAILED);
    showToast.error(i18next.t('toasts.deleteFailed'));
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
    showToast.success(i18next.t('toasts.accountDeleted'));

    // 3. Reload app (clears all state)
    setTimeout(() => window.location.reload(), 1000);
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      showToast.error(i18next.t('toasts.accountDeleteReauth'));
      // TODO: Trigger re-authentication flow
    } else {
      console.error('Account deletion failed:', error);
      logAnalyticsEvent(AnalyticsEvent.ACCOUNT_DELETE_FAILED);
      showToast.error(i18next.t('toasts.deleteFailed'));
    }
  }
};
