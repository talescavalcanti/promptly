'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Header } from '../../components/Header/Header';
import { Button } from '../../components/Button/Button';
import { ArrowLeft, Copy, PenLine, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';


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

    if (loading) return <div style={{ background: '#000', minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
    if (!project) return null;

    return (
        <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
            <Header />
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    style={{ marginBottom: '2rem', paddingLeft: 0, color: 'rgba(255,255,255,0.6)' }}
                >
                    <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Voltar
                </Button>

                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>{project.title}</h1>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {project.inputs?.appName && (
                            <span style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                                {project.inputs.appName}
                            </span>
                        )}
                        {project.inputs?.appType && (
                            <span style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                                {project.inputs.appType}
                            </span>
                        )}
                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', background: 'rgba(245, 165, 36, 0.15)', color: '#f5a524', fontSize: '0.9rem' }}>
                            {project.inputs?.promptMode || 'Geral'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem' }}>

                    {/* Conteúdo Gerado */}
                    <div style={{
                        background: 'rgba(25,25,25,0.5)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        padding: '2rem',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Prompt Gerado</h2>
                            <Button variant="ghost" onClick={handleCopy} title="Copiar">
                                <Copy size={18} />
                            </Button>
                        </div>
                        <div className="markdown-content" style={{ lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                            <ReactMarkdown>{project.generated_content}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Sidebar de Ações e Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>Ações</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
                                    <PenLine size={18} style={{ marginRight: '0.5rem' }} />
                                    Continuar Editando
                                </Button>
                                <Button variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>
                                    <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
                                    Regenerar
                                </Button>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>Inputs Originais</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.2rem' }}>Objetivo</span>
                                    <p style={{ fontSize: '0.95rem' }}>{project.inputs?.objective}</p>
                                </div>
                                {project.inputs?.stackFrontend && (
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.2rem' }}>Frontend</span>
                                        <p style={{ fontSize: '0.95rem' }}>{project.inputs.stackFrontend.join(', ')}</p>
                                    </div>
                                )}
                                {project.inputs?.database && (
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.2rem' }}>Database</span>
                                        <p style={{ fontSize: '0.95rem' }}>{project.inputs.database}</p>
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
