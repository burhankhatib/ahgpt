/*!
 * Al Hayat GPT Widget SDK - Stable Version
 * https://www.alhayatgpt.com
 * 
 * Copyright (c) 2025 Al Hayat GPT
 * Released under the MIT License
 * 
 * This version solves the "refused to connect" issue by:
 * 1. Using popup windows for authentication instead of iframe embedding
 * 2. Implementing robust error handling and fallback mechanisms
 * 3. Adding proper cross-origin support for third-party websites
 */
(function() {
    'use strict';

    // Debug logging with levels
    function debugLog(level, message, data = null) {
        if (typeof console !== 'undefined' && console[level]) {
            const timestamp = new Date().toISOString();
            const logMessage = `[AlHayatGPT SDK Stable] ${timestamp} ${message}`;
            if (data) {
                console[level](logMessage, data);
            } else {
                console[level](logMessage);
            }
        }
    }

    function destroyAllWidgets() {
        debugLog('info', 'Destroying ALL existing AlHayatGPT widgets to ensure a clean slate.');

        // 1. Destroy all registered widget instances
        if (window.AlHayatGPT_Instances) {
            Object.values(window.AlHayatGPT_Instances).forEach(instance => {
                if (instance && typeof instance.destroy === 'function') {
                    try {
                        instance.destroy();
                    } catch (e) {
                        debugLog('warn', 'Error destroying a widget instance.', e);
                    }
                }
            });
        }
        window.AlHayatGPT_Instances = {}; // Reset the global registry

        // 2. Aggressively scan the DOM and remove any orphaned widgets
        const orphanedIframes = document.querySelectorAll('iframe[src*="alhayatgpt.com/widget/chat"]');
        orphanedIframes.forEach(iframe => {
            debugLog('warn', 'Found and removing an orphaned widget iframe.', iframe);
            const container = iframe.parentElement;
            if (container) {
                // To be safe, remove the container of the iframe, which might be the root.
                container.remove();
            } else {
                iframe.remove();
            }
        });
    }

    // Configuration constants
    const CONSTANTS = {
        VERSION: '2.0.0-stable',
        IFRAME_TIMEOUT: 15000,
        AUTH_POPUP_TIMEOUT: 300000, // 5 minutes
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 2000,
        MESSAGE_TIMEOUT: 30000,
        SUPPORTED_THEMES: ['light', 'dark', 'auto'],
        DEFAULT_WIDTH: '100%',
        DEFAULT_HEIGHT: '100%',
        MIN_HEIGHT: '300px',
        MAX_HEIGHT: 'none'
    };

    // Error types for better error handling
    const ErrorTypes = {
        CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
        IFRAME_LOAD_FAILED: 'IFRAME_LOAD_FAILED',
        AUTH_FAILED: 'AUTH_FAILED',
        NETWORK_ERROR: 'NETWORK_ERROR',
        TIMEOUT: 'TIMEOUT',
        CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
        POPUP_BLOCKED: 'POPUP_BLOCKED',
        CROSS_ORIGIN_ERROR: 'CROSS_ORIGIN_ERROR'
    };

    class AlHayatGPTWidget {
        constructor(config) {
            debugLog('info', 'Widget constructor called', config);
            
            // Validate required configuration
            if (!config || !config.containerId) {
                const error = new Error('containerId is required in widget configuration');
                error.type = ErrorTypes.CONFIGURATION_ERROR;
                throw error;
            }

            // Clean the target container before initialization
            const containerElement = document.getElementById(config.containerId);
            if (containerElement) {
                containerElement.innerHTML = '';
            }

            // Initialize configuration with secure defaults
            this.config = {
                apiEndpoint: 'https://www.alhayatgpt.com',
                theme: 'auto',
                width: CONSTANTS.DEFAULT_WIDTH,
                height: CONSTANTS.DEFAULT_HEIGHT,
                allowGuests: true,
                retryAttempts: CONSTANTS.RETRY_ATTEMPTS,
                retryDelay: CONSTANTS.RETRY_DELAY,
                debug: false,
                usePopupAuth: true,
                fallbackToGuest: true,
                autoResize: true,
                smartHeight: true,
                responsiveHeight: true,
                minHeight: 400,
                maxHeight: 800,
                secureOrigin: true,
                enableRetry: true,
                ...config
            };

            // Register this instance globally
            if (!window.AlHayatGPT_Instances) {
                window.AlHayatGPT_Instances = {};
            }
            window.AlHayatGPT_Instances[config.containerId] = this;

            // Validate and sanitize configuration
            this.validateAndSanitizeConfig();

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
            this.healthCheckInterval = null;
            this.lastMessageTime = Date.now();

            debugLog('info', 'Widget configuration validated', this.config);
            
            // Start initialization with error boundary
            this.safeInit();
        }

        validateAndSanitizeConfig() {
            // Validate theme
            if (!CONSTANTS.SUPPORTED_THEMES.includes(this.config.theme)) {
                debugLog('warn', `Invalid theme "${this.config.theme}", falling back to "auto"`);
                this.config.theme = 'auto';
            }

            // Validate and sanitize dimensions
            if (this.config.width && typeof this.config.width === 'number') {
                this.config.width = `${Math.max(200, this.config.width)}px`;
            }
            if (this.config.height && typeof this.config.height === 'number') {
                const height = Math.max(300, Math.min(800, this.config.height));
                this.config.height = `${height}px`;
            }

            // Validate endpoint URL
            try {
                const url = new URL(this.config.apiEndpoint);
                // Ensure HTTPS for security
                if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
                    debugLog('warn', 'Non-HTTPS endpoint detected, this may cause security issues');
                }
            } catch (e) {
                const error = new Error(`Invalid apiEndpoint: ${this.config.apiEndpoint}`);
                error.type = ErrorTypes.CONFIGURATION_ERROR;
                throw error;
            }

            // Validate container ID
            if (typeof this.config.containerId !== 'string' || !this.config.containerId.trim()) {
                const error = new Error('containerId must be a non-empty string');
                error.type = ErrorTypes.CONFIGURATION_ERROR;
                throw error;
            }
        }

        async safeInit() {
            try {
                await this.init();
            } catch (error) {
                debugLog('error', 'Failed to initialize widget', error);
                this.handleInitializationFailure(error);
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
                // Step 1: Find and prepare container
                await this.findAndPrepareContainer();
                
                // Step 2: Handle authentication if required
                await this.handleAuthenticationFlow();

                // Step 3: Create and setup widget iframe
                await this.createWidget();
                
                // Step 4: Setup communication and monitoring
                await this.setupCommunication();
                
                // Step 5: Apply styling and finalize
                this.finalizeWidget();
                
                debugLog('info', 'Widget initialization completed successfully');
                this.triggerCallback('onReady');

            } catch (error) {
                debugLog('error', 'Initialization step failed', error);
                
                if (this.config.enableRetry && this.initAttempts < this.config.retryAttempts) {
                    debugLog('info', `Retrying initialization in ${this.config.retryDelay}ms...`);
                    setTimeout(() => this.init(), this.config.retryDelay);
                    return;
                }
                
                throw error; // Let safeInit handle the final failure
            }
        }

        async findAndPrepareContainer() {
            return new Promise((resolve, reject) => {
                const findContainer = () => {
                    this.container = document.getElementById(this.config.containerId);
                    if (this.container) {
                        // Check for existing widget to prevent duplication
                        const existingWidget = this.container.querySelector('iframe[src*="/widget/chat"]');
                        if (existingWidget) {
                            debugLog('warn', 'Widget already exists in container, cleaning up...');
                            existingWidget.remove();
                        }
                        
                        // Clear any existing content
                        this.container.innerHTML = '';
                        
                        // Prepare container for widget
                        this.prepareContainer();
                        debugLog('info', 'Container found and prepared');
                        resolve(this.container);
                    } else if (document.readyState === 'loading') {
                        // DOM not ready yet, wait for it
                        document.addEventListener('DOMContentLoaded', findContainer, { once: true });
                        // Also add a timeout as fallback
                        setTimeout(() => {
                            if (!this.container) {
                                const error = new Error(`Container with ID "${this.config.containerId}" not found after DOM ready`);
                                error.type = ErrorTypes.CONTAINER_NOT_FOUND;
                                reject(error);
                            }
                        }, 5000);
                    } else {
                        const error = new Error(`Container with ID "${this.config.containerId}" not found`);
                        error.type = ErrorTypes.CONTAINER_NOT_FOUND;
                        reject(error);
                    }
                };
                findContainer();
            });
        }

        prepareContainer() {
            // Ensure container has proper styling for the widget
            if (!this.container.style.position || this.container.style.position === 'static') {
                this.container.style.position = 'relative';
            }
            
            // Add loading indicator
            this.showLoadingState();
        }

        showLoadingState() {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'ahgpt-loading';
            loadingDiv.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                height: ${this.config.height};
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                color: #64748b;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
            `;
            loadingDiv.innerHTML = `
                <div style="text-align: center;">
                    <div style="width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
                    <div>Loading Al Hayat GPT...</div>
                </div>
            `;
            
            // Add CSS animation
            if (!document.getElementById('ahgpt-loading-styles')) {
                const style = document.createElement('style');
                style.id = 'ahgpt-loading-styles';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            this.container.appendChild(loadingDiv);
        }

        hideLoadingState() {
            const loadingDiv = document.getElementById('ahgpt-loading');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        }

        async handleAuthenticationFlow() {
            if (!this.config.clerkPublishableKey && this.config.allowGuests) {
                debugLog('info', 'Using guest mode - no authentication required');
                return null;
            }

            if (!this.config.clerkPublishableKey) {
                debugLog('info', 'No Clerk key provided, using guest mode');
                return null;
            }

            debugLog('info', 'Starting authentication flow');

            try {
                // Check for existing valid authentication
                const existingAuth = this.getStoredAuth();
                if (existingAuth && await this.isAuthValid(existingAuth)) {
                    debugLog('info', 'Using existing valid authentication');
                    this.currentUser = existingAuth;
                    return existingAuth;
                }

                // Try popup authentication
                if (this.config.usePopupAuth) {
                    return await this.authenticateWithPopup();
                } else {
                    debugLog('info', 'Popup auth disabled, falling back to guest mode');
                    return null;
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
                const timeout = setTimeout(() => {
                    this.cleanupAuthPopup();
                    const error = new Error('Authentication timeout');
                    error.type = ErrorTypes.TIMEOUT;
                    reject(error);
                }, CONSTANTS.AUTH_POPUP_TIMEOUT);

                const authUrl = new URL(`${this.config.apiEndpoint}/sign-in`);
                authUrl.searchParams.set('widget_auth', 'true');
                authUrl.searchParams.set('parent_origin', window.location.origin);
                
                try {
                    this.authPopup = window.open(
                        authUrl.toString(),
                        'ahgpt_auth',
                        'width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
                    );

                    if (!this.authPopup || this.authPopup.closed) {
                        clearTimeout(timeout);
                        const error = new Error('Popup was blocked by browser. Please allow popups for authentication.');
                        error.type = ErrorTypes.POPUP_BLOCKED;
                        reject(error);
                        return;
                    }

                    // Listen for auth completion
                    const authMessageHandler = (event) => {
                        // Verify origin for security
                        if (!this.isValidOrigin(event.origin)) {
                            return;
                        }

                        if (event.data && event.data.type === 'WIDGET_AUTH_SUCCESS') {
                            clearTimeout(timeout);
                            window.removeEventListener('message', authMessageHandler);
                            
                            const user = event.data.payload;
                            this.storeAuth(user);
                            this.currentUser = user;
                            this.cleanupAuthPopup();
                            
                            debugLog('info', 'Authentication successful', user);
                            resolve(user);
                            
                        } else if (event.data && event.data.type === 'WIDGET_AUTH_ERROR') {
                            clearTimeout(timeout);
                            window.removeEventListener('message', authMessageHandler);
                            this.cleanupAuthPopup();
                            
                            const error = new Error(event.data.payload?.message || 'Authentication failed');
                            error.type = ErrorTypes.AUTH_FAILED;
                            reject(error);
                        }
                    };

                    window.addEventListener('message', authMessageHandler);

                    // Monitor popup closure
                    const checkClosed = setInterval(() => {
                        if (this.authPopup && this.authPopup.closed) {
                            clearInterval(checkClosed);
                            clearTimeout(timeout);
                            window.removeEventListener('message', authMessageHandler);
                            
                            if (this.currentUser) {
                                resolve(this.currentUser);
                            } else {
                                const error = new Error('Authentication cancelled by user');
                                error.type = ErrorTypes.AUTH_FAILED;
                                reject(error);
                            }
                        }
                    }, 1000);

                } catch (error) {
                    clearTimeout(timeout);
                    this.cleanupAuthPopup();
                    error.type = ErrorTypes.AUTH_FAILED;
                    reject(error);
                }
            });
        }

        cleanupAuthPopup() {
            if (this.authPopup && !this.authPopup.closed) {
                this.authPopup.close();
            }
            this.authPopup = null;
        }

        isValidOrigin(origin) {
            try {
                const originUrl = new URL(origin);
                const endpointUrl = new URL(this.config.apiEndpoint);
                return originUrl.hostname === endpointUrl.hostname;
            } catch {
                return false;
            }
        }

        getStoredAuth() {
            try {
                const storedAuth = localStorage.getItem('ahgpt_auth');
                return storedAuth ? JSON.parse(storedAuth) : null;
            } catch {
                return null;
            }
        }

        storeAuth(user) {
            try {
                const authData = {
                    ...user,
                    timestamp: Date.now()
                };
                localStorage.setItem('ahgpt_auth', JSON.stringify(authData));
            } catch (error) {
                debugLog('warn', 'Failed to store auth data', error);
            }
        }

        async isAuthValid(auth) {
            if (!auth || !auth.timestamp) {
                return false;
            }

            // Check if auth is too old (24 hours)
            const maxAge = 24 * 60 * 60 * 1000;
            if (Date.now() - auth.timestamp > maxAge) {
                return false;
            }

            // TODO: Add API call to verify auth token if needed
            return true;
        }

        async createWidget() {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    const error = new Error('Widget iframe failed to load within timeout');
                    error.type = ErrorTypes.IFRAME_LOAD_FAILED;
                    reject(error);
                }, CONSTANTS.IFRAME_TIMEOUT);

                try {
                    this.iframe = document.createElement('iframe');
                    
                    const widgetUrl = this.buildWidgetUrl();
                    this.iframe.src = widgetUrl.toString();
                    
                    // Enhanced iframe configuration for better compatibility
                    this.iframe.style.cssText = `
                        width: ${this.config.width};
                        height: ${this.config.height};
                        border: none;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        background: white;
                        display: block;
                    `;
                    
                    // Comprehensive sandbox permissions for maximum compatibility
                    this.iframe.setAttribute('sandbox', 
                        'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation'
                    );
                    
                    // Additional permissions for modern features
                    this.iframe.setAttribute('allow', 'clipboard-write; web-share');
                    this.iframe.setAttribute('loading', 'eager');
                    this.iframe.setAttribute('importance', 'high');

                    // Handle iframe load events
                    this.iframe.addEventListener('load', () => {
                        clearTimeout(timeout);
                        debugLog('info', 'Widget iframe loaded successfully');
                        this.hideLoadingState();
                        resolve();
                    });

                    this.iframe.addEventListener('error', (event) => {
                        clearTimeout(timeout);
                        const error = new Error('Failed to load widget iframe');
                        error.type = ErrorTypes.IFRAME_LOAD_FAILED;
                        error.originalEvent = event;
                        reject(error);
                    });

                    this.container.appendChild(this.iframe);

                } catch (error) {
                    clearTimeout(timeout);
                    error.type = ErrorTypes.IFRAME_LOAD_FAILED;
                    reject(error);
                }
            });
        }

        buildWidgetUrl() {
            const widgetUrl = new URL(`${this.config.apiEndpoint}/widget/chat`);
            
            // Add configuration parameters
            widgetUrl.searchParams.set('theme', this.config.theme);
            widgetUrl.searchParams.set('allowGuests', this.config.allowGuests.toString());
            widgetUrl.searchParams.set('parentOrigin', window.location.origin);
            widgetUrl.searchParams.set('version', CONSTANTS.VERSION);
            widgetUrl.searchParams.set('enhanced_styling', 'true'); // Enable enhanced styling
            
            // Add authentication info if available
            if (this.currentUser) {
                widgetUrl.searchParams.set('authenticated', 'true');
                widgetUrl.searchParams.set('userId', this.currentUser.id || '');
            }
            
            // Add debug flag if enabled
            if (this.config.debug) {
                widgetUrl.searchParams.set('debug', 'true');
            }

            return widgetUrl;
        }

        async setupCommunication() {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    const error = new Error('Widget failed to become ready within timeout');
                    error.type = ErrorTypes.TIMEOUT;
                    reject(error);
                }, CONSTANTS.MESSAGE_TIMEOUT);

                // Setup message handling
                this.messageEventHandler = (event) => {
                    this.handleMessage(event);
                };
                window.addEventListener('message', this.messageEventHandler);

                // Wait for widget ready signal
                this.once('WIDGET_READY', () => {
                    clearTimeout(timeout);
                    this.isReady = true;
                    this.startHealthCheck();
                    resolve();
                });

                // Setup error handling
                this.once('ERROR', (payload) => {
                    clearTimeout(timeout);
                    const error = new Error(payload?.message || 'Widget reported an error');
                    error.type = ErrorTypes.NETWORK_ERROR;
                    reject(error);
                });
            });
        }

        handleMessage(event) {
            // Security check: verify origin
            if (!this.isValidOrigin(event.origin)) {
                debugLog('warn', 'Ignored message from invalid origin', event.origin);
                return;
            }

            const message = event.data;
            if (!message || !message.type) {
                return;
            }

            this.lastMessageTime = Date.now();
            debugLog('debug', 'Received message', message);

            // Handle system messages
            switch (message.type) {
                case 'WIDGET_READY':
                    debugLog('info', 'Widget ready signal received');
                    break;
                    
                case 'USER_SIGNED_IN':
                    this.currentUser = message.payload;
                    this.storeAuth(message.payload);
                    this.triggerCallback('onUserSignIn', message.payload);
                    break;
                    
                case 'USER_SIGNED_OUT':
                    this.currentUser = null;
                    localStorage.removeItem('ahgpt_auth');
                    this.triggerCallback('onUserSignOut');
                    break;
                    
                case 'ERROR':
                    const error = new Error(message.payload?.message || 'Widget error');
                    error.type = ErrorTypes.NETWORK_ERROR;
                    this.triggerCallback('onError', error);
                    break;
            }

            // Trigger custom event handlers
            this.triggerEventHandlers(message.type, message.payload);
        }

        triggerEventHandlers(eventType, payload) {
            const handlers = this.messageHandlers.get(eventType) || [];
            handlers.forEach(handler => {
                try {
                    handler(payload);
                } catch (error) {
                    debugLog('error', 'Event handler error', error);
                }
            });
        }

        triggerCallback(callbackName, ...args) {
            if (this.config[callbackName] && typeof this.config[callbackName] === 'function') {
                try {
                    this.config[callbackName](...args);
                } catch (error) {
                    debugLog('error', `Callback ${callbackName} error`, error);
                }
            }
        }

        startHealthCheck() {
            // Periodic health check to ensure widget is responsive
            this.healthCheckInterval = setInterval(() => {
                const timeSinceLastMessage = Date.now() - this.lastMessageTime;
                if (timeSinceLastMessage > 60000) { // 1 minute
                    debugLog('warn', 'Widget may be unresponsive - no messages received recently');
                }
            }, 30000); // Check every 30 seconds
        }

        finalizeWidget() {
            this.applyCustomStyles();
            this.isReady = true;
            debugLog('info', 'Widget finalization complete');
        }

        applyCustomStyles() {
            if (this.config.customStyles && this.container) {
                try {
                    Object.assign(this.container.style, this.config.customStyles);
                } catch (error) {
                    debugLog('warn', 'Failed to apply custom styles', error);
                }
            }
        }

        handleInitializationFailure(error) {
            debugLog('error', 'Widget initialization failed completely', error);
            
            // Clear any loading states
            this.hideLoadingState();
            
            // Show error state in container
            if (this.container) {
                this.showErrorState(error);
            }
            
            // Trigger error callback
            this.triggerCallback('onError', error);
        }

        showErrorState(error) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: ${this.config.height};
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 12px;
                color: #991b1b;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                text-align: center;
                padding: 20px;
            `;
            
            const isPopupBlocked = error.type === ErrorTypes.POPUP_BLOCKED;
            const isNetworkError = error.type === ErrorTypes.NETWORK_ERROR || error.type === ErrorTypes.IFRAME_LOAD_FAILED;
            
            let errorMessage = 'Unable to load chatbot';
            let suggestion = 'Please try refreshing the page.';
            
            if (isPopupBlocked) {
                errorMessage = 'Authentication blocked';
                suggestion = 'Please allow popups and try again, or use guest mode.';
            } else if (isNetworkError) {
                errorMessage = 'Connection error';
                suggestion = 'Please check your internet connection and try again.';
            }
            
            errorDiv.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                <div style="font-weight: 600; margin-bottom: 8px;">${errorMessage}</div>
                <div style="color: #7f1d1d; margin-bottom: 16px;">${suggestion}</div>
                ${this.config.allowGuests && !isPopupBlocked ? 
                    '<button style="background: #dc2626; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="location.reload()">Try Again</button>' : 
                    ''
                }
            `;
            
            this.container.innerHTML = '';
            this.container.appendChild(errorDiv);
        }

        // Public API methods
        on(eventType, handler) {
            if (typeof handler !== 'function') {
                throw new Error('Event handler must be a function');
            }
            
            if (!this.messageHandlers.has(eventType)) {
                this.messageHandlers.set(eventType, []);
            }
            this.messageHandlers.get(eventType).push(handler);
            
            return this; // Enable chaining
        }

        once(eventType, handler) {
            const onceHandler = (payload) => {
                handler(payload);
                this.off(eventType, onceHandler);
            };
            return this.on(eventType, onceHandler);
        }

        off(eventType, handler) {
            const handlers = this.messageHandlers.get(eventType);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
            return this; // Enable chaining
        }

        sendMessage(type, payload) {
            if (!this.iframe || !this.iframe.contentWindow) {
                debugLog('warn', 'Cannot send message - iframe not ready');
                return;
            }

            const message = {
                type,
                payload,
                timestamp: Date.now(),
                source: 'widget-sdk'
            };

            try {
                this.iframe.contentWindow.postMessage(message, this.config.apiEndpoint);
                debugLog('debug', 'Sent message to widget', message);
            } catch (error) {
                debugLog('error', 'Failed to send message to widget', error);
            }
        }

        updateConfig(newConfig) {
            if (!newConfig || typeof newConfig !== 'object') {
                throw new Error('updateConfig requires a configuration object');
            }

            const oldConfig = { ...this.config };
            this.config = { ...this.config, ...newConfig };
            
            // Apply immediate visual changes
            if (newConfig.theme && newConfig.theme !== oldConfig.theme) {
                this.sendMessage('UPDATE_CONFIG', { theme: newConfig.theme });
            }
            
            if (newConfig.height && newConfig.height !== oldConfig.height) {
                if (this.iframe) {
                    this.iframe.style.height = newConfig.height;
                }
            }
            
            if (newConfig.customStyles) {
                this.applyCustomStyles();
            }

            return this; // Enable chaining
        }

        // Authentication methods
        signIn() {
            if (this.currentUser) {
                debugLog('warn', 'User is already signed in');
                return Promise.resolve(this.currentUser);
            }

            return this.authenticateWithPopup();
        }

        signOut() {
            this.currentUser = null;
            localStorage.removeItem('ahgpt_auth');
            this.sendMessage('SIGN_OUT');
            this.triggerCallback('onUserSignOut');
            return this; // Enable chaining
        }

        // Utility methods
        getUser() {
            return this.currentUser;
        }

        isAuthenticated() {
            return !!this.currentUser;
        }

        isWidgetReady() {
            return this.isReady;
        }

        getVersion() {
            return CONSTANTS.VERSION;
        }

        // Cleanup and destruction
        destroy() {
            debugLog('info', 'Destroying widget');
            
            this.isDestroyed = true;
            this.isReady = false;

            // Clear intervals and timeouts
            if (this.healthCheckInterval) {
                clearInterval(this.healthCheckInterval);
                this.healthCheckInterval = null;
            }

            // Cleanup popup
            this.cleanupAuthPopup();

            // Remove event listeners
            if (this.messageEventHandler) {
                window.removeEventListener('message', this.messageEventHandler);
                this.messageEventHandler = null;
            }

            // Remove iframe
            if (this.iframe) {
                this.iframe.remove();
                this.iframe = null;
            }

            // Clear message handlers
            this.messageHandlers.clear();

            // COMPLETELY CLEAR container to prevent any remnants
            if (this.container) {
                this.container.innerHTML = '';
                this.container.style.cssText = '';
                this.container = null;
            }

            // Remove from global registry
            if (window.AlHayatGPT_Instances && this.config.containerId) {
                delete window.AlHayatGPT_Instances[this.config.containerId];
            }

            debugLog('info', 'Widget destroyed successfully');
        }
    }

    // Global widget factory and utilities
    const AlHayatGPT = {
        createWidget(config) {
            try {
                // Destroy any and all existing widgets first to guarantee a clean slate.
                destroyAllWidgets();

                // Now, create the new widget instance.
                return new AlHayatGPTWidget(config);
            } catch (error) {
                debugLog('error', 'Failed to create widget', error);
                throw error;
            }
        },

        version: CONSTANTS.VERSION,
        
        // Utility to check if the SDK is supported
        isSupported() {
            return !!(
                window.postMessage &&
                window.addEventListener &&
                document.createElement &&
                localStorage &&
                URL &&
                Promise
            );
        },

        // Helper to validate configuration
        validateConfig(config) {
            if (!config) {
                throw new Error('Configuration is required');
            }
            if (!config.containerId) {
                throw new Error('containerId is required');
            }
            return true;
        }
    };

    // Export to global scope
    window.AlHayatGPT = AlHayatGPT;

    // Emit ready event for scripts waiting for SDK
    if (typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('AlHayatGPTSDKReady', { detail: AlHayatGPT }));
    }

    debugLog('info', `Al Hayat GPT Widget SDK ${CONSTANTS.VERSION} loaded successfully`);

})(); 