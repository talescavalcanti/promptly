/**
 * SaaS Builder Prompt V4 - PRD Format (Clean Output)
 * 
 * Este template gera um PRD (Product Requirements Document) limpo e profissional,
 * sem o cabeçalho verboso "VOCÊ É O ULTIMATE...".
 * 
 * Baseado nos agents: saas-builder-agent.md, saas-builder-2.0.md, saas-builder-3.0.md
 */

export interface SaasBuilderInput {
    appName: string;
    niche: string;
    targetAudience: string;
    features: string[];
    visualStyle: string;
    primaryColor: string;
    secondaryColor: string;
    typography: string;
    typographyWeight: number | string;
    targetPlatform: string;
    // Monetization
    monetization: {
        enabled: boolean;
        model: 'subscription' | 'one-time' | 'freemium' | 'usage-based';
        provider: 'stripe' | 'asaas' | 'mercadopago' | 'demo';
        plans: string[];
        trialDays: number;
    };
}

/**
 * Template para o Gemini gerar o PRD final.
 * O Gemini preencherá os campos baseado nos inputs do usuário.
 */
export const PRD_GENERATION_SYSTEM_PROMPT = `You are an Elite Product Architect and Senior Prompt Engineer.

YOUR MISSION:
Generate a PRODUCTION-READY PRD (Product Requirements Document) for a SaaS application.
The output must be a complete, technical specification that an AI coding assistant (Lovable, Bolt, v0) can execute in ONE prompt.

CRITICAL RULES:
1. Output ONLY the PRD document - no explanations, no commentary
2. The PRD must start directly with the project name (no preamble like "You are...")
3. Use Markdown formatting for readability
4. Be EXHAUSTIVE in technical details (schema, RLS, components, routes)
5. NEVER use placeholders like "[Insert here]" - YOU fill in everything
6. Respect ALL user inputs exactly as provided (colors, fonts, features)
7. The design must NEVER look like "vibe coding" - it must be premium and sophisticated

OUTPUT FORMAT:
The PRD should follow this structure:
# {App Name} — Full-Stack SaaS Specification

## Executive Summary
## Technical Architecture  
## Database Schema & RLS
## UI/UX Design System
## Feature Specification
## Routes & Navigation
## Implementation Checklist
`;

/**
 * Template PRD que será preenchido pelo Gemini
 */
