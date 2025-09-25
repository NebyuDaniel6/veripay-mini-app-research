/**
 * API Service for VeriPay Mini App
 * Handles communication with the VeriPay bot backend
 */

import telegramService from './telegram.js';

export class ApiService {
  constructor() {
    this.baseUrl = this.getBaseUrl();
    this.timeout = 10000; // 10 seconds
  }

  getBaseUrl() {
    // In production, this would be your bot's API endpoint
    // For now, we'll use a mock API
    return 'https://api.veripay.com'; // Replace with actual API URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${telegramService.getInitData()}`,
        'X-User-ID': telegramService.getUserId(),
        'X-Platform': 'telegram-mini-app'
      },
      timeout: this.timeout
    };

    const config = { ...defaultOptions, ...options };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('API request failed:', error);
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.name === 'AbortError') {
      return new Error('Request timeout. Please check your connection.');
    }
    
    if (error.message.includes('Failed to fetch')) {
      return new Error('Network error. Please check your connection.');
    }
    
    return error;
  }

  // Transaction methods
  async getTransactions(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        limit: params.limit || 20,
        offset: params.offset || 0,
        ...params
      });

      return await this.request(`/api/transactions?${queryParams}`);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  }

  async getTransaction(id) {
    try {
      return await this.request(`/api/transactions/${id}`);
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      throw error;
    }
  }

  async createTransaction(transactionData) {
    try {
      return await this.request('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData)
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }

  // User methods
  async getUserProfile() {
    try {
      return await this.request('/api/user/profile');
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(profileData) {
    try {
      return await this.request('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  // Analytics methods
  async getAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        period: params.period || 'week',
        ...params
      });

      return await this.request(`/api/analytics?${queryParams}`);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  async getDashboardData() {
    try {
      return await this.request('/api/dashboard');
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  // File upload methods
  async uploadFile(file, type = 'receipt') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('user_id', telegramService.getUserId());

      return await this.request('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telegramService.getInitData()}`
        },
        body: formData
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  // Statement methods
  async uploadStatement(file) {
    try {
      return await this.uploadFile(file, 'statement');
    } catch (error) {
      console.error('Failed to upload statement:', error);
      throw error;
    }
  }

  async processStatement(statementId) {
    try {
      return await this.request(`/api/statements/${statementId}/process`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to process statement:', error);
      throw error;
    }
  }

  // Reconciliation methods
  async getReconciliationData(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      return await this.request(`/api/reconciliation?${queryParams}`);
    } catch (error) {
      console.error('Failed to fetch reconciliation data:', error);
      throw error;
    }
  }

  async performReconciliation(data) {
    try {
      return await this.request('/api/reconciliation', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to perform reconciliation:', error);
      throw error;
    }
  }

  // Notification methods
  async getNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        unread_only: params.unread_only || false,
        ...params
      });

      return await this.request(`/api/notifications?${queryParams}`);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      return await this.request(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      return await this.request('/api/health');
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Mock data methods for development
  getMockTransactions() {
    return [
      {
        id: 1,
        amount: 150.00,
        bank_name: 'CBE',
        receipt_number: 'CBE123456789',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        customer_name: 'John Doe'
      },
      {
        id: 2,
        amount: 75.50,
        bank_name: 'Telebirr',
        receipt_number: 'TB987654321',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        customer_name: 'Jane Smith'
      },
      {
        id: 3,
        amount: 200.00,
        bank_name: 'Dashen Bank',
        receipt_number: 'DB456789123',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        customer_name: 'Bob Johnson'
      }
    ];
  }

  getMockAnalytics() {
    return {
      total_transactions: 45,
      total_amount: 6750.50,
      today_transactions: 8,
      today_amount: 1200.00,
      weekly_chart: [
        { day: 'Mon', amount: 450.00, count: 3 },
        { day: 'Tue', amount: 320.50, count: 2 },
        { day: 'Wed', amount: 680.00, count: 4 },
        { day: 'Thu', amount: 290.00, count: 2 },
        { day: 'Fri', amount: 560.00, count: 3 },
        { day: 'Sat', amount: 890.00, count: 5 },
        { day: 'Sun', amount: 1200.00, count: 8 }
      ],
      bank_breakdown: [
        { bank: 'CBE', amount: 2500.00, percentage: 37 },
        { bank: 'Telebirr', amount: 1800.50, percentage: 27 },
        { bank: 'Dashen Bank', amount: 1450.00, percentage: 21 },
        { bank: 'Other', amount: 1000.00, percentage: 15 }
      ]
    };
  }
}
