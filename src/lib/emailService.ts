// Email Service using EmailJS - FREE tier (200 emails/month)
// Setup: https://www.emailjs.com/
import emailjs from '@emailjs/browser';

// EmailJS Configuration
// You need to create a free account at emailjs.com and get these IDs
const EMAILJS_SERVICE_ID = 'service_tasklegends'; // Create a service connected to your email
const EMAILJS_TEMPLATE_ID = 'template_support'; // Create a template
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Get from EmailJS dashboard

const SUPPORT_EMAIL = 'fitquestplay@gmail.com';

interface TicketEmailData {
    ticketId: string;
    ticketType: string;
    subject: string;
    description: string;
    userEmail: string;
    username: string;
    transactionId?: string;
    reportedUserId?: string;
    duelId?: string;
}

export async function sendTicketEmail(data: TicketEmailData): Promise<boolean> {
    // Check if EmailJS is configured
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.log('[EmailService] EmailJS not configured, logging ticket instead:');
        console.log('─'.repeat(50));
        console.log(`📧 NEW SUPPORT TICKET`);
        console.log(`To: ${SUPPORT_EMAIL}`);
        console.log(`From: ${data.userEmail} (${data.username})`);
        console.log(`Type: ${data.ticketType}`);
        console.log(`Subject: ${data.subject}`);
        console.log(`Description: ${data.description}`);
        if (data.transactionId) console.log(`Transaction: ${data.transactionId}`);
        if (data.reportedUserId) console.log(`Reported User: ${data.reportedUserId}`);
        if (data.duelId) console.log(`Duel: ${data.duelId}`);
        console.log('─'.repeat(50));
        return true; // Don't block the flow
    }

    try {
        const templateParams = {
            to_email: SUPPORT_EMAIL,
            from_name: data.username,
            from_email: data.userEmail,
            ticket_id: data.ticketId.slice(0, 8),
            ticket_type: getTicketTypeLabel(data.ticketType),
            subject: data.subject,
            message: data.description,
            transaction_id: data.transactionId || 'N/A',
            reported_user: data.reportedUserId || 'N/A',
            duel_id: data.duelId || 'N/A',
        };

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );

        console.log('[EmailService] Email sent successfully:', response.status);
        return true;
    } catch (error) {
        console.error('[EmailService] Failed to send email:', error);
        return false;
    }
}

function getTicketTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        complaint: '📢 Reclamação',
        bug: '🐛 Denúncia de Bug',
        user_report: '🚨 Denúncia de Usuário',
        redemption_issue: '🎁 Problema com Resgate',
    };
    return labels[type] || type;
}