export const PRD_TEMPLATE = `# {{APP_NAME}} — Full-Stack SaaS Specification

> **Platform:** {{PLATFORM}} | **Stack:** React + Vite + Tailwind + TypeScript + Supabase

---

## 1. Executive Summary

| Field | Value |
|-------|-------|
| **App Name** | {{APP_NAME}} |
| **Market Niche** | {{NICHE}} |
| **Target Audience** | {{TARGET_AUDIENCE}} |
| **Core Value Proposition** | [Infer: What problem does this solve?] |
| **Key Success Metric** | [Infer: How do we measure success?] |

---

## 2. Technical Architecture

### Stack (Mandatory)
- **Frontend:** React 18+ with Vite, TypeScript (strict mode), Tailwind CSS
- **Backend:** Supabase (Auth, Postgres, RLS, Storage)
- **State Management:** TanStack Query + Context API
- **UI Components:** Custom Design System (no default Shadcn look)

### Project Structure
\`\`\`
src/
├── components/          # Reusable UI components
│   ├── ui/             # Primitives (Button, Input, Card)
│   └── layout/         # LayoutShell, Sidebar, Topbar
├── features/           # Feature modules
│   ├── auth/
│   ├── dashboard/
│   ├── [core-entity]/
│   └── settings/
├── lib/                # Utilities
│   ├── supabase.ts
│   └── utils.ts
├── types/              # TypeScript types
└── styles/             # Global CSS, tokens
\`\`\`

---

## 3. Database Schema & Security

### Tables

#### \`profiles\`
\`\`\`sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### \`[core_entity]\` — [Infer name from niche]
\`\`\`sql
CREATE TABLE [core_entity] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for updated_at
CREATE TRIGGER update_[core_entity]_updated_at
  BEFORE UPDATE ON [core_entity]
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`\`\`

### Row Level Security (RLS) — MANDATORY
\`\`\`sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE [core_entity] ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users CRUD own [core_entity]" ON [core_entity]
  FOR ALL USING (auth.uid() = user_id);
\`\`\`

---

## 4. UI/UX Design System

### Visual Identity
| Token | Value |
|-------|-------|
| **Style** | {{VISUAL_STYLE}} |
| **Primary Color** | {{PRIMARY_COLOR}} |
| **Secondary Color** | {{SECONDARY_COLOR}} |
| **Typography** | {{TYPOGRAPHY}} (Weight: {{TYPOGRAPHY_WEIGHT}}) |

### Design Tokens (CSS Variables)
\`\`\`css
:root {
  /* Colors */
  --color-primary: {{PRIMARY_COLOR}};
  --color-secondary: {{SECONDARY_COLOR}};
  --color-bg: [infer from style];
  --color-surface: [infer from style];
  --color-text: [infer contrast];
  --color-text-muted: [infer];
  --color-border: [infer];
  
  /* Typography */
  --font-family: '{{TYPOGRAPHY}}', sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: {{TYPOGRAPHY_WEIGHT}};
  
  /* Spacing (4px scale) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  
  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
}
\`\`\`

### Anti Vibe-Coding Rules
1. **No generic Shadcn look** — Customize every component
2. **Consistent icon style** — Use only Lucide React, outline style
3. **Purposeful animations** — 150-220ms transitions, no flashy effects
4. **Premium density** — Proper spacing, never cramped or too sparse
5. **States everywhere** — Loading skeletons, empty states with CTA, error with retry

---

## 5. Feature Specification

### Core Features
{{FEATURES_LIST}}

### Mandatory Modules

#### Authentication (Supabase Auth)
- Email/password signup with validation
- Login with "Remember me"
- Password reset flow (email link)
- Protected routes middleware
- Session persistence

#### Dashboard (/app)
- KPI cards: Total items, Active, Last 7 days
- Recent items list with quick actions
- "Create New" CTA button

#### CRUD — [Core Entity]
| Operation | Requirements |
|-----------|--------------|
| **List** | Search, status filter, pagination (10/page), empty state |
| **Create** | Validation (title: 3-80 chars), success toast |
| **Detail** | Full data view, edit/delete actions |
| **Update** | Same validation, optimistic updates |
| **Delete** | Confirmation modal, cascade handling |

#### Settings (/settings)
- User preferences (theme, notifications mock)
- Export user data (JSON download)
- Danger zone: Delete account (confirm)

---

## 6. Routes & Navigation

| Route | Access | Description |
|-------|--------|-------------|
| \`/\` | Public | Landing page |
| \`/auth\` | Public | Login/Signup |
| \`/auth/reset\` | Public | Password reset |
| \`/app\` | Private | Dashboard |
| \`/app/[entity]\` | Private | Entity list |
| \`/app/[entity]/new\` | Private | Create form |
| \`/app/[entity]/[id]\` | Private | Detail view |
| \`/settings\` | Private | User settings |
| \`/admin\` | Admin | Admin panel (if enabled) |

### Navigation Structure
- **Sidebar** (desktop): Logo, nav links, user menu
- **Bottom nav** (mobile): 4-5 key actions
- **Topbar**: Breadcrumbs, search, notifications

---

## 7. Landing Page (Public)

### Sections
1. **Hero**: Headline + Sub + 2 CTAs + Trust badges
2. **How It Works**: 3 steps with icons
3. **Features**: 6 cards with benefits
4. **Social Proof**: 3 testimonials + metrics
5. **FAQ**: 4-6 questions
6. **Footer**: Links, legal, contact

### Copy Guidelines
- Headline: Direct, benefit-focused, no buzzwords
- CTA: Action verb + outcome (e.g., "Start Free Trial")
- Tone: Professional, confident, specific to {{NICHE}}

---

## 8. Monetization & Billing

{{MONETIZATION_SECTION}}

---

## 9. Implementation Checklist

- [ ] Project setup (Vite + TypeScript + Tailwind)
- [ ] Design tokens CSS file
- [ ] Supabase client configuration
- [ ] Auth flows (signup, login, reset, logout)
- [ ] Protected route middleware
- [ ] Layout components (Shell, Sidebar, Topbar)
- [ ] Core UI components (Button, Input, Card, Modal, Toast)
- [ ] Database tables + RLS policies (supabase.sql)
- [ ] Dashboard with real data
- [ ] Full CRUD for core entity
- [ ] Settings page
- [ ] Landing page with all sections
- [ ] Loading states (skeletons)
- [ ] Empty states with CTAs
- [ ] Error handling with toasts
- [ ] Mobile responsive (all screens)
- [ ] Payment integration (if enabled)
- [ ] README with setup instructions

---

**EXECUTE NOW**: Implement the complete SaaS following this specification. Do not ask questions.
`;

/**
 * Gera o prompt final que será enviado ao Gemini
 */
