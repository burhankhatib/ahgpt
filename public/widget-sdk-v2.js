/*!
 * Al Hayat GPT Widget SDK v2.0.0
 * https://www.alhayatgpt.com
 * 
 * Copyright (c) 2025 Al Hayat GPT
 * Released under the MIT License
 */
(function() {
  'use strict';

  // Debug logging function
  function debugLog(level, message, data = null) {
    if (typeof console !== 'undefined' && console[level]) {
      const timestamp = new Date().toISOString();
      const logMessage = `[AlHayatGPT SDK v2.0.0] ${timestamp} ${message}`;
      if (data) {
        console[level](logMessage, data);
      } else {
        console[level](logMessage);
      }
    }
  }

  debugLog('info', 'SDK initialization started');

  // Configuration constants
  const CONSTANTS = {
    IFRAME_TIMEOUT: 10000,
    AUTH_POPUP_TIMEOUT: 300000, // 5 minutes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000,
    MESSAGE_TIMEOUT: 30000,
    SUPPORTED_THEMES: ['light', 'dark', 'auto'],
    VERSION: '2.0.0'
  };

  // Error types
  const ErrorTypes = {
    CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
    IFRAME_LOAD_FAILED: 'IFRAME_LOAD_FAILED',
    AUTH_FAILED: 'AUTH_FAILED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
  };

  class AlHayatGPTWidget {
    constructor(config) {
      debugLog('info', 'Widget constructor called', config);
      
      if (!config || !config.containerId) {
        throw new Error('containerId is required in widget configuration');
      }

      // Initialize configuration with defaults
      this.config = {
        apiEndpoint: 'https://www.alhayatgpt.com',
        theme: 'auto',
        width: '100%',
        height: '600px',
        allowGuests: true,
        retryAttempts: CONSTANTS.RETRY_ATTEMPTS,
        retryDelay: CONSTANTS.RETRY_DELAY,
        debug: false,
        usePopupAuth: true, // New: Use popup for auth instead of iframe
        fallbackToGuest: true, // New: Fallback to guest mode if auth fails
        autoResize: true, // New: Auto-resize iframe based on content
        ...config
      };

      // Validate configuration
      this.validateConfig();

      // Initialize state
      this.iframe = null;
      this.container = null;
      this.messageHandlers = new Map();
      this.messageEventHandler = null;
      this.initAttempts = 0;
      this.isDestroyed = false;
      this.isReady = false;
      this.currentUser = null;
      this.authPopup = null;
      this.loadingPromise = null;

      debugLog('info', 'Widget configuration validated', this.config);
      
      // Start initialization
      this.init();
    }

    validateConfig() {
      // Validate theme
      if (!CONSTANTS.SUPPORTED_THEMES.includes(this.config.theme)) {
        debugLog('warn', `Invalid theme "${this.config.theme}", falling back to "auto"`);
        this.config.theme = 'auto';
      }

      // Validate dimensions
      if (this.config.width && typeof this.config.width === 'number') {
        this.config.width = `${this.config.width}px`;
      }
      if (this.config.height && typeof this.config.height === 'number') {
        this.config.height = `${this.config.height}px`;
      }

      // Validate endpoint
      try {
        new URL(this.config.apiEndpoint);
      } catch (e) {
        throw new Error(`Invalid apiEndpoint: ${this.config.apiEndpoint}`);
      }
    }

    async init() {
      if (this.isDestroyed) {
        debugLog('warn', 'Widget is destroyed, skipping initialization');
        return;
      }

      this.initAttempts++;
      debugLog('info', `Initialization attempt ${this.initAttempts}/${this.config.retryAttempts}`);

      try {
        // Find container
        await this.findContainer();
        
        // Setup authentication first
        if (this.config.clerkPublishableKey && !this.config.allowGuests) {
          await this.handleAuthentication();
        }

        // Create and setup iframe
        await this.createIframe();
        await this.setupMessageHandling();
        await this.waitForWidgetReady();
        
        this.applyStyles();
        this.isReady = true;
        
        debugLog('info', 'Widget initialization complete');
        
        if (this.config.onReady && typeof this.config.onReady === 'function') {
          this.config.onReady();
        }

      } catch (error) {
        debugLog('error', 'Initialization failed', error);
        
        if (this.initAttempts < this.config.retryAttempts) {
          debugLog('info', `Retrying in ${this.config.retryDelay}ms...`);
          setTimeout(() => this.init(), this.config.retryDelay);
          return;
        }
        
        // Final failure handling
        this.handleInitializationFailure(error);
      }
    }

    async findContainer() {
      return new Promise((resolve, reject) => {
        const findAttempt = () => {
          this.container = document.getElementById(this.config.containerId);
          if (this.container) {
            debugLog('info', 'Container found');
            resolve(this.container);
          } else if (document.readyState === 'loading') {
            // DOM not ready yet, wait for it
            document.addEventListener('DOMContentLoaded', findAttempt);
          } else {
            reject(new Error(`Container with ID "${this.config.containerId}" not found`));
          }
        };
        findAttempt();
      });
    }

    async handleAuthentication() {
      if (!this.config.clerkPublishableKey) {
        debugLog('info', 'No Clerk key provided, using guest mode');
        return null;
      }

      debugLog('info', 'Starting authentication process');

      try {
        // Check for existing authentication
        const existingAuth = this.getStoredAuth();
        if (existingAuth && this.isAuthValid(existingAuth)) {
          debugLog('info', 'Using existing authentication');
          this.currentUser = existingAuth;
          return existingAuth;
        }

        // Use popup authentication
        if (this.config.usePopupAuth) {
          return await this.authenticateWithPopup();
        } else {
          // Fallback to redirect-based auth
          return await this.authenticateWithRedirect();
        }

      } catch (error) {
        debugLog('error', 'Authentication failed', error);
        
        if (this.config.fallbackToGuest) {
          debugLog('info', 'Falling back to guest mode');
          return null;
        } else {
          throw error;
        }
      }
    }

    async authenticateWithPopup() {
      return new Promise((resolve, reject) => {
        const authUrl = new URL(`${this.config.apiEndpoint}/sign-in`);
        authUrl.searchParams.set('widget_auth', 'true');
        authUrl.searchParams.set('return_origin', window.location.origin);
        
        // Open popup window
        const popup = window.open(
          authUrl.toString(),
          'alhayat_auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        if (!popup) {
          reject(new Error('Popup blocked. Please allow popups for authentication.'));
          return;
        }

        this.authPopup = popup;

        // Listen for auth completion
        const authListener = (event) => {
          // Verify origin
          try {
            const allowedOrigin = new URL(this.config.apiEndpoint).origin;
            if (event.origin !== allowedOrigin) {
              return;
            }
          } catch (e) {
            return;
          }

          const message = event.data;
          if (message && message.type === 'WIDGET_AUTH_SUCCESS') {
            debugLog('info', 'Authentication successful');
            this.currentUser = message.payload.user;
            this.storeAuth(this.currentUser);
            
            window.removeEventListener('message', authListener);
            popup.close();
            this.authPopup = null;
            resolve(this.currentUser);
          } else if (message && message.type === 'WIDGET_AUTH_ERROR') {
            debugLog('error', 'Authentication error', message.payload);
            window.removeEventListener('message', authListener);
            popup.close();
            this.authPopup = null;
            reject(new Error(message.payload.error || 'Authentication failed'));
          }
        };

        window.addEventListener('message', authListener);

        // Handle popup close
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', authListener);
            this.authPopup = null;
            reject(new Error('Authentication cancelled by user'));
          }
        }, 1000);

        // Timeout
        setTimeout(() => {
          if (!popup.closed) {
            popup.close();
            window.removeEventListener('message', authListener);
            clearInterval(checkClosed);
            this.authPopup = null;
            reject(new Error('Authentication timeout'));
          }
        }, CONSTANTS.AUTH_POPUP_TIMEOUT);
      });
    }

    async authenticateWithRedirect() {
      // Check if we're returning from a redirect
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');
      
      if (authToken) {
        try {
          const user = await this.verifyAuthToken(authToken);
          this.currentUser = user;
          this.storeAuth(user);
          
          // Clean URL
          const url = new URL(window.location.href);
          url.searchParams.delete('auth_token');
          window.history.replaceState({}, document.title, url.toString());
          
          return user;
        } catch (error) {
          debugLog('error', 'Token verification failed', error);
          throw error;
        }
      }

      // Redirect to auth
      const authUrl = new URL(`${this.config.apiEndpoint}/sign-in`);
      authUrl.searchParams.set('widget_auth', 'redirect');
      authUrl.searchParams.set('return_url', window.location.href);
      
      window.location.href = authUrl.toString();
      
      // This will never resolve as we're redirecting
      return new Promise(() => {});
    }

    async verifyAuthToken(token) {
      const response = await fetch(`${this.config.apiEndpoint}/api/auth/verify-widget-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      return await response.json();
    }

    getStoredAuth() {
      try {
        const stored = localStorage.getItem('alhayat_widget_auth');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    }

    storeAuth(user) {
      try {
        localStorage.setItem('alhayat_widget_auth', JSON.stringify({
          ...user,
          timestamp: Date.now()
        }));
      } catch (e) {
        debugLog('warn', 'Failed to store authentication');
      }
    }

    isAuthValid(auth) {
      // Check if auth is less than 24 hours old
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      return auth && auth.timestamp && (Date.now() - auth.timestamp < maxAge);
    }

    async createIframe() {
      return new Promise((resolve, reject) => {
        this.iframe = document.createElement('iframe');
        
        // Build the widget URL with configuration
        const widgetUrl = new URL(`${this.config.apiEndpoint}/widget/chat`);
        widgetUrl.searchParams.set('theme', this.config.theme);
        widgetUrl.searchParams.set('allowGuests', this.config.allowGuests.toString());
        widgetUrl.searchParams.set('parentOrigin', window.location.origin);
        widgetUrl.searchParams.set('version', CONSTANTS.VERSION);
        
        if (this.config.clerkPublishableKey) {
          widgetUrl.searchParams.set('clerkKey', this.config.clerkPublishableKey);
        }

        if (this.currentUser) {
          widgetUrl.searchParams.set('authenticated', 'true');
        }

        // Configure iframe
        this.iframe.src = widgetUrl.toString();
        this.iframe.style.width = this.config.width;
        this.iframe.style.height = this.config.height;
        this.iframe.style.border = 'none';
        this.iframe.style.borderRadius = '12px';
        this.iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        this.iframe.style.transition = 'height 0.3s ease';
        
        // Enhanced security attributes - allow popups for auth
        this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
        this.iframe.setAttribute('allow', 'clipboard-write; microphone; camera');
        this.iframe.setAttribute('loading', 'lazy');

        // Handle load events
        const loadTimeout = setTimeout(() => {
          reject(new Error('Iframe load timeout'));
        }, CONSTANTS.IFRAME_TIMEOUT);

        this.iframe.onload = () => {
          clearTimeout(loadTimeout);
          debugLog('info', 'Iframe loaded successfully');
          resolve(this.iframe);
        };

        this.iframe.onerror = () => {
          clearTimeout(loadTimeout);
          reject(new Error('Failed to load iframe'));
        };

        debugLog('info', 'Creating iframe', this.iframe.src);
        this.container.appendChild(this.iframe);
      });
    }

    async setupMessageHandling() {
      this.messageEventHandler = (event) => {
        // Enhanced origin verification
        try {
          const allowedOrigin = new URL(this.config.apiEndpoint).origin;
          if (event.origin !== allowedOrigin) {
            debugLog('warn', 'Message from unauthorized origin', event.origin);
            return;
          }
        } catch (e) {
          debugLog('error', 'Error verifying origin', e);
          return;
        }

        const message = event.data;
        if (message && typeof message === 'object' && message.type) {
          this.handleMessage(message);
        }
      };

      window.addEventListener('message', this.messageEventHandler);
      debugLog('info', 'Message handling setup complete');
    }

    async waitForWidgetReady() {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Widget ready timeout'));
        }, CONSTANTS.MESSAGE_TIMEOUT);

        const originalHandler = this.messageHandlers.get('WIDGET_READY') || [];
        this.messageHandlers.set('WIDGET_READY', [...originalHandler, () => {
          clearTimeout(timeout);
          resolve();
        }]);
      });
    }

    handleMessage(message) {
      debugLog('info', 'Received message', message);
      
      switch (message.type) {
        case 'WIDGET_READY':
          debugLog('info', 'Widget ready event received');
          this.triggerEventHandlers('WIDGET_READY', message.payload);
          break;
        
        case 'USER_SIGNED_IN':
          debugLog('info', 'User signed in event received');
          this.currentUser = message.payload;
          this.storeAuth(this.currentUser);
          this.triggerEventHandlers('USER_SIGNED_IN', message.payload);
          if (this.config.onUserSignIn && typeof this.config.onUserSignIn === 'function') {
            this.config.onUserSignIn(message.payload);
          }
          break;
        
        case 'USER_SIGNED_OUT':
          debugLog('info', 'User signed out event received');
          this.currentUser = null;
          localStorage.removeItem('alhayat_widget_auth');
          this.triggerEventHandlers('USER_SIGNED_OUT', message.payload);
          if (this.config.onUserSignOut && typeof this.config.onUserSignOut === 'function') {
            this.config.onUserSignOut();
          }
          break;
        
        case 'RESIZE':
          if (this.config.autoResize && this.iframe && message.payload && typeof message.payload.height === 'number') {
            const newHeight = Math.max(400, Math.min(800, message.payload.height));
            this.iframe.style.height = `${newHeight}px`;
            debugLog('info', 'Widget resized to height:', newHeight);
          }
          this.triggerEventHandlers('RESIZE', message.payload);
          break;
        
        case 'ERROR':
          debugLog('error', 'Error event received', message.payload);
          this.triggerEventHandlers('ERROR', message.payload);
          if (this.config.onError && typeof this.config.onError === 'function') {
            const errorMessage = message.payload && message.payload.message || 'Widget error';
            this.config.onError(new Error(errorMessage));
          }
          break;

        case 'CHAT_STARTED':
        case 'CHAT_MESSAGE':
        case 'CHAT_ENDED':
          this.triggerEventHandlers(message.type, message.payload);
          break;
        
        default:
          debugLog('warn', 'Unknown message type:', message.type);
      }
    }

    triggerEventHandlers(eventType, payload) {
      const handlers = this.messageHandlers.get(eventType) || [];
      handlers.forEach(handler => {
        if (typeof handler === 'function') {
          try {
            handler(payload);
          } catch (e) {
            debugLog('error', 'Error in event handler', e);
          }
        }
      });
    }

    handleInitializationFailure(error) {
      debugLog('error', 'Widget initialization failed permanently', error);
      
      // Show error message in container
      if (this.container) {
        this.container.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            text-align: center;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background-color: #f9fafb;
            min-height: 300px;
          ">
            <div style="
              width: 48px;
              height: 48px;
              background-color: #fef2f2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1rem;
            ">
              <svg style="width: 24px; height: 24px; color: #ef4444;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 style="
              margin: 0 0 0.5rem 0;
              font-size: 1.25rem;
              font-weight: 600;
              color: #374151;
            ">Chat Widget Unavailable</h3>
            <p style="
              margin: 0 0 1.5rem 0;
              color: #6b7280;
              max-width: 300px;
            ">Unable to load the chat widget. Please check your internet connection and try again.</p>
            <button onclick="location.reload()" style="
              background-color: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 500;
            ">Retry</button>
          </div>
        `;
      }

      if (this.config.onError && typeof this.config.onError === 'function') {
        this.config.onError(error);
      }
    }

    applyStyles() {
      if (this.config.customStyles && this.container && typeof this.config.customStyles === 'object') {
        Object.assign(this.container.style, this.config.customStyles);
        debugLog('info', 'Custom styles applied');
      }
    }

    // Public API methods
    on(eventType, handler) {
      if (typeof eventType !== 'string' || typeof handler !== 'function') {
        debugLog('warn', 'Invalid parameters for on() method');
        return this;
      }
      
      if (!this.messageHandlers.has(eventType)) {
        this.messageHandlers.set(eventType, []);
      }
      this.messageHandlers.get(eventType).push(handler);
      debugLog('info', 'Event handler added for:', eventType);
      return this;
    }

    off(eventType, handler) {
      if (typeof eventType !== 'string') {
        debugLog('warn', 'Invalid eventType for off() method');
        return this;
      }
      
      const handlers = this.messageHandlers.get(eventType);
      if (handlers && typeof handler === 'function') {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
          debugLog('info', 'Event handler removed for:', eventType);
        }
      }
      return this;
    }

    sendMessage(type, payload) {
      if (typeof type !== 'string') {
        debugLog('warn', 'Invalid message type');
        return this;
      }
      
      if (this.iframe && this.iframe.contentWindow && this.isReady) {
        try {
          this.iframe.contentWindow.postMessage({ type, payload }, this.config.apiEndpoint);
          debugLog('info', 'Message sent to widget:', { type, payload });
        } catch (e) {
          debugLog('error', 'Error sending message', e);
        }
      } else {
        debugLog('warn', 'Cannot send message: iframe not ready');
      }
      return this;
    }

    updateConfig(newConfig) {
      if (typeof newConfig !== 'object' || newConfig === null) {
        debugLog('warn', 'Invalid config object');
        return this;
      }
      
      this.config = { ...this.config, ...newConfig };
      this.sendMessage('UPDATE_CONFIG', newConfig);
      debugLog('info', 'Config updated:', newConfig);
      return this;
    }

    // Authentication methods
    signIn() {
      if (this.config.clerkPublishableKey) {
        return this.handleAuthentication();
      } else {
        debugLog('warn', 'No Clerk key provided for authentication');
        return Promise.reject(new Error('Authentication not configured'));
      }
    }

    signOut() {
      this.currentUser = null;
      localStorage.removeItem('alhayat_widget_auth');
      this.sendMessage('SIGN_OUT');
      return this;
    }

    getUser() {
      return this.currentUser;
    }

    isAuthenticated() {
      return !!this.currentUser;
    }

    // Widget state methods
    isReady() {
      return this.isReady;
    }

    getVersion() {
      return CONSTANTS.VERSION;
    }

    destroy() {
      debugLog('info', 'Destroying widget...');
      this.isDestroyed = true;
      this.isReady = false;
      
      // Close auth popup if open
      if (this.authPopup && !this.authPopup.closed) {
        this.authPopup.close();
        this.authPopup = null;
      }
      
      // Remove iframe
      if (this.iframe && this.iframe.parentNode) {
        this.iframe.parentNode.removeChild(this.iframe);
        this.iframe = null;
      }
      
      // Remove event listeners
      if (this.messageEventHandler) {
        window.removeEventListener('message', this.messageEventHandler);
        this.messageEventHandler = null;
      }
      
      // Clear handlers
      this.messageHandlers.clear();
      this.currentUser = null;
      
      debugLog('info', 'Widget destroyed');
      return this;
    }
  }

  // Initialize global object
  debugLog('info', 'Setting up global AlHayatGPT object...');
  
  // Ensure window object exists (for server-side rendering compatibility)
  if (typeof window !== 'undefined') {
    // Set up the main API
    window.AlHayatGPT = {
      createWidget: function(config) {
        debugLog('info', 'createWidget called', config);
        try {
          return new AlHayatGPTWidget(config);
        } catch (error) {
          debugLog('error', 'Error creating widget', error);
          throw error;
        }
      },
      version: CONSTANTS.VERSION,
      isLoaded: true,
      constants: CONSTANTS,
      // Utility methods
      setDebugMode: function(enabled) {
        CONSTANTS.DEBUG_ENABLED = enabled;
      }
    };
    
    // Also export the class directly for advanced usage
    window.AlHayatGPTWidget = AlHayatGPTWidget;
    
    debugLog('info', 'Global AlHayatGPT object created successfully');
    debugLog('info', 'Available methods:', Object.keys(window.AlHayatGPT));
    
    // Dispatch a custom event to signal SDK is ready
    if (typeof CustomEvent !== 'undefined') {
      try {
        const event = new CustomEvent('AlHayatGPTSDKReady', {
          detail: { 
            version: CONSTANTS.VERSION,
            features: ['popup-auth', 'auto-resize', 'guest-fallback']
          }
        });
        window.dispatchEvent(event);
        debugLog('info', 'AlHayatGPTSDKReady event dispatched');
      } catch (e) {
        debugLog('warn', 'Could not dispatch custom event', e);
      }
    }
  } else {
    debugLog('warn', 'Window object not available - running in non-browser environment');
  }
  
})(); 