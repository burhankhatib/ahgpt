// Al Hayat GPT Widget SDK v2.0 - Complete Rebuild with Enhanced Detection
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
  latitude?: number;
  longitude?: number;
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
  ip?: string;
  source: 'geolocation' | 'ip' | 'unknown';
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

// Enhanced language detection using the enhanced utils
class LanguageDetector {
  private static readonly RTL_LANGUAGES = ['ar', 'he', 'ur', 'fa', 'bal'];
  
  static async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    if (!text.trim() || text.length < 3) return { language: 'en', confidence: 0 };
    
    try {
      // Use the enhanced language detection from utils
      const { detectLanguage } = await import('../utils/languageDetection');
      const detectedLanguage = detectLanguage(text);
      
      console.log(`🔍 [Widget SDK Enhanced] Language detected: ${detectedLanguage} for text: ${text.substring(0, 50)}...`);
      
      // Calculate confidence based on text characteristics
      const confidence = this.calculateConfidence(text, detectedLanguage);
      
      console.log(`✅ [Widget SDK Enhanced] Final detection: ${detectedLanguage} (confidence: ${confidence})`);
      
      return { language: detectedLanguage, confidence };
    } catch (error) {
      console.warn('[Widget SDK Enhanced] Language detection failed:', error);
      return { language: 'en', confidence: 0.3 };
    }
  }
  
  private static calculateConfidence(text: string, detectedLanguage: string): number {
    // Base confidence on text length and script characteristics
    const textLength = text.length;
    let confidence = 0.5; // Base confidence
    
    // Length-based confidence
    if (textLength > 50) {
      confidence += 0.3;
    } else if (textLength > 20) {
      confidence += 0.2;
    } else if (textLength > 10) {
      confidence += 0.1;
    }
    
    // Script-based confidence boost
    const scriptPatterns = {
      ar: /[\u0600-\u06FF]/,
      he: /[\u0590-\u05FF]/,
      zh: /[\u4E00-\u9FFF]/,
      ja: /[\u3040-\u309F\u30A0-\u30FF]/,
      ko: /[\uAC00-\uD7AF]/,
      ru: /[\u0400-\u04FF]/,
      th: /[\u0E00-\u0E7F]/,
      hi: /[\u0900-\u097F]/,
      bn: /[\u0980-\u09FF]/
    };
    
    const pattern = scriptPatterns[detectedLanguage as keyof typeof scriptPatterns];
    if (pattern && pattern.test(text)) {
      confidence += 0.2; // Non-Latin scripts are more reliable
    }
    
    return Math.min(0.95, confidence);
  }
  
  static isRTL(language: string): boolean {
    return this.RTL_LANGUAGES.includes(language);
  }
  
  static getDirection(language: string): 'ltr' | 'rtl' {
    return this.isRTL(language) ? 'rtl' : 'ltr';
  }
}

