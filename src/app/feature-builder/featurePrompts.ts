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
    const edgeCasesSelected = Object.entries(state.edgeCases)
        .filter(([_, v]) => v)
        .map(([k]) => {
            const labels: Record<string, string> = {
                nullValues: 'Valores nulos, undefined, NaN, strings/arrays/objetos vazios',
                wrongTypes: 'Tipos incorretos, formatos inválidos, encoding errado',
                sizeLimits: 'Limites de tamanho, valores extremos (1 char a 10MB)',
                concurrency: 'Operações simultâneas, race conditions, deadlocks',
                timeouts: 'Timeouts, falhas de conexão, serviços indisponíveis',
            };
            return `- ${labels[k] || k}`;
        })
        .join('\n');

    const securitySelected = Object.entries(state.security)
        .filter(([_, v]) => v)
        .map(([k]) => {
            const labels: Record<string, string> = {
                xss: 'Sanitização contra XSS em todo input de texto',
                sqlInjection: 'Parametrização de queries (nunca concatenar SQL)',
                permissions: 'Verificar permissões específicas para cada ação',
                rateLimiting: 'Rate limiting por usuário e IP',
                audit: 'Audit trail para ações críticas',
            };
            return `- ${labels[k] || k}`;
        })
        .join('\n');

    const testTypesSelected = Object.entries(state.testTypes)
        .filter(([_, v]) => v)
        .map(([k]) => {
            const labels: Record<string, string> = {
                happyPath: 'Happy path com dados válidos típicos',
                validations: 'Cada validação (input válido e inválido)',
                businessRules: 'Cada regra de negócio isoladamente',
                edgeCases: 'Cada edge-case mapeado',
                errors: 'Cada cenário de erro',
            };
            return `- ${labels[k] || k}`;
        })
        .join('\n');

    const observabilitySelected = Object.entries(state.observability)
        .filter(([_, v]) => v)
        .map(([k]) => {
            const labels: Record<string, string> = {
                logging: 'Logging estruturado (operation_started, decision_made, operation_succeeded, operation_failed)',
                metrics: 'Métricas (Counter de execuções/erros, Histogram de duração, Gauge de operações em andamento)',
                tracing: 'Tracing distribuído com spans e propagação de contexto',
            };
            return `- ${labels[k] || k}`;
        })
        .join('\n');

    const coverageLabel: Record<string, string> = {
        basic: '70% das branches principais',
        complete: '90% das branches de código',
        exhaustive: '100% das branches de código, 100% dos cenários de erro, 100% das validações',
    };

    const consumerLabels: Record<string, string> = {
        user: 'Usuário final via interface',
        api: 'API externa (third-party)',
        internal: 'Sistema interno',
        multiple: 'Múltiplos consumidores (usuário + API + sistemas)',
    };

    const inputsSection = state.inputs.length > 0
        ? state.inputs.map(i =>
            `| ${i.name} | ${i.type} | ${i.required ? 'Sim' : 'Não'} | ${i.format || '-'} |`
        ).join('\n')
        : 'A ser definido pelo agente.';

    const businessRulesSection = state.businessRules.length > 0
        ? state.businessRules.map((r, i) => `RN${String(i + 1).padStart(2, '0')}: ${r}`).join('\n')
        : 'A ser inferido pelo agente com base na descrição.';

    const dependenciesSection = state.dependencies.length > 0
        ? state.dependencies.map(d => `- ${d}`).join('\n')
        : 'Nenhuma dependência específica definida.';

    return `# 🔧 SOLICITAÇÃO DE IMPLEMENTAÇÃO DE FEATURE

${PLATFORM_INSTRUCTIONS[state.targetPlatform] || ''}

---

## 📋 ESPECIFICAÇÃO DA FEATURE

**Nome da Feature:** ${state.featureName}
**Contexto:** ${state.context.charAt(0).toUpperCase() + state.context.slice(1)}
**Foco Principal:** ${CONTEXT_FOCUS[state.context]}

---

## 🎯 ANÁLISE

### Objetivo Principal
${state.objective}

### Problema de Negócio
${state.businessProblem || 'Definir com base no objetivo.'}

### Consumidor
${consumerLabels[state.consumer]}

### Camada/Módulo/Domínio
${state.architectureLayer || 'A ser determinado pelo agente.'}

### Dependências
${dependenciesSection}

---

## 📐 ESPECIFICAÇÃO TÉCNICA

### Interface e Contrato

#### Inputs
| Campo | Tipo | Obrigatório | Formato |
|-------|------|-------------|---------|
${inputsSection}

#### Outputs Esperados
${state.outputs || 'Definir estrutura de resposta conforme padrões do contexto.'}

### Regras de Negócio
${businessRulesSection}

---

## ⚠️ EDGE CASES OBRIGATÓRIOS

Analise e trate os seguintes cenários:

${edgeCasesSelected || '- Análise básica de valores inválidos'}

---

## 🔒 REQUISITOS DE SEGURANÇA

${securitySelected || '- Validação básica de inputs'}

---

## 🧪 REQUISITOS DE TESTES

**Nível de Cobertura:** ${coverageLabel[state.testCoverage]}

### Tipos de Testes Requeridos
${testTypesSelected || '- Testes básicos de happy path'}

---

## 📊 OBSERVABILIDADE

${observabilitySelected || '- Logging básico de erros'}

---

## 📦 FORMATO DE ENTREGA ESPERADO

Sua resposta deve seguir esta estrutura:

### 1. Análise da Feature
- Resumo do entendimento da solicitação
- Premissas assumidas listadas explicitamente
- Decisões técnicas tomadas com justificativas

### 2. Especificação
- Interface completa (inputs/outputs com tipos)
- Regras de negócio enumeradas (RN01, RN02, etc)
- Tabela de cenários de erro

### 3. Implementação
- Tipos e Interfaces (código)
- Validações (código)
- Lógica Principal (código)
- Tratamento de Erros (código)

### 4. Testes
- Casos de Sucesso (código)
- Casos de Erro (código)
- Edge Cases (código)

### 5. Observabilidade
- Estrutura de logs
- Métricas a coletar

### 6. Checklist de Qualidade
- [ ] Tipagem 100% explícita
- [ ] Todas validações implementadas
- [ ] Todos edge-cases cobertos
- [ ] Tratamento de erro completo
- [ ] Testes com cobertura exigida
- [ ] Logging estruturado
- [ ] Segurança verificada
- [ ] Documentação completa

---

## 🚫 REGRAS INVIOLÁVEIS

1. NUNCA produza código sem validação de inputs
2. NUNCA ignore casos de erro - trate todos explicitamente
3. NUNCA use tipos genéricos (any) quando tipos específicos são possíveis
4. NUNCA assuma contexto - explicite todas as premissas
5. NUNCA entregue sem testes para cenários críticos
6. NUNCA deixe erros silenciosos - sempre log ou propague
7. NUNCA exponha dados sensíveis em logs ou respostas de erro
8. NUNCA implemente apenas o happy path

---

Implemente esta feature seguindo rigorosamente as especificações acima.`;
}
