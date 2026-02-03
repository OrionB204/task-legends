export const PAYMENT_CONFIG = {
    // === CONFIGURAÇÃO DE PRODUÇÃO ===
    // Altere para 'PRODUCTION' quando tiver as chaves reais
    // Enquanto estiver em 'TEST', o dinheiro não será cobrado de verdade
    environment: 'PRODUCTION' as 'TEST' | 'PRODUCTION',

    // Google Pay Merchant ID (Obtido no Google Pay Console)
    // https://pay.google.com/business/console/
    googleMerchantId: 'BCR2DN5T52XZPNKO',
    merchantName: 'TaskQuest RPG', // Nome que aparecerá na fatura

    // Configuração do Gateway de Pagamento (Recomendado: Stripe)
    // Você precisa criar uma conta no Stripe: https://stripe.com
    gateway: 'stripe',

    // Chave pública do Stripe (Começa com pk_live_...)
    stripePublishableKey: 'pk_live_51SwVeK1OWFGPq79wdS774Cdnqg87B1M8pMWPvSw2a954e1G9UzLtM4xo0POOxUAvG5eXSz5OwWccbujc8CNFReFx00E4SVPVdz',

    // Versão da API do Stripe
    stripeVersion: '2023-10-16',

    // Moeda e País
    currencyCode: 'BRL',
    countryCode: 'BR',
};

// Função auxiliar para validar se as chaves de produção estão configuradas
export const isProductionReady = () => {
    return (
        PAYMENT_CONFIG.environment === 'PRODUCTION' &&
        PAYMENT_CONFIG.googleMerchantId !== 'SEU_MERCHANT_ID_DO_GOOGLE' &&
        PAYMENT_CONFIG.stripePublishableKey !== 'pk_test_SUA_CHAVE_PUBLICA_DO_STRIPE'
    );
};
