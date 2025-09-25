/**
 * VeriPay Mini App - Simple Working Version
 * Fixed UI and button functionality
 */

// Simple Telegram service
const telegramService = {
  init() {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      console.log('Telegram WebApp initialized');
    } else {
      console.warn('Telegram WebApp not available');
    }
  },

  getUser() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    return null;
  },

  sendData(data) {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(data));
    }
  },

  showAlert(message) {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  }
};

// Simple formatters
const formatters = {
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  },

  formatTimeAgo(timestamp) {
    const now = Date.now();
    const seconds = Math.round((now - timestamp) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }
};

// Main App Class
class VeriPayApp {
  constructor() {
    this.user = null;
    this.transactions = [];
    this.init();
  }

  init() {
    // Initialize Telegram
    telegramService.init();
    
    // Get user data
    this.user = telegramService.getUser();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI
    this.updateUI();
    
    // Hide loading screen
    this.hideLoadingScreen();
    
    console.log('VeriPay App initialized');
  }

  setupEventListeners() {
    // Quick action buttons
    const captureBtn = document.getElementById('capture-payment-btn');
    const transactionsBtn = document.getElementById('view-transactions-btn');
    const uploadBtn = document.getElementById('upload-statement-btn');
    const analyticsBtn = document.getElementById('analytics-btn');

    if (captureBtn) {
      captureBtn.addEventListener('click', () => this.handleCapturePayment());
    }

    if (transactionsBtn) {
      transactionsBtn.addEventListener('click', () => this.handleViewTransactions());
    }

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.handleUploadStatement());
    }

    if (analyticsBtn) {
      analyticsBtn.addEventListener('click', () => this.handleAnalytics());
    }

    // Bottom navigation
    const homeBtn = document.getElementById('home-btn');
    const transactionsNavBtn = document.getElementById('transactions-nav-btn');
    const profileBtn = document.getElementById('profile-btn');

    if (homeBtn) {
      homeBtn.addEventListener('click', () => this.showHome());
    }

    if (transactionsNavBtn) {
      transactionsNavBtn.addEventListener('click', () => this.handleViewTransactions());
    }

    if (profileBtn) {
      profileBtn.addEventListener('click', () => this.showProfile());
    }
  }

  updateUI() {
    // Update user info
    this.updateUserInfo();
    
    // Load sample transactions
    this.loadSampleTransactions();
  }

  updateUserInfo() {
    const nameElement = document.getElementById('user-name');
    const avatarElement = document.getElementById('user-avatar');
    
    if (this.user) {
      if (nameElement) {
        nameElement.textContent = `Welcome, ${this.user.first_name || 'User'}!`;
      }
      if (avatarElement) {
        avatarElement.textContent = (this.user.first_name || 'U').charAt(0).toUpperCase();
      }
    } else {
      if (nameElement) {
        nameElement.textContent = 'Welcome back!';
      }
      if (avatarElement) {
        avatarElement.textContent = 'U';
      }
    }
  }

  loadSampleTransactions() {
    // Sample transactions for demo
    this.transactions = [
      {
        id: 'tx1',
        amount: 150.00,
        bank_name: 'Dashen Bank',
        receipt_number: 'DB12345',
        created_at: Date.now() - 3600000,
        status: 'completed'
      },
      {
        id: 'tx2',
        amount: 200.50,
        bank_name: 'CBE',
        receipt_number: 'CBE67890',
        created_at: Date.now() - 7200000,
        status: 'completed'
      },
      {
        id: 'tx3',
        amount: 75.25,
        bank_name: 'Telebirr',
        receipt_number: 'TB11223',
        created_at: Date.now() - 10800000,
        status: 'pending'
      }
    ];

    this.renderTransactions();
  }

  renderTransactions() {
    const container = document.getElementById('transactions-container');
    if (!container) return;

    if (this.transactions.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500">No transactions yet</p>
          <p class="text-sm text-gray-400">Start capturing payments to see them here</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.transactions.map(transaction => `
      <div class="bg-white rounded-lg p-4 mb-3 shadow-sm border">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-semibold text-sm">${transaction.bank_name.charAt(0)}</span>
            </div>
            <div>
              <div class="font-semibold text-gray-900">${formatters.formatCurrency(transaction.amount)}</div>
              <div class="text-sm text-gray-600">${transaction.bank_name}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500">${formatters.formatTimeAgo(transaction.created_at)}</div>
            <div class="text-xs ${transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}">
              ${transaction.status}
            </div>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          Ref: ${transaction.receipt_number}
        </div>
      </div>
    `).join('');
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    if (app) {
      app.style.opacity = '1';
    }
  }

  // Button handlers
  handleCapturePayment() {
    console.log('Capture payment clicked');
    telegramService.sendData({
      action: 'capture_payment',
      user_id: this.user?.id
    });
    telegramService.showAlert('Opening payment capture...');
  }

  handleViewTransactions() {
    console.log('View transactions clicked');
    telegramService.sendData({
      action: 'view_transactions',
      user_id: this.user?.id
    });
    telegramService.showAlert('Loading transactions...');
  }

  handleUploadStatement() {
    console.log('Upload statement clicked');
    telegramService.sendData({
      action: 'upload_statement',
      user_id: this.user?.id
    });
    telegramService.showAlert('Opening statement upload...');
  }

  handleAnalytics() {
    console.log('Analytics clicked');
    window.location.href = 'analytics.html';
  }

  showHome() {
    console.log('Home clicked');
    // Reset to main view
    this.updateUI();
  }

  showProfile() {
    console.log('Profile clicked');
    telegramService.showAlert('Profile feature coming soon!');
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new VeriPayApp();
});

// Export for modules (if needed)
window.VeriPayApp = VeriPayApp;
