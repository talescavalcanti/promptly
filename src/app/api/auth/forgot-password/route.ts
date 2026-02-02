import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
        }

        // Create Supabase admin client for password reset
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // Generate password reset link
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
            }
        });

        if (error) {
            console.error('Supabase error:', error);
            // Don't reveal if email exists or not for security
            return NextResponse.json({ success: true });
        }

        const resetLink = data.properties?.action_link;

        if (!resetLink) {
            console.error('No reset link generated');
            return NextResponse.json({ success: true });
        }

        // Initialize Resend directly with the API key
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Send email via Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'Promptly <noreply@iapromptly.com.br>',
            to: email,
            subject: 'Recuperação de Senha - Promptly',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #1C1C1E; border-radius: 24px; padding: 40px;">
                                    <tr>
                                        <td align="center" style="padding-bottom: 24px;">
                                            <span style="font-size: 24px; font-weight: 700; color: #FF9F0A;">Promptly</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding-bottom: 16px;">
                                            <h1 style="margin: 0; color: #F5F5F7; font-size: 28px; font-weight: 700;">Recuperar Senha</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding-bottom: 32px;">
                                            <p style="margin: 0; color: #86868B; font-size: 16px; line-height: 1.5;">
                                                Você solicitou a recuperação de senha da sua conta Promptly. Clique no botão abaixo para criar uma nova senha.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding-bottom: 32px;">
                                            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #FF9F0A 0%, #FFB340 100%); color: #000; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-size: 16px; font-weight: 600;">
                                                Redefinir Senha
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center">
                                            <p style="margin: 0; color: #48484A; font-size: 14px;">
                                                Se você não solicitou esta recuperação, pode ignorar este email.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        });

        if (emailError) {
            console.error('Resend error:', emailError);
            return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
        }

        console.log('Email sent successfully:', emailData);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
