import React, { useEffect, useState, useCallback } from 'react';
import styles from './InventoryTransactionPage.module.css';
import { ArrowDownCircle, ArrowUpCircle, Activity, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { Header, Loading, Main, Pagination, Searchbar, Table } from '../../../components';
import { TableColumn } from '../../../types';
import { useTransactionStore, Transaction } from '../../../stores';
import { formatDate } from '../../../utils';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const REASON_LABELS: Record<string, string> = {
    restock:     'Restock',
    consumption: 'Consumption',
    adjustment:  'Adjustment',
    initial:     'Initial Stock'
};

const InventoryTransactionPage: React.FC = () => {
    const { inventoryItemId } = useParams<{ inventoryItemId?: string }>();
    const location  = useLocation();
    const navigate  = useNavigate();
    const itemName  = (location.state as { itemName?: string })?.itemName;

    const [searchTerm, setSearchTerm]   = useState('');
    const [typeFilter, setTypeFilter]   = useState<'IN' | 'OUT' | ''>('');
    const [startDate, setStartDate]     = useState('');
    const [endDate, setEndDate]         = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const {
        transactions,
        stats,
        loading,
        statsLoading,
        error,
        pagination,
        fetchTransactions,
        fetchTransactionsByItemId,
        fetchTransactionStats
    } = useTransactionStore();

    const fetchData = useCallback(async (
        page = 1,
        limit = 10,
        search = '',
        transactionType: 'IN' | 'OUT' | '' = '',
        start = '',
        end = ''
    ) => {
        const params = {
            page,
            limit,
            search:          search          || undefined,
            transactionType: transactionType || undefined,
            startDate:       start           || undefined,
            endDate:         end             || undefined
        };
        if (inventoryItemId) {
            await fetchTransactionsByItemId(inventoryItemId, params);
        } else {
            await fetchTransactions(params);
        }
    }, [inventoryItemId, fetchTransactions, fetchTransactionsByItemId]);

    useEffect(() => {
        if (isInitialLoad) {
            fetchData();
            if (!inventoryItemId) fetchTransactionStats();
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, fetchData, fetchTransactionStats, inventoryItemId]);

    const handleSearch   = useCallback((term: string) => { setSearchTerm(term); fetchData(1, pagination.itemsPerPage, term, typeFilter, startDate, endDate); }, [fetchData, pagination.itemsPerPage, typeFilter, startDate, endDate]);
    const handleTypeFilter = useCallback((val: 'IN' | 'OUT' | '') => { setTypeFilter(val); fetchData(1, pagination.itemsPerPage, searchTerm, val, startDate, endDate); }, [fetchData, pagination.itemsPerPage, searchTerm, startDate, endDate]);
    const handleDateFilter = useCallback((s: string, e: string) => { setStartDate(s); setEndDate(e); fetchData(1, pagination.itemsPerPage, searchTerm, typeFilter, s, e); }, [fetchData, pagination.itemsPerPage, searchTerm, typeFilter]);
    const handlePageChange = useCallback((page: number) => { fetchData(page, pagination.itemsPerPage, searchTerm, typeFilter, startDate, endDate); }, [fetchData, pagination.itemsPerPage, searchTerm, typeFilter, startDate, endDate]);
    const handleItemsPerPageChange = useCallback((n: number) => { fetchData(1, n, searchTerm, typeFilter, startDate, endDate); }, [fetchData, searchTerm, typeFilter, startDate, endDate]);
    const handleClearFilters = useCallback(() => { setSearchTerm(''); setTypeFilter(''); setStartDate(''); setEndDate(''); fetchData(); }, [fetchData]);

    const summaryCards = [
        { title: 'Stock IN',     value: statsLoading ? '…' : stats?.totalIN   ?? 0, sub: `${stats?.countIN   ?? 0} transactions`, icon: ArrowDownCircle, color: 'in'     },
        { title: 'Stock OUT',    value: statsLoading ? '…' : stats?.totalOUT  ?? 0, sub: `${stats?.countOUT  ?? 0} transactions`, icon: ArrowUpCircle,   color: 'out'    },
        { title: 'Last 7 Days',  value: statsLoading ? '…' : stats?.recentActivity ?? 0, sub: 'Recent transactions',             icon: Activity,        color: 'recent' }
    ];

    const columns: TableColumn<Transaction>[] = [
        {
            key: 'transactionType',
            header: 'TYPE',
            render: (item) => (
                <span className={`${styles.badge} ${styles[item.transactionType.toLowerCase()]}`}>
                    {item.transactionType === 'IN'
                        ? <TrendingDown className={styles.badgeIcon} />
                        : <TrendingUp   className={styles.badgeIcon} />
                    }
                    {item.transactionType}
                </span>
            )
        },

        // Item + category — always show when not filtered by a specific item
        ...(!inventoryItemId ? [{
            key: 'itemName' as keyof Transaction,
            header: 'ITEM',
            render: (item: Transaction) => (
                <div className={styles.itemCell}>
                    <span className={styles.itemName}>{item.itemName}</span>
                    <span className={styles.itemCategory}>{item.category}</span>
                </div>
            )
        }] : []),

        // Category — always show when viewing a specific item (otherwise it's already in the ITEM column above)
        ...(inventoryItemId ? [{
            key: 'category' as keyof Transaction,
            header: 'CATEGORY',
            render: (item: Transaction) => (
                <span className={styles.categoryPill}>{item.category}</span>
            )
        }] : []),

        {
            key: 'reason',
            header: 'REASON',
            render: (item) => (
                <span className={`${styles.reasonPill} ${styles[`reason__${item.reason}`]}`}>
                    {REASON_LABELS[item.reason] || item.reason}
                </span>
            )
        },
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
            render: (item) => <span className={styles.stockNum}>{item.previousStock}</span>
        },
        {
            key: 'newStock',
            header: 'NEW STOCK',
            render: (item) => <span className={styles.stockNum}>{item.newStock}</span>
        },
        {
            key: 'notes',
            header: 'NOTES',
            render: (item) => (
                <span className={styles.notes} title={item.notes || ''}>
                    {item.notes || <span className={styles.noNotes}>—</span>}
                </span>
            )
        },
        {
            key: 'createdAt',
            header: 'DATE',
            render: (item) => <span className={styles.date}>{formatDate(item.createdAt)}</span>
        }
    ];

    const hasActiveFilters = typeFilter || startDate || endDate || searchTerm;
    const pageTitle = inventoryItemId && itemName ? `${itemName} — Transaction History` : 'Transaction History';
    const headerActions = inventoryItemId
        ? [{ id: 'backBtn', label: 'Back to Inventory', icon: <ArrowLeft style={{ width: 16, height: 16 }} />, onClick: () => navigate('/admin/inventory'), type: 'secondary' as const }]
        : [];

    return (
        <Main error={error}>
            <Header title={pageTitle} actions={headerActions} />

            {/* Global stats — only on all-transactions view */}
            {!inventoryItemId && (
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
            )}

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        {inventoryItemId && itemName ? `History for "${itemName}"` : 'All Transactions'}
                    </div>

                    <div className={styles.controls}>
                        <Searchbar
                            onSearch={handleSearch}
                            placeholder="Search item, notes…"
                            disabled={loading}
                            className={styles.searchbar}
                        />

                        {/* Type filter */}
                        <select
                            title="Filter by type"
                            className={styles.filterSelect}
                            value={typeFilter}
                            onChange={(e) => handleTypeFilter(e.target.value as 'IN' | 'OUT' | '')}
                            disabled={loading}
                        >
                            <option value="">All Types</option>
                            <option value="IN">IN</option>
                            <option value="OUT">OUT</option>
                        </select>

                        {/* Date range */}
                        <div className={styles.dateRange}>
                            <input
                                title="Start date"
                                type="date"
                                className={styles.dateInput}
                                value={startDate}
                                onChange={(e) => handleDateFilter(e.target.value, endDate)}
                                disabled={loading}
                            />
                            <span className={styles.dateSep}>–</span>
                            <input
                                title="End date"
                                type="date"
                                className={styles.dateInput}
                                value={endDate}
                                onChange={(e) => handleDateFilter(startDate, e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Items per page */}
                        <div className={styles.itemsPerPageControl}>
                            <label htmlFor="txPerPage">Per page:</label>
                            <select
                                id="txPerPage"
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
                            <button type="button" className={styles.clearBtn} onClick={handleClearFilters} disabled={loading}>
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Results meta */}
                {!loading && (
                    <div className={styles.resultsMeta}>
                        Showing <strong>{pagination.startIndex}–{pagination.endIndex}</strong> of <strong>{pagination.totalItems}</strong> transactions
                    </div>
                )}

                {loading ? (
                    <div className={styles.tableResponsive}>
                        <Loading type="skeleton" rows={8} message="Loading transactions…" delay={0} minDuration={800} />
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
    );
};

export default InventoryTransactionPage;