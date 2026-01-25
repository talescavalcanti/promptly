'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Header } from '../../components/Header/Header';
import { Button } from '../../components/Button/Button';
import { ArrowLeft, Copy, PenLine, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from './project-detail.module.css';

import { extractVariables, fillVariables } from '../../../utils/prompt-utils';

// Note: Since Next.js 15+, params are async in layouts/pages. 
// We should use `use(params)` or handle `params` as a Promise.
export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Dynamic Variables State
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [detectedVars, setDetectedVars] = useState<string[]>([]);

    useEffect(() => {
        console.log('Project ID:', id);
        fetchProject();
    }, [id]);

    useEffect(() => {
        if (project?.generated_content) {
            const vars = extractVariables(project.generated_content);
            setDetectedVars(vars);

            // Initialize empty values for new vars (persisting existing ones if re-parsing)
            setVariables(prev => {
                const newState = { ...prev };
                vars.forEach(v => {
                    if (!newState[v]) newState[v] = '';
                });
                return newState;
            });
        }
    }, [project?.generated_content]);

    const fetchProject = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProject(data);
        } catch (error) {
            console.error('Erro ao carregar projeto:', error);
            router.push('/projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (project?.generated_content) {
            // Use filled content if variables exist, otherwise original
            const contentToCopy = detectedVars.length > 0
                ? fillVariables(project.generated_content, variables)
                : project.generated_content;

            navigator.clipboard.writeText(contentToCopy);
            alert('Prompt copiado para a área de transferência!');
        }
    };

    const handleEdit = () => {
        if (project?.inputs) {
            // Save inputs to localStorage to be picked up by dashboard
            localStorage.setItem('promptly_draft', JSON.stringify({
                ...project.inputs,
                promptMode: project.inputs.promptMode || 'mvp'
            }));
            router.push('/dashboard');
        }
    };

    const handleRegenerate = async () => {
        if (!project?.inputs || loading) return;

        const confirmRegen = window.confirm("Isso irá gerar uma nova versão e substituir o conteúdo atual. Deseja continuar?");
        if (!confirmRegen) return;

        setLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...project.inputs,
                    promptMode: project.inputs.promptMode || 'mvp'
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(`Erro: ${data.error || 'Falha ao regenerar.'}`);
            } else {
                // Update local state and ideally refetch to sync with DB if API updates DB (it does)
                setProject((prev: any) => ({ ...prev, generated_content: data.result }));
                alert("Conteúdo regenerado com sucesso!");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    const handleVariableChange = (key: string, value: string) => {
        setVariables(prev => ({ ...prev, [key]: value }));
    };

    if (loading) return <div className={styles.loading}>Carregando...</div>;
    if (!project) return null;

    return (
        <div className={styles.page}>
            <main className={styles.container}>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className={styles.backBtn}
                >
                    <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Voltar
                </Button>

                <div className={styles.header}>
                    <h1 className={styles.title}>{project.title}</h1>
                    <div className={styles.tags}>
                        {project.inputs?.appName && (
                            <span className={styles.tag}>
                                {project.inputs.appName}
                            </span>
                        )}
                        {project.inputs?.appType && (
                            <span className={styles.tag}>
                                {project.inputs.appType}
                            </span>
                        )}
                        <span className={`${styles.tag} ${styles.tagOrange}`}>
                            {project.inputs?.promptMode || 'Geral'}
                        </span>
                    </div>
                </div>

                <div className={styles.layout}>

                    {/* Conteúdo Gerado */}
                    <div className={styles.contentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Prompt Gerado</h2>
                            <Button variant="ghost" onClick={handleCopy} title="Copiar Prompt Preenchido">
                                <Copy size={18} style={{ marginRight: detectedVars.length > 0 ? '0.5rem' : 0 }} />
                                {detectedVars.length > 0 ? 'Copiar Preenchido' : ''}
                            </Button>
                        </div>
                        <div className={styles.markdownContent}>
                            <ReactMarkdown>
                                {fillVariables(project.generated_content || '', variables)}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Sidebar de Ações e Inputs */}
                    <div className={styles.sidebar}>

                        {/* Dynamic Variables Section */}
                        {detectedVars.length > 0 && (
                            <div className={styles.card} style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
                                <h3 className={styles.cardTitle} style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    ✨ Variáveis Dinâmicas
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1rem' }}>
                                    Preencha abaixo para personalizar o prompt.
                                </p>
                                <div className={styles.inputsList}>
                                    {detectedVars.map(variable => (
                                        <div key={variable} className={styles.inputGroup}>
                                            <span className={styles.label} style={{ color: '#fff' }}>{variable}</span>
                                            <input
                                                type="text"
                                                className={styles.value} // reusing styles.value usually works if it's text-like, but might need input specific style
                                                style={{
                                                    width: '100%',
                                                    background: 'rgba(0,0,0,0.3)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    padding: '0.5rem',
                                                    borderRadius: '6px',
                                                    color: 'white',
                                                    fontSize: '0.9rem',
                                                    marginTop: '0.25rem'
                                                }}
                                                value={variables[variable] || ''}
                                                onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                placeholder={`Valor para ${variable}...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Ações</h3>
                            <div className={styles.actions}>
                                <Button
                                    variant="primary"
                                    className={styles.fullWidthBtn}
                                    onClick={handleEdit}
                                >
                                    <PenLine size={18} style={{ marginRight: '0.5rem' }} />
                                    Continuar Editando
                                </Button>
                                <Button
                                    variant="secondary"
                                    className={styles.fullWidthBtn}
                                    onClick={handleRegenerate}
                                    loading={loading}
                                >
                                    <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
                                    Regenerar
                                </Button>
                            </div>

                        </div>

                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Inputs Originais</h3>
                            <div className={styles.inputsList}>
                                <div className={styles.inputGroup}>
                                    <span className={styles.label}>Objetivo</span>
                                    <p className={styles.value}>{project.inputs?.objective}</p>
                                </div>
                                {project.inputs?.stackFrontend && (
                                    <div className={styles.inputGroup}>
                                        <span className={styles.label}>Frontend</span>
                                        <p className={styles.value}>{project.inputs.stackFrontend.join(', ')}</p>
                                    </div>
                                )}
                                {project.inputs?.database && (
                                    <div className={styles.inputGroup}>
                                        <span className={styles.label}>Database</span>
                                        <p className={styles.value}>{project.inputs.database}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
