/**
 * Storage Service for VeriPay Mini App
 * Handles local data persistence and caching
 */

export class StorageService {
  constructor() {
    this.prefix = 'veripay_';
    this.encryptionKey = 'veripay_secure_key'; // In production, use proper encryption
  }

  // Generic storage methods
  set(key, value, encrypt = false) {
    try {
      const data = encrypt ? this.encrypt(JSON.stringify(value)) : JSON.stringify(value);
      localStorage.setItem(this.prefix + key, data);
      return true;
    } catch (error) {
      console.error('Failed to store data:', error);
      return false;
    }
  }

  get(key, decrypt = false) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      if (!data) return null;
      
      const parsed = decrypt ? JSON.parse(this.decrypt(data)) : JSON.parse(data);
      return parsed;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Failed to remove data:', error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  // User data methods
  setUser(user) {
    return this.set('user', user, true);
  }

  getUser() {
    return this.get('user', true);
  }

  removeUser() {
    return this.remove('user');
  }

  // Theme preferences
  setTheme(theme) {
    return this.set('theme', theme);
  }

  getTheme() {
    return this.get('theme') || 'light';
  }

  // Transaction cache
  setTransactions(transactions) {
    return this.set('transactions', transactions);
  }

  getTransactions() {
    return this.get('transactions') || [];
  }

  addTransaction(transaction) {
    const transactions = this.getTransactions();
    transactions.unshift(transaction);
    return this.setTransactions(transactions.slice(0, 50)); // Keep last 50
  }

  // Analytics cache
  setAnalytics(analytics) {
    return this.set('analytics', analytics);
  }

  getAnalytics() {
    return this.get('analytics');
  }

  // Settings
  setSettings(settings) {
    return this.set('settings', settings);
  }

  getSettings() {
    return this.get('settings') || {
      notifications: true,
      haptic_feedback: true,
      auto_refresh: true,
      theme: 'auto'
    };
  }

  updateSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    return this.setSettings(settings);
  }

  // Cache management
  setCache(key, data, ttl = 300000) { // 5 minutes default TTL
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    };
    return this.set(`cache_${key}`, cacheData);
  }

  getCache(key) {
    const cacheData = this.get(`cache_${key}`);
    if (!cacheData) return null;

    const now = Date.now();
    if (now - cacheData.timestamp > cacheData.ttl) {
      this.remove(`cache_${key}`);
      return null;
    }

    return cacheData.data;
  }

  clearCache() {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix + 'cache_')
      );
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  // Offline data
  setOfflineData(key, data) {
    return this.set(`offline_${key}`, data);
  }

  getOfflineData(key) {
    return this.get(`offline_${key}`);
  }

  // Sync queue for offline actions
  addToSyncQueue(action) {
    const queue = this.getSyncQueue();
    queue.push({
      ...action,
      id: Date.now() + Math.random(),
      timestamp: Date.now()
    });
    return this.set('sync_queue', queue);
  }

  getSyncQueue() {
    return this.get('sync_queue') || [];
  }

  removeFromSyncQueue(id) {
    const queue = this.getSyncQueue();
    const filtered = queue.filter(item => item.id !== id);
    return this.set('sync_queue', filtered);
  }

  clearSyncQueue() {
    return this.remove('sync_queue');
  }

  // Simple encryption/decryption (not for production use)
  encrypt(text) {
    // This is a simple XOR encryption - use proper encryption in production
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
      );
    }
    return btoa(result);
  }

  decrypt(encryptedText) {
    try {
      const text = atob(encryptedText);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        );
      }
      return result;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  // Storage quota management
  getStorageUsage() {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (key.startsWith(this.prefix)) {
          total += localStorage[key].length;
        }
      }
      return {
        used: total,
        usedKB: Math.round(total / 1024 * 100) / 100,
        usedMB: Math.round(total / 1024 / 1024 * 100) / 100
      };
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return { used: 0, usedKB: 0, usedMB: 0 };
    }
  }

  // Cleanup old data
  cleanup() {
    try {
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      // Clean old cache entries
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix + 'cache_')
      );
      
      keys.forEach(key => {
        const cacheData = this.get(key.replace(this.prefix, ''));
        if (cacheData && now - cacheData.timestamp > maxAge) {
          localStorage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
      return false;
    }
  }

  // Export/Import data
  exportData() {
    try {
      const data = {};
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      
      keys.forEach(key => {
        data[key] = localStorage.getItem(key);
      });
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      const keys = Object.keys(data);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.setItem(key, data[key]);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}