export function generateSaasV4Prompt(input: SaasBuilderInput): { systemPrompt: string; userPrompt: string } {
    let prd = PRD_TEMPLATE;

    // Generate monetization section
    const generateMonetizationSection = (): string => {
        if (!input.monetization?.enabled) {
            return '> **Monetization:** Not configured for MVP. Implement billing in Phase 2.';
        }

        const providerConfigs: Record<string, { name: string; docs: string; features: string }> = {
            'stripe': {
                name: 'Stripe',
                docs: 'https://stripe.com/docs',
                features: 'Subscriptions, One-time payments, Customer Portal, Webhooks'
            },
            'asaas': {
                name: 'Asaas',
                docs: 'https://docs.asaas.com',
                features: 'PIX, Boleto, Credit Card, Subscriptions (Brazil)'
            },
            'mercadopago': {
                name: 'Mercado Pago',
                docs: 'https://www.mercadopago.com.br/developers',
                features: 'PIX, Boleto, Credit Card, Checkout Pro (LATAM)'
            },
            'demo': {
                name: 'Demo Mode',
                docs: '',
                features: 'Mock payments for testing only'
            }
        };

        const provider = providerConfigs[input.monetization.provider] || providerConfigs['demo'];
        const modelLabels: Record<string, string> = {
            'subscription': 'Recurring Subscription',
            'one-time': 'One-time Payment',
            'freemium': 'Freemium + Premium',
            'usage-based': 'Usage-based Billing'
        };

        return `### Billing Model: ${modelLabels[input.monetization.model] || 'Subscription'}

| Config | Value |
|--------|-------|
| **Provider** | ${provider.name} |
| **Model** | ${modelLabels[input.monetization.model]} |
| **Trial Period** | ${input.monetization.trialDays || 0} days |
| **Plans** | ${input.monetization.plans?.join(', ') || 'Free, Pro, Enterprise'} |

### Integration Requirements

#### Database Tables
\`\`\`sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('trialing', 'active', 'canceled', 'past_due')) DEFAULT 'trialing',
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  provider_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### API Routes (Edge Functions or API Routes)
- \`POST /api/billing/checkout\` — Create checkout session
- \`POST /api/billing/webhook\` — Handle provider webhooks
- \`GET /api/billing/subscription\` — Get current subscription
- \`POST /api/billing/cancel\` — Cancel subscription

#### UI Components
- **Pricing Page** — Plan comparison cards with CTAs
- **Billing Settings** — Manage subscription, payment methods
- **Upgrade Modal** — In-app upgrade prompt
- **Paywall** — Feature gating for free users${provider.docs ? `\n\n> **Docs:** ${provider.docs}` : ''}`;
    };

    // Substitui placeholders
    const replacements: Record<string, string> = {
        'APP_NAME': input.appName || 'New SaaS App',
        'PLATFORM': input.targetPlatform || 'Lovable',
        'NICHE': input.niche || '[Infer best niche from app name]',
        'TARGET_AUDIENCE': input.targetAudience || '[Infer ideal customer persona]',
        'VISUAL_STYLE': input.visualStyle || 'Modern & Clean',
        'PRIMARY_COLOR': input.primaryColor || '#3b82f6',
        'SECONDARY_COLOR': input.secondaryColor || '#ffffff',
        'TYPOGRAPHY': input.typography || 'Inter',
        'TYPOGRAPHY_WEIGHT': String(input.typographyWeight || 600),
        'FEATURES_LIST': input.features?.length > 0
            ? input.features.map(f => `- ${f}`).join('\n')
            : '- Auth\n- Dashboard\n- CRUD Core Entity\n- Settings\n- Admin (optional)',
        'MONETIZATION_SECTION': generateMonetizationSection(),
    };

    for (const [key, value] of Object.entries(replacements)) {
        prd = prd.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const monetizationInfo = input.monetization?.enabled
        ? `- Monetization: ${input.monetization.model} via ${input.monetization.provider} (${input.monetization.trialDays} day trial)\n- Plans: ${input.monetization.plans?.join(', ') || 'Free, Pro, Enterprise'}`
        : '- Monetization: Not enabled';

    const userPrompt = `
Generate a complete PRD for this SaaS project. Fill in ALL bracketed fields [like this] with intelligent inferences.

USER INPUTS:
- App Name: ${input.appName}
- Platform: ${input.targetPlatform}
- Niche: ${input.niche || 'Infer from name'}
- Target Audience: ${input.targetAudience || 'Infer ideal persona'}
- Features: ${input.features?.join(', ') || 'Infer MVP features'}
- Visual Style: ${input.visualStyle}
- Primary Color: ${input.primaryColor}
- Secondary Color: ${input.secondaryColor}
- Typography: ${input.typography} (Weight: ${input.typographyWeight})
${monetizationInfo}

TEMPLATE TO FILL:
${prd}

OUTPUT: Return ONLY the filled PRD document, starting with "# ${input.appName}". No explanations.
`;

    return {
        systemPrompt: PRD_GENERATION_SYSTEM_PROMPT,
        userPrompt
    };
}

