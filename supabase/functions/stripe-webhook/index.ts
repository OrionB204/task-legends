
// Instruções para o Usuário
// 1. Crie os Payment Links no Stripe para cada produto (5, 10, 20, 30 diamantes).
// 2. Cole os links no arquivo src/config/stripeLinks.ts
// 3. No Stripe, configure o Webhook apontando para:
//    https://seu-projeto.supabase.co/functions/v1/stripe-webhook
//    (Você precisará fazer deploy dessa função)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

// @ts-ignore
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
// @ts-ignore
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req: any) => {
    const signature = req.headers.get('Stripe-Signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = JSON.parse(body);

        const responseData = {
            received: true,
            debug: {
                userIdProcessed: null as string | null,
                amountPaid: 0,
                emailFound: null as string | null,
                rpcSuccess: false,
                rpcError: null as any
            }
        };

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            let userId = session.client_reference_id
            const amountPaid = session.amount_total // em centavos
            const customerEmail = session.customer_details?.email || session.email;

            responseData.debug.amountPaid = amountPaid;
            responseData.debug.emailFound = customerEmail;

            // Log Centralizado no Banco (Para você ler no painel)
            await supabase.from('debug_logs').insert({
                event_type: 'webhook_received',
                message: userId ? `Recebido com ID: ${userId}` : `Sem ID no link. Buscando email: ${customerEmail}`,
                payload: { userId, customerEmail, amountPaid, session_id: session.id }
            });

            // --- LÔGICA DE FALLBACK (BACKUP) ---
            if (!userId && customerEmail) {
                console.log(`⚠️ Tentando resgate por email: ${customerEmail}`);

                // Busca ID pelo email
                const { data: { users } } = await supabase.auth.admin.listUsers();
                const foundUser = users?.find(u => u.email === customerEmail);

                if (foundUser) {
                    userId = foundUser.id;
                    responseData.debug.userIdProcessed = userId + " (Email Match)";

                    await supabase.from('debug_logs').insert({
                        event_type: 'email_search_found',
                        message: `Encontrado: ${userId}`,
                        payload: { userId }
                    });
                } else {
                    await supabase.from('debug_logs').insert({
                        event_type: 'email_search_failed',
                        message: `Nenhum user encontrado para: ${customerEmail}`,
                        payload: { email: customerEmail }
                    });
                }
            } else {
                responseData.debug.userIdProcessed = userId;
            }

            if (userId) {
                let diamondsToAdd = 0;
                if (amountPaid === 500) diamondsToAdd = 5;
                else if (amountPaid === 1000) diamondsToAdd = 10;
                else if (amountPaid === 2000) diamondsToAdd = 20;
                else if (amountPaid === 3000) diamondsToAdd = 30;
                else diamondsToAdd = Math.floor(amountPaid / 100);

                if (diamondsToAdd > 0) {
                    // ATUALIZADO: Usando os novos nomes de parâmetro para evitar ambiguidade
                    const { error: rpcError } = await supabase.rpc('add_diamonds', {
                        _user_id: userId,
                        _amount: diamondsToAdd
                    });

                    if (rpcError) {
                        responseData.debug.rpcError = rpcError;
                        await supabase.from('debug_logs').insert({
                            event_type: 'rpc_failure',
                            message: `Erro RPC: ${rpcError.message}`,
                            payload: rpcError
                        });
                    } else {
                        responseData.debug.rpcSuccess = true;
                        await supabase.from('debug_logs').insert({
                            event_type: 'success',
                            message: `Creditado ${diamondsToAdd} D na conta ${userId}`,
                            payload: { success: true }
                        });

                        await supabase.from('diamond_transactions').insert({
                            user_id: userId,
                            amount: diamondsToAdd,
                            transaction_type: 'purchase',
                            description: `Compra Stripe: ${diamondsToAdd} Diamantes`,
                            balance_after: 0,
                            reference_id: session.id,
                            reference_type: 'stripe'
                        });
                    }
                }
            } else {
                responseData.debug.rpcError = "User not found (No ID, No Email match)";
                await supabase.from('debug_logs').insert({
                    event_type: 'fatal_error',
                    message: "Impossível identificar usuário",
                    payload: { session_id: session.id }
                });
            }
        }

        return new Response(JSON.stringify(responseData), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
})
