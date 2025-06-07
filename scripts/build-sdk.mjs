#!/usr/bin/env node
import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const entryPoint = path.resolve(__dirname, '../src/sdk/sdk.ts');
const outfile = path.resolve(__dirname, '../public/sdk.js');
const testPageTemplate = path.resolve(__dirname, 'template.html');
const testPageOutput = path.resolve(__dirname, '../public/test-sdk.html');

console.log('🚀 Building Al Hayat GPT Widget SDK v3.0...');

try {
    // --- Step 1: Build the SDK using esbuild ---
    console.log('📦 Compiling and bundling...');
    const result = await esbuild.build({
        entryPoints: [entryPoint],
        outfile,
        bundle: true,
        minify: true,
        platform: 'browser',
        format: 'iife',
        sourcemap: 'inline',
        target: 'es2018',
        metafile: true,
    });

    // --- Step 2: Analyze and report the bundle size ---
    console.log('📊 Analyzing bundle...');
    const bundleSize = result.metafile.outputs[path.relative(process.cwd(), outfile)].bytes;
    console.log(`✅ Build complete!`);
    console.log(`   - Output: ${path.relative(process.cwd(), outfile)}`);
    console.log(`   - Size: ${(bundleSize / 1024).toFixed(2)} KB`);

    // --- Step 3: Create a test page for the new SDK ---
    console.log('📝 Creating test page...');
    let templateContent = fs.readFileSync(testPageTemplate, 'utf-8');
    const sdkFileName = path.basename(outfile);
    const testPageContent = templateContent.replace('{{SDK_FILE_NAME}}', sdkFileName);
    fs.writeFileSync(testPageOutput, testPageContent);
    console.log(`   - Test page: ${path.relative(process.cwd(), testPageOutput)}`);

    console.log('\n🎉 SDK built successfully!');
    console.log(`\n👉 To test, open '${path.basename(testPageOutput)}' in a browser.`);

} catch (error) {
    console.error('\n❌ Build failed:');
    console.error(error);
    process.exit(1);
} 