// Hook for fetching and managing showcase data

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ExampleData, ShowcaseState } from '@/types/showcase';

// ========================================
// 🎬 CONFIGURE SEUS EXEMPLOS AQUI
// ========================================
// Para adicionar vídeos:
// 1. Coloque seus arquivos MP4 na pasta: public/videos/
// 2. Use a URL: '/videos/seu-arquivo.mp4'
// ========================================

const MOCK_EXAMPLES: ExampleData[] = [
    {
        id: '1',
        title: 'Landing Page para Barbearia',
        description: 'Página completa com: Header, Hero, Sessão de Serviços, Sessão de Testemunhas, Sessão de Contato e Footer.',
        videoUrl: '/videos/barbershop.mp4', // <-- URL simplificada e segura
        appLink: 'https://barber-shopp.lovable.app',
        tags: ['Landing Page', 'Barbearia', 'Serviços'],
        author: { id: 'u1', name: 'Promptly' },
        createdAt: new Date('2026-01-28'),
    },
    {
        id: '2',
        title: 'SaaS completo + Landing Page',
        description: 'Plataforma para gerenciamento de empresas pequenas com: Dashboard, Cadastro de Usuário, Controle de estoque e de vendas + Landing Page',
        videoUrl: '/videos/controlestore.mp4', // <-- Coloque seu MP4 em public/videos/exemplo-2.mp4
        appLink: 'https://controle-store-test.lovable.app',
        tags: ['SaaS', 'Landing Page', 'Gestão'],
        author: { id: 'u2', name: 'Promptly' },
        createdAt: new Date('2026-01-25'),
    },
    {
        id: '3',
        title: 'Landing Page para Advogado',
        description: 'Landing Page profissional para advogados com: Header, Hero, Sessão de Serviços, Sessão de Depoimentos, Sessão de Contato e Footer.',
        videoUrl: '/videos/landingadvogado2.mp4', // <-- Coloque seu MP4 em public/videos/exemplo-3.mp4
        appLink: 'https://v0-drpaulomartins.vercel.app',
        tags: ['Landing Page', 'Advocacia', 'Profissionalismo'],
        author: { id: 'u3', name: 'Promptly' },
        createdAt: new Date('2026-01-22'),
    },
];

const ITEMS_PER_PAGE = 12;

export const useShowcaseData = () => {
    const [data, setData] = useState<ExampleData[]>([]);
    const [state, setState] = useState<ShowcaseState>('LOADING');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const fetchData = useCallback(async () => {
        setState('LOADING');
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const response: ExampleData[] = MOCK_EXAMPLES;

            if (response.length === 0) {
                setState('EMPTY');
            } else {
                const sortedData = response.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setData(sortedData);
                setState('SUCCESS');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            setState('ERROR');
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data;
        const searchLower = searchTerm.toLowerCase();
        return data.filter(item => {
            const matchesTitle = item.title.toLowerCase().includes(searchLower);
            const matchesDesc = item.description.toLowerCase().includes(searchLower);
            const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(searchLower));
            return matchesTitle || matchesDesc || matchesTags;
        });
    }, [data, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [searchTerm]);

    const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        data.forEach(item => item.tags.forEach(tag => tagsSet.add(tag)));
        return Array.from(tagsSet).sort();
    }, [data]);

    return {
        data: paginatedData,
        allData: filteredData,
        state: filteredData.length === 0 && state === 'SUCCESS' ? 'EMPTY' : state,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        totalPages,
        allTags,
        refetch: fetchData,
    };
};
