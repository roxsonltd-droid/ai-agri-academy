import NetInfo from '@react-native-community/netinfo';
import { getPendingActions, removePendingAction } from '../db/sqlite';

// Replace with actual backend URL in production
const BACKEND_URL = 'http://localhost:8000/api/v1';

export class SyncEngine {
  private isSyncing = false;
  private unsubscribe: (() => void) | null = null;

  start() {
    // Listen for network state changes
    this.unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.sync();
      }
    });
  }

  stop() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async sync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const actions = getPendingActions();
      if (actions.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`Starting sync for ${actions.length} offline actions...`);

      // Send all pending actions to the backend as a batch
      const response = await fetch(`${BACKEND_URL}/sync/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions })
      });

      if (response.ok) {
        // If batch sync is successful, remove them from local DB
        actions.forEach(action => removePendingAction(action.id));
        console.log('Sync completed successfully.');
      } else {
        console.error('Sync failed with status:', response.status);
      }
    } catch (error) {
      console.error('Sync engine error:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncEngine = new SyncEngine();
