import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a proper JavaScript version of the widget SDK
const jsContent = `(function() {
  'use strict';
  
  /**
   * Al Hayat GPT Widget SDK
   * Allows other websites to embed the chat functionality with authentication
   */
  
  // Debug logging function
  function debugLog(message) {
    if (typeof console !== 'undefined' && console.log) {
      console.log('[AlHayatGPT SDK]', message);
    }
  }
  
  debugLog('SDK initialization started');
  
  class AlHayatGPTWidget {
    constructor(config) {
      debugLog('Widget constructor called with config:', config);
      
      if (!config || !config.containerId) {
        throw new Error('containerId is required in widget configuration');
      }
      
      this.config = {
        apiEndpoint: 'https://www.alhayatgpt.com',
        theme: 'auto',
        width: '100%',
        height: '600px',
        allowGuests: true,
        retryAttempts: 3,
        retryDelay: 2000,
        ...config
      };
      
      this.iframe = null;
      this.container = null;
      this.messageHandlers = new Map();
      this.messageEventHandler = null;
      this.initAttempts = 0;
      this.isDestroyed = false;

      debugLog('Widget configuration set:', this.config);
      this.init();
    }

    init() {
      debugLog('Initializing widget...');
      
      if (this.isDestroyed) {
        debugLog('Widget is destroyed, skipping initialization');
        return;
      }
      
      this.initAttempts++;
      debugLog(\`Initialization attempt \${this.initAttempts}/\${this.config.retryAttempts}\`);
      
      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        const error = \`Container with ID "\${this.config.containerId}" not found\`;
        debugLog('Error: ' + error);
        
        if (this.initAttempts < this.config.retryAttempts) {
          debugLog(\`Retrying in \${this.config.retryDelay}ms...\`);
          setTimeout(() => this.init(), this.config.retryDelay);
          return;
        }
        
        const finalError = new Error(\`\${error} after \${this.config.retryAttempts} attempts\`);
        if (this.config.onError && typeof this.config.onError === 'function') {
          this.config.onError(finalError);
        }
        throw finalError;
      }

      debugLog('Container found, creating iframe...');
      try {
        this.createIframe();
        this.setupMessageHandling();
        this.applyStyles();
        debugLog('Widget initialization complete');
      } catch (error) {
        debugLog('Error during initialization:', error);
        
        if (this.initAttempts < this.config.retryAttempts) {
          debugLog(\`Retrying in \${this.config.retryDelay}ms...\`);
          setTimeout(() => this.init(), this.config.retryDelay);
          return;
        }
        
        const finalError = new Error(\`Failed to initialize Al Hayat GPT widget after \${this.config.retryAttempts} attempts: \${error.message}\`);
        if (this.config.onError && typeof this.config.onError === 'function') {
          this.config.onError(finalError);
        }
        throw finalError;
      }
    }

    createIframe() {
      this.iframe = document.createElement('iframe');
      
      // Build the widget URL with configuration
      const widgetUrl = new URL(\`\${this.config.apiEndpoint}/widget/chat\`);
      widgetUrl.searchParams.set('theme', this.config.theme);
      widgetUrl.searchParams.set('allowGuests', this.config.allowGuests.toString());
      
      if (this.config.clerkPublishableKey) {
        widgetUrl.searchParams.set('clerkKey', this.config.clerkPublishableKey);
      }

      // Add parent origin for security
      widgetUrl.searchParams.set('parentOrigin', window.location.origin);

      this.iframe.src = widgetUrl.toString();
      this.iframe.style.width = this.config.width;
      this.iframe.style.height = this.config.height;
      this.iframe.style.border = 'none';
      this.iframe.style.borderRadius = '12px';
      this.iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      
      // Security attributes
      this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
      this.iframe.setAttribute('allow', 'clipboard-write');

      debugLog('Iframe created with URL:', this.iframe.src);
      this.container.appendChild(this.iframe);
    }

    setupMessageHandling() {
      this.messageEventHandler = (event) => {
        // Verify origin for security
        try {
          const allowedOrigin = new URL(this.config.apiEndpoint).origin;
          if (event.origin !== allowedOrigin) {
            debugLog('Message from unauthorized origin:', event.origin);
            return;
          }
        } catch (e) {
          debugLog('Error verifying origin:', e);
          return;
        }

        const message = event.data;
        if (message && typeof message === 'object') {
          this.handleMessage(message);
        }
      };

      window.addEventListener('message', this.messageEventHandler);
      debugLog('Message handling setup complete');
    }

    handleMessage(message) {
      debugLog('Received message:', message);
      
      if (!message.type) {
        debugLog('Message missing type, ignoring');
        return;
      }

      switch (message.type) {
        case 'WIDGET_READY':
          debugLog('Widget ready event received');
          if (this.config.onReady && typeof this.config.onReady === 'function') {
            this.config.onReady();
          }
          break;
        
        case 'USER_SIGNED_IN':
          debugLog('User signed in event received');
          if (this.config.onUserSignIn && typeof this.config.onUserSignIn === 'function') {
            this.config.onUserSignIn(message.payload);
          }
          break;
        
        case 'USER_SIGNED_OUT':
          debugLog('User signed out event received');
          if (this.config.onUserSignOut && typeof this.config.onUserSignOut === 'function') {
            this.config.onUserSignOut();
          }
          break;
        
        case 'RESIZE':
          if (this.iframe && message.payload && typeof message.payload.height === 'number') {
            this.iframe.style.height = \`\${message.payload.height}px\`;
            debugLog('Widget resized to height:', message.payload.height);
          }
          break;
        
        case 'ERROR':
          debugLog('Error event received:', message.payload);
          if (this.config.onError && typeof this.config.onError === 'function') {
            const errorMessage = message.payload && message.payload.message || 'Widget error';
            this.config.onError(new Error(errorMessage));
          }
          break;
        
        default:
          debugLog('Unknown message type:', message.type);
      }

      // Trigger custom event handlers
      const handlers = this.messageHandlers.get(message.type) || [];
      handlers.forEach(handler => {
        if (typeof handler === 'function') {
          try {
            handler(message.payload);
          } catch (e) {
            debugLog('Error in custom event handler:', e);
          }
        }
      });
    }

    applyStyles() {
      if (this.config.customStyles && this.container && typeof this.config.customStyles === 'object') {
        Object.assign(this.container.style, this.config.customStyles);
        debugLog('Custom styles applied');
      }
    }

    // Public API methods
    on(eventType, handler) {
      if (typeof eventType !== 'string' || typeof handler !== 'function') {
        debugLog('Invalid parameters for on() method');
        return;
      }
      
      if (!this.messageHandlers.has(eventType)) {
        this.messageHandlers.set(eventType, []);
      }
      this.messageHandlers.get(eventType).push(handler);
      debugLog('Event handler added for:', eventType);
    }

    off(eventType, handler) {
      if (typeof eventType !== 'string') {
        debugLog('Invalid eventType for off() method');
        return;
      }
      
      const handlers = this.messageHandlers.get(eventType);
      if (handlers && typeof handler === 'function') {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
          debugLog('Event handler removed for:', eventType);
        }
      }
    }

    sendMessage(type, payload) {
      if (typeof type !== 'string') {
        debugLog('Invalid message type');
        return;
      }
      
      if (this.iframe && this.iframe.contentWindow) {
        try {
          this.iframe.contentWindow.postMessage({ type, payload }, this.config.apiEndpoint);
          debugLog('Message sent to widget:', { type, payload });
        } catch (e) {
          debugLog('Error sending message:', e);
        }
      } else {
        debugLog('Cannot send message: iframe not ready');
      }
    }

    updateConfig(newConfig) {
      if (typeof newConfig !== 'object' || newConfig === null) {
        debugLog('Invalid config object');
        return;
      }
      
      this.config = { ...this.config, ...newConfig };
      this.sendMessage('UPDATE_CONFIG', newConfig);
      debugLog('Config updated:', newConfig);
    }

    destroy() {
      debugLog('Destroying widget...');
      this.isDestroyed = true;
      
      if (this.iframe && this.iframe.parentNode) {
        this.iframe.parentNode.removeChild(this.iframe);
        this.iframe = null;
      }
      if (this.messageEventHandler) {
        window.removeEventListener('message', this.messageEventHandler);
        this.messageEventHandler = null;
      }
      this.messageHandlers.clear();
      debugLog('Widget destroyed');
    }
  }

  // Initialize global object immediately
  debugLog('Setting up global AlHayatGPT object...');
  
  // Ensure window object exists (for server-side rendering compatibility)
  if (typeof window !== 'undefined') {
    // Set up the main API
    window.AlHayatGPT = {
      createWidget: function(config) {
        debugLog('createWidget called with config:', config);
        try {
          return new AlHayatGPTWidget(config);
        } catch (error) {
          debugLog('Error creating widget:', error);
          throw error;
        }
      },
      version: '1.0.0',
      isLoaded: true
    };
    
    // Also export the class directly for backwards compatibility
    window.AlHayatGPTWidget = AlHayatGPTWidget;
    
    debugLog('Global AlHayatGPT object created successfully');
    debugLog('Available methods:', Object.keys(window.AlHayatGPT));
    
    // Dispatch a custom event to signal SDK is ready
    if (typeof CustomEvent !== 'undefined') {
      try {
        const event = new CustomEvent('AlHayatGPTSDKReady', {
          detail: { version: '1.0.0' }
        });
        window.dispatchEvent(event);
        debugLog('AlHayatGPTSDKReady event dispatched');
      } catch (e) {
        debugLog('Could not dispatch custom event:', e);
      }
    }
  } else {
    debugLog('Window object not available - running in non-browser environment');
  }
  
})();`;

