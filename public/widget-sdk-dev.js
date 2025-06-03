/*!
 * Al Hayat GPT Widget SDK - Development Version
 * Points to localhost for local testing
 */
(function() {
    'use strict';

    // Debug logging with levels
    function debugLog(level, message, data = null) {
        if (typeof console !== 'undefined' && console[level]) {
            const timestamp = new Date().toISOString();
            const logMessage = `[AlHayatGPT SDK DEV] ${timestamp} ${message}`;
            if (data) {
                console[level](logMessage, data);
            } else {
                console[level](logMessage);
            }
        }
    }

    // Configuration constants for development
    const CONSTANTS = {
        VERSION: '2.0.0-dev',
        IFRAME_TIMEOUT: 15000,
        AUTH_POPUP_TIMEOUT: 300000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 2000,
        MESSAGE_TIMEOUT: 30000,
        SUPPORTED_THEMES: ['light', 'dark', 'auto'],
        DEFAULT_WIDTH: '100%',
        DEFAULT_HEIGHT: '600px'
    };

    // Error types for better error handling
    const ErrorTypes = {
        CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
        IFRAME_LOAD_FAILED: 'IFRAME_LOAD_FAILED',
        AUTH_FAILED: 'AUTH_FAILED',
        NETWORK_ERROR: 'NETWORK_ERROR',
        TIMEOUT: 'TIMEOUT',
        CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
        POPUP_BLOCKED: 'POPUP_BLOCKED'
    };

    class AlHayatGPTWidget {
        constructor(config) {
            debugLog('info', 'Widget constructor called', config);
            
            if (!config || !config.containerId) {
                const error = new Error('containerId is required in widget configuration');
                error.type = ErrorTypes.CONFIGURATION_ERROR;
                throw error;
            }

            // Development configuration - points to localhost
            this.config = {
                apiEndpoint: 'http://localhost:3000',  // DEV: Point to local server
                theme: 'auto',
                width: CONSTANTS.DEFAULT_WIDTH,
                height: CONSTANTS.DEFAULT_HEIGHT,
                allowGuests: true,
                retryAttempts: CONSTANTS.RETRY_ATTEMPTS,
                retryDelay: CONSTANTS.RETRY_DELAY,
                debug: true,  // DEV: Enable debug by default
                usePopupAuth: true,
                fallbackToGuest: true,
                autoResize: true,
                enableRetry: true,
                ...config
            };

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

            debugLog('info', 'DEV Widget configuration', this.config);
            
            this.safeInit();
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
                await this.findAndPrepareContainer();
                await this.createWidget();
                await this.setupCommunication();
                
                this.isReady = true;
                debugLog('info', 'DEV Widget initialization completed successfully');
                this.triggerCallback('onReady');

            } catch (error) {
                debugLog('error', 'Initialization step failed', error);
                
                if (this.config.enableRetry && this.initAttempts < this.config.retryAttempts) {
                    debugLog('info', `Retrying initialization in ${this.config.retryDelay}ms...`);
                    setTimeout(() => this.init(), this.config.retryDelay);
                    return;
                }
                
                throw error;
            }
        }

        async findAndPrepareContainer() {
            return new Promise((resolve, reject) => {
                const findContainer = () => {
                    this.container = document.getElementById(this.config.containerId);
                    if (this.container) {
                        this.prepareContainer();
                        debugLog('info', 'Container found and prepared');
                        resolve(this.container);
                    } else if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', findContainer, { once: true });
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
            if (!this.container.style.position || this.container.style.position === 'static') {
                this.container.style.position = 'relative';
            }
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
                    <div>Loading Al Hayat GPT (DEV)...</div>
                </div>
            `;
            
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

        async createWidget() {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    const error = new Error('Widget iframe failed to load within timeout');
                    error.type = ErrorTypes.IFRAME_LOAD_FAILED;
                    reject(error);
                }, CONSTANTS.IFRAME_TIMEOUT);

                try {
                    this.iframe = document.createElement('iframe');
                    
                    // DEV: Build localhost URL
                    const widgetUrl = new URL(`${this.config.apiEndpoint}/widget/chat`);
                    widgetUrl.searchParams.set('theme', this.config.theme);
                    widgetUrl.searchParams.set('allowGuests', this.config.allowGuests.toString());
                    widgetUrl.searchParams.set('parentOrigin', window.location.origin);
                    widgetUrl.searchParams.set('version', CONSTANTS.VERSION);
                    
                    debugLog('info', 'DEV: Creating iframe with URL', widgetUrl.toString());
                    
                    this.iframe.src = widgetUrl.toString();
                    this.iframe.style.cssText = `
                        width: ${this.config.width};
                        height: ${this.config.height};
                        border: none;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        background: white;
                        display: block;
                    `;
                    
                    this.iframe.setAttribute('sandbox', 
                        'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'
                    );
                    this.iframe.setAttribute('allow', 'clipboard-write; web-share');

                    this.iframe.addEventListener('load', () => {
                        clearTimeout(timeout);
                        debugLog('info', 'DEV: Widget iframe loaded successfully');
                        this.hideLoadingState();
                        resolve();
                    });

                    this.iframe.addEventListener('error', (event) => {
                        clearTimeout(timeout);
                        debugLog('error', 'DEV: Iframe load error', event);
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

        async setupCommunication() {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    const error = new Error('Widget failed to become ready within timeout');
                    error.type = ErrorTypes.TIMEOUT;
                    reject(error);
                }, CONSTANTS.MESSAGE_TIMEOUT);

                this.messageEventHandler = (event) => {
                    this.handleMessage(event);
                };
                window.addEventListener('message', this.messageEventHandler);

                this.once('WIDGET_READY', () => {
                    clearTimeout(timeout);
                    debugLog('info', 'DEV: Widget ready signal received');
                    resolve();
                });

                this.once('ERROR', (payload) => {
                    clearTimeout(timeout);
                    const error = new Error(payload?.message || 'Widget reported an error');
                    error.type = ErrorTypes.NETWORK_ERROR;
                    reject(error);
                });
            });
        }

        handleMessage(event) {
            // DEV: More permissive origin checking for localhost
            const message = event.data;
            if (!message || !message.type) {
                return;
            }

            debugLog('debug', 'DEV: Received message', message);

            switch (message.type) {
                case 'WIDGET_READY':
                    break;
                case 'USER_SIGNED_IN':
                    this.currentUser = message.payload;
                    this.triggerCallback('onUserSignIn', message.payload);
                    break;
                case 'USER_SIGNED_OUT':
                    this.currentUser = null;
                    this.triggerCallback('onUserSignOut');
                    break;
                case 'RESIZE':
                    if (this.config.autoResize && this.iframe && message.payload?.height) {
                        const height = Math.max(300, Math.min(800, message.payload.height));
                        this.iframe.style.height = `${height}px`;
                    }
                    break;
                case 'ERROR':
                    const error = new Error(message.payload?.message || 'Widget error');
                    error.type = ErrorTypes.NETWORK_ERROR;
                    this.triggerCallback('onError', error);
                    break;
            }

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

        handleInitializationFailure(error) {
            debugLog('error', 'DEV: Widget initialization failed completely', error);
            
            this.hideLoadingState();
            
            if (this.container) {
                this.showErrorState(error);
            }
            
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
            
            errorDiv.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                <div style="font-weight: 600; margin-bottom: 8px;">DEV: Widget Load Failed</div>
                <div style="color: #7f1d1d; margin-bottom: 8px;">${error.message}</div>
                <div style="color: #7f1d1d; margin-bottom: 16px; font-size: 12px;">Check console for details</div>
                <button style="background: #dc2626; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;" onclick="location.reload()">Retry</button>
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
            
            return this;
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
            return this;
        }

        sendMessage(type, payload) {
            if (!this.iframe || !this.iframe.contentWindow) {
                debugLog('warn', 'Cannot send message - iframe not ready');
                return;
            }

            const message = { type, payload, timestamp: Date.now(), source: 'widget-sdk' };

            try {
                this.iframe.contentWindow.postMessage(message, this.config.apiEndpoint);
                debugLog('debug', 'DEV: Sent message to widget', message);
            } catch (error) {
                debugLog('error', 'Failed to send message to widget', error);
            }
        }

        updateConfig(newConfig) {
            if (!newConfig || typeof newConfig !== 'object') {
                throw new Error('updateConfig requires a configuration object');
            }

            this.config = { ...this.config, ...newConfig };
            
            if (newConfig.theme) {
                this.sendMessage('UPDATE_CONFIG', { theme: newConfig.theme });
            }
            
            return this;
        }

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

        destroy() {
            debugLog('info', 'DEV: Destroying widget');
            
            this.isDestroyed = true;
            this.isReady = false;

            if (this.messageEventHandler) {
                window.removeEventListener('message', this.messageEventHandler);
                this.messageEventHandler = null;
            }

            if (this.iframe) {
                this.iframe.remove();
                this.iframe = null;
            }

            this.messageHandlers.clear();

            if (this.container) {
                this.container.innerHTML = '';
            }

            debugLog('info', 'DEV: Widget destroyed successfully');
        }
    }

    // Export to global scope
    window.AlHayatGPT = {
        createWidget(config) {
            try {
                return new AlHayatGPTWidget(config);
            } catch (error) {
                debugLog('error', 'DEV: Failed to create widget', error);
                throw error;
            }
        },

        version: CONSTANTS.VERSION,
        
        isSupported() {
            return !!(
                window.postMessage &&
                window.addEventListener &&
                document.createElement &&
                localStorage &&
                URL &&
                Promise
            );
        }
    };

    debugLog('info', `DEV: Al Hayat GPT Widget SDK ${CONSTANTS.VERSION} loaded successfully`);

})(); 