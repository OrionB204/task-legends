export const STRIPE_LINKS = {
    // Cole aqui os links de pagamento que você criar no Stripe
    // Exemplo: 'https://buy.stripe.com/test_...'

    pack_5: 'https://buy.stripe.com/8x200b4fA4JD8ViboXds401',   // Link para o pacote de 5 Diamantes
    pack_10: 'https://buy.stripe.com/3cI14f5jEb81fjG1Onds402',  // Link para o pacote de 10 Diamantes
    pack_20: 'https://buy.stripe.com/4gMcMXcM62Bv2wU0Kjds403',  // Link para o pacote de 20 Diamantes
    pack_30: 'https://buy.stripe.com/28E7sDbI2fohb3q3Wvds404',  // Link para o pacote de 30 Diamantes
};

// Função auxiliar para gerar o link com o ID do usuário
export const getPaymentLink = (packAmount: number, userId: string) => {
    let baseUrl = '';

    switch (packAmount) {
        case 5: baseUrl = STRIPE_LINKS.pack_5; break;
        case 10: baseUrl = STRIPE_LINKS.pack_10; break;
        case 20: baseUrl = STRIPE_LINKS.pack_20; break;
        case 30: baseUrl = STRIPE_LINKS.pack_30; break;
        default: return null;
    }

    if (!baseUrl) return null;

    // Adiciona o client_reference_id para sabermos quem pagou
    // O Stripe permite passar esse parâmetro na URL para rastreio
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}client_reference_id=${userId}`;
};