// Create the public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write the compiled JavaScript file
const outputPath = path.join(publicDir, 'widget-sdk.js');
fs.writeFileSync(outputPath, jsContent);

console.log('✅ Widget SDK compiled successfully!');
console.log(`📁 Output: ${outputPath}`);
console.log(`📏 Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

// Create a minified version (improved minification)
const minifiedContent = jsContent
  .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
  .replace(/\/\/(?![:/])\s.*$/gm, '') // Remove line comments but preserve URLs (http://, https://, //)
  .replace(/\s+/g, ' ') // Collapse whitespace
  .replace(/;\s*}/g, ';}') // Remove unnecessary spaces
  .replace(/\s*{\s*/g, '{') // Remove spaces around {
  .replace(/\s*}\s*/g, '}') // Remove spaces around }
  .replace(/\s*,\s*/g, ',') // Remove spaces around commas
  .replace(/\s*:\s*/g, ':') // Remove spaces around colons
  .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
  .trim();

const minifiedPath = path.join(publicDir, 'widget-sdk.min.js');
fs.writeFileSync(minifiedPath, minifiedContent);

console.log(`📦 Minified: ${minifiedPath}`);
console.log(`📏 Minified size: ${(fs.statSync(minifiedPath).size / 1024).toFixed(2)} KB`);

// Create a CDN-ready version with version info
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version || '1.0.0';

const cdnContent = `/*!
 * Al Hayat GPT Widget SDK v${version}
 * https://www.alhayatgpt.com
 * 
 * Copyright (c) ${new Date().getFullYear()} Al Hayat GPT
 * Released under the MIT License
 */
${minifiedContent}`;

const cdnPath = path.join(publicDir, `widget-sdk-v${version}.min.js`);
fs.writeFileSync(cdnPath, cdnContent);

console.log(`🌐 CDN version: ${cdnPath}`);
console.log('');
console.log('🚀 Widget SDK build complete!');
console.log('');
console.log('📋 Usage:');
console.log(`   <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>`);
console.log('   <script>');
console.log('     const widget = AlHayatGPT.createWidget({');
console.log('       containerId: "chat-widget",');
console.log('       clerkPublishableKey: "your-clerk-key", // optional');
console.log('       theme: "auto", // light, dark, or auto');
console.log('       onReady: () => console.log("Widget ready!")');
console.log('     });');
console.log('   </script>');
console.log('   or');
console.log(`   <script src="https://www.alhayatgpt.com/widget-sdk-v${version}.min.js"></script>`); 