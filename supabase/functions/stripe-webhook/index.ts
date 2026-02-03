
// Instruções para o Usuário
// 1. Crie os Payment Links no Stripe para cada produto (5, 10, 20, 30 diamantes).
// 2. Cole os links no arquivo src/config/stripeLinks.ts
// 3. No Stripe, configure o Webhook apontando para:
//    https://seu-projeto.supabase.co/functions/v1/stripe-webhook
//    (Você precisará fazer deploy dessa função)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        // Em produção, você DEVE validar a assinatura do Webhook usando stripe.webhooks.constructEvent
        // Mas isso requer o endpoint secret do webhook (STRIPE_WEBHOOK_SECRET)
        const event = JSON.parse(body);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const userId = session.client_reference_id // Aqui está o ID que passamos no front!
            const amountPaid = session.amount_total // Em centavos

            if (userId) {
                console.log(`Pagamento confirmado para usuário ${userId}. Valor: ${amountPaid}`);

                // Lógica simples: converter valor pago em diamantes (ex: R$5,00 = 500 centavos -> 5 diamantes)
                // O ideal é mapear o price_id do produto para a quantidade de diamantes
                // Mas para simplificar, vamos assumir que cada 1 real (100 centavos) = 1 diamante (ajuste conforme sua regra)

                let diamondsToAdd = 0;
                // Exemplo de mapeamento por valor (R$ 5,00 = 500 centavos)
                if (amountPaid === 500) diamondsToAdd = 5;
                else if (amountPaid === 1000) diamondsToAdd = 10;
                else if (amountPaid === 2000) diamondsToAdd = 20;
                else if (amountPaid === 3000) diamondsToAdd = 30;
                else diamondsToAdd = Math.floor(amountPaid / 100); // Fallback: 1 diamante por real

                if (diamondsToAdd > 0) {
                    // 1. Dar os diamantes (RPC seguro)
                    const { error: rpcError } = await supabase.rpc('add_diamonds', {
                        user_id: userId,
                        amount_to_add: diamondsToAdd
                    });

                    if (rpcError) console.error('Erro ao adicionar diamantes:', rpcError);

                    // 2. Registrar transação
                    await supabase.from('diamond_transactions').insert({
                        user_id: userId,
                        amount: diamondsToAdd,
                        transaction_type: 'purchase',
                        description: `Compra Stripe Link: ${diamondsToAdd} Diamantes`,
                        balance_after: 0, // Trigger arruma
                        reference_id: session.id,
                        reference_type: 'stripe_checkout'
                    });
                }
            }
        }

        const responseData = {
            received: true,
            debug: {
                userIdProcessed: null as string | null,
                amountPaid: 0,
                diamondsCalculated: 0,
                rpcSuccess: false,
                rpcError: null as any
            }
        };

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const userId = session.client_reference_id
            const amountPaid = session.amount_total

            responseData.debug.userIdProcessed = userId;
            responseData.debug.amountPaid = amountPaid;

            if (userId) {
                let diamondsToAdd = 0;
                if (amountPaid === 500) diamondsToAdd = 5;
                else if (amountPaid === 1000) diamondsToAdd = 10;
                else if (amountPaid === 2000) diamondsToAdd = 20;
                else if (amountPaid === 3000) diamondsToAdd = 30;
                else diamondsToAdd = Math.floor(amountPaid / 100);

                responseData.debug.diamondsCalculated = diamondsToAdd;

                if (diamondsToAdd > 0) {
                    const { error: rpcError } = await supabase.rpc('add_diamonds', {
                        user_id: userId,
                        amount_to_add: diamondsToAdd
                    });

                    if (rpcError) {
                        console.error('Erro ao adicionar diamantes:', rpcError);
                        responseData.debug.rpcError = rpcError;
                    } else {
                        responseData.debug.rpcSuccess = true;

                        // Transaction log (fire and forget)
                        await supabase.from('diamond_transactions').insert({
                            user_id: userId,
                            amount: diamondsToAdd,
                            transaction_type: 'purchase',
                            description: `Compra Stripe Link: ${diamondsToAdd} Diamantes`,
                            balance_after: 0,
                            reference_id: session.id,
                            reference_type: 'stripe_checkout'
                        });
                    }
                }
            } else {
                responseData.debug.rpcError = "No client_reference_id found in session";
            }
        }

        return new Response(JSON.stringify(responseData), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
})
