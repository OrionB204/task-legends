// Email Service using EmailJS - FREE tier (200 emails/month)
// Setup: https://www.emailjs.com/
import emailjs from '@emailjs/browser';

// EmailJS Configuration - CONFIGURED ✅
const EMAILJS_SERVICE_ID = 'service_tasklegends';
const EMAILJS_TEMPLATE_ID = 'template_hhdkvlq';
const EMAILJS_PUBLIC_KEY = '0sHBrvhFAIz7JbXuX';

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

    try {
        // Variables matching your EmailJS "Contact Us" template:
        // {{title}} = subject line
        // {{name}} = sender name  
        // {{message}} = content
        // {{email}} = reply-to email
        const templateParams = {
            title: `[${getTicketTypeLabel(data.ticketType)}] ${data.subject}`,
            name: data.username,
            email: data.userEmail,
            message: `📋 ID: ${data.ticketId.slice(0, 8)}

${data.description}

${data.transactionId ? `💳 Transação: ${data.transactionId}` : ''}
${data.reportedUserId ? `🚨 Usuário: ${data.reportedUserId}` : ''}
${data.duelId ? `⚔️ Duelo: ${data.duelId}` : ''}`.trim(),
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
