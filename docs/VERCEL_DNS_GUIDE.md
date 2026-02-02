# Configurando DNS do Resend na Vercel

Se você comprou ou gerencia seu domínio pela Vercel, siga estes passos para verificar seu domínio no Resend.

## 1. Acesse o Painel de Domínios da Vercel

1. Vá para o [Dashboard da Vercel](https://vercel.com/dashboard).
2. Clique na aba **"Domains"** (no topo, ou dentro do projeto em Settings > Domains).
3. Encontre o domínio que você quer configurar (ex: `iapromptly.com`) e clique em **"Edit"** ou nos três pontinhos -> **"View DNS Records"**.

## 2. Adicione os Registros (Records)

Você precisa copiar EXATAMENTE o que o Resend mostra na tela (imagem que você mandou) e colar na Vercel.

### Registro 1: DKIM (O mais importante)
- **Type:** `TXT`
- **Name:** `resend._domainkey`
  *(Nota: Na Vercel, se não funcionar apenas `resend._domainkey`, tente `resend._domainkey.seudominio.com`, mas geralmente só a primeira parte basta)*.
- **Value:** `p=MIGfMA0GCSqGSIb3DQE...` (Copie o valor INTEIRO que começa com `p=` do Resend).
- Clique em **Add**.

### Registro 2: SPF
- **Type:** `TXT`
- **Name:** `send` (ou o subdomínio que você escolheu no Resend).
- **Value:** `v=spf1 include:amazonses.com ~all` (Copie do Resend).
- Clique em **Add**.

### Registro 3: MX (Para receber erros de volta)
- **Type:** `MX`
- **Name:** `send`
- **Value:** `feedback-smtp.sa-east-1.amazonses.com` (Copie o valor do Resend).
- **Priority:** `10`
- Clique em **Add**.

> **Dica:** Se a Vercel pedir "Priority" separado, coloque 10. Se pedir junto com o valor, coloque `10 feedback-smtp...`.

---

## 3. Verificação

1. Volte para o painel do **Resend**.
2. Clique no botão **"Verify DNS Records"** (pode estar no topo ou embaixo).
3. O status deve mudar de "Pending" para "Verified" (Verde).
   *   *Isso pode levar de 1 minuto a 24 horas, mas na Vercel costuma ser rápido.*

## 4. Teste Final

Assim que ficar **Verde**:
1. Volte ao seu código.
2. Mude o remetente no arquivo `route.ts` para: `onboarding@send.iapromptly.com` (ou o domínio que você configurou).
3. Teste o cadastro novamente!
