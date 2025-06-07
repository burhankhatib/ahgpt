// Al Hayat GPT Widget SDK v2.0 - Complete Rebuild
// Built from scratch based on the main chat component

// Types and Interfaces
export interface WidgetMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  uniqueKey: string;
  firstName?: string;
  lastName?: string; // Used for source website tracking
  email?: string;
}

export interface LanguageDetection {
  language: string;
  direction: 'ltr' | 'rtl';
  confidence: number;
}

export interface WidgetConfig {
  containerId: string;
  height: string; // Fixed height as required
  theme?: 'light' | 'dark' | 'auto';
  onReady?: () => void;
  onError?: (error: WidgetError) => void;
  onLanguageDetected?: (detection: LanguageDetection) => void;
  debug?: boolean;
}

export interface UserLocation {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  detectionMethod: string;
  confidence: number;
}

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

// Error codes
export const ErrorCodes = {
  CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
  IFRAME_LOAD_FAILED: 'IFRAME_LOAD_FAILED',
  DOMAIN_BLOCKED: 'DOMAIN_BLOCKED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
  CHAT_ERROR: 'CHAT_ERROR'
} as const;

// Language detection utilities (simplified version from main app)
class LanguageDetector {
  private static readonly RTL_LANGUAGES = ['ar', 'he', 'ur', 'fa', 'bal'];
  
  static detectLanguage(text: string): { language: string; confidence: number } {
    if (!text.trim()) return { language: 'en', confidence: 0 };
    
    // Arabic detection
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    const arabicChars = (text.match(arabicRegex) || []).length;
    const arabicRatio = arabicChars / text.length;
    
    if (arabicRatio > 0.3) {
      return { language: 'ar', confidence: Math.min(arabicRatio * 2, 1) };
    }
    
    // Hebrew detection
    const hebrewRegex = /[\u0590-\u05FF]/;
    const hebrewChars = (text.match(hebrewRegex) || []).length;
    const hebrewRatio = hebrewChars / text.length;
    
    if (hebrewRatio > 0.3) {
      return { language: 'he', confidence: Math.min(hebrewRatio * 2, 1) };
    }
    
    // Chinese detection
    const chineseRegex = /[\u4e00-\u9fff]/;
    const chineseChars = (text.match(chineseRegex) || []).length;
    const chineseRatio = chineseChars / text.length;
    
    if (chineseRatio > 0.1) {
      return { language: 'zh', confidence: Math.min(chineseRatio * 3, 1) };
    }
    
    // Default to English
    return { language: 'en', confidence: 0.5 };
  }
  
  static isRTL(language: string): boolean {
    return this.RTL_LANGUAGES.includes(language);
  }
  
  static getDirection(language: string): 'ltr' | 'rtl' {
    return this.isRTL(language) ? 'rtl' : 'ltr';
  }
}

// Location detection utility using browser geolocation
class LocationDetector {
  static async detectUserLocation(): Promise<UserLocation | null> {
    return new Promise((resolve) => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.warn('[Widget] Geolocation not supported by browser');
        resolve(null);
        return;
      }

      // Set timeout for geolocation request
      const timeoutId = setTimeout(() => {
        console.warn('[Widget] Geolocation request timed out');
        resolve(null);
      }, 5000); // 5 second timeout

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId);
          try {
            const { latitude, longitude } = position.coords;
            
            // Use reverse geocoding to get location details
            const location = await LocationDetector.reverseGeocode(latitude, longitude);
            resolve(location);
          } catch (error) {
            console.warn('[Widget] Reverse geocoding failed:', error);
            resolve({
              country: 'Unknown',
              countryCode: 'UN',
              city: 'Unknown',
              region: 'Unknown',
              detectionMethod: 'browser-coords-only',
              confidence: 0.6
            });
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn('[Widget] Geolocation error:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: false, // Use network-based location for faster response
          timeout: 4000, // 4 second timeout for position request
          maximumAge: 300000 // Accept cached position up to 5 minutes old
        }
      );
    });
  }

  static async reverseGeocode(lat: number, lon: number): Promise<UserLocation> {
    try {
      // Use a free reverse geocoding service (OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AlHayatGPT-Widget/2.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const address = data.address || {};
      
      return {
        country: address.country || 'Unknown',
        countryCode: address.country_code?.toUpperCase() || 'UN',
        city: address.city || address.town || address.village || 'Unknown',
        region: address.state || address.region || 'Unknown',
        detectionMethod: 'browser-geocoding',
        confidence: 0.85
      };
    } catch (error) {
      console.warn('[Widget] Reverse geocoding failed:', error);
      // Return minimal location data
      return {
        country: 'Unknown',
        countryCode: 'UN', 
        city: 'Unknown',
        region: 'Unknown',
        detectionMethod: 'browser-coords-only',
        confidence: 0.6
      };
    }
  }

  static getCountryFlag(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return '';
    
    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
}

