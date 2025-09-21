import React from 'react'
import styles from './Pagination.module.css'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
    showFirstLast?: boolean;
    showPageNumbers?: boolean;
    maxVisiblePages?: number;
    disabled?: boolean;
    className?: string;
    showItemsInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    showFirstLast = true,
    showPageNumbers = true,
    maxVisiblePages = 5,
    disabled = false,
    className = '',
    showItemsInfo = true
}) => {
    const getVisiblePages = (): number[] => {
        if (!showPageNumbers || totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const halfVisible = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    const visiblePages = getVisiblePages();

    const getItemsInfo = (): string => {
        if (!totalItems || !itemsPerPage) return '';
        
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        
        return `Showing ${startItem}-${endItem} of ${totalItems} items`;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && !disabled) {
            onPageChange(page);
        }
    };

    if (totalPages <= 1) {
        return null;
    }

  return (
    <div className={`${styles.paginationContainer} ${className}`}>
      
        {
            showItemsInfo && totalItems && itemsPerPage && (
                <div className={styles.itemsInfo}>
                {getItemsInfo()}
                </div>
            )
        }

        <div className={styles.paginationControls}>
   
            {
                showFirstLast && (
                    <button
                        type="button"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1 || disabled}
                        className={`${styles.pageButton} ${styles.navButton}`}
                        aria-label="First page"
                    >
                        <ChevronsLeft size={16} />
                    </button>
                )
            }

            <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || disabled}
                className={`${styles.pageButton} ${styles.navButton}`}
                aria-label="Previous page"
            >
                <ChevronLeft size={16} />
            </button>

            {
                showPageNumbers && (
                <>
                    {
                        visiblePages[0] > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(1)}
                                    disabled={disabled}
                                    className={styles.pageButton}
                                >
                                1
                                </button>
                                {
                                    visiblePages[0] > 2 && (
                                        <span className={styles.ellipsis}>...</span>
                                    )
                                }
                            </>
                        )
                    }

                    {
                        visiblePages.map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => handlePageChange(page)}
                                disabled={disabled}
                                className={`${styles.pageButton} ${
                                    page === currentPage ? styles.active : ''
                                }`}
                                aria-current={page === currentPage ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        ))
                    }


                    {
                        visiblePages[visiblePages.length - 1] < totalPages && (
                            <>
                                {
                                    visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                                        <span className={styles.ellipsis}>...</span>
                                    )
                                }
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={disabled}
                                    className={styles.pageButton}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )
                    }
                </>
                )
            }

            <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || disabled}
                className={`${styles.pageButton} ${styles.navButton}`}
                aria-label="Next page"
            >
                <ChevronRight size={16} />
            </button>

            {
                showFirstLast && (
                    <button
                        type="button"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || disabled}
                        className={`${styles.pageButton} ${styles.navButton}`}
                        aria-label="Last page"
                    >
                        <ChevronsRight size={16} />
                    </button>
                )
            }
        </div>
    </div>
  )
}

export default Pagination