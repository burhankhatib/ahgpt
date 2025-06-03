export function getSanityPermissionError(error: unknown): string | null {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('Insufficient permissions') || errorMessage.includes('permission')) {
        return `
Sanity Permission Error: Your Sanity API token doesn't have write permissions.

To fix this:
1. Go to your Sanity project dashboard (https://sanity.io/manage)
2. Navigate to API → Tokens
3. Create a new token with "Editor" or "Admin" permissions
4. Add it to your environment variables as SANITY_API_TOKEN

Current token permissions: Read-only
Required permissions: Read + Write (Editor/Admin)
        `.trim();
    }
    
    return null;
}

export function isSanityPermissionError(error: unknown): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return errorMessage.includes('Insufficient permissions') || errorMessage.includes('permission');
} 