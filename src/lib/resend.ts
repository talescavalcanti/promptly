import { Resend } from 'resend';

// Initialize Resend with the API Key from environment variables
// Make sure to add RESEND_API_KEY to your .env.local file
// Safe initialization to prevent crash if key is missing during build/dev
export const resend = new Resend(process.env.RESEND_API_KEY || 're_missing_key');

/**
 * Example usage:
 * 
 * await resend.emails.send({
 *   from: 'onboarding@resend.dev',
 *   to: 'user@example.com',
 *   subject: 'Hello World',
 *   html: '<p>Congrats on sending your first email!</p>'
 * });
 */
