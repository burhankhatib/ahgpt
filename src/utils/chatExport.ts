import { Message } from '@/types/chat';

export async function sendChatViaEmail(
    email: string,
    messages: Message[],
    title: string,
    format: 'pdf' | 'text' = 'pdf',
    firstName: string,
    lastName: string,
) {
    try {
        const response = await fetch('/api/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                messages,
                title,
                format,
                firstName,
                lastName,

            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

export function stripHtmlTags(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
} 