import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        // Read the globals.css file
        const cssPath = path.join(process.cwd(), 'src/app/globals.css');
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // Return the CSS with proper headers
        return new NextResponse(cssContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/css',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('Error serving globals.css:', error);
        return new NextResponse('/* Error loading CSS */', {
            status: 500,
            headers: {
                'Content-Type': 'text/css',
            },
        });
    }
} 