# 🛡️ Guia de Segurança Máxima para Pagamentos

Para proteger seu dinheiro e evitar que hackers simulem compras falsas, a "mágica" do pagamento precisa acontecer em um servidor seguro (Backend), e não no computador do jogador (Frontend).

Nós já criamos o código seguro (`supabase/functions/process-google-payment`), mas agora precisamos enviá-lo para a nuvem do Supabase.

Realize os passos abaixo com calma.

## Passo 1: Instalar o Painel de Controle (CLI)
Precisamos instalar a ferramenta que conecta seu computador ao servidor do Supabase.
> Se o comando automático que tentei rodar falhou, abra o PowerShell como Administrador e rode:
> `npm install -g supabase`

## Passo 2: Conectar sua Conta
No terminal do seu computador (pode ser no VS Code mesmo), digite:
```powershell
npx supabase login
```
Ele vai pedir para abrir o navegador. Aceite. Isso autoriza seu computador a mandar códigos para o seu projeto.

## Passo 3: Linkar ao Projeto
Precisamos dizer qual projeto do Supabase vamos usar. 
1. Vá no site do Supabase (Dashboard).
2. Entre no seu projeto -> Project Settings (ícone de engrenagem).
3. Copie o **Reference ID** (Geramente é um código como `abcdefghijklmno`).
4. No terminal, digite:
```powershell
npx supabase link --project-ref SEU_ID_AQUI
```
Ele vai pedir a senha do banco de dados (aquela que você criou quando fez o projeto).

## Passo 4: Enviar o Código Seguro (Deploy)
Agora vamos enviar a função de pagamento para o ar:
```powershell
npx supabase functions deploy process-google-payment --no-verify-jwt
```

## Passo 5: Salvar a Senha (Segredo)
Agora precisamos guardar a chave secreta do Stripe no cofre do Supabase, para que ninguém veja.
Substitua `sk_live_...` pela sua chave secreta real do Stripe (Produção).
```powershell
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI
```

---
✅ **Pronto!**
Agora, quando alguém clicar em comprar no jogo:
1. O App manda os dados pro Google.
2. O Google manda pro Supabase (Nuvem).
3. O Supabase (usando a chave guardada no cofre) fala com o Stripe.
4. O Stripe confirma o dinheiro.
5. O Supabase entrega os diamantes.

Tudo isso acontece longe do usuário, garantindo segurança total.
