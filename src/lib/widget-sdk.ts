/**
 * Al Hayat GPT Widget SDK - Optimized Version
 * High-performance, secure, and memory-efficient widget implementation
 */

// Optimized interfaces with minimal footprint
export interface User {
  readonly id: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
}

export interface WidgetConfig {
  readonly containerId: string;
  readonly clerkPublishableKey?: string;
  readonly apiEndpoint?: string;
  readonly theme?: 'light' | 'dark' | 'auto';
  readonly width?: string;
  readonly height?: string;
  readonly allowGuests?: boolean;
  readonly customStyles?: Readonly<Record<string, string>>;
  readonly onReady?: () => void;
  readonly onUserSignIn?: (user: User) => void;
  readonly onUserSignOut?: () => void;
  readonly onError?: (error: WidgetError) => void;
  readonly debug?: boolean;
  readonly retryAttempts?: number;
  readonly retryDelay?: number;
}

export interface WidgetMessage {
  readonly type: 'WIDGET_READY' | 'USER_SIGNED_IN' | 'USER_SIGNED_OUT' | 'RESIZE' | 'ERROR';
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly timestamp?: number;
  readonly nonce?: string;
}

// Enhanced error handling with error codes
export class WidgetError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'WidgetError';
  }
}

// Error codes for better debugging
export const ErrorCodes = {
  CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
  IFRAME_LOAD_FAILED: 'IFRAME_LOAD_FAILED',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_CONFIG: 'INVALID_CONFIG',
  INITIALIZATION_FAILED: 'INITIALIZATION_FAILED'
} as const;

type EventHandler = (payload?: Readonly<Record<string, unknown>>) => void;

// Memory-efficient singleton registry with WeakMap
const widgetRegistry = new WeakMap<HTMLElement, AlHayatGPTWidget>();
let globalInstanceCount = 0;

