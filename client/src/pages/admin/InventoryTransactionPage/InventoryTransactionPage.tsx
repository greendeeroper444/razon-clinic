import React, { useEffect, useState, useCallback } from 'react';
import styles from './InventoryTransactionPage.module.css';
import { ArrowDownCircle, ArrowUpCircle, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Header, Loading, Main, Pagination, Searchbar, Table } from '../../../components';
import { TableColumn } from '../../../types';
import { useTransactionStore, Transaction } from '../../../stores';
import { formatDate } from '../../../utils';

// const REASON_LABELS: Record<string, string> = {
//     restock: 'Restock',
//     consumption: 'Consumption',
//     adjustment: 'Adjustment',
//     initial: 'Initial Stock'
// };

const InventoryTransactionPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'IN' | 'OUT' | ''>('');
    const [reasonFilter, setReasonFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const {
        transactions,
        stats,
        loading,
        statsLoading,
        error,
        pagination,
        fetchTransactions,
        fetchTransactionStats
    } = useTransactionStore();

    const fetchData = useCallback(async (
        page = 1,
        limit = 10,
        search = '',
        transactionType: 'IN' | 'OUT' | '' = '',
        reason = '',
        start = '',
        end = ''
    ) => {
        await fetchTransactions({
            page,
            limit,
            search: search || undefined,
            transactionType: transactionType || undefined,
            reason: reason || undefined,
            startDate: start || undefined,
            endDate: end || undefined
        });
    }, [fetchTransactions]);

    useEffect(() => {
        if (isInitialLoad) {
            fetchData();
            fetchTransactionStats();
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, fetchData, fetchTransactionStats]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        fetchData(1, pagination.itemsPerPage, term, typeFilter, reasonFilter, startDate, endDate);
    }, [fetchData, pagination.itemsPerPage, typeFilter, reasonFilter, startDate, endDate]);

    const handleTypeFilter = useCallback((value: 'IN' | 'OUT' | '') => {
        setTypeFilter(value);
        fetchData(1, pagination.itemsPerPage, searchTerm, value, reasonFilter, startDate, endDate);
    }, [fetchData, pagination.itemsPerPage, searchTerm, reasonFilter, startDate, endDate]);

    // const handleReasonFilter = useCallback((value: string) => {
    //     setReasonFilter(value);
    //     fetchData(1, pagination.itemsPerPage, searchTerm, typeFilter, value, startDate, endDate);
    // }, [fetchData, pagination.itemsPerPage, searchTerm, typeFilter, startDate, endDate]);

    const handleDateFilter = useCallback((start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
        fetchData(1, pagination.itemsPerPage, searchTerm, typeFilter, reasonFilter, start, end);
    }, [fetchData, pagination.itemsPerPage, searchTerm, typeFilter, reasonFilter]);

    const handlePageChange = useCallback((page: number) => {
        fetchData(page, pagination.itemsPerPage, searchTerm, typeFilter, reasonFilter, startDate, endDate);
    }, [fetchData, pagination.itemsPerPage, searchTerm, typeFilter, reasonFilter, startDate, endDate]);

    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        fetchData(1, itemsPerPage, searchTerm, typeFilter, reasonFilter, startDate, endDate);
    }, [fetchData, searchTerm, typeFilter, reasonFilter, startDate, endDate]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setTypeFilter('');
        setReasonFilter('');
        setStartDate('');
        setEndDate('');
        fetchData();
    }, [fetchData]);

    const summaryCards = [
        {
            title: 'Stock IN',
            value: statsLoading ? '...' : stats?.totalIN ?? 0,
            sub: `${stats?.countIN ?? 0} transactions`,
            icon: ArrowDownCircle,
            color: 'in'
        },
        {
            title: 'Stock OUT',
            value: statsLoading ? '...' : stats?.totalOUT ?? 0,
            sub: `${stats?.countOUT ?? 0} transactions`,
            icon: ArrowUpCircle,
            color: 'out'
        },
        {
            title: 'Last 7 Days',
            value: statsLoading ? '...' : stats?.recentActivity ?? 0,
            sub: 'Recent transactions',
            icon: Activity,
            color: 'recent'
        }
    ];

    const columns: TableColumn<Transaction>[] = [
        {
            key: 'transactionType',
            header: 'TYPE',
            render: (item) => (
                <span className={`${styles.badge} ${styles[item.transactionType.toLowerCase()]}`}>
                    {item.transactionType === 'IN'
                        ? <TrendingDown className={styles.badgeIcon} />
                        : <TrendingUp className={styles.badgeIcon} />
                    }
                    {item.transactionType}
                </span>
            )
        },
        {
            key: 'itemName',
            header: 'ITEM',
            render: (item) => (
                <div className={styles.itemCell}>
                    <span className={styles.itemName}>{item.itemName}</span>
                    <span className={styles.itemCategory}>{item.category}</span>
                </div>
            )
        },
        // {
        //     key: 'reason',
        //     header: 'REASON',
        //     render: (item) => (
        //         <span className={`${styles.reason} ${styles[item.reason]}`}>
        //             {REASON_LABELS[item.reason] || item.reason}
        //         </span>
        //     )
        // },
        {
            key: 'quantity',
            header: 'QTY',
            render: (item) => (
                <span className={`${styles.qty} ${styles[item.transactionType.toLowerCase()]}`}>
                    {item.transactionType === 'IN' ? '+' : '-'}{item.quantity}
                </span>
            )
        },
        {
            key: 'previousStock',
            header: 'PREV. STOCK',
            render: (item) => item.previousStock
        },
        {
            key: 'newStock',
            header: 'NEW STOCK',
            render: (item) => item.newStock
        },
        // {
        //     key: 'notes',
        //     header: 'NOTES',
        //     render: (item) => (
        //         <span className={styles.notes}>{item.notes || '—'}</span>
        //     )
        // },
        {
            key: 'createdAt',
            header: 'DATE',
            render: (item) => formatDate(item.createdAt)
        }
    ];

    const hasActiveFilters = typeFilter || reasonFilter || startDate || endDate || searchTerm;

  return (
    <Main error={error}>
        <Header title="Transaction History" actions={[]} />

        <div className={styles.cards}>
            {summaryCards.map((card, i) => (
                <div className={`${styles.card} ${styles[`card__${card.color}`]}`} key={i}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>{card.title}</span>
                        <card.icon className={`${styles.cardIcon} ${styles[`cardIcon__${card.color}`]}`} />
                    </div>
                    <div className={styles.cardValue}>{card.value}</div>
                    <div className={styles.cardSub}>{card.sub}</div>
                </div>
            ))}
        </div>

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>All Transactions</div>

                <div className={styles.controls}>
                    <Searchbar
                        onSearch={handleSearch}
                        placeholder="Search items..."
                        disabled={loading}
                        className={styles.searchbar}
                    />

                    <select
                        title='All Types'
                        className={styles.filterSelect}
                        value={typeFilter}
                        onChange={(e) => handleTypeFilter(e.target.value as 'IN' | 'OUT' | '')}
                        disabled={loading}
                    >
                        <option value="">All Types</option>
                        <option value="IN">IN</option>
                        <option value="OUT">OUT</option>
                    </select>

                    {/* <select
                        title='All Reasons'
                        className={styles.filterSelect}
                        value={reasonFilter}
                        onChange={(e) => handleReasonFilter(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">All Reasons</option>
                        <option value="restock">Restock</option>
                        <option value="consumption">Consumption</option>
                        <option value="adjustment">Adjustment</option>
                        <option value="initial">Initial Stock</option>
                    </select> */}

                    <div className={styles.dateRange}>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={startDate}
                            onChange={(e) => handleDateFilter(e.target.value, endDate)}
                            disabled={loading}
                            placeholder="Start date"
                        />
                        <span className={styles.dateSep}>–</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={endDate}
                            onChange={(e) => handleDateFilter(startDate, e.target.value)}
                            disabled={loading}
                            placeholder="End date"
                        />
                    </div>

                    <div className={styles.itemsPerPageControl}>
                        <label htmlFor="itemsPerPage">Per page:</label>
                        <select
                            id="itemsPerPage"
                            value={pagination.itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            disabled={loading}
                            className={styles.itemsPerPageSelect}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            className={styles.clearBtn}
                            onClick={handleClearFilters}
                            disabled={loading}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className={styles.tableResponsive}>
                    <Loading
                        type="skeleton"
                        rows={8}
                        message="Loading transactions..."
                        delay={0}
                        minDuration={800}
                    />
                </div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={transactions}
                        emptyMessage="No transactions found."
                        searchTerm={searchTerm}
                        getRowKey={(item) => item.id}
                    />

                    {pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalItems}
                            itemsPerPage={pagination.itemsPerPage}
                            onPageChange={handlePageChange}
                            disabled={loading}
                        />
                    )}
                </>
            )}
        </div>
    </Main>
  )
}

export default InventoryTransactionPage