// Enhanced location detection using the new Sanity-compatible approach
class LocationDetector {
  static async detectUserLocation(): Promise<UserLocation | null> {
    try {
      console.log('[Widget SDK Enhanced] Starting enhanced location detection...');
      
      // Use the new location detection utility that matches Sanity integration
      const { detectUserLocation } = await import('../utils/chatLocationDetection');
      const locationResult = await detectUserLocation();
      
      if (locationResult.location) {
        console.log('[Widget SDK Enhanced] ✅ Location detected:', locationResult.location);
        return locationResult.location;
      } else {
        console.warn('[Widget SDK Enhanced] Location detection failed:', locationResult.error);
        return null;
      }
    } catch (error) {
      console.warn('[Widget SDK Enhanced] Location detection error:', error);
      return null;
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
    console.log('[Widget Debug Enhanced] Constructor called with config:', config);
    this.config = config;
    this.sourceWebsite = this.extractSourceWebsite();
    console.log('[Widget Debug Enhanced] Source website:', this.sourceWebsite);
    this.initialize().catch(error => {
      console.error('[Widget Debug Enhanced] Constructor initialization failed:', error);
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
      this.log('Starting enhanced widget initialization...');
      
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
      
      // Step 3: Start enhanced location detection (non-blocking)
      this.log('Starting enhanced location detection...');
      LocationDetector.detectUserLocation().then(location => {
        this.userLocation = location;
        this.log('Enhanced location detected:', location);
        
        // Store location for potential Sanity sync
        if (location && typeof window !== 'undefined') {
          try {
            const guestId = this.getOrCreateGuestId();
            const locationData = {
              ...location,
              detectedAt: new Date().toISOString(),
              userKey: guestId,
              source: 'widget-enhanced'
            };
            localStorage.setItem(`userLocation_${guestId}`, JSON.stringify(locationData));
            this.log('Location stored for Sanity sync:', locationData);
          } catch (error) {
            this.log('Failed to store location:', error);
          }
        }
      }).catch(error => {
        this.log('Enhanced location detection failed:', error);
        this.userLocation = null;
      });
      
      // Step 4: Create and configure iframe
      this.log('Creating iframe...');
      await this.createIframe();
      
      // Step 5: Setup message handling
      this.log('Setting up enhanced message handling...');
      this.setupMessageHandling();
      
      this.log('Enhanced widget initialization completed successfully');
      
      // Call onReady callback if provided
      if (this.config.onReady) {
        this.config.onReady();
      }
      
    } catch (error) {
      this.log('Enhanced widget initialization failed:', error);
      this.handleError(error);
      throw error;
    }
  }
  
  private getOrCreateGuestId(): string {
    if (typeof window === 'undefined') {
      return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    
    let guestId = localStorage.getItem('ahgpt_guest_id');
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('ahgpt_guest_id', guestId);
    }
    return guestId;
  }
  
  private async checkDomainAccess(): Promise<boolean> {
    // Always allow widget to load for marketing purposes
    // Domain blocking is now handled at API level when users try to chat
    this.log('Domain access check bypassed - widget loads on all domains for marketing');
    return true;
  }
  
  private async createIframe(): Promise<void> {
    if (!this.container) {
      console.error('[Widget Debug Enhanced] No container available for iframe');
      return;
    }
    
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      const iframeUrl = this.buildIframeUrl();
      
      console.log('[Widget Debug Enhanced] Building iframe with URL:', iframeUrl);
      iframe.src = iframeUrl;
      iframe.style.width = '100%';
      iframe.style.height = this.config.height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      iframe.style.backgroundColor = '#f9fafb';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
      iframe.setAttribute('loading', 'lazy');
      
      console.log('[Widget Debug Enhanced] Iframe element created, setting up event handlers...');
      
      const timeout = setTimeout(() => {
        console.error('[Widget Debug Enhanced] Iframe load timeout after 15 seconds');
        reject(new WidgetError(
          'Widget iframe failed to load within timeout',
          ErrorCodes.IFRAME_LOAD_FAILED
        ));
      }, 15000);
      
      iframe.onload = () => {
        console.log('[Widget Debug Enhanced] Iframe onload event fired');
        clearTimeout(timeout);
        this.iframe = iframe;
        this.setupMessageHandling();
        console.log('[Widget Debug Enhanced] Enhanced message handling setup complete');
        resolve(undefined);
      };
       
      iframe.onerror = (error) => {
        console.error('[Widget Debug Enhanced] Iframe onerror event fired:', error);
        clearTimeout(timeout);
        reject(new WidgetError(
          'Widget iframe failed to load',
          ErrorCodes.IFRAME_LOAD_FAILED
        ));
      };
      
      // Clear container and add iframe
      console.log('[Widget Debug Enhanced] Adding iframe to container...');
      if (this.container) {
        this.container.innerHTML = '';
        this.container.appendChild(iframe);
        console.log('[Widget Debug Enhanced] Iframe added to DOM');
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
      guest: 'true',
      enhanced: 'true' // Flag for enhanced detection
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  private getWidgetUrl(): string {
    // Always use the production widget domain - never use the embedding site's domain
    return 'https://www.alhayatgpt.com/widget/chat';
  }
  
  private setupMessageHandling(): void {
    console.log('[Widget Debug Enhanced] Setting up enhanced message handling...');
    window.addEventListener('message', (event) => {
      if (this.isDestroyed || !this.iframe) {
        console.log('[Widget Debug Enhanced] Ignoring message - widget destroyed or no iframe');
        return;
      }
      
      // Verify origin for security
      const iframe = this.iframe;
      if (event.source !== iframe.contentWindow) {
        console.log('[Widget Debug Enhanced] Ignoring message - not from our iframe. Source:', event.source);
        return;
      }
      
      console.log('[Widget Debug Enhanced] Received message from iframe:', event.data);
      this.handleIframeMessage(event.data);
    });
    console.log('[Widget Debug Enhanced] Enhanced message listener registered');
  }
  
  private handleIframeMessage(data: any): void {
    try {
      console.log('[Widget Debug Enhanced] Processing iframe message:', data);
      const { type, payload } = data;
      console.log('[Widget Debug Enhanced] Message type:', type, 'Payload:', payload);
      
      switch (type) {
        case 'WIDGET_READY':
          console.log('[Widget Debug Enhanced] WIDGET_READY received! Calling onReady callback...');
          this.log('Enhanced widget iframe ready');
          if (this.config.onReady) {
            console.log('[Widget Debug Enhanced] Executing onReady callback');
            this.config.onReady();
            console.log('[Widget Debug Enhanced] onReady callback executed successfully');
          } else {
            console.log('[Widget Debug Enhanced] No onReady callback configured');
          }
          break;
          
        case 'LANGUAGE_DETECTED':
          console.log('[Widget Debug Enhanced] Enhanced language detected:', payload);
          this.handleLanguageDetection(payload);
          break;
          
        case 'MESSAGE_SENT':
          console.log('[Widget Debug Enhanced] Message sent:', payload);
          this.handleMessageSent(payload);
          break;
          
        case 'ERROR':
          console.log('[Widget Debug Enhanced] Error received from iframe:', payload);
          this.handleError(new WidgetError(
            payload.message || 'Unknown error',
            payload.code || ErrorCodes.CHAT_ERROR,
            false,
            payload
          ));
          break;
          
        default:
          console.log('[Widget Debug Enhanced] Unknown message type received:', type);
          this.log('Unknown message type:', type);
      }
    } catch (error) {
      console.error('[Widget Debug Enhanced] Error handling iframe message:', error);
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
      
      this.log('Enhanced language detected:', payload);
    }
  }
  
  private handleMessageSent(payload: any): void {
    // Track message for analytics/debugging
    this.log('Enhanced message sent:', {
      content: payload.content?.substring(0, 50) + '...',
      language: this.currentLanguage,
      source: this.sourceWebsite,
      location: this.userLocation?.country || 'Unknown'
    });
  }
  
  private handleError(error: unknown): void {
    const widgetError = error instanceof WidgetError ? error : new WidgetError(
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCodes.INITIALIZATION_FAILED
    );
    
    this.log('Enhanced widget error:', widgetError);
    
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
      console.log(`[AlHayatGPT Widget Enhanced]`, message, ...args);
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
    
    this.log('Enhanced widget destroyed');
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
  
  // Enhanced API methods
  public async detectLanguageFromText(text: string): Promise<LanguageDetection> {
    const result = await LanguageDetector.detectLanguage(text);
    return {
      language: result.language,
      direction: LanguageDetector.getDirection(result.language),
      confidence: result.confidence
    };
  }
  
  public async refreshLocation(): Promise<UserLocation | null> {
    this.userLocation = await LocationDetector.detectUserLocation();
    return this.userLocation;
  }
}

// Global SDK object
export const AlHayatGPTSDK = {
  createWidget: (config: WidgetConfig): AlHayatGPTWidget => {
    return new AlHayatGPTWidget(config);
  },
  
  version: '2.1.0', // Updated version for enhanced detection
  
  ErrorCodes,
  
  // Enhanced utility functions
  detectLanguage: LanguageDetector.detectLanguage.bind(LanguageDetector),
  isRTL: LanguageDetector.isRTL.bind(LanguageDetector),
  getCountryFlag: LocationDetector.getCountryFlag.bind(LocationDetector),
  detectLocation: LocationDetector.detectUserLocation.bind(LocationDetector)
};

// Auto-attach to window for browser usage
if (typeof window !== 'undefined') {
  console.log('[Widget Debug Enhanced] Attaching AlHayatGPT Enhanced SDK to window...');
  (window as any).AlHayatGPT = AlHayatGPTSDK;
  console.log('[Widget Debug Enhanced] Enhanced SDK attached successfully');
  
  // Dispatch ready event
  console.log('[Widget Debug Enhanced] Dispatching AlHayatGPTSDKReady event...');
  const event = new CustomEvent('AlHayatGPTSDKReady', {
    detail: { 
      version: AlHayatGPTSDK.version,
      features: ['guest-only', 'enhanced-language-detection', 'enhanced-location-detection', 'source-tracking', 'html-rendering', 'sanity-sync']
    }
  });
  window.dispatchEvent(event);
  console.log('[Widget Debug Enhanced] AlHayatGPTSDKReady event dispatched with version:', AlHayatGPTSDK.version);
}

export default AlHayatGPTSDK; 