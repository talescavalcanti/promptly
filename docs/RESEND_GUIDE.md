# Guia de Integração Resend + Supabase

Este guia detalha como configurar o **Resend** para enviar seus emails de Autenticação (Confirmação de Conta e Redefinição de Senha) e Emails Transacionais.

## Passo 1: Configurar Conta no Resend

1. Acesse [Resend.com](https://resend.com) e crie sua conta.
2. **Adicione seu Domínio**:
   - Vá em "Domains" > "Add Domain".
   - Insira seu domínio (ex: `seuapp.com`).
   - O Resend fornecerá registros DNS (DKIM, SPF, MX).
   - Adicione esses registros no seu provedor de domínio (GoDaddy, Registro.br, Vercel, etc).
   - Clique em "Verify". *Isso é crucial para evitar cair no SPAM.*
3. **Gerar API Key**:
   - Vá em "API Keys" > "Create API Key".
   - Nome: `Promptly Production`.
   - Permissão: "Full Access" ou "Sending Access".
   - **Copie e guarde esta chave!** (Começa com `re_...`).

---

## Passo 2: Conectar ao Supabase (Para Auth)

Para que o Supabase use o Resend para enviar emails de "Confirmar Email" e "Esqueci minha Senha", usaremos a integração SMTP.

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecione seu projeto **Promptly**.
3. No menu lateral, vá em **Project Settings** (ícone de engrenagem) -> **Auth**.
4. Role até a seção **SMTP Settings**.
5. Ative a opção **Enable Custom SMTP**.
6. Preencha com os dados do Resend:
   - **Sender Email**: `nao-responda@seuapp.com` (Deve ser do domínio verificado no Passo 1).
   - **Sender Name**: `Promptly`
   - **Custom SMTP Host**: `smtp.resend.com`
   - **Port Number**: `465` (SSL) ou `587` (TLS)
   - **Username**: `resend`
   - **Password**: `[SUA_API_KEY_DO_RESEND]` (Cole a chave `re_...` aqui).
   - **Minimum interval**: `60` (Padrão).

7. Clique em **Save**.

> **Teste:** Tente criar uma nova conta ou pedir redefinição de senha no seu app. O email chegará via Resend!

---

## Passo 3: Configurar Código (Para Emails Customizados)

Se você quiser enviar emails manuais (ex: "Bem-vindo", "Fatura Gerada") via código:

1. Adicione a chave no arquivo `.env.local`:
   ```bash
   RESEND_API_KEY=re_123456...
   ```

2. O cliente já foi configurado em `src/lib/resend.ts`:
   ```typescript
   import { Resend } from 'resend';
   export const resend = new Resend(process.env.RESEND_API_KEY);
   ```

3. Exemplo de uso em uma API Route (`src/app/api/send-email/route.ts`):
   ```typescript
   import { resend } from '@/lib/resend';
   import { NextResponse } from 'next/server';

   export async function POST() {
     try {
       const data = await resend.emails.send({
         from: 'Promptly <onboarding@resend.dev>', // Use seu domínio verificado em produção
         to: ['usuario@email.com'],
         subject: 'Bem-vindo ao Promptly!',
         html: '<h1>Olá!</h1><p>Obrigado por se cadastrar.</p>'
       });

       return NextResponse.json(data);
     } catch (error) {
       return NextResponse.json({ error });
     }
   }
   ```

---

## Dica Pro: Templates de Email

Para emails bonitos, recomendamos usar **React Email**.
O Resend tem integração nativa onde você escreve o email como um componente React.

1. Instale: `npm install @react-email/components`
2. Crie seus templates em uma pasta `emails/`.

---

## ⚠️ Solução de Erros Comuns

### Erro: "You can only send testing emails to your own email address"

Este é o erro **mais comum**. Acontece porque você ainda não verificou seu domínio.

**Como resolver (Opção 1 - Produção / Recomendada):**
1. Vá em [Resend Domains](https://resend.com/domains).
2. Adicione seu site (ex: `promptly.app`).
   > **Aviso Importante:** O Resend **NÃO ACEITA** domínios gratuitos como `vercel.app`, `netlify.app` ou `herokuapp.com`. Você precisa comprar um domínio próprio (ex: `seusite.com.br`) em sites como GoDaddy, Registro.br ou Namecheap.
3. O Resend vai te dar 3 registros DNS (Tipo TXT e MX).
4. Entre no **Registro.br**, **GoDaddy**, **Vercel** ou onde comprou seu domínio.
5. Crie esses registros lá.
6. Volte no Resend e clique em **Verify**.
7. **Importante:** Assim que verificar, altere o email de envio no arquivo `src/app/api/emails/welcome/route.ts`:
   - De: `onboarding@resend.dev`
   - Para: `nao-responda@promptly.app` (ou o domínio que você verificou).

**Como resolver (Opção 2 - Apenas Teste Rápido):**
Enquanto você **não** verifica o domínio, o Resend só permite enviar emails para **o mesmo email** que você usou para criar a conta.
- Se sua conta Resend é `taless...006@gmail.com`, você SÓ pode fazer cadastro no app usando `taless...006@gmail.com`.
- Se tentar usar `teste@gmail.com`, vai dar erro.
