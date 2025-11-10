import React from 'react';
import { toast } from 'sonner';

/**
 * Security Validation Utilities
 * - Input Sanitization
 * - XSS Prevention
 * - SQL Injection Prevention
 * - Rate Limiting (Client-Side)
 */

class SecurityValidator {
  constructor() {
    this.requestCounts = new Map();
    this.blockedIPs = new Set();
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Validate amount (positive number)
   */
  validateAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num < 1000000000;
  }

  /**
   * Validate wallet address (Ethereum)
   */
  validateWalletAddress(address) {
    if (!address) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Rate Limiting (Client-Side)
   * Prevents spam requests
   */
  checkRateLimit(action, maxRequests = 10, timeWindow = 60000) {
    const now = Date.now();
    const key = `${action}_${this.getClientIdentifier()}`;
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, []);
    }

    const requests = this.requestCounts.get(key);
    
    // Remove old requests outside time window
    const validRequests = requests.filter(timestamp => now - timestamp < timeWindow);
    
    if (validRequests.length >= maxRequests) {
      toast.error('Zu viele Anfragen. Bitte warten Sie einen Moment.');
      return false;
    }

    validRequests.push(now);
    this.requestCounts.set(key, validRequests);
    
    return true;
  }

  /**
   * Get client identifier (simple fingerprint)
   */
  getClientIdentifier() {
    if (typeof window === 'undefined') return 'server';
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ].join('|');

    return this.simpleHash(fingerprint);
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Validate transaction before submission
   */
  validateTransaction(data) {
    const errors = [];

    // Amount validation
    if (!this.validateAmount(data.amount)) {
      errors.push('Ungültiger Betrag');
    }

    // Email validation
    if (data.email && !this.validateEmail(data.email)) {
      errors.push('Ungültige E-Mail-Adresse');
    }

    // Wallet validation
    if (data.wallet_address && !this.validateWalletAddress(data.wallet_address)) {
      errors.push('Ungültige Wallet-Adresse');
    }

    // Check for suspicious patterns
    if (this.detectSuspiciousPatterns(data)) {
      errors.push('Verdächtige Aktivität erkannt');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Detect suspicious patterns
   */
  detectSuspiciousPatterns(data) {
    const suspiciousPatterns = [
      /<script>/i,
      /javascript:/i,
      /onerror=/i,
      /onclick=/i,
      /eval\(/i,
      /SELECT.*FROM/i,
      /INSERT.*INTO/i,
      /DROP.*TABLE/i,
      /--/,
      /\/\*/,
    ];

    const dataString = JSON.stringify(data).toLowerCase();
    
    return suspiciousPatterns.some(pattern => pattern.test(dataString));
  }

  /**
   * Sanitize object recursively
   */
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeInput(obj);
    }

    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      sanitized[key] = this.sanitizeObject(obj[key]);
    }

    return sanitized;
  }

  /**
   * Verify CSRF Token (would need backend support)
   */
  getCSRFToken() {
    if (typeof document === 'undefined') return null;
    
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : null;
  }

  /**
   * Check if request should be blocked
   */
  shouldBlockRequest(action) {
    const clientId = this.getClientIdentifier();
    
    if (this.blockedIPs.has(clientId)) {
      toast.error('Ihr Zugriff wurde vorübergehend gesperrt.');
      return true;
    }

    return false;
  }

  /**
   * Block client temporarily
   */
  blockClient(duration = 300000) { // 5 minutes default
    const clientId = this.getClientIdentifier();
    this.blockedIPs.add(clientId);
    
    setTimeout(() => {
      this.blockedIPs.delete(clientId);
    }, duration);
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password) {
    if (!password || password.length < 8) {
      return { isStrong: false, message: 'Mindestens 8 Zeichen' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    if (strength < 3) {
      return { 
        isStrong: false, 
        message: 'Passwort zu schwach. Nutzen Sie Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen' 
      };
    }

    return { isStrong: true, message: 'Passwort ist stark' };
  }

  /**
   * Log security event
   */
  logSecurityEvent(event) {
    console.warn('🔒 Security Event:', {
      timestamp: new Date().toISOString(),
      event,
      clientId: this.getClientIdentifier()
    });
  }
}

// Singleton instance
const securityValidator = new SecurityValidator();

export default securityValidator;

/**
 * React Hook for security validation
 */
export const useSecurityValidator = () => {
  const sanitize = (input) => securityValidator.sanitizeInput(input);
  
  const validateTransaction = (data) => securityValidator.validateTransaction(data);
  
  const checkRateLimit = (action, max, window) => 
    securityValidator.checkRateLimit(action, max, window);

  return {
    sanitize,
    validateTransaction,
    checkRateLimit,
    validateEmail: (email) => securityValidator.validateEmail(email),
    validateAmount: (amount) => securityValidator.validateAmount(amount),
    validateWallet: (address) => securityValidator.validateWalletAddress(address),
  };
};