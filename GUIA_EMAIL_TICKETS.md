# 📧 Configuração de Email para Tickets - EmailJS

## Passo a Passo (5 minutos)

### 1. Criar conta no EmailJS
Acesse: https://www.emailjs.com/ e crie uma conta gratuita

### 2. Conectar seu Email
1. Vá em **Email Services** → **Add New Service**
2. Escolha **Gmail** (ou outro)
3. Conecte sua conta `fitquestplay@gmail.com`
4. Nomeie o serviço como: `service_tasklegends`
5. Copie o **Service ID** (será algo como `service_abc123`)

### 3. Criar Template
1. Vá em **Email Templates** → **Create New Template**
2. Nomeie como: `template_support`
3. Configure assim:

**Subject:**
```
[TaskLegends] {{ticket_type}}: {{subject}}
```

**Content (HTML):**
```html
<h2>🎮 Novo Ticket de Suporte</h2>

<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td><strong>ID:</strong></td>
    <td>{{ticket_id}}</td>
  </tr>
  <tr>
    <td><strong>Tipo:</strong></td>
    <td>{{ticket_type}}</td>
  </tr>
  <tr>
    <td><strong>Usuário:</strong></td>
    <td>{{from_name}} ({{from_email}})</td>
  </tr>
</table>

<h3>📝 Assunto</h3>
<p>{{subject}}</p>

<h3>📄 Descrição</h3>
<p>{{message}}</p>

<hr>
<small>
  Transaction ID: {{transaction_id}}<br>
  Reported User: {{reported_user}}<br>
  Duel ID: {{duel_id}}
</small>
```

4. Configure **To Email** como: `{{to_email}}`
5. Salve o template

### 4. Obter a Public Key
1. Vá em **Account** → **General**
2. Copie a **Public Key**

### 5. Atualizar o Código
Abra o arquivo `src/lib/emailService.ts` e substitua:

```typescript
const EMAILJS_SERVICE_ID = 'service_tasklegends';  // Seu Service ID
const EMAILJS_TEMPLATE_ID = 'template_support';    // Seu Template ID  
const EMAILJS_PUBLIC_KEY = 'SUA_PUBLIC_KEY_AQUI';  // Sua Public Key
```

### 6. Deploy
```bash
.\DEPLOY_GCLOUD.bat
```

---

## ✅ Pronto!
Agora quando alguém criar um ticket, você receberá um email em `fitquestplay@gmail.com`!

## 📊 Limite Gratuito
- **200 emails/mês** no plano Free
- Para mais, é $9/mês para 1000 emails