// Main Widget SDK Class
export class AlHayatGPTWidget {
  private config: WidgetConfig;
  private container: HTMLElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private sourceWebsite: string;
  private messages: WidgetMessage[] = [];
  private isDestroyed = false;
  private userLocation: UserLocation | null = null;
  private currentLanguage = 'en';
  private currentDirection: 'ltr' | 'rtl' = 'ltr';
  
  constructor(config: WidgetConfig) {
    console.log('[Widget Debug] Constructor called with config:', config);
    this.config = config;
    this.sourceWebsite = this.extractSourceWebsite();
    console.log('[Widget Debug] Source website:', this.sourceWebsite);
    this.initialize().catch(error => {
      console.error('[Widget Debug] Constructor initialization failed:', error);
      this.handleError(error);
    });
  }
  
  private extractSourceWebsite(): string {
    try {
      // Get the source website from the current window location
      return window.location.hostname || 'unknown-source';
    } catch (error) {
      return 'unknown-source';
    }
  }
  
  private async initialize(): Promise<void> {
    try {
      this.log('Starting widget initialization...');
      
      // Step 1: Check if domain is blocked
      const domainAllowed = await this.checkDomainAccess();
      if (!domainAllowed) {
        throw new WidgetError(
          'This domain is not authorized to use the Al Hayat GPT widget. Please contact support if you believe this is an error.',
          ErrorCodes.DOMAIN_BLOCKED,
          false,
          { domain: this.sourceWebsite }
        );
      }
      
      // Step 2: Find container
      this.log('Looking for container:', this.config.containerId);
      this.container = document.querySelector(this.config.containerId);
      
      if (!this.container) {
        throw new WidgetError(
          `Container not found: ${this.config.containerId}`,
          ErrorCodes.CONTAINER_NOT_FOUND,
          false,
          { selector: this.config.containerId }
        );
      }
      
      // Step 3: Start location detection (non-blocking)
      this.log('Starting location detection...');
      LocationDetector.detectUserLocation().then(location => {
        this.userLocation = location;
        this.log('Location detected:', location);
      }).catch(error => {
        this.log('Location detection failed:', error);
        this.userLocation = null;
      });
      
      // Step 4: Create and configure iframe
      this.log('Creating iframe...');
      await this.createIframe();
      
      // Step 5: Setup message handling
      this.log('Setting up message handling...');
      this.setupMessageHandling();
      
      this.log('Widget initialization completed successfully');
      
      // Call onReady callback if provided
      if (this.config.onReady) {
        this.config.onReady();
      }
      
    } catch (error) {
      this.log('Widget initialization failed:', error);
      this.handleError(error);
      throw error;
    }
  }
  
  private async checkDomainAccess(): Promise<boolean> {
    // Always allow widget to load for marketing purposes
    // Domain blocking is now handled at API level when users try to chat
    this.log('Domain access check bypassed - widget loads on all domains for marketing');
    return true;
  }
  
