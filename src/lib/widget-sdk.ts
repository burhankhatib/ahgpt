/**
 * Al Hayat GPT Widget SDK
 * Allows other websites to embed the chat functionality with authentication
 */

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: unknown;
}

export interface WidgetConfig {
  containerId: string;
  clerkPublishableKey?: string;
  apiEndpoint?: string;
  theme?: 'light' | 'dark' | 'auto';
  width?: string;
  height?: string;
  allowGuests?: boolean;
  customStyles?: Record<string, string>;
  onReady?: () => void;
  onUserSignIn?: (user: User) => void;
  onUserSignOut?: () => void;
  onError?: (error: Error) => void;
}

export interface WidgetMessage {
  type: 'WIDGET_READY' | 'USER_SIGNED_IN' | 'USER_SIGNED_OUT' | 'RESIZE' | 'ERROR';
  payload?: Record<string, unknown>;
}

type EventHandler = (payload?: Record<string, unknown>) => void;

// Centralized Auth Helper
function getToken() {
  const urlToken = new URLSearchParams(window.location.search).get('token');
  if (urlToken) {
    localStorage.setItem('ahgpt_token', urlToken);
    // Remove token from URL for cleanliness
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.toString());
    return urlToken;
  }
  return localStorage.getItem('ahgpt_token');
}

function showSignInButton(container: HTMLElement, signInText: string = 'Sign in to save your chats') {
  const btn = document.createElement('button');
  btn.innerText = signInText;
  btn.onclick = () => {
    const redirectUrl = encodeURIComponent(window.location.href);
    window.location.href = `https://www.alhayatgpt.com/sign-in?redirect_url=${redirectUrl}`;
  };
  container.appendChild(btn);
}

class AlHayatGPTWidget {
  private config: WidgetConfig;
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLElement | null = null;
  private messageHandlers: Map<string, EventHandler[]> = new Map();
  private messageEventHandler: ((event: MessageEvent) => void) | null = null;
  private token: string | null = null;

  constructor(config: WidgetConfig) {
    this.config = {
      apiEndpoint: typeof window !== 'undefined' ? window.location.origin : 'https://www.alhayatgpt.com',
      theme: 'auto',
      width: '100%',
      height: '600px',
      allowGuests: true,
      ...config
    };

    this.init();
  }

  private init() {
    this.container = document.getElementById(this.config.containerId);
    if (!this.container) {
      throw new Error(`Container with ID "${this.config.containerId}" not found`);
    }

    this.token = getToken();
    if (!this.token && !this.config.allowGuests) {
      showSignInButton(this.container);
      return;
    }

    this.createIframe();
    this.setupMessageHandling();
    this.applyStyles();
  }

  private createIframe() {
    this.iframe = document.createElement('iframe');
    
    // Build the widget URL with configuration
    const widgetUrl = new URL(`${this.config.apiEndpoint}/widget/chat`);
    widgetUrl.searchParams.set('theme', this.config.theme!);
    widgetUrl.searchParams.set('allowGuests', this.config.allowGuests!.toString());
    
    if (this.config.clerkPublishableKey) {
      widgetUrl.searchParams.set('clerkKey', this.config.clerkPublishableKey);
    }

    // Add parent origin for security
    widgetUrl.searchParams.set('parentOrigin', window.location.origin);

    this.iframe.src = widgetUrl.toString();
    this.iframe.style.width = this.config.width!;
    this.iframe.style.height = this.config.height!;
    this.iframe.style.border = 'none';
    this.iframe.style.borderRadius = '12px';
    this.iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    
    // Security attributes
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
    this.iframe.setAttribute('allow', 'clipboard-write');

    this.container!.appendChild(this.iframe);
  }

  private setupMessageHandling() {
    this.messageEventHandler = (event: MessageEvent) => {
      // Verify origin for security
      if (!event.origin.includes(new URL(this.config.apiEndpoint!).hostname)) {
        return;
      }

      const message: WidgetMessage = event.data;
      this.handleMessage(message);
    };

    window.addEventListener('message', this.messageEventHandler);
  }

  private handleMessage(message: WidgetMessage) {
    switch (message.type) {
      case 'WIDGET_READY':
        this.config.onReady?.();
        break;
      
      case 'USER_SIGNED_IN':
        this.config.onUserSignIn?.(message.payload as User);
        break;
      
      case 'USER_SIGNED_OUT':
        this.config.onUserSignOut?.();
        break;
      
      case 'RESIZE':
        if (this.iframe && message.payload?.height) {
          this.iframe.style.height = `${message.payload.height}px`;
        }
        break;
      
      case 'ERROR':
        this.config.onError?.(new Error(message.payload?.message as string || 'Widget error'));
        break;
    }

    // Trigger custom event handlers
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message.payload));
  }

  private applyStyles() {
    if (this.config.customStyles && this.container) {
      Object.assign(this.container.style, this.config.customStyles);
    }
  }

  // Public API methods
  public on(eventType: string, handler: EventHandler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType)!.push(handler);
  }

  public off(eventType: string, handler: EventHandler) {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public sendMessage(type: string, payload?: Record<string, unknown>) {
    if (this.iframe?.contentWindow) {
      // Attach token if available
      const message = { type, payload, token: this.token };
      this.iframe.contentWindow.postMessage(message, this.config.apiEndpoint!);
    }
  }

  public updateConfig(newConfig: Partial<WidgetConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.sendMessage('UPDATE_CONFIG', newConfig);
  }

  public destroy() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    if (this.messageEventHandler) {
      window.removeEventListener('message', this.messageEventHandler);
      this.messageEventHandler = null;
    }
    this.messageHandlers.clear();
  }
}

// Global widget factory
declare global {
  interface Window {
    AlHayatGPT: {
      createWidget: (config: WidgetConfig) => AlHayatGPTWidget;
      version: string;
    };
  }
}

// Initialize global object
if (typeof window !== 'undefined') {
  window.AlHayatGPT = {
    createWidget: (config: WidgetConfig) => new AlHayatGPTWidget(config),
    version: '1.0.0'
  };
}

export default AlHayatGPTWidget; 