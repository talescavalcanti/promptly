'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import styles from './page.module.css';
import { Header } from '../components/Header/Header';
import { UploadCloud, ArrowRight, Palette, Type, Paintbrush, Check, Loader2, ArrowLeft, FileText, Code, Lightbulb, Copy, Layers } from 'lucide-react';

type ExtractionResult = {
    success: boolean;
    fullReport: string;
    tokens: any;
    sections: {
        metadata: string;
        direction: string;
        colors: string;
        typography: string;
        layout: string;
        spacing: string;
        radius: string;
        shadows: string;
        borders: string;
        components: string;
        patterns: string;
        replicationGuide: string;
    };
};

type TabId = 'report' | 'tokens' | 'guide' | 'components';

export default function DesignExtractorPage() {
    const router = useRouter();
    const [dragging, setDragging] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [extractionData, setExtractionData] = useState<ExtractionResult | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('report');
    const [copiedTokens, setCopiedTokens] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await processFile(file);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setExtracting(true);
        setExtractionData(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch('/api/extract-design', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Falha na extração');

            setExtractionData(data);
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setExtracting(false);
        }
    };

    const handleCopyTokens = async () => {
        if (!extractionData?.tokens) return;
        await navigator.clipboard.writeText(JSON.stringify(extractionData.tokens, null, 2));
        setCopiedTokens(true);
        setTimeout(() => setCopiedTokens(false), 2000);
    };

    const handleUseDesign = () => {
        if (!extractionData) return;

        // Pass the full report and tokens to the dashboard
        const contextString = `# Design System Extraído (UDTE)\n\n${extractionData.fullReport}`;
        localStorage.setItem('promptly_extracted_design', contextString);

        // Also save JSON tokens for structured access
        if (extractionData.tokens) {
            localStorage.setItem('promptly_design_tokens', JSON.stringify(extractionData.tokens));
        }

        router.push('/dashboard?source=extractor');
    };

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'report', label: 'Relatório', icon: <FileText size={16} /> },
        { id: 'tokens', label: 'JSON Tokens', icon: <Code size={16} /> },
        { id: 'guide', label: 'Guia de Reuso', icon: <Lightbulb size={16} /> },
        { id: 'components', label: 'Componentes', icon: <Layers size={16} /> },
    ];

    return (
        <div className={styles.container}>
            <Header />

            <div className={styles.header}>
                <h1 className={styles.title}>Extrator Universal de Design</h1>
                <p className={styles.subtitle}>
                    Envie uma imagem de referência e nossa IA irá extrair um Design System completo: cores, tipografia, espaçamentos, componentes e um guia de replicação.
                </p>
            </div>

            {!extractionData && (
                <div
                    className={`${styles.dropZone} ${dragging ? styles.dragging : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                        disabled={extracting}
                    />

                    <div className={styles.iconWrapper}>
                        {extracting ? <Loader2 className="animate-spin" size={32} /> : <UploadCloud size={32} />}
                    </div>

                    <h3 className={styles.uploadTitle}>
                        {extracting ? 'Analisando com UDTE...' : 'Arraste ou Clique para Upload'}
                    </h3>
                    <p className={styles.uploadDesc}>
                        Suporta PNG, JPG, WEBP. A análise pode levar alguns segundos.
                    </p>
                </div>
            )}

            {extractionData && (
                <div className={styles.resultsContainer}>
                    {/* Tab Navigation */}
                    <div className={styles.tabNav}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className={styles.tabContent}>
                        {activeTab === 'report' && (
                            <div className={styles.reportView}>
                                <ReactMarkdown>{extractionData.fullReport}</ReactMarkdown>
                            </div>
                        )}

                        {activeTab === 'tokens' && (
                            <div className={styles.tokensView}>
                                <div className={styles.tokensHeader}>
                                    <h3>Design Tokens (JSON)</h3>
                                    <button className={styles.copyBtn} onClick={handleCopyTokens}>
                                        {copiedTokens ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar JSON</>}
                                    </button>
                                </div>
                                <pre className={styles.jsonBlock}>
                                    {extractionData.tokens
                                        ? JSON.stringify(extractionData.tokens, null, 2)
                                        : 'Nenhum JSON de tokens foi extraído.'}
                                </pre>
                            </div>
                        )}

                        {activeTab === 'guide' && (
                            <div className={styles.guideView}>
                                <ReactMarkdown>
                                    {extractionData.sections?.replicationGuide || 'Guia de replicação não disponível.'}
                                </ReactMarkdown>
                            </div>
                        )}

                        {activeTab === 'components' && (
                            <div className={styles.componentsView}>
                                <ReactMarkdown>
                                    {extractionData.sections?.components || 'Inventário de componentes não disponível.'}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button className={`${styles.actionButton} ${styles.btnSecondary}`} onClick={() => setExtractionData(null)}>
                            <ArrowLeft size={18} /> Nova Extração
                        </button>
                        <button className={`${styles.actionButton} ${styles.btnPrimary}`} onClick={handleUseDesign}>
                            Criar Projeto com esse Design <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
