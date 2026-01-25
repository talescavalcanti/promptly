import React, { useState } from 'react';
import { X, Code, Check, Lock, Zap } from 'lucide-react';
import styles from './CodeExportModal.module.css';
import { Button } from '../Button/Button';
import { PlanType, checkFeatureAccess } from '@/lib/permissions';
import { useRouter } from 'next/navigation';

interface CodeExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    promptContent: string;
    userPlan: PlanType;
}

type Tab = 'python' | 'langchain' | 'json';

export function CodeExportModal({ isOpen, onClose, promptContent, userPlan }: CodeExportModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('python');
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const hasAccess = checkFeatureAccess(userPlan, 'code_snippets');

    const handleCopy = () => {
        const code = getCodeSnippet(activeTab, promptContent);
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getCodeSnippet = (tab: Tab, content: string): string => {
        const escapedContent = content.replace(/"/g, '\\"').replace(/\n/g, '\\n');

        switch (tab) {
            case 'python':
                return `import openai

client = openai.OpenAI(api_key="YOUR_API_KEY")

response = client.chat.completions.create(
  model="gpt-4",
  messages=[
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "${escapedContent}"
    }
  ],
  temperature=0.7
)

print(response.choices[0].message.content)`;
            case 'langchain':
                return `import { PromptTemplate } from "@langchain/core/prompts";

const prompt = PromptTemplate.fromTemplate(\`
${content.replace(/`/g, '\\`')}
\`);

const formattedPrompt = await prompt.format({
    // Variables if any
});`;
            case 'json':
                return JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are a helpful assistant." },
                        { role: "user", content }
                    ]
                }, null, 2);
            default:
                return '';
        }
    };

    if (!hasAccess) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <div className={styles.header}>
                        <div className={styles.title}>
                            <Lock size={20} color="#F59E0B" />
                            Recurso Pro
                        </div>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className={styles.upsellContainer}>
                        <div className={styles.upsellIcon}>
                            <Code size={32} />
                        </div>
                        <h2 className={styles.upsellTitle}>Exporte como Código</h2>
                        <p className={styles.upsellDesc}>
                            Desenvolvedores Pro economizam horas integrando prompts diretamente em Python, LangChain e JSON.
                        </p>
                        <div className={styles.upsellList}>
                            <div className={styles.upsellItem}>
                                <Check size={16} color="#10B981" /> Snippets prontos para OpenAI SDK
                            </div>
                            <div className={styles.upsellItem}>
                                <Check size={16} color="#10B981" /> Integração com LangChain
                            </div>
                            <div className={styles.upsellItem}>
                                <Check size={16} color="#10B981" /> Formatação JSON automática
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => router.push('/pricing')}
                            style={{ maxWidth: '300px' }}
                        >
                            Fazer Upgrade por R$ 27,90 <Zap size={16} style={{ marginLeft: '0.5rem' }} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        <Code size={20} />
                        Exportar Código
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'python' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('python')}
                        >
                            Python
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'langchain' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('langchain')}
                        >
                            LangChain JS
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'json' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('json')}
                        >
                            JSON
                        </button>
                    </div>

                    <div className={styles.codeArea}>
                        <pre className={styles.pre}>
                            <code className={styles.code}>
                                {getCodeSnippet(activeTab, promptContent)}
                            </code>
                        </pre>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleCopy}>
                        {copied ? <><Check size={18} /> Copiado</> : 'Copiar Código'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
