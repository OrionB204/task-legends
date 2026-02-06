import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SUPPORT_EMAIL = 'fitquestplay@gmail.com'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { ticket, userEmail, username } = await req.json()

        console.log('[SendTicketEmail] Processing ticket:', ticket.id)

        // Format the email content
        const emailSubject = `[TaskLegends Support] ${ticket.ticket_type.toUpperCase()}: ${ticket.subject}`

        const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 NOVO TICKET DE SUPORTE - TASKLEGENDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INFORMAÇÕES DO TICKET
─────────────────────────────────────────────────
🆔 ID: ${ticket.id}
📌 Tipo: ${getTicketTypeLabel(ticket.ticket_type)}
📅 Data: ${new Date(ticket.created_at).toLocaleString('pt-BR')}
🔖 Status: ${ticket.status}

👤 INFORMAÇÕES DO USUÁRIO
─────────────────────────────────────────────────
📧 Email: ${userEmail || 'Não disponível'}
🎮 Username: ${username || 'Não disponível'}
🆔 User ID: ${ticket.user_id}

📝 ASSUNTO
─────────────────────────────────────────────────
${ticket.subject}

📄 DESCRIÇÃO
─────────────────────────────────────────────────
${ticket.description}

${ticket.transaction_id ? `💳 Transaction ID: ${ticket.transaction_id}` : ''}
${ticket.reported_user_id ? `🚨 Reported User ID: ${ticket.reported_user_id}` : ''}
${ticket.duel_id ? `⚔️ Duel ID: ${ticket.duel_id}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este email foi enviado automaticamente pelo sistema TaskLegends.
Para responder, entre em contato diretamente com o usuário.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

        // Try to send via Resend API if key is available
        const resendApiKey = Deno.env.get('RESEND_API_KEY')

        if (resendApiKey) {
            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'TaskLegends <suporte@tasklegends.com>',
                    to: [SUPPORT_EMAIL],
                    subject: emailSubject,
                    text: emailBody,
                }),
            })

            if (!resendResponse.ok) {
                const error = await resendResponse.text()
                console.error('[SendTicketEmail] Resend API error:', error)
                throw new Error(`Resend API error: ${error}`)
            }

            console.log('[SendTicketEmail] Email sent successfully via Resend!')
        } else {
            // Fallback: Use EmailJS or log for manual processing
            console.log('[SendTicketEmail] No RESEND_API_KEY found, logging ticket for manual processing')
            console.log('[SendTicketEmail] Would send to:', SUPPORT_EMAIL)
            console.log('[SendTicketEmail] Subject:', emailSubject)
            console.log('[SendTicketEmail] Body:', emailBody)

            // Store in a emails_queue table for manual processing if needed
            // For now, just log it
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Ticket email processed',
                sentTo: SUPPORT_EMAIL
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('[SendTicketEmail] Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})

function getTicketTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        complaint: '📢 Reclamação',
        bug: '🐛 Denúncia de Bug',
        user_report: '🚨 Denúncia de Usuário',
        redemption_issue: '🎁 Problema com Resgate',
    }
    return labels[type] || type
}
