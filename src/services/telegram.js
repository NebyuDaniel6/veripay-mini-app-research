/**
 * Telegram Web App SDK Integration
 * Handles all Telegram-specific functionality
 */

class TelegramService {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.isReady = false;
    this.user = null;
    this.initData = null;
    
    this.init();
  }

  init() {
    if (!this.tg) {
      console.warn('Telegram Web App SDK not available');
      return;
    }

    try {
      // Initialize the Web App
      this.tg.ready();
      this.tg.expand();
      
      // Get user data
      this.user = this.tg.initDataUnsafe?.user;
      this.initData = this.tg.initData;
      
      // Set up theme
      this.setupTheme();
      
      // Set up back button
      this.setupBackButton();
      
      // Set up main button
      this.setupMainButton();
      
      this.isReady = true;
      console.log('Telegram Web App initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize Telegram Web App:', error);
    }
  }

  setupTheme() {
    if (!this.tg) return;
    
    const theme = this.tg.colorScheme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply Telegram theme colors
    if (this.tg.themeParams) {
      const root = document.documentElement;
      const params = this.tg.themeParams;
      
      if (params.bg_color) {
        root.style.setProperty('--tg-theme-bg-color', params.bg_color);
      }
      if (params.text_color) {
        root.style.setProperty('--tg-theme-text-color', params.text_color);
      }
      if (params.hint_color) {
        root.style.setProperty('--tg-theme-hint-color', params.hint_color);
      }
      if (params.link_color) {
        root.style.setProperty('--tg-theme-link-color', params.link_color);
      }
      if (params.button_color) {
        root.style.setProperty('--tg-theme-button-color', params.button_color);
      }
      if (params.button_text_color) {
        root.style.setProperty('--tg-theme-button-text-color', params.button_text_color);
      }
      if (params.secondary_bg_color) {
        root.style.setProperty('--tg-theme-secondary-bg-color', params.secondary_bg_color);
      }
    }
  }

  setupBackButton() {
    if (!this.tg?.BackButton) return;
    
    this.tg.BackButton.onClick(() => {
      this.handleBackButton();
    });
  }

  setupMainButton() {
    if (!this.tg?.MainButton) return;
    
    // Configure main button
    this.tg.MainButton.setText('Continue');
    this.tg.MainButton.color = '#2481cc';
    this.tg.MainButton.textColor = '#ffffff';
    
    this.tg.MainButton.onClick(() => {
      this.handleMainButton();
    });
  }

  handleBackButton() {
    // Custom back button logic
    const currentView = this.getCurrentView();
    
    switch (currentView) {
      case 'transactions':
        this.showMainView();
        break;
      case 'analytics':
        this.showMainView();
        break;
      default:
        this.tg?.close();
    }
  }

  handleMainButton() {
    // Custom main button logic
    const currentView = this.getCurrentView();
    
    switch (currentView) {
      case 'capture-payment':
        this.submitPayment();
        break;
      case 'upload-statement':
        this.submitStatement();
        break;
      default:
        this.tg?.close();
    }
  }

  getCurrentView() {
    // Determine current view based on DOM state
    if (document.getElementById('transactions-view')?.style.display !== 'none') {
      return 'transactions';
    }
    if (document.getElementById('analytics-view')?.style.display !== 'none') {
      return 'analytics';
    }
    if (document.getElementById('capture-view')?.style.display !== 'none') {
      return 'capture-payment';
    }
    if (document.getElementById('upload-view')?.style.display !== 'none') {
      return 'upload-statement';
    }
    return 'main';
  }

  showBackButton() {
    if (this.tg?.BackButton) {
      this.tg.BackButton.show();
    }
  }

  hideBackButton() {
    if (this.tg?.BackButton) {
      this.tg.BackButton.hide();
    }
  }

  showMainButton(text = 'Continue') {
    if (this.tg?.MainButton) {
      this.tg.MainButton.setText(text);
      this.tg.MainButton.show();
    }
  }

  hideMainButton() {
    if (this.tg?.MainButton) {
      this.tg.MainButton.hide();
    }
  }

  showPopup(options) {
    if (!this.tg?.showPopup) return Promise.resolve(null);
    
    return new Promise((resolve) => {
      this.tg.showPopup(options, (buttonId) => {
        resolve(buttonId);
      });
    });
  }

  showAlert(message) {
    if (this.tg?.showAlert) {
      this.tg.showAlert(message);
    } else {
      alert(message);
    }
  }

  showConfirm(message) {
    if (this.tg?.showConfirm) {
      return new Promise((resolve) => {
        this.tg.showConfirm(message, (confirmed) => {
          resolve(confirmed);
        });
      });
    } else {
      return Promise.resolve(confirm(message));
    }
  }

  sendData(data) {
    if (this.tg?.sendData) {
      this.tg.sendData(JSON.stringify(data));
    }
  }

  close() {
    if (this.tg?.close) {
      this.tg.close();
    }
  }

  // User data getters
  getUser() {
    return this.user;
  }

  getUserId() {
    return this.user?.id;
  }

  getUserName() {
    return this.user?.first_name || 'User';
  }

  getUserAvatar() {
    return this.user?.photo_url;
  }

  getInitData() {
    return this.initData;
  }

  // Utility methods
  isTelegram() {
    return !!this.tg;
  }

  getPlatform() {
    return this.tg?.platform || 'unknown';
  }

  getVersion() {
    return this.tg?.version || 'unknown';
  }

  isExpanded() {
    return this.tg?.isExpanded || false;
  }

  getViewportHeight() {
    return this.tg?.viewportHeight || window.innerHeight;
  }

  getViewportStableHeight() {
    return this.tg?.viewportStableHeight || window.innerHeight;
  }

  // Haptic feedback
  impactOccurred(style = 'medium') {
    if (this.tg?.HapticFeedback?.impactOccurred) {
      this.tg.HapticFeedback.impactOccurred(style);
    }
  }

  notificationOccurred(type = 'success') {
    if (this.tg?.HapticFeedback?.notificationOccurred) {
      this.tg.HapticFeedback.notificationOccurred(type);
    }
  }

  selectionChanged() {
    if (this.tg?.HapticFeedback?.selectionChanged) {
      this.tg.HapticFeedback.selectionChanged();
    }
  }
}

// Create global instance
window.telegramService = new TelegramService();

// Export for modules
export default window.telegramService;
