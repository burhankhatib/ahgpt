import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { exportToPDF, exportToText } from '@/utils/exportUtils';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, messages, title, format } = await request.json();

        let attachment;
        let content;

        if (format === 'pdf') {
            const pdfBlob = await exportToPDF(messages, title);
            const buffer = await pdfBlob.arrayBuffer();
            attachment = {
                filename: `${title}.pdf`,
                content: Buffer.from(buffer)
            };
            content = 'Please find your chat export attached as a PDF.';
        } else {
            const textContent = exportToText(messages, title);
            attachment = {
                filename: `${title}.txt`,
                content: textContent
            };
            content = 'Please find your chat export attached as a text file.';
        }

        const data = await resend.emails.send({
            from: 'Al Hayat GPT <ahgpt@alhayat.tv>',
            to: email,
            subject: `Chat Export: ${title}`,
            text: content,
            attachments: [attachment]
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to send email:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
} 