  private async createIframe(): Promise<void> {
    if (!this.container) {
      console.error('[Widget Debug] No container available for iframe');
      return;
    }
    
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      const iframeUrl = this.buildIframeUrl();
      
      console.log('[Widget Debug] Building iframe with URL:', iframeUrl);
      iframe.src = iframeUrl;
      iframe.style.width = '100%';
      iframe.style.height = this.config.height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      iframe.style.backgroundColor = '#f9fafb';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
      iframe.setAttribute('loading', 'lazy');
      
      console.log('[Widget Debug] Iframe element created, setting up event handlers...');
      
      const timeout = setTimeout(() => {
        console.error('[Widget Debug] Iframe load timeout after 15 seconds');
        reject(new WidgetError(
          'Widget iframe failed to load within timeout',
          ErrorCodes.IFRAME_LOAD_FAILED
        ));
      }, 15000);
      
      iframe.onload = () => {
        console.log('[Widget Debug] Iframe onload event fired');
        clearTimeout(timeout);
        this.iframe = iframe;
        this.setupMessageHandling();
        console.log('[Widget Debug] Message handling setup complete');
        resolve(undefined);
      };
       
      iframe.onerror = (error) => {
        console.error('[Widget Debug] Iframe onerror event fired:', error);
        clearTimeout(timeout);
        reject(new WidgetError(
          'Widget iframe failed to load',
          ErrorCodes.IFRAME_LOAD_FAILED
        ));
      };
      
      // Clear container and add iframe
      console.log('[Widget Debug] Adding iframe to container...');
      if (this.container) {
        this.container.innerHTML = '';
        this.container.appendChild(iframe);
        console.log('[Widget Debug] Iframe added to DOM');
      }
    });
  }
  
  private buildIframeUrl(): string {
    const baseUrl = this.getWidgetUrl();
    const params = new URLSearchParams({
      source: this.sourceWebsite,
      height: this.config.height,
      theme: this.config.theme || 'auto',
      embedded: 'true',
      guest: 'true'
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  private getWidgetUrl(): string {
    // Always use the production widget domain - never use the embedding site's domain
    return 'https://www.alhayatgpt.com/widget/chat';
  }
  
  private setupMessageHandling(): void {
    console.log('[Widget Debug] Setting up message handling...');
    window.addEventListener('message', (event) => {
      if (this.isDestroyed || !this.iframe) {
        console.log('[Widget Debug] Ignoring message - widget destroyed or no iframe');
        return;
      }
      
      // Verify origin for security
      const iframe = this.iframe;
      if (event.source !== iframe.contentWindow) {
        console.log('[Widget Debug] Ignoring message - not from our iframe. Source:', event.source);
        return;
      }
      
      console.log('[Widget Debug] Received message from iframe:', event.data);
      this.handleIframeMessage(event.data);
    });
    console.log('[Widget Debug] Message listener registered');
  }
  
  private handleIframeMessage(data: any): void {
    try {
      console.log('[Widget Debug] Processing iframe message:', data);
      const { type, payload } = data;
      console.log('[Widget Debug] Message type:', type, 'Payload:', payload);
      
      switch (type) {
        case 'WIDGET_READY':
          console.log('[Widget Debug] WIDGET_READY received! Calling onReady callback...');
          this.log('Widget iframe ready');
          if (this.config.onReady) {
            console.log('[Widget Debug] Executing onReady callback');
            this.config.onReady();
            console.log('[Widget Debug] onReady callback executed successfully');
          } else {
            console.log('[Widget Debug] No onReady callback configured');
          }
          break;
          
        case 'LANGUAGE_DETECTED':
          console.log('[Widget Debug] Language detected:', payload);
          this.handleLanguageDetection(payload);
          break;
          
        case 'MESSAGE_SENT':
          console.log('[Widget Debug] Message sent:', payload);
          this.handleMessageSent(payload);
          break;
          
        case 'ERROR':
          console.log('[Widget Debug] Error received from iframe:', payload);
          this.handleError(new WidgetError(
            payload.message || 'Unknown error',
            payload.code || ErrorCodes.CHAT_ERROR,
            false,
            payload
          ));
          break;
          
        default:
          console.log('[Widget Debug] Unknown message type received:', type);
          this.log('Unknown message type:', type);
      }
    } catch (error) {
      console.error('[Widget Debug] Error handling iframe message:', error);
      this.log('Error handling iframe message:', error);
    }
  }
  
  private handleLanguageDetection(payload: any): void {
    if (payload.language && payload.direction) {
      this.currentLanguage = payload.language;
      this.currentDirection = payload.direction;
      
      // Update container direction
      if (this.container) {
        this.container.dir = payload.direction;
      }
      
      // Notify parent
      if (this.config.onLanguageDetected) {
        this.config.onLanguageDetected({
          language: payload.language,
          direction: payload.direction,
          confidence: payload.confidence || 0.8
        });
      }
      
      this.log('Language detected:', payload);
    }
  }
  
  private handleMessageSent(payload: any): void {
    // Track message for analytics/debugging
    this.log('Message sent:', {
      content: payload.content?.substring(0, 50) + '...',
      language: this.currentLanguage,
      source: this.sourceWebsite
    });
  }
  
  private handleError(error: unknown): void {
    const widgetError = error instanceof WidgetError ? error : new WidgetError(
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCodes.INITIALIZATION_FAILED
    );
    
    this.log('Widget error:', widgetError);
    
    if (this.config.onError) {
      this.config.onError(widgetError);
    }
    
    // Show user-friendly error in container
    this.showError(widgetError);
  }
  
  private showError(error: WidgetError): void {
    if (!this.container) return;
    
    const errorHtml = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: ${this.config.height};
        padding: 20px;
        background: #fef2f2;
        border-radius: 12px;
        border: 1px solid #fca5a5;
        color: #dc2626;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
      ">
        <div style="font-size: 24px; margin-bottom: 12px;">⚠️</div>
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
          Widget Error
        </h3>
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">
          ${error.message}
        </p>
        ${error.code === ErrorCodes.DOMAIN_BLOCKED ? `
          <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.6;">
            Contact support if you believe this is an error.
          </p>
        ` : ''}
      </div>
    `;
    
    this.container.innerHTML = errorHtml;
  }
  
  private log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[AlHayatGPT Widget]`, message, ...args);
    }
  }
  
  // Public API methods
  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.iframe = null;
    this.container = null;
    
    this.log('Widget destroyed');
  }
  
  public getSourceWebsite(): string {
    return this.sourceWebsite;
  }
  
  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }
  
  public getCurrentDirection(): 'ltr' | 'rtl' {
    return this.currentDirection;
  }
  
  public getUserLocation(): UserLocation | null {
    return this.userLocation;
  }
}

