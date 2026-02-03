'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, FolderOpen, RefreshCw, ArrowLeft } from 'lucide-react';
import { useShowcaseData } from '@/hooks/useShowcaseData';
import ExampleCard from '@/app/components/Showcase/ExampleCard';
import SearchFilterBar from '@/app/components/Showcase/SearchFilterBar';
import styles from './showcase.module.css';

// Skeleton component (RN07)
const SkeletonCard: React.FC = () => (
    <div className={styles.skeletonCard}>
        <div className={styles.skeletonImage} />
        <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonDesc} />
            <div className={styles.skeletonDesc} style={{ width: '70%' }} />
            <div className={styles.skeletonFooter}>
                <div className={styles.skeletonAuthor} />
                <div className={styles.skeletonButton} />
            </div>
        </div>
    </div>
);

// Empty state component (EC01)
const EmptyState: React.FC<{ searchTerm: string; onClear: () => void }> = ({ searchTerm, onClear }) => (
    <div className={styles.emptyState}>
        <FolderOpen size={64} strokeWidth={1} />
        <h3>Nenhum exemplo encontrado</h3>
        {searchTerm ? (
            <>
                <p>Não encontramos resultados para &quot;{searchTerm}&quot;</p>
                <button className={styles.clearSearchBtn} onClick={onClear}>
                    Limpar busca
                </button>
            </>
        ) : (
            <p>Ainda não há exemplos para exibir.</p>
        )}
    </div>
);

// Error state component (EC02)
const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
    <div className={styles.errorState}>
        <AlertCircle size={64} strokeWidth={1} />
        <h3>Erro ao carregar exemplos</h3>
        <p>Não foi possível carregar os exemplos. Tente novamente mais tarde.</p>
        <button className={styles.retryBtn} onClick={onRetry}>
            <RefreshCw size={18} /> Tentar novamente
        </button>
    </div>
);

// Pagination component (RN06)
const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className={styles.pagination}>
            <button
                className={styles.pageBtn}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                ← Anterior
            </button>

            <div className={styles.pageNumbers}>
                {pages.map(page => (
                    <button
                        key={page}
                        className={`${styles.pageNum} ${page === currentPage ? styles.active : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                className={styles.pageBtn}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Próxima →
            </button>
        </div>
    );
};

export default function ShowcasePage() {
    const {
        data,
        allData,
        state,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        totalPages,
        allTags,
        refetch,
    } = useShowcaseData();

    return (
        <main className={styles.container}>
            <div className={styles.topBar}>
                <Link href="/" className={styles.backButton}>
                    <ArrowLeft size={24} />
                    <span>Voltar</span>
                </Link>
            </div>
            <header className={styles.header}>
                <h1 className={styles.title}>O que você pode criar com <span className={styles.highlight}>1 clique</span></h1>
                <p className={styles.subtitle}>
                    Exemplos reais gerados com <span className={styles.highlight}>apenas 1 prompt</span>, sem edição manual ou código extra.
                </p>
            </header>

            <SearchFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                allTags={allTags}
                resultCount={allData.length}
            />

            {/* Loading State (RN07) */}
            {state === 'LOADING' && (
                <div className={styles.grid}>
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

            {/* Error State (EC02) */}
            {state === 'ERROR' && <ErrorState onRetry={refetch} />}

            {/* Empty State (EC01) */}
            {state === 'EMPTY' && <EmptyState searchTerm={searchTerm} onClear={() => setSearchTerm('')} />}

            {/* Success State */}
            {state === 'SUCCESS' && data.length > 0 && (
                <>
                    <div className={styles.grid}>
                        {data.map(example => (
                            <ExampleCard key={example.id} example={example} />
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <h2 className={styles.ctaTitle}>
                    Você tem <span className={styles.highlight}>dúvida</span> que foi tudo feito com 1 prompt?
                </h2>
                <p className={styles.ctaDescription}>
                    Teste você mesmo. Crie sua conta gratuita e gere sua primeira aplicação em segundos.
                </p>
                <Link href="/pricing" className={styles.ctaButton}>
                    Testar Grátis Agora
                </Link>
            </section>
        </main>
    );
}
