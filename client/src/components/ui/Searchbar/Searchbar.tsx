import React, { useState, useEffect, useCallback } from 'react'
import styles from './Searchbar.module.css'
import { Search, X } from 'lucide-react'

interface SearchbarProps {
    onSearch: (searchTerm: string) => void;
    placeholder?: string;
    debounceMs?: number;
    initialValue?: string;
    disabled?: boolean;
    className?: string;
}

const Searchbar: React.FC<SearchbarProps> = ({
    onSearch,
    placeholder = 'Search...',
    debounceMs = 500,
    initialValue = '',
    disabled = false,
    className = ''
}) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const [isSearching, setIsSearching] = useState(false);

    //debounce search function
    const debounceSearch = useCallback(
        (term: string) => {
            const timeoutId = setTimeout(() => {
                onSearch(term);
                setIsSearching(false);
            }, debounceMs);

            return () => clearTimeout(timeoutId);
        },
        [onSearch, debounceMs]
    );

    useEffect(() => {
        setIsSearching(true);
        const cleanup = debounceSearch(searchTerm);
        return cleanup;
    }, [searchTerm, debounceSearch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch(searchTerm);
            setIsSearching(false);
        }
    };

  return (
    <div className={`${styles.searchContainer} ${className}`}>
        <div className={styles.searchInputWrapper}>
            <Search 
                className={`${styles.searchIcon} ${isSearching ? styles.searching : ''}`} 
                size={20} 
            />
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={`${styles.searchInput} ${disabled ? styles.disabled : ''}`}
            />
            {
                searchTerm && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className={styles.clearButton}
                        disabled={disabled}
                        aria-label="Clear search"
                    >
                        <X size={16} />
                    </button>
                )
            }
        </div>
    </div>
  )
}

export default Searchbar