// Security: CSP-compliant token management
class SecureTokenManager {
  private static readonly TOKEN_KEY = 'ahgpt_token';
  private static readonly NONCE_LENGTH = 16;

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const urlToken = new URLSearchParams(window.location.search).get('token');
      if (urlToken && this.validateToken(urlToken)) {
        this.storeToken(urlToken);
        this.cleanUrl();
        return urlToken;
      }
      return this.retrieveStoredToken();
    } catch (error) {
      console.warn('[WidgetSDK] Token retrieval failed:', error);
      return null;
    }
  }

  private static validateToken(token: string): boolean {
    // Basic token validation - should be expanded based on your token format
    return typeof token === 'string' && token.length > 10 && /^[A-Za-z0-9._-]+$/.test(token);
  }

  private static storeToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.warn('[WidgetSDK] Token storage failed:', error);
    }
  }

  private static retrieveStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.warn('[WidgetSDK] Token retrieval failed:', error);
      return null;
    }
  }

  private static cleanUrl(): void {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('token')) {
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (error) {
      console.warn('[WidgetSDK] URL cleanup failed:', error);
    }
  }

  static generateNonce(): string {
    const array = new Uint8Array(this.NONCE_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Enhanced security validator
class SecurityValidator {
  private static readonly ALLOWED_PROTOCOLS = ['https:', 'http:'];
  private static readonly LOCALHOST_PATTERNS = ['localhost', '127.0.0.1', '::1'];

  static validateOrigin(origin: string, expectedOrigin: string): boolean {
    try {
      const originUrl = new URL(origin);
      const expectedUrl = new URL(expectedOrigin);
      
      // Allow localhost for development
      if (this.isLocalhost(originUrl.hostname) || this.isLocalhost(expectedUrl.hostname)) {
        return true;
      }
      
      // Strict origin matching for production
      return origin === expectedOrigin;
    } catch (error) {
      console.warn('[WidgetSDK] Origin validation failed:', error);
      return false;
    }
  }

  private static isLocalhost(hostname: string): boolean {
    return this.LOCALHOST_PATTERNS.includes(hostname);
  }

  static validateConfig(config: WidgetConfig): void {
    if (!config.containerId?.trim()) {
      throw new WidgetError('Container ID is required', ErrorCodes.INVALID_CONFIG);
    }

    if (config.apiEndpoint) {
      try {
        const url = new URL(config.apiEndpoint);
        if (!this.ALLOWED_PROTOCOLS.includes(url.protocol)) {
          throw new WidgetError(`Invalid protocol: ${url.protocol}`, ErrorCodes.SECURITY_VIOLATION);
        }
      } catch (error) {
        throw new WidgetError(`Invalid API endpoint: ${config.apiEndpoint}`, ErrorCodes.INVALID_CONFIG);
      }
    }
  }
}

// Optimized retry mechanism with exponential backoff
class RetryManager {
  private attempts = 0;
  private readonly maxAttempts: number;
  private readonly baseDelay: number;

  constructor(maxAttempts = 3, baseDelay = 1000) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    while (this.attempts < this.maxAttempts) {
      try {
        const result = await operation();
        this.reset();
        return result;
      } catch (error) {
        this.attempts++;
        
        if (this.attempts >= this.maxAttempts) {
          throw new WidgetError(
            `Operation failed after ${this.maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ErrorCodes.INITIALIZATION_FAILED,
            false,
            { originalError: error, attempts: this.attempts }
          );
        }

        const delay = this.baseDelay * Math.pow(2, this.attempts - 1);
        await this.sleep(delay);
      }
    }

    throw new WidgetError('Retry manager exhausted', ErrorCodes.INITIALIZATION_FAILED);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reset(): void {
    this.attempts = 0;
  }
}

// Memory-efficient widget class
export class AlHayatGPTWidget {
  private readonly config: Required<WidgetConfig>;
  private readonly instanceId: string;
  private readonly retryManager: RetryManager;
  private readonly cleanupTasks = new Set<() => void>();
  
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLElement | null = null;
  private messageHandlers = new Map<string, Set<EventHandler>>();
  private messageEventHandler: ((event: MessageEvent) => void) | null = null;
  private isDestroyed = false;
  private nonce = '';

  constructor(config: WidgetConfig) {
    // Security validation first
    SecurityValidator.validateConfig(config);

    // Optimized config with defaults
    this.config = {
      apiEndpoint: typeof window !== 'undefined' ? window.location.origin : 'https://www.alhayatgpt.com',
      theme: 'auto',
      width: '100%',
      height: '600px',
      allowGuests: true,
      debug: false,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
      customStyles: Object.freeze({ ...config.customStyles }),
      onReady: config.onReady,
      onUserSignIn: config.onUserSignIn,
      onUserSignOut: config.onUserSignOut,
      onError: config.onError
    } as Required<WidgetConfig>;

    this.instanceId = `widget_${++globalInstanceCount}_${Date.now()}`;
    this.retryManager = new RetryManager(this.config.retryAttempts, this.config.retryDelay);
    this.nonce = SecureTokenManager.generateNonce();

    this.log('Initializing widget', { instanceId: this.instanceId, config: this.sanitizeConfigForLogging() });
    
    // Initialize with proper error handling
    this.initializeWidget().catch(error => {
      this.handleError(error);
    });
  }

  private async initializeWidget(): Promise<void> {
    await this.retryManager.execute(async () => {
      await this.findContainer();
      await this.createIframe();
      await this.setupMessageHandling();
      this.applyStyles();
      this.log('Widget initialized successfully');
      this.config.onReady?.();
    });
  }

  private async findContainer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const attemptFind = () => {
        this.container = document.getElementById(this.config.containerId);
        
        if (this.container) {
          // Check for existing widget in this container
          if (widgetRegistry.has(this.container)) {
            const existingWidget = widgetRegistry.get(this.container);
            existingWidget?.destroy();
          }
          
          // Register this widget
          widgetRegistry.set(this.container, this);
          resolve();
          return;
        }

        reject(new WidgetError(
          `Container with ID "${this.config.containerId}" not found`,
          ErrorCodes.CONTAINER_NOT_FOUND,
          true
        ));
      };

      // Try immediate find, then wait for DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attemptFind, { once: true });
        this.addCleanupTask(() => document.removeEventListener('DOMContentLoaded', attemptFind));
      } else {
        attemptFind();
      }
    });
  }

  private async createIframe(): Promise<void> {
    if (!this.container) {
      throw new WidgetError('Container not found', ErrorCodes.CONTAINER_NOT_FOUND);
    }

    // Clear container
    this.container.innerHTML = '';

    this.iframe = document.createElement('iframe');
    
    // Build secure widget URL
    const widgetUrl = new URL(`${this.config.apiEndpoint}/widget/chat`);
    widgetUrl.searchParams.set('theme', this.config.theme);
    widgetUrl.searchParams.set('allowGuests', this.config.allowGuests.toString());
    widgetUrl.searchParams.set('nonce', this.nonce);
    
    // Remove clerk key for external widgets - they should remain guest-only
    // if (this.config.clerkPublishableKey) {
    //   widgetUrl.searchParams.set('clerkKey', this.config.clerkPublishableKey);
    // }

    // Enhanced security
    widgetUrl.searchParams.set('parentOrigin', window.location.origin);

    // Apply iframe properties
    this.iframe.src = widgetUrl.toString();
    this.iframe.style.cssText = `
      width: ${this.config.width};
      height: ${this.config.height};
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: block;
    `;
    
    // Enhanced security attributes
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
    this.iframe.setAttribute('allow', 'clipboard-write');
    this.iframe.setAttribute('loading', 'lazy');

    // Load timeout
    const loadPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new WidgetError('Iframe load timeout', ErrorCodes.TIMEOUT, true));
      }, 15000);

      const cleanup = () => {
        clearTimeout(timeout);
        this.iframe?.removeEventListener('load', onLoad);
        this.iframe?.removeEventListener('error', onError);
      };

      const onLoad = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new WidgetError('Iframe failed to load', ErrorCodes.IFRAME_LOAD_FAILED, true));
      };

      this.iframe!.addEventListener('load', onLoad, { once: true });
      this.iframe!.addEventListener('error', onError, { once: true });
      this.addCleanupTask(cleanup);
    });

    this.container.appendChild(this.iframe);
    await loadPromise;
  }

  private setupMessageHandling(): void {
    this.messageEventHandler = (event: MessageEvent) => {
      if (this.isDestroyed) return;

      // Enhanced security validation
      if (!SecurityValidator.validateOrigin(event.origin, this.config.apiEndpoint)) {
        this.log('Blocked message from unauthorized origin', { origin: event.origin });
        return;
      }

      // Validate message structure
      const message = event.data as WidgetMessage;
      if (!message?.type) {
        this.log('Invalid message received', { message });
        return;
      }

      // Nonce validation for critical messages
      if (['USER_SIGNED_IN', 'USER_SIGNED_OUT'].includes(message.type)) {
        if (message.nonce !== this.nonce) {
          this.log('Message nonce validation failed', { expected: this.nonce, received: message.nonce });
          return;
        }
      }

      this.handleMessage(message);
    };

    window.addEventListener('message', this.messageEventHandler, { passive: true });
    this.addCleanupTask(() => {
      if (this.messageEventHandler) {
        window.removeEventListener('message', this.messageEventHandler);
      }
    });
  }

  private handleMessage(message: WidgetMessage): void {
    this.log('Received message', { type: message.type, payload: message.payload });

    try {
      switch (message.type) {
        case 'WIDGET_READY':
          this.config.onReady?.();
          break;
        
                 case 'USER_SIGNED_IN':
           if (message.payload && typeof message.payload === 'object' && 'id' in message.payload) {
             this.config.onUserSignIn?.(message.payload as unknown as User);
           }
           break;
        
        case 'USER_SIGNED_OUT':
          this.config.onUserSignOut?.();
          break;
        
        case 'RESIZE':
          if (this.iframe && message.payload?.height) {
            const height = Number(message.payload.height);
            if (height > 0 && height < 10000) { // Sanity check
              this.iframe.style.height = `${height}px`;
            }
          }
          break;
        
        case 'ERROR':
          const error = new WidgetError(
            message.payload?.message as string || 'Widget error',
            message.payload?.code as string || 'UNKNOWN_ERROR',
            message.payload?.retryable as boolean || false,
            message.payload
          );
          this.handleError(error);
          break;
      }

      // Trigger custom handlers
      this.triggerEventHandlers(message.type, message.payload);
    } catch (error) {
      this.handleError(error);
    }
  }

  private triggerEventHandlers(eventType: string, payload?: Readonly<Record<string, unknown>>): void {
    const handlers = this.messageHandlers.get(eventType);
    if (!handlers) return;

    // Create a copy to avoid issues if handlers are modified during iteration
    const handlersCopy = Array.from(handlers);
    handlersCopy.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        this.log('Error in event handler', { eventType, error });
      }
    });
  }

  private applyStyles(): void {
    if (!this.container || !this.config.customStyles) return;

    try {
      Object.entries(this.config.customStyles).forEach(([property, value]) => {
        if (this.container && typeof value === 'string') {
          this.container.style.setProperty(property, value);
        }
      });
    } catch (error) {
      this.log('Error applying custom styles', { error });
    }
  }

  private handleError(error: unknown): void {
    const widgetError = error instanceof WidgetError 
      ? error 
      : new WidgetError(
          error instanceof Error ? error.message : 'Unknown error',
          ErrorCodes.INITIALIZATION_FAILED,
          false,
          { originalError: error }
        );

    this.log('Widget error', { error: widgetError });
    this.config.onError?.(widgetError);
  }

  private addCleanupTask(task: () => void): void {
    this.cleanupTasks.add(task);
  }

  private log(message: string, data?: Record<string, unknown>): void {
    if (!this.config.debug) return;
    
    const logMessage = `[WidgetSDK:${this.instanceId}] ${message}`;
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  private sanitizeConfigForLogging(): Record<string, unknown> {
    const { clerkPublishableKey, onReady, onUserSignIn, onUserSignOut, onError, ...safe } = this.config;
    return {
      ...safe,
      clerkPublishableKey: clerkPublishableKey ? '[REDACTED]' : undefined,
      hasCallbacks: !!(onReady || onUserSignIn || onUserSignOut || onError)
    };
  }

  // Public API methods
  public on(eventType: string, handler: EventHandler): void {
    if (this.isDestroyed) return;
    
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }
    this.messageHandlers.get(eventType)!.add(handler);
  }

  public off(eventType: string, handler: EventHandler): void {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(eventType);
      }
    }
  }

  public sendMessage(type: string, payload?: Record<string, unknown>): void {
    if (this.isDestroyed || !this.iframe?.contentWindow) return;

    try {
      const message: WidgetMessage = {
        type: type as any,
        payload: payload ? Object.freeze({ ...payload }) : undefined,
        timestamp: Date.now(),
        nonce: this.nonce
      };

      this.iframe.contentWindow.postMessage(message, this.config.apiEndpoint);
    } catch (error) {
      this.log('Failed to send message', { type, error });
    }
  }

  public updateConfig(newConfig: Partial<WidgetConfig>): void {
    if (this.isDestroyed) return;

    // Validate new config
    SecurityValidator.validateConfig({ ...this.config, ...newConfig });
    
    Object.assign(this.config, newConfig);
    this.sendMessage('UPDATE_CONFIG', newConfig);
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.log('Destroying widget');
    this.isDestroyed = true;

    // Execute all cleanup tasks
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        this.log('Cleanup task failed', { error });
      }
    });
    this.cleanupTasks.clear();

    // Clean up DOM
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }

    // Clean up registry
    if (this.container) {
      widgetRegistry.delete(this.container);
      this.container = null;
    }

    // Clear handlers
    this.messageHandlers.clear();
    this.messageEventHandler = null;

    globalInstanceCount = Math.max(0, globalInstanceCount - 1);
  }

  // Utility methods
  public isReady(): boolean {
    return !this.isDestroyed && !!this.iframe && !!this.container;
  }

  public getInstanceId(): string {
    return this.instanceId;
  }

  public static getActiveWidgetCount(): number {
    return globalInstanceCount;
  }
}

// Optimized global factory
declare global {
  interface Window {
    AlHayatGPT: {
      createWidget: (config: WidgetConfig) => AlHayatGPTWidget;
      version: string;
      ErrorCodes: typeof ErrorCodes;
      getActiveWidgetCount: () => number;
    };
  }
}

// Initialize global object with memory efficiency
if (typeof window !== 'undefined') {
  // Prevent multiple SDK loading
  if (window.AlHayatGPT) {
    console.warn('[WidgetSDK] SDK already loaded, skipping re-initialization');
  } else {
    window.AlHayatGPT = Object.freeze({
      createWidget: (config: WidgetConfig) => new AlHayatGPTWidget(config),
      version: '2.0.0-optimized',
      ErrorCodes: Object.freeze(ErrorCodes),
      getActiveWidgetCount: AlHayatGPTWidget.getActiveWidgetCount
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      // Widgets will be automatically cleaned up by their destructors
      console.log('[WidgetSDK] Page unloading, widgets will be cleaned up');
    });
  }
}

export default AlHayatGPTWidget; 