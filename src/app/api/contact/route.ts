import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schema
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  jobRole: z.string().optional(),
  ministry: z.string().min(1, 'Ministry/Organization is required'),
  mobile: z.string().optional(),
  message: z.string().min(20, 'Message must be at least 20 characters long'),
  captcha: z.string().min(1, 'Please verify you are not a robot'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = contactSchema.parse(body);
    
    const { firstName, lastName, email, jobRole, ministry, mobile, message, captcha } = validatedData;
    
    // Note: Captcha validation is handled on the frontend with dynamic Bible words
    // The frontend ensures the user enters the correct captcha word before submission

    // Email content
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Ministry/Organization:</strong> ${ministry}</p>
      ${jobRole ? `<p><strong>Job Role:</strong> ${jobRole}</p>` : ''}
      ${mobile ? `<p><strong>Mobile:</strong> ${mobile}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><em>Sent from AHGPT Contact Form</em></p>
    `;

    const emailText = `
New Contact Form Submission

Name: ${firstName} ${lastName}
Email: ${email}
Ministry/Organization: ${ministry}
${jobRole ? `Job Role: ${jobRole}` : ''}
${mobile ? `Mobile: ${mobile}` : ''}

Message:
${message}

---
Sent from AHGPT Contact Form
    `;

    // Send email to both recipients
    const emailPromises = [
      resend.emails.send({
        from: 'AHGPT Contact <contact@alhayat.org>',
        to: ['bob@alhayat.org'],
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        html: emailHtml,
        text: emailText,
      }),
      resend.emails.send({
        from: 'AHGPT Contact <contact@alhayat.org>',
        to: ['abuali@alhayat.org'],
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        html: emailHtml,
        text: emailText,
      })
    ];

    await Promise.all(emailPromises);

    return NextResponse.json(
      { message: 'Email sent successfully!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
} 