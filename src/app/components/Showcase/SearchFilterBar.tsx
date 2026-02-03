'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchFilterBar.module.css';

interface SearchFilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    allTags: string[];
    resultCount: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
    searchTerm,
    onSearchChange,
    allTags,
    resultCount,
}) => {
    const handleTagClick = (tag: string) => {
        if (searchTerm.toLowerCase() === tag.toLowerCase()) {
            onSearchChange('');
        } else {
            onSearchChange(tag);
        }
    };

    return (
        <div className={styles.container}>
            {/* Search Input */}
            <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={20} />
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Buscar por título, descrição, tag ou autor..."
                    value={searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                />
                {searchTerm && (
                    <button
                        className={styles.clearButton}
                        onClick={() => onSearchChange('')}
                        aria-label="Limpar busca"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Tags Filter */}
            <div className={styles.tagsRow}>
                <div className={styles.tagsWrapper}>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            className={`${styles.tagChip} ${searchTerm.toLowerCase() === tag.toLowerCase() ? styles.active : ''}`}
                            onClick={() => handleTagClick(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <span className={styles.resultCount}>
                    {resultCount} {resultCount === 1 ? 'exemplo' : 'exemplos'}
                </span>
            </div>
        </div>
    );
};

export default SearchFilterBar;
