import { NextRequest, NextResponse } from 'next/server';
import { 
    getDomainAccessConfig,
    updateDomainAccessConfig,
    addDomainToList,
    removeDomainFromList,
    type DomainAccessConfig
} from '@/sanity/lib/data/domainAccess';

// GET - Load current configuration
export async function GET() {
    try {
        const config = await getDomainAccessConfig();
        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        console.error('Error loading domain configuration:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load configuration' },
            { status: 500 }
        );
    }
}

// POST - Save new configuration
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Validate the request body
        const { mode, whitelist, blacklist, allowedTesting } = body;
        
        if (!['whitelist', 'blacklist', 'disabled'].includes(mode)) {
            return NextResponse.json(
                { error: 'Invalid mode. Must be whitelist, blacklist, or disabled' },
                { status: 400 }
            );
        }
        
        if (!Array.isArray(whitelist) || !Array.isArray(blacklist)) {
            return NextResponse.json(
                { error: 'Whitelist and blacklist must be arrays' },
                { status: 400 }
            );
        }
        
        if (typeof allowedTesting !== 'boolean') {
            return NextResponse.json(
                { error: 'allowedTesting must be a boolean' },
                { status: 400 }
            );
        }
        
        // Clean and validate domains
        const cleanWhitelist = whitelist
            .map((domain: string) => domain.toLowerCase().trim())
            .filter((domain: string) => domain.length > 0);
            
        const cleanBlacklist = blacklist
            .map((domain: string) => domain.toLowerCase().trim())
            .filter((domain: string) => domain.length > 0);
        
        const configUpdate: Partial<DomainAccessConfig> = {
            mode,
            whitelist: cleanWhitelist,
            blacklist: cleanBlacklist,
            allowedTesting,
        };
        
        const updatedConfig = await updateDomainAccessConfig(configUpdate);
        
        return NextResponse.json({
            success: true,
            message: 'Configuration saved successfully',
            config: updatedConfig,
        });
        
    } catch (error) {
        console.error('Error in POST /api/admin/domains:', error);
        return NextResponse.json(
            { error: 'Failed to save configuration' },
            { status: 500 }
        );
    }
}

// PUT - Add domain to list
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { domain, listType } = body;
        
        if (!domain || typeof domain !== 'string') {
            return NextResponse.json(
                { error: 'Domain is required and must be a string' },
                { status: 400 }
            );
        }
        
        if (!['whitelist', 'blacklist'].includes(listType)) {
            return NextResponse.json(
                { error: 'listType must be whitelist or blacklist' },
                { status: 400 }
            );
        }
        
        const updatedConfig = await addDomainToList(domain, listType);
        
        return NextResponse.json({
            success: true,
            message: `Domain added to ${listType}`,
            config: updatedConfig,
        });
        
    } catch (error) {
        console.error('Error in PUT /api/admin/domains:', error);
        return NextResponse.json(
            { error: 'Failed to add domain' },
            { status: 500 }
        );
    }
}

// DELETE - Remove domain from list
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain');
        const listType = searchParams.get('listType');
        
        if (!domain) {
            return NextResponse.json(
                { error: 'Domain parameter is required' },
                { status: 400 }
            );
        }
        
        if (!['whitelist', 'blacklist'].includes(listType || '')) {
            return NextResponse.json(
                { error: 'listType must be whitelist or blacklist' },
                { status: 400 }
            );
        }
        
        const updatedConfig = await removeDomainFromList(domain, listType as 'whitelist' | 'blacklist');
        
        return NextResponse.json({
            success: true,
            message: `Domain removed from ${listType}`,
            config: updatedConfig,
        });
        
    } catch (error) {
        console.error('Error in DELETE /api/admin/domains:', error);
        return NextResponse.json(
            { error: 'Failed to remove domain' },
            { status: 500 }
        );
    }
} 