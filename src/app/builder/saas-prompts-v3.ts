export interface SaasBuilderState {
  identity: {
    name: string;
    niche: string;
    oneLiner: string;
    tone: string;
    visualMood: string;
  };
  audience: {
    persona: string;
    pain: string;
    keyAction: string;
    successMetric: string;
  };

  scope: {
    featuresRequired: string[];
    featuresOut: string[];
    routes: string[];
    adminEnabled: boolean;
    payments: {
      enabled: boolean;
      provider: 'demo' | 'stripe' | 'mercadopago' | 'other';
      providerName?: string;
    };
    storage: boolean;
  };
  branding: {
    font: string;
    fontWeight: string;
    colors: {
      primary: string;
      bg: string;
      text: string;
      border: string;
    };
  };
}

export const SAAS_BUILDER_V3_TEMPLATE = `# PRODUCT REQUIREMENTS DOCUMENT (PRD) — ONE-PROMPT STARTUP
Project: {{APP_NAME}}
Type: Premium Full-Stack SaaS (MVP)
Stack: React (Vite+Tailwind) + Supabase (Auth+DB+RLS)

[MISSION]
Build a production-ready {{NICHE}} SaaS platform where users can "{{KEY_ACTION}}".
The goal is to solve "{{PAIN}}" for "{{PERSONA}}", measuring success by "{{SUCCESS_METRIC}}".

[EXECUTIVE SUMMARY]
- Name: {{APP_NAME}}
- Concept (One-Liner): {{ONE_LINER}}
- Visual Identity: {{VISUAL_MOOD}}
- Tone of Voice: {{TONE}}

[TECHNICAL CONSTRAINTS & ARCHITECTURE]
1. Framework: React + Vite + TypeScript (Strict)
2. Styling: Tailwind CSS (Mobile First, Premium UI) — NO "generic coding vibes".
3. Backend: Supabase (Postgres, Auth, Edge Functions if needed).
4. Security: Row Level Security (RLS) is MANDATORY for all tables.
5. Deployment: Ready for Netlify/Vercel.

[CORE FEATURE SET (MVP SCOPE)]
Implement the following modules with production-quality UX (loading states, error handling, toasts):
{{FEATURES_REQUIRED}}

(Explicitly Excluded: {{FEATURES_OUT}})

[DATA MODEL (INFERRED)]
Based on the niche "{{NICHE}}", architect a normalized Postgres schema:
- **Core Entity**: The primary unit of value (e.g., Project, Lead, Asset).
- **Sub-Entities**: Related data to support the core flow.
- **User Profile**: Extended profile table linked to auth.users.
*Requirement: Generate \`supabase.sql\` with creating tables, RLS policies, and triggers.*

[USER EXPERIENCE & NAVIGATION]
- **Public**: High-conversion Landing Page (Hero, Features, Pricing, Testimonials, FAQ).
- **Auth**: Signup/Login flows (Supabase Auth).
- **App Layout**: Premium Dashboard with Sidebar/Drawer.
- **Key Flows**: 
   1. User creates an account.
   2. User accesses Dashboard.
   3. User performs "{{KEY_ACTION}}".
   4. User manages settings/billing (if enabled).

[ROUTING STRUCTURE]
Required Paths: {{ROUTES_REQUIRED}}
(Admin Panel: {{ADMIN_ENABLED}})

[INTEGRATION SPECS]
- Payments: {{PAYMENTS_ENABLED}} (Provider: {{PAYMENTS_PROVIDER}} {{PAYMENTS_PROVIDER_NAME}})
- Storage: {{STORAGE_ENABLED}} (For uploads)

[DESIGN SYSTEM & BRANDING]
- Typography: {{FONT}} (Primary Weight: {{FONT_WEIGHT}})
- Color Palette:
  - Primary: {{COLOR_PRIMARY}}
  - Background: {{COLOR_BG}}
  - Text: {{COLOR_TEXT}}
  - Border: {{COLOR_BORDER}}
*Directive: Use a sophisticated design system with consistent tokens (spacing, radius, shadows). Avoid generic Bootstrap/Material looks.*

[DELIVERABLES CHECKLIST]
1. Complete Source Code (React+Vite+Tailwind).
2. \`supabase.sql\` (Schema, RLS, Seed Data).
3. \`README.md\` (Setup, Environment Variables, Deployment Guide).
4. Project Decisions Log (in /settings).

[EXECUTION INSTRUCTIONS]
Act as a Senior Architect. Analyze the requirements above and generate the COMPLETE codebase in a single pass. 
Do not ask follow-up questions. Infer missing details with "Best Practice" defaults for the {{NICHE}} market.
Start by setting up the project structure, then the database, then the UI components, and finally the pages.`;

export function generateSaasV3Prompt(state: SaasBuilderState): string {
  let prompt = SAAS_BUILDER_V3_TEMPLATE;

  // Helpers
  const replace = (key: string, value: string) => {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value || '[Não informado - Inferir]');
  };

  // Identity
  replace('APP_NAME', state.identity.name);
  replace('NICHE', state.identity.niche);
  replace('ONE_LINER', state.identity.oneLiner);
  replace('TONE', state.identity.tone);
  replace('VISUAL_MOOD', state.identity.visualMood);

  // Audience
  replace('PERSONA', state.audience.persona);
  replace('PAIN', state.audience.pain);
  replace('KEY_ACTION', state.audience.keyAction);
  replace('SUCCESS_METRIC', state.audience.successMetric);

  // Scope
  replace('FEATURES_REQUIRED', state.scope.featuresRequired.join(', '));
  replace('FEATURES_OUT', state.scope.featuresOut.join(', '));

  // Routes
  replace('ROUTES_REQUIRED', ['/', '/auth', '/app', '/settings', '/app/items', '/app/items/:id', ...state.scope.routes].join(', '));
  replace('ADMIN_ENABLED', state.scope.adminEnabled ? 'true' : 'false');
  replace('ROUTES_EXTRA', state.scope.routes.join(', '));

  // Integrations
  replace('PAYMENTS_ENABLED', state.scope.payments.enabled ? 'true' : 'false');
  replace('PAYMENTS_PROVIDER', state.scope.payments.provider);
  replace('PAYMENTS_PROVIDER_NAME', state.scope.payments.providerName || '');
  replace('STORAGE_ENABLED', state.scope.storage ? 'true' : 'false');

  // Branding
  replace('FONT', state.branding.font);
  replace('FONT_WEIGHT', state.branding.fontWeight || 'Regular');
  replace('COLOR_PRIMARY', state.branding.colors.primary);
  replace('COLOR_BG', state.branding.colors.bg);
  replace('COLOR_TEXT', state.branding.colors.text);
  replace('COLOR_BORDER', state.branding.colors.border);

  return prompt;
}
