/**
 * Al Hayat GPT Widget SDK v3.0
 * 
 * A minimalist, dependency-free SDK for embedding the Al Hayat GPT Widget.
 * This script handles the creation of the widget's iframe and provides a simple,
 * stable interface for interaction.
 * 
 * Core Principles:
 * 1. Zero Dependencies: Runs in any browser environment without external libraries.
 * 2. Maximum Compatibility: Uses standard, universally supported browser APIs.
 * 3. Robust Loading: Ensures the widget can be embedded on any website.
 * 4. Simple API: Easy to use and understand.
 * 5. Centralized Styling: Loads external CSS for consistent appearance.
 */

// Define the shape of the public API that will be exposed on the window object.
interface AlHayatGPTSDK {
    createWidget: (options: WidgetOptions) => void;
    _isReady: boolean;
    _readyQueue: Array<() => void>;
}

// Define the configuration options for creating a widget.
interface WidgetOptions {
    containerId: string;
    widgetBaseUrl?: string;
    height?: string;
    width?: string;
    style?: {
        border?: string;
        borderRadius?: string;
        boxShadow?: string;
        [key: string]: string | undefined;
    };
}

// Check if the SDK has already been initialized to prevent conflicts.
if ((window as any).AlHayatGPT) {
    console.warn("Al Hayat GPT SDK has already been loaded. Please include the script only once.");
} else {
    // Initialize the SDK on the window object.
    (window as any).AlHayatGPT = {
        _isReady: false,
        _readyQueue: [], // A queue for function calls made before the SDK is fully ready.

        /**
         * The primary public method to create and embed the widget.
         * @param options - Configuration for the widget.
         */
        createWidget: function(options: WidgetOptions) {
            // If the SDK isn't fully ready, queue the call.
            if (!this._isReady) {
                this._readyQueue.push(() => this.createWidget(options));
                return;
            }
            // Proceed with widget creation.
            _createWidget(options);
        }
    } as AlHayatGPTSDK;

    /**
     * Load external CSS from Al Hayat GPT for consistent styling.
     * This ensures all widget implementations use the same centralized styles.
     */
    function _loadExternalCSS(): void {
        // Check if the CSS has already been loaded to prevent duplicates
        const existingLink = document.querySelector('link[href="https://www.alhayatgpt.com/api/globals.css"]');
        if (existingLink) {
            return; // CSS already loaded
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://www.alhayatgpt.com/api/globals.css';
        link.type = 'text/css';
        
        // Add error handling for CSS loading
        link.onerror = () => {
            console.warn('Al Hayat GPT SDK: Could not load external CSS. Widget will use default styling.');
        };
        
        // Add to document head
        document.head.appendChild(link);
        console.log('Al Hayat GPT SDK: External CSS loaded for consistent styling.');
    }

    /**
     * The internal function that handles the actual widget creation.
     * @param options - The widget configuration.
     */
    function _createWidget(options: WidgetOptions): void {
        // Validate that a container ID was provided.
        if (!options.containerId) {
            console.error("Al Hayat GPT SDK: `containerId` is a required option.");
            return;
        }

        // Find the container element in the DOM.
        const container = document.getElementById(options.containerId);
        if (!container) {
            console.error(`Al Hayat GPT SDK: Container element with id '${options.containerId}' not found.`);
            return;
        }

        // Load external CSS before creating the widget
        _loadExternalCSS();

        // --- Core Iframe Creation ---
        const iframe = document.createElement('iframe');

        // Construct the widget URL. The `source` parameter is crucial for identifying the host page.
        const baseUrl = options.widgetBaseUrl || 'https://www.alhayatgpt.com/widget/chat';
        const widgetUrl = new URL(baseUrl);
        widgetUrl.searchParams.append('source', window.location.hostname);
        
        // Set iframe attributes for proper functionality and appearance.
        iframe.src = widgetUrl.toString();
        iframe.id = 'alhayat-gpt-widget-iframe';
        iframe.title = 'Al Hayat GPT Chat Widget';
        iframe.style.border = 'none';
        iframe.style.width = options.width || '100%';
        iframe.style.height = options.height || '100%';
        iframe.style.display = 'block'; // Ensure proper display
        iframe.setAttribute('allow', 'geolocation'); // Request permission for geolocation if needed.

        // Apply additional custom styles if provided
        if (options.style) {
            Object.entries(options.style).forEach(([property, value]) => {
                if (value !== undefined) {
                    // Convert camelCase to kebab-case for CSS properties
                    const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
                    iframe.style.setProperty(cssProperty, value);
                }
            });
        }

        // Clear the container and append the new iframe.
        container.innerHTML = '';
        container.appendChild(iframe);

        console.log(`Al Hayat GPT Widget created successfully in container #${options.containerId}`);
    }

    /**
     * Function to process any calls that were queued while the SDK was loading.
     */
    function _processReadyQueue(): void {
        const sdk = (window as any).AlHayatGPT as AlHayatGPTSDK;
        sdk._isReady = true;
        sdk._readyQueue.forEach(fn => fn()); // Execute all queued functions.
        sdk._readyQueue = []; // Clear the queue.
    }

    // Use 'DOMContentLoaded' to ensure the DOM is ready before processing the queue.
    // This is more reliable than 'window.onload'.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _processReadyQueue);
    } else {
        // If the DOM is already loaded, process the queue immediately.
        _processReadyQueue();
    }

    // Announce that the SDK is ready by dispatching a custom event.
    // This allows host pages to reliably listen for the SDK's availability.
    window.dispatchEvent(new CustomEvent('AlHayatGPTSDKReady'));
    console.log("Al Hayat GPT SDK v3.0 is ready.");
} 