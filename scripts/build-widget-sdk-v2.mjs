#!/usr/bin/env node

// Build script for Al Hayat GPT Widget SDK v2.0
// Compiles TypeScript to JavaScript and creates production bundle

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 Building Al Hayat GPT Widget SDK v2.0...\n');

// Create temporary build directory
const buildDir = path.join(projectRoot, 'temp-sdk-build');
if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
}
fs.mkdirSync(buildDir);

try {
    console.log('📦 Step 1: Compiling TypeScript to JavaScript...');
    
    // Copy the SDK TypeScript file to temp directory
    const sdkSource = path.join(projectRoot, 'src/lib/widget-sdk-v2.ts');
    const sdkTemp = path.join(buildDir, 'widget-sdk-v2.ts');
    fs.copyFileSync(sdkSource, sdkTemp);
    
    // Create a simple tsconfig for compilation
    const tsConfig = {
        compilerOptions: {
            target: "ES2020",
            module: "ES2020",
            moduleResolution: "node",
            lib: ["ES2020", "DOM"],
            outDir: ".",
            declaration: false,
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
        },
        include: ["./widget-sdk-v2.ts"],
        exclude: []
    };
    
    fs.writeFileSync(
        path.join(buildDir, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
    );
    
    // Compile TypeScript
    process.chdir(buildDir);
    execSync('npx tsc', { stdio: 'inherit' });
    
    console.log('✅ TypeScript compilation completed\n');
    
    console.log('🎯 Step 2: Creating production bundle...');
    
    // Read the compiled JavaScript
    const compiledJS = fs.readFileSync(path.join(buildDir, 'widget-sdk-v2.js'), 'utf8');
    
    // Create the production bundle with IIFE wrapper for browser compatibility
    const productionBundle = `/*!
 * Al Hayat GPT Widget SDK v2.0
 * Built from scratch for guest-only mode with enhanced features
 * 
 * Features:
 * - Guest-only mode (no authentication required)
 * - Automatic language detection with RTL support
 * - Source website tracking via lastName
 * - Sanity sync for chat persistence
 * - Domain-based access control
 * - Fixed height configuration
 * - HTML rendering for assistant responses
 * 
 * Copyright (c) 2024 Al Hayat GPT
 * Licensed under MIT License
 */

(function() {
    'use strict';
    
    ${compiledJS.replace(/export /g, '')}
    
    // Auto-dispatch ready event
    if (typeof window !== 'undefined') {
        setTimeout(() => {
            const event = new CustomEvent('AlHayatGPTSDKReady', {
                detail: { 
                    version: '2.0.0',
                    features: [
                        'guest-only-mode',
                        'language-detection',
                        'source-tracking',
                        'sanity-sync',
                        'domain-control',
                        'html-rendering'
                    ]
                }
            });
            window.dispatchEvent(event);
            console.log('🚀 Al Hayat GPT Widget SDK v2.0 ready');
        }, 100);
    }
})();`;
    
    // Write production bundle
    const outputPath = path.join(projectRoot, 'public/widget-sdk-v2.min.js');
    fs.writeFileSync(outputPath, productionBundle);
    
    console.log('✅ Production bundle created\n');
    
    console.log('📊 Step 3: Bundle analysis...');
    
    // Get file sizes
    const bundleSize = fs.statSync(outputPath).size;
    const bundleSizeKB = (bundleSize / 1024).toFixed(2);
    
    console.log(`📁 Bundle size: ${bundleSizeKB} KB`);
    console.log(`📍 Output location: ${outputPath}`);
    
    // Create a simple test HTML file
    const testHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Al Hayat GPT Widget SDK v2.0 Test</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f9fafb;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .widget-container {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
        }
        .status {
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            font-size: 14px;
        }
        .status.loading {
            background: #fef3c7;
            color: #92400e;
        }
        .status.ready {
            background: #d1fae5;
            color: #065f46;
        }
        .status.error {
            background: #fee2e2;
            color: #991b1b;
        }
        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Al Hayat GPT Widget SDK v2.0 Test</h1>
        <p><strong>Version:</strong> 2.0.0 (Guest-Only Mode)</p>
        
        <div id="status" class="status loading">
            📡 Loading SDK...
        </div>
        
        <h2>Features Tested:</h2>
        <ul>
            <li>✅ Guest-only mode (no authentication)</li>
            <li>✅ Source website tracking (<code>localhost</code>)</li>
            <li>✅ Auto language detection</li>
            <li>✅ Fixed height configuration</li>
            <li>✅ Error handling</li>
        </ul>
    </div>

    <div class="container">
        <h2>Widget Demo</h2>
        <div class="widget-container">
            <div id="chat-widget"></div>
        </div>
    </div>

    <div class="container">
        <h2>Integration Code</h2>
        <pre><code>&lt;script src="https://alhayatgpt.com/widget-sdk-v2.min.js"&gt;&lt;/script&gt;
&lt;script&gt;
window.addEventListener('AlHayatGPTSDKReady', function() {
    const widget = window.AlHayatGPT.createWidget({
        containerId: 'chat-widget',
        height: '600px',
        theme: 'auto',
        debug: true,
        onReady: function() {
            console.log('Widget ready!');
        },
        onLanguageDetected: function(detection) {
            console.log('Language detected:', detection);
        },
        onError: function(error) {
            console.error('Widget error:', error);
        }
    });
});
&lt;/script&gt;</code></pre>
    </div>

    <script src="./widget-sdk-v2.min.js"></script>
    <script>
        const statusEl = document.getElementById('status');
        
        window.addEventListener('AlHayatGPTSDKReady', function(event) {
            statusEl.className = 'status ready';
            statusEl.innerHTML = '✅ SDK v' + event.detail.version + ' loaded successfully!';
            
            console.log('SDK Features:', event.detail.features);
            
            // Create widget
            setTimeout(() => {
                try {
                    const widget = window.AlHayatGPT.createWidget({
                        containerId: 'chat-widget',
                        height: '600px',
                        theme: 'auto',
                        debug: true,
                        
                        onReady: function() {
                            console.log('✅ Widget ready!');
                            statusEl.innerHTML += '<br>🚀 Widget initialized successfully!';
                        },
                        
                        onLanguageDetected: function(detection) {
                            console.log('🌍 Language detected:', detection);
                            statusEl.innerHTML += '<br>🌍 Language: ' + detection.language + ' (' + detection.direction + ')';
                        },
                        
                        onError: function(error) {
                            console.error('❌ Widget error:', error);
                            statusEl.className = 'status error';
                            statusEl.innerHTML = '❌ Error: ' + error.message + ' (Code: ' + error.code + ')';
                        }
                    });
                    
                    console.log('Widget instance:', widget);
                    console.log('Source website:', widget.getSourceWebsite());
                    
                } catch (error) {
                    console.error('Failed to create widget:', error);
                    statusEl.className = 'status error';
                    statusEl.innerHTML = '❌ Failed to create widget: ' + error.message;
                }
            }, 500);
        });
        
        // Set timeout for loading failure
        setTimeout(() => {
            if (statusEl.className.includes('loading')) {
                statusEl.className = 'status error';
                statusEl.innerHTML = '❌ SDK failed to load within 10 seconds';
            }
        }, 10000);
    </script>
</body>
</html>`;
    
    const testPath = path.join(projectRoot, 'public/test-sdk-v2.html');
    fs.writeFileSync(testPath, testHTML);
    
    console.log(`📋 Test page created: ${testPath}`);
    
    console.log('\n🎉 Build completed successfully!');
    console.log('\n📚 Usage:');
    console.log('1. Include in HTML: <script src="https://alhayatgpt.com/widget-sdk-v2.min.js"></script>');
    console.log('2. Listen for ready event: window.addEventListener("AlHayatGPTSDKReady", ...)');
    console.log('3. Create widget: window.AlHayatGPT.createWidget({ containerId: "...", height: "600px" })');
    console.log('\n🧪 Test the SDK:');
    console.log(`Open: ${testPath.replace(projectRoot, '.')}`);
    
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
} finally {
    // Cleanup
    process.chdir(projectRoot);
    if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true });
    }
} 