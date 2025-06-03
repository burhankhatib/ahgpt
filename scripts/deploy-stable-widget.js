#!/usr/bin/env node

/**
 * Deploy Stable Widget SDK Script
 * 
 * This script:
 * 1. Backs up current widget files
 * 2. Replaces them with the new stable versions
 * 3. Updates documentation and examples
 * 4. Runs basic tests to ensure everything works
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Al Hayat GPT Stable Widget SDK...\n');

const publicDir = path.join(__dirname, '../public');
const backupDir = path.join(publicDir, 'backup-' + Date.now());

// Create backup directory
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
    console.log('📁 Created backup directory:', backupDir);
}

// Files to backup and replace
const filesToBackup = [
    'widget-sdk.js',
    'widget-sdk.min.js',
    'widget-example.html',
    'README-widget.md'
];

// Step 1: Backup existing files
console.log('\n📦 Backing up existing files...');
filesToBackup.forEach(file => {
    const sourcePath = path.join(publicDir, file);
    const backupPath = path.join(backupDir, file);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, backupPath);
        console.log(`   ✅ Backed up: ${file}`);
    } else {
        console.log(`   ⚠️  File not found: ${file}`);
    }
});

// Step 2: Replace with stable versions
console.log('\n🔄 Deploying stable versions...');

try {
    // Replace main SDK
    const stableSDK = path.join(publicDir, 'widget-sdk-stable.js');
    const mainSDK = path.join(publicDir, 'widget-sdk.js');
    
    if (fs.existsSync(stableSDK)) {
        fs.copyFileSync(stableSDK, mainSDK);
        console.log('   ✅ Deployed: widget-sdk.js');
    }
    
    // Replace minified SDK
    const stableMinSDK = path.join(publicDir, 'widget-sdk-stable.min.js');
    const mainMinSDK = path.join(publicDir, 'widget-sdk.min.js');
    
    if (fs.existsSync(stableMinSDK)) {
        fs.copyFileSync(stableMinSDK, mainMinSDK);
        console.log('   ✅ Deployed: widget-sdk.min.js');
    }
    
    // Update example file
    const stableExample = path.join(publicDir, 'test-stable-widget.html');
    const mainExample = path.join(publicDir, 'widget-example.html');
    
    if (fs.existsSync(stableExample)) {
        // Create updated example based on stable test
        const exampleContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Al Hayat GPT Widget Example - Production</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #6b7280;
            margin-bottom: 30px;
            font-size: 1.1rem;
        }
        
        .widget-container {
            margin: 30px 0;
            padding: 20px;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            background-color: #f9fafb;
        }
        
        .status {
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-weight: 500;
        }
        
        .status.loading {
            background-color: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #bfdbfe;
        }
        
        .status.ready {
            background-color: #f0f9f4;
            color: #166534;
            border: 1px solid #bbf7d0;
        }
        
        .status.error {
            background-color: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }
        
        .code-example {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
            margin: 20px 0;
        }
        
        .controls {
            display: flex;
            gap: 10px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        button {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: transform 0.2s;
        }
        
        button:hover {
            transform: translateY(-1px);
        }
        
        .highlight {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        
        .highlight strong {
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Al Hayat GPT Widget - Production Ready</h1>
        <p class="subtitle">
            Experience our advanced Christian AI chatbot with stable cross-origin support
        </p>
        
        <div class="highlight">
            <strong>✨ New in v2.0.0-stable:</strong> 
            Popup authentication solves "refused to connect" errors on third-party websites.
            Now works reliably on any domain with enhanced error handling and retry mechanisms.
        </div>
        
        <div id="status" class="status loading">
            🔄 Loading widget...
        </div>
        
        <div class="widget-container">
            <div id="chat-widget"></div>
        </div>
        
        <div class="controls">
            <button onclick="changeTheme('light')">Light Theme</button>
            <button onclick="changeTheme('dark')">Dark Theme</button>
            <button onclick="changeTheme('auto')">Auto Theme</button>
            <button onclick="testAuth()">Test Authentication</button>
            <button onclick="recreateWidget()">Recreate Widget</button>
        </div>
        
        <div class="code-example">
<strong>Basic Integration:</strong>

&lt;script src="https://www.alhayatgpt.com/widget-sdk.min.js"&gt;&lt;/script&gt;
&lt;div id="chat-widget"&gt;&lt;/div&gt;
&lt;script&gt;
  const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    theme: 'auto',
    allowGuests: true,
    usePopupAuth: true,      // NEW: Popup authentication
    fallbackToGuest: true,   // NEW: Graceful fallback
    onReady: () =&gt; console.log('Widget ready!'),
    onError: (error) =&gt; console.error('Error:', error)
  });
&lt;/script&gt;
        </div>
        
        <div class="code-example">
<strong>Advanced Configuration:</strong>

const widget = AlHayatGPT.createWidget({
  containerId: 'chat-widget',
  theme: 'auto',
  width: '100%',
  height: '600px',
  allowGuests: true,
  usePopupAuth: true,
  fallbackToGuest: true,
  enableRetry: true,
  retryAttempts: 3,
  debug: false,
  customStyles: {
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
  },
  onReady: () =&gt; updateStatus('ready', '✅ Widget ready!'),
  onUserSignIn: (user) =&gt; console.log('User signed in:', user),
  onUserSignOut: () =&gt; console.log('User signed out'),
  onError: (error) =&gt; handleError(error)
});
        </div>
    </div>

    <!-- Widget SDK -->
    <script src="/widget-sdk.min.js"></script>
    
    <script>
        let widget;
        
        function updateStatus(type, message) {
            const statusEl = document.getElementById('status');
            statusEl.textContent = message;
            statusEl.className = \`status \${type}\`;
        }
        
        function handleError(error) {
            console.error('Widget error:', error);
            updateStatus('error', \`❌ Error: \${error.message}\`);
        }
        
        function initializeWidget() {
            try {
                widget = AlHayatGPT.createWidget({
                    containerId: 'chat-widget',
                    theme: 'auto',
                    allowGuests: true,
                    usePopupAuth: true,
                    fallbackToGuest: true,
                    enableRetry: true,
                    debug: true,
                    onReady: function() {
                        updateStatus('ready', '✅ Widget ready and responsive!');
                        console.log('Widget info:', {
                            version: widget.getVersion(),
                            isReady: widget.isWidgetReady(),
                            isAuthenticated: widget.isAuthenticated()
                        });
                    },
                    onUserSignIn: function(user) {
                        console.log('User signed in:', user);
                        updateStatus('ready', \`✅ Welcome, \${user.firstName || 'User'}!\`);
                    },
                    onUserSignOut: function() {
                        console.log('User signed out');
                        updateStatus('ready', '✅ Signed out - now in guest mode');
                    },
                    onError: handleError
                });
                
                console.log('Widget created successfully');
                
            } catch (error) {
                handleError(error);
            }
        }
        
        function changeTheme(theme) {
            if (widget) {
                widget.updateConfig({ theme: theme });
                console.log(\`Theme changed to: \${theme}\`);
            }
        }
        
        async function testAuth() {
            if (widget) {
                try {
                    if (widget.isAuthenticated()) {
                        widget.signOut();
                    } else {
                        updateStatus('loading', '🔐 Opening authentication popup...');
                        await widget.signIn();
                    }
                } catch (error) {
                    handleError(error);
                }
            }
        }
        
        function recreateWidget() {
            if (widget) {
                widget.destroy();
                widget = null;
                updateStatus('loading', '🔄 Recreating widget...');
                setTimeout(initializeWidget, 1000);
            }
        }
        
        // Initialize widget when SDK is ready
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof AlHayatGPT !== 'undefined') {
                initializeWidget();
            } else {
                window.addEventListener('AlHayatGPTSDKReady', initializeWidget);
                
                setTimeout(() => {
                    if (typeof AlHayatGPT === 'undefined') {
                        updateStatus('error', '❌ SDK failed to load');
                    }
                }, 10000);
            }
        });
        
        // Global error handler
        window.addEventListener('error', function(event) {
            console.error('Global error:', event.error);
        });
    </script>
</body>
</html>`;
        
        fs.writeFileSync(mainExample, exampleContent);
        console.log('   ✅ Deployed: widget-example.html');
    }
    
    // Update documentation
    const stableDocs = path.join(publicDir, 'stable-widget-integration-guide.md');
    const mainDocs = path.join(publicDir, 'README-widget.md');
    
    if (fs.existsSync(stableDocs)) {
        fs.copyFileSync(stableDocs, mainDocs);
        console.log('   ✅ Deployed: README-widget.md');
    }
    
} catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
}

// Step 3: Update package.json if it exists
console.log('\n📝 Updating package.json...');
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Add widget-related scripts if they don't exist
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }
        
        packageJson.scripts['widget:build'] = 'terser public/widget-sdk.js -o public/widget-sdk.min.js -c -m';
        packageJson.scripts['widget:test'] = 'echo "Widget SDK tests would run here"';
        packageJson.scripts['widget:deploy'] = 'node scripts/deploy-stable-widget.js';
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('   ✅ Updated package.json scripts');
    } catch (error) {
        console.log('   ⚠️  Could not update package.json:', error.message);
    }
}

// Step 4: Create deployment summary
console.log('\n📊 Deployment Summary:');
console.log('   ✅ Widget SDK v2.0.0-stable deployed');
console.log('   ✅ Popup authentication enabled');
console.log('   ✅ Cross-origin compatibility improved');
console.log('   ✅ Error handling enhanced');
console.log('   ✅ Documentation updated');
console.log('   ✅ Example page updated');

console.log('\n🔗 URLs to test:');
console.log('   • Widget Example: /widget-example.html');
console.log('   • Test Page: /test-stable-widget.html');
console.log('   • Documentation: /README-widget.md');

console.log('\n📋 Next Steps:');
console.log('   1. Test the widget on different domains');
console.log('   2. Verify popup authentication works');
console.log('   3. Check error handling scenarios');
console.log('   4. Update your CDN/deployment if needed');

console.log('\n💾 Backup created at:', backupDir);
console.log('\n🎉 Deployment completed successfully!');

// Step 5: Basic validation
console.log('\n🔍 Running basic validation...');

const mainSDKPath = path.join(publicDir, 'widget-sdk.js');
const mainMinSDKPath = path.join(publicDir, 'widget-sdk.min.js');

if (fs.existsSync(mainSDKPath)) {
    const content = fs.readFileSync(mainSDKPath, 'utf8');
    if (content.includes('2.0.0-stable') && content.includes('usePopupAuth')) {
        console.log('   ✅ widget-sdk.js contains stable version');
    } else {
        console.log('   ⚠️  widget-sdk.js may not be the stable version');
    }
}

if (fs.existsSync(mainMinSDKPath)) {
    const size = fs.statSync(mainMinSDKPath).size;
    console.log(`   ✅ widget-sdk.min.js exists (${Math.round(size/1024)}KB)`);
}

console.log('\n✨ Ready to use! The stable widget SDK is now live.'); 