// Global SDK object
export const AlHayatGPTSDK = {
  createWidget: (config: WidgetConfig): AlHayatGPTWidget => {
    return new AlHayatGPTWidget(config);
  },
  
  version: '2.0.0',
  
  ErrorCodes,
  
  // Utility functions
  detectLanguage: LanguageDetector.detectLanguage.bind(LanguageDetector),
  isRTL: LanguageDetector.isRTL.bind(LanguageDetector),
  getCountryFlag: LocationDetector.getCountryFlag.bind(LocationDetector)
};

// Auto-attach to window for browser usage
if (typeof window !== 'undefined') {
  console.log('[Widget Debug] Attaching AlHayatGPT SDK to window...');
  (window as any).AlHayatGPT = AlHayatGPTSDK;
  console.log('[Widget Debug] SDK attached successfully');
  
  // Dispatch ready event
  console.log('[Widget Debug] Dispatching AlHayatGPTSDKReady event...');
  const event = new CustomEvent('AlHayatGPTSDKReady', {
    detail: { 
      version: AlHayatGPTSDK.version,
      features: ['guest-only', 'language-detection', 'source-tracking', 'html-rendering']
    }
  });
  window.dispatchEvent(event);
  console.log('[Widget Debug] AlHayatGPTSDKReady event dispatched with version:', AlHayatGPTSDK.version);
}

export default AlHayatGPTSDK; 