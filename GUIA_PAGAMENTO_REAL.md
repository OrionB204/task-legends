# 💰 Configuração de Pagamentos Reais (Produção)

Para que o dinheiro das compras de diamantes vá para sua conta bancária, o Google Pay na Web **exige** o uso de um processador de pagamentos (Gateway). O Google Pay atua apenas como a carteira segura, mas quem processa o cartão é o Gateway.

Utilizamos **Stripe** como padrão por ser o mais fácil de integrar.

## Passo 1: Criar Conta no Stripe (Gateway)
1. Acesse [Stripe.com](https://stripe.com/br) e crie sua conta.
2. Ative sua conta preenchendo os dados bancários (onde você receberá o dinheiro).
3. No Dashboard do Stripe, vá em **Developers (Desenvolvedores) > API Keys**.
4. Copie a **Publishable Key** (começa com `pk_live_...`).

## Passo 2: Configurar Google Pay Console
1. Acesse o [Google Pay & Wallet Console](https://pay.google.com/business/console/).
2. Crie um perfil de negócio.
3. Obtenha seu **Merchant ID** (ID do Comerciante).
4. **IMPORTANTE**: No console do Google Pay, você precisa cadastrar que usará o **Stripe** como processador de pagamento.

## Passo 3: Atualizar o Código
Edite o arquivo `src/config/payments.ts` no seu projeto:

```typescript
export const PAYMENT_CONFIG = {
  // Mude para 'PRODUCTION' para cobrar de verdade
  environment: 'PRODUCTION', 

  // Seu ID do Google Pay Console
  googleMerchantId: '12345678901234567890', 
  
  // Sua chave pública do Stripe (pk_live_...)
  stripePublishableKey: 'pk_live_XXXXXXXXXXXXXXXXXXXXXXXX',
  
  // ... resto das configs
};
```

## Passo 4: Aprovação do Google
Antes de funcionar para todos os usuários em Produção, o Google exige que você submeta seu site para aprovação no **Google Pay Console**. Eles vão verificar se o site segue as diretrizes de marca e segurança (HTTPS).

---
**Observação**: Enquanto você não completar esses passos, mantenha `environment: 'TEST'` em `src/config/payments.ts`. O modo de teste simula a compra sem cobrar o cartão.
