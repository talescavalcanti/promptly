'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Header } from '../../components/Header/Header';
import { Button } from '../../components/Button/Button';
import { ArrowLeft, Copy, PenLine, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from './project-detail.module.css';

// Note: Since Next.js 15+, params are async in layouts/pages. 
// We should use `use(params)` or handle `params` as a Promise.
export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProject();
    }, [id]);

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
            navigator.clipboard.writeText(project.generated_content);
            alert('Copiado para a área de transferência!');
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
                            <Button variant="ghost" onClick={handleCopy} title="Copiar">
                                <Copy size={18} />
                            </Button>
                        </div>
                        <div className={styles.markdownContent}>
                            <ReactMarkdown>{project.generated_content}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Sidebar de Ações e Inputs */}
                    <div className={styles.sidebar}>
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
