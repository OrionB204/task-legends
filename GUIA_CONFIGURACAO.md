# 🗝️ GUIA DETALHADO: CONFIGURANDO OS PAGAMENTOS

Este guia contém os **links diretos** para onde você precisa ir. Não precisa procurar nos menus!

---

## 🟢 PASSO 1: Pegar a Chave do Stripe
1. Clique neste link para abrir suas chaves do Stripe:
   👉 **[https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)**

2. Procure a linha onde diz **"Secret key"** (Chave secreta).
3. Deve haver um botão **"Revelar chave de teste"** ou **"Revelar chave de produção"**.
4. Clique para revelar e **COPIE** o código que começa com `sk_live_...` (ou `sk_test_...`).
   *(Guarde esse código no bloco de notas por enquanto)*

---

## 🟢 PASSO 2: Pegar a Chave Mestra do Supabase
1. Clique neste link para ir direto nas configurações de API do seu projeto:
   👉 **[https://supabase.com/dashboard/project/ljqcnvsethddhaxvytlm/settings/api](https://supabase.com/dashboard/project/ljqcnvsethddhaxvytlm/settings/api)**

2. Role a página para baixo até encontrar a seção **"Project API keys"**.
3. Você verá duas caixas: `anon` e `service_role`.
4. Encontre a **`service_role`** (essa é a secreta).
5. Clique no botão **"Reveal"** (ou ícone de olho/copiar) e **COPIE** essa chave longuíssima.
   *(Guarde ela junto com a outra)*

---

## 🟢 PASSO 3: Colar as Chaves no Lugar Certo
1. Clique neste link para ir direto nas configurações da sua Função de Pagamento:
   👉 **[https://supabase.com/dashboard/project/ljqcnvsethddhaxvytlm/functions/stripe-webhook](https://supabase.com/dashboard/project/ljqcnvsethddhaxvytlm/functions/stripe-webhook)**

2. No topo da tela, procure por uma aba ou botão escrito **SECRETS** (Segredos) ou **Environment Variables**.
   *(Pode estar dentro de um menu "Management")*

3. Clique em **"Add new secret"** (Adicionar novo segredo) para criar as 3 chaves abaixo.

---

## 📋 A LISTA DO QUE VOCÊ PRECISA CRIAR:

Você vai clicar em adicionar **3 VEZES**, uma para cada linha abaixo:

| NO CAMPO "NAME" (Nome) ESCREVA: | NO CAMPO "VALUE" (Valor) COLE: |
| :--- | :--- |
| `STRIPE_SECRET_KEY` | A chave `sk_...` que você copiou do Stripe (Passo 1). |
| `SUPABASE_SERVICE_ROLE_KEY` | A chave longa `service_role` do Supabase (Passo 2). |
| `SUPABASE_URL` | `https://ljqcnvsethddhaxvytlm.supabase.co` |

---

## 🏁 FINALIZANDO
Depois de salvar essas 3 chaves:
1. Volte no painel do **Stripe** (onde mostra os webhooks).
2. Entre no webhook que deu erro.
3. Clique no botão **"Reenviar"** no canto superior direito.
4. Seus diamantes devem cair na conta em segundos!
