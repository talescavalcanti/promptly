import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { error: 'RESEND_API_KEY missing' },
                { status: 500 }
            );
        }

        const data = await resend.emails.send({
            from: 'Promptly <onboarding@iapromptly.com.br>', // UPDATE THIS TO YOUR VERIFIED DOMAIN IN PROD
            to: [email],
            subject: 'Bem-vindo ao Promptly!',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F5A524;">Bem-vindo ao Promptly, ${name}!</h1>
          <p>Estamos muito felizes em ter você conosco.</p>
          <p>Sua conta foi criada com sucesso.</p>
          <br/>
          <p>Se você não realizou este cadastro, ignore este email.</p>
        </div>
      `,
        });

        if (data.error) {
            console.error('❌ Resend API Error:', data.error);
            return NextResponse.json(data, { status: 400 });
        }

        console.log('✅ Email sent successfully:', data);
        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Internal Server Error Sending Email:', error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
