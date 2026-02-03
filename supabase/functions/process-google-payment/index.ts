import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Chave Secreta Hardcoded para facilitar testes LOCAIS. 
// EM PRODUÇÃO REAL, USE Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || "";

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { paymentData, amount, currency } = await req.json()

        console.log("Recebendo requisição de pagamento:", amount, currency);

        // 1. Inicializa Stripe
        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16', // Atualizado
            httpClient: Stripe.createFetchHttpClient(),
        })

        // 2. Extrai o token do Google Pay
        const tokenData = JSON.parse(paymentData.paymentMethodData.tokenizationData.token);

        // O ID do token do Stripe vem dentro de 'id' no JSON do Google se usarmos gateway: stripe
        // Mas o Google Pay retorna um objeto token complexo. 
        // Com a integração direta via Google Pay Button <-> Stripe, o "token" do Google contém o 'id' do PaymentMethod ou Token do Stripe.
        const stripeTokenId = tokenData.id;

        console.log("Criando cobrança com token:", stripeTokenId);

        // 3. Cria a Cobrança (Charge) ou PaymentIntent
        // Para simplificar, vamos criar um PaymentIntent confirmado automaticamente
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe usa centavos! (10.00 vira 1000)
            currency: currency || 'BRL',
            payment_method_data: {
                type: 'card',
                card: {
                    token: stripeTokenId // Usa o token gerado pelo Google Pay
                }
            },
            confirm: true, // Tenta cobrar imediatamente
            description: `Compra de Diamantes via Google Pay`
        });

        if (paymentIntent.status !== 'succeeded') {
            throw new Error(`Pagamento não completado. Status: ${paymentIntent.status}`);
        }

        // 4. Se chegou aqui, o pagamento foi SUCESSO.
        // O cliente (frontend) pode confiar e liberar os diamantes, 
        // OU chamamos a procedure de banco aqui (mais seguro).

        // Vamos retornar sucesso e deixar o front atualizar a UI, 
        // (idealmente aqui chamariamos o supabaseClient para inserir a transação)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Pagamento processado com sucesso!',
                transactionId: paymentIntent.id
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error("Erro no processamento:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400, // Bad Request
            }
        )
    }
})
