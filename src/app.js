/**
 * VeriPay Mini App - Main Application Logic
 * Modern ES6+ JavaScript with advanced features
 */

import telegramService from './services/telegram.js';
import { ApiService } from './services/api.js';
import { StorageService } from './services/storage.js';
import { formatCurrency, formatDate, formatTime } from './utils/formatters.js';

class VeriPayApp {
  constructor() {
    this.api = new ApiService();
    this.storage = new StorageService();
    this.currentView = 'main';
    this.user = null;
    this.transactions = [];
    
    this.init();
  }

  async init() {
    try {
      // Wait for Telegram to be ready
      await this.waitForTelegram();
      
      // Initialize user data
      await this.initializeUser();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadInitialData();
      
      // Show the app
      this.showApp();
      
      console.log('VeriPay App initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize VeriPay App:', error);
      this.showError('Failed to initialize app. Please try again.');
    }
  }

  async waitForTelegram() {
    return new Promise((resolve) => {
      const checkTelegram = () => {
        if (telegramService.isReady) {
          resolve();
        } else {
          setTimeout(checkTelegram, 100);
        }
      };
      checkTelegram();
    });
  }

  async initializeUser() {
    this.user = telegramService.getUser();
    
    if (this.user) {
      // Update UI with user info
      this.updateUserInfo();
      
      // Store user data locally
      this.storage.setUser(this.user);
    } else {
      console.warn('No user data available from Telegram');
    }
  }

  updateUserInfo() {
    const nameElement = document.getElementById('user-name');
    const roleElement = document.getElementById('user-role');
    const avatarElement = document.getElementById('user-avatar');
    
    if (nameElement && this.user) {
      nameElement.textContent = `Welcome, ${this.user.first_name || 'User'}!`;
    }
    
    if (roleElement) {
      roleElement.textContent = 'Waiter'; // Default role
    }
    
    if (avatarElement && this.user?.first_name) {
      avatarElement.textContent = this.user.first_name.charAt(0).toUpperCase();
    }
  }

  setupEventListeners() {
    // Quick action buttons
    document.getElementById('capture-payment-btn')?.addEventListener('click', () => {
      this.showCapturePayment();
    });
    
    document.getElementById('view-transactions-btn')?.addEventListener('click', () => {
      this.showTransactions();
    });
    
    document.getElementById('upload-statement-btn')?.addEventListener('click', () => {
      this.showUploadStatement();
    });
    
    document.getElementById('analytics-btn')?.addEventListener('click', () => {
      this.showAnalytics();
    });
    
    // Navigation buttons
    document.getElementById('view-all-btn')?.addEventListener('click', () => {
      this.showTransactions();
    });
    
    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Settings
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.showSettings();
    });
  }

  async loadInitialData() {
    try {
      // Load recent transactions
      await this.loadRecentTransactions();
      
      // Load user preferences
      this.loadUserPreferences();
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  async loadRecentTransactions() {
    try {
      // Try to load from API first
      const transactions = await this.api.getTransactions({ limit: 5 });
      
      if (transactions && transactions.length > 0) {
        this.transactions = transactions;
        this.renderRecentTransactions();
      } else {
        // Fallback to mock data for demo
        this.loadMockTransactions();
      }
      
    } catch (error) {
      console.error('Failed to load transactions:', error);
      this.loadMockTransactions();
    }
  }

  loadMockTransactions() {
    // Mock data for demonstration
    this.transactions = [
      {
        id: 1,
        amount: 150.00,
        bank_name: 'CBE',
        receipt_number: 'CBE123456789',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: 2,
        amount: 75.50,
        bank_name: 'Telebirr',
        receipt_number: 'TB987654321',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: 3,
        amount: 200.00,
        bank_name: 'Dashen Bank',
        receipt_number: 'DB456789123',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      }
    ];
    
    this.renderRecentTransactions();
  }

  renderRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    if (!container) return;
    
    if (this.transactions.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-secondary-500">
          <svg class="w-12 h-12 mx-auto mb-4 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <p>No transactions yet</p>
          <p class="text-sm">Start capturing payments to see them here</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.transactions.map(transaction => `
      <div class="transaction-card animate-slide-up">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-semibold text-sm">${transaction.bank_name.charAt(0)}</span>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-secondary-900">${formatCurrency(transaction.amount)} ETB</div>
                <div class="text-sm text-secondary-600">${transaction.bank_name}</div>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-secondary-500">${formatTime(transaction.created_at)}</div>
            <div class="status-indicator ${transaction.status === 'completed' ? 'status-success' : 'status-pending'}">
              ${transaction.status}
            </div>
          </div>
        </div>
        <div class="mt-2 text-xs text-secondary-500">
          Ref: ${transaction.receipt_number}
        </div>
      </div>
    `).join('');
  }

  showApp() {
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    if (app) {
      app.style.opacity = '1';
    }
  }

  showCapturePayment() {
    telegramService.impactOccurred('medium');
    
    // Send data to bot
    telegramService.sendData({
      action: 'capture_payment',
      user_id: this.user?.id
    });
    
    // Show confirmation
    this.showToast('Opening payment capture...', 'info');
  }

  showTransactions() {
    telegramService.impactOccurred('light');
    this.currentView = 'transactions';
    
    // Send data to bot
    telegramService.sendData({
      action: 'view_transactions',
      user_id: this.user?.id
    });
    
    // Show confirmation
    this.showToast('Loading transactions...', 'info');
  }

  showUploadStatement() {
    telegramService.impactOccurred('medium');
    
    // Send data to bot
    telegramService.sendData({
      action: 'upload_statement',
      user_id: this.user?.id
    });
    
    // Show confirmation
    this.showToast('Opening statement upload...', 'info');
  }

  showAnalytics() {
    telegramService.impactOccurred('light');
    
    // Send data to bot
    telegramService.sendData({
      action: 'view_analytics',
      user_id: this.user?.id
    });
    
    // Show confirmation
    this.showToast('Loading analytics...', 'info');
  }

  showSettings() {
    telegramService.impactOccurred('light');
    
    // Show settings popup
    telegramService.showPopup({
      title: 'Settings',
      message: 'Settings panel coming soon!',
      buttons: [
        { id: 'ok', type: 'default', text: 'OK' }
      ]
    });
  }

  toggleTheme() {
    telegramService.impactOccurred('light');
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    this.storage.setTheme(newTheme);
    
    this.showToast(`Switched to ${newTheme} theme`, 'success');
  }

  loadUserPreferences() {
    const theme = this.storage.getTheme();
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-20 left-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100`;
    
    const colors = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    };
    
    toast.className += ` ${colors[type] || colors.info}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateY(-100px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showMainView() {
    this.currentView = 'main';
    telegramService.hideBackButton();
    telegramService.hideMainButton();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.veriPayApp = new VeriPayApp();
});

// Export for modules
export default VeriPayApp;
