import { jsPDF } from 'jspdf';
import { Message } from '@/types/chat';

export async function exportToPDF(messages: Message[], title: string): Promise<Blob> {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    const lineHeight = 7;

    // Add title
    doc.setFontSize(16);
    doc.text(title, margin, y);
    y += lineHeight * 2;

    // Add messages
    doc.setFontSize(12);
    messages.forEach((message) => {
        const role = message.role === 'user' ? 'You' : 'AI';
        const timestamp = new Date(message.timestamp).toLocaleString();
        
        // Add role and timestamp
        doc.setFont('helvetica', 'bold');
        doc.text(`${role} (${timestamp}):`, margin, y);
        y += lineHeight;

        // Add message content
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(message.content, 170);
        doc.text(splitText, margin, y);
        y += lineHeight * (splitText.length + 1);

        // Add page break if needed
        if (y > 270) {
            doc.addPage();
            y = margin;
        }
    });

    return doc.output('blob');
}

export function exportToText(messages: Message[], title: string): string {
    let text = `${title}\n\n`;

    messages.forEach((message) => {
        const role = message.role === 'user' ? 'You' : 'AI';
        const timestamp = new Date(message.timestamp).toLocaleString();
        text += `${role} (${timestamp}):\n${message.content}\n\n`;
    });

    return text;
} 