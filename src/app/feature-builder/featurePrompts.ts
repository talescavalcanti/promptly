// Feature Builder - Prompt Generation based on APEX Agent
import { FeatureBuilderState } from './page';

const CONTEXT_FOCUS: Record<string, string> = {
    frontend: 'UX, estados de loading, feedback visual, validação client-side, acessibilidade',
    backend: 'Contratos de API, idempotência, versionamento, rate limiting, autenticação',
    database: 'Migrations, índices, constraints, transações, integridade referencial',
    integration: 'Retry com backoff, circuit breaker, fallback, timeout, health checks',
    auth: 'Segurança, tokens JWT, refresh tokens, sessões, proteção contra CSRF',
};

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
    'Lovable': 'Gere código otimizado para a plataforma Lovable. Use componentes React com TypeScript e Tailwind CSS.',
    'Google AI Studio': 'Formate a resposta como prompt estruturado para ser usado no Google AI Studio.',
    'Vercel': 'Otimize para deploy na Vercel com Next.js App Router e Edge Functions quando apropriado.',
    'Replit': 'Gere código compatível com Replit, incluindo instruções de setup no README.',
};

export function generateFeaturePrompt(state: FeatureBuilderState): string {
    const contextFocus = CONTEXT_FOCUS[state.context] || 'Foco geral na qualidade e robustez.';
    const platformInstr = PLATFORM_INSTRUCTIONS[state.targetPlatform] || '';

    const robustnessInstructions = {
        fast: 'Priorize velocidade de desenvolvimento e simplicidade (MVP).',
        secure: 'Priorize segurança e tratativa de erros robusta.',
        bulletproof: 'Priorize arquitetura escalável, cobertura de testes total e tolerância a falhas.',
    };

    const testInstruction = state.includeTests
        ? 'Inclua testes unitários e de integração abrangentes.'
        : 'Inclua apenas testes básicos de sanidade.';

    return `# 🔧 SOLICITAÇÃO DE IMPLEMENTAÇÃO DE FEATURE

${platformInstr}

---

## 📋 ESPECIFICAÇÃO DA FEATURE

**Nome da Feature:** ${state.featureName}
**Contexto:** ${state.context.toUpperCase()}
**Foco Principal:** ${contextFocus}
**Nível de Robustez:** ${state.robustness.toUpperCase()}

---

## 🎯 DESCRIÇÃO E OBJETIVO

${state.description}

---

## 🏗️ INSTRUÇÕES PARA O AGENTE

Com base na descrição acima, por favor gere uma especificação técnica completa e a implementação seguindo estas diretrizes:

### 1. Análise e Requisitos
- Identifique os inputs necessários e seus tipos.
- Identifique as regras de negócio implícitas na descrição.
- Identifique dependências ou integrações necessárias.

### 2. Tratamento de Casos
- Mapeie e trate Edge Cases relevantes (valores nulos, limites, erros de rede).
- ${robustnessInstructions[state.robustness]}

### 3. Segurança e Qualidade
- Aplique práticas de segurança adequadas ao contexto ${state.context}.
- Implemente logs e observabilidade onde necessário.

### 4. Testes
- ${testInstruction}

---

## 📦 FORMATO DE ENTREGA ESPERADO

Por favor, forneça:
1.  **Resumo da Análise**: Entendimento do problema e decisões tomadas.
2.  **Especificação Técnica**: Interfaces, contratos e validações.
3.  **Implementação**: Código completo, bem tipado e documentado.
4.  **Testes**: Código dos testes solicitados.

---

## 🚫 REGRAS GERAIS

1.  Código limpo e moderno.
2.  Tipagem explícita (sem 'any').
3.  Tratamento de erros explícito.
`;
}
