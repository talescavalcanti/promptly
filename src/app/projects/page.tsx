'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Button } from '../components/Button/Button';
import { Plus, ArrowRight, Clock } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal/ScrollReveal';

import styles from './projects.module.css';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div className={styles.page}>
            <main className={styles.container}>
                <ScrollReveal>
                    <div className={styles.header}>
                        <div className={styles.titleSection}>
                            <h1>Meus Projetos</h1>
                            <p>Gerencie e evolua seus prompts</p>
                        </div>
                        <Link href="/dashboard" tabIndex={-1}>
                            <button className={styles.newProjectBtn}>
                                <Plus size={20} />
                                Novo Projeto
                            </button>
                        </Link>
                    </div>
                </ScrollReveal>

                {loading ? (
                    <div className={styles.loader}>Carregando...</div>
                ) : projects.length === 0 ? (
                    <ScrollReveal delay={0.1}>
                        <div className={styles.emptyState}>
                            <h3 className={styles.emptyTitle}>Nenhum projeto ainda</h3>
                            <p className={styles.emptyDesc}>Comece gerando seu primeiro prompt profissional e ele aparecerá aqui automaticamente.</p>
                            <Link href="/dashboard">
                                <Button variant="secondary">Criar Agora</Button>
                            </Link>
                        </div>
                    </ScrollReveal>
                ) : (
                    <div className={styles.grid}>
                        {projects.map((project) => (
                            <Link href={`/projects/${project.id}`} key={project.id} className={styles.projectLink}>
                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.cardTitle}>
                                            {project.title || 'Projeto Sem Título'}
                                        </h3>
                                        <p className={styles.cardDesc}>
                                            {project.inputs?.objective || 'Sem descrição'}
                                        </p>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <span className={styles.date}>
                                            <Clock size={14} />
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                        <span className={styles.status}>
                                            {project.status === 'completed' ? 'Pronto' : 'Rascunho'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
