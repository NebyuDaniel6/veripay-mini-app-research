/**
 * Utility functions for formatting data
 */

// Currency formatting
export function formatCurrency(amount, currency = 'ETB') {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Date formatting
export function formatDate(date, options = {}) {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
}

// Time formatting
export function formatTime(date, options = {}) {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Time';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
}

// DateTime formatting
export function formatDateTime(date, options = {}) {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid DateTime';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
}

// Relative time formatting
export function formatRelativeTime(date) {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
}

// Number formatting
export function formatNumber(number, options = {}) {
  if (typeof number !== 'number') {
    number = parseFloat(number) || 0;
  }
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };
  
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(number);
}

// Percentage formatting
export function formatPercentage(value, total, decimals = 1) {
  if (!total || total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

// File size formatting
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Phone number formatting
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Ethiopian phone number formatting
  if (cleaned.startsWith('251')) {
    return `+251 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  } else if (cleaned.startsWith('09')) {
    return `+251 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

// Bank name formatting
export function formatBankName(bankName) {
  if (!bankName) return 'Unknown Bank';
  
  const bankMap = {
    'CBE': 'Commercial Bank of Ethiopia',
    'Telebirr': 'Telebirr',
    'Dashen Bank': 'Dashen Bank',
    'Awash Bank': 'Awash Bank',
    'Abyssinia Bank': 'Abyssinia Bank',
    'Nib Bank': 'Nib Bank',
    'United Bank': 'United Bank',
    'Wegagen Bank': 'Wegagen Bank'
  };
  
  return bankMap[bankName] || bankName;
}

// Transaction status formatting
export function formatTransactionStatus(status) {
  const statusMap = {
    'completed': 'Completed',
    'pending': 'Pending',
    'failed': 'Failed',
    'cancelled': 'Cancelled',
    'processing': 'Processing'
  };
  
  return statusMap[status] || status;
}

// Status color mapping
export function getStatusColor(status) {
  const colorMap = {
    'completed': 'green',
    'pending': 'yellow',
    'failed': 'red',
    'cancelled': 'gray',
    'processing': 'blue'
  };
  
  return colorMap[status] || 'gray';
}

// Truncate text
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Capitalize first letter
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Format initials
export function formatInitials(name) {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Format receipt number
export function formatReceiptNumber(receiptNumber) {
  if (!receiptNumber) return 'N/A';
  
  // Add spaces for better readability
  return receiptNumber.replace(/(.{4})/g, '$1 ').trim();
}

// Format amount with color
export function formatAmountWithColor(amount, type = 'income') {
  const formatted = formatCurrency(amount);
  const color = type === 'income' ? 'text-green-600' : 'text-red-600';
  return `<span class="${color}">${formatted}</span>`;
}

// Format large numbers
export function formatLargeNumber(number) {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
}

// Format duration
export function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
