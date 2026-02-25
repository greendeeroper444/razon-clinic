import React, { useEffect, useState, useCallback } from 'react'
import styles from './PersonnelManagementPage.module.css';
import { Plus, Edit, Trash, UserCog } from 'lucide-react';
import { OpenModalProps } from '../../../hooks/hook';
import { Header, Loading, Main, Modal, Pagination, Searchbar, SubmitLoading, Table } from '../../../components';
import { FormDataType, PersonnelFormData, TableColumn } from '../../../types';
import { formatDate, getLoadingText } from '../../../utils';
import { getPersonnelSummaryCards } from '../../../config/personnelSummaryCards';
import { usePersonnelStore } from '../../../stores';

const PersonnelPage: React.FC<OpenModalProps> = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    
    //zustand store selectors
    const {
        personnel,
        submitLoading,
        loading,
        error,
        isProcessing,
        summaryStats,
        selectedPersonnel,
        isModalCreateOpen,
        isModalUpdateOpen,
        isModalDeleteOpen,
        deletePersonnelData,
        pagination: storePagination,
        fetchPersonnel,
        addPersonnel,
        updatePersonnelData,
        deletePersonnel,
        openModalCreate,
        openModalUpdate,
        openModalDelete,
        closeModalCreate,
        closeModalUpdate,
        closeModalDelete,
        currentOperation
    } = usePersonnelStore();

    //memoized fetch function to prevent recreation on every render
    const fetchData = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        try {
            await fetchPersonnel({ page, limit, search });
        } catch (error) {
            console.error('Error fetching personnel:', error);
        }
    }, [fetchPersonnel]);

    //initial load only
    useEffect(() => {
        if (isInitialLoad) {
            fetchData(1, 10, '');
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, fetchData]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        fetchData(1, storePagination?.itemsPerPage || 10, term);
    }, [fetchData, storePagination?.itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        fetchData(page, storePagination?.itemsPerPage || 10, searchTerm);
    }, [fetchData, storePagination?.itemsPerPage, searchTerm]);

    const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
        fetchData(1, itemsPerPage, searchTerm);
    }, [fetchData, searchTerm]);

    const handleCreateClick = useCallback(() => {
        openModalCreate();
    }, [openModalCreate]);

    const handleUpdateClick = useCallback((item: PersonnelFormData) => {
        openModalUpdate(item);
    }, [openModalUpdate]);

    const handleDeleteClick = useCallback((item: PersonnelFormData) => {
        openModalDelete(item);
    }, [openModalDelete]);

    const handleSubmitCreate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data for adding personnel')
            return
        }

        const personnelData = data as PersonnelFormData;

        try {
            await addPersonnel(personnelData)

            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
                closeModalCreate();
            }, 600);
        } catch (error) {
            console.error('Error adding personnel:', error);
        }
    }, [addPersonnel, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm, closeModalCreate])
    
    const handleSubmitUpdate = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data === 'string') {
            console.error('Invalid data or missing personnel ID');
            return;
        }

        const personnelData = data as PersonnelFormData;

        try {
            if (selectedPersonnel && selectedPersonnel.id) {
                await updatePersonnelData(selectedPersonnel.id, personnelData);
            } else {
                await addPersonnel(personnelData);
            }
            
            //refresh after operation completes
            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error saving personnel:', error);
        }
    }, [selectedPersonnel, updatePersonnelData, addPersonnel, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const handleConfirmDelete = useCallback(async (data: FormDataType | string): Promise<void> => {
        if (typeof data !== 'string') {
            console.error('Invalid personnel ID');
            return;
        }
        
        try {
            await deletePersonnel(data);
            
            //refresh after operation completes
            setTimeout(() => {
                fetchData(
                    storePagination?.currentPage || 1, 
                    storePagination?.itemsPerPage || 10, 
                    searchTerm
                );
            }, 600);
        } catch (error) {
            console.error('Error deleting personnel:', error);
        }
    }, [deletePersonnel, fetchData, storePagination?.currentPage, storePagination?.itemsPerPage, searchTerm]);

    const summaryCards = getPersonnelSummaryCards(summaryStats);

    const personnelColumns: TableColumn<PersonnelFormData>[] = [
        {
            key: 'name',
            header: 'NAME',
            render: (item) => (
                <div className={styles.personnelInfo}>
                    <div className={styles.personnelIcon}>
                        <UserCog className={styles.icon} />
                    </div>
                    <div>
                        <div className={styles.personnelName}>
                            {item.firstName} {item.middleName ? `${item.middleName} ` : ''}{item.lastName} {item.suffix ? `${item.suffix}` : ''}
                        </div>
                        <div className={styles.personnelRole}>{item.role}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'contact',
            header: 'CONTACT',
            render: (item) => {
                //display email if available, otherwise contactNumber
                const contact = (item as any).email || item.contactNumber || 'N/A';
                return contact;
            }
        },
        {
            key: 'sex',
            header: 'SEX',
            render: (item) => item.sex
        },
        {
            key: 'birthdate',
            header: 'BIRTHDATE',
            render: (item) => formatDate(item.birthdate)
        },
        {
            key: 'address',
            header: 'ADDRESS',
            render: (item) => (
                <span className={styles.address}>
                    {item.address.length > 30 ? `${item.address.substring(0, 30)}...` : item.address}
                </span>
            )
        },
        {
            key: 'role',
            header: 'ROLE',
            render: (item) => (
                <span className={`${styles.rolebadge} ${styles[item.role.toLowerCase()]}`}>
                    {item.role}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            render: (item) => (
                <>
                    <button 
                        type='button'
                        className={`${styles.actionBtn} ${styles.update}`}
                        onClick={() => handleUpdateClick(item)}
                        disabled={isProcessing}
                    >
                        <Edit className={styles.icon} /> Edit
                    </button>
                    <button 
                        type='button'
                        className={`${styles.actionBtn} ${styles.cancel}`}
                        onClick={() => handleDeleteClick(item)}
                        disabled={isProcessing}
                    >
                        <Trash className={styles.icon} /> Delete
                    </button>
                </>
            )
        }
    ];

    const headerActions = [
        {
            id: 'newPersonnelBtn',
            label: 'New Personnel',
            icon: <Plus className={styles.icon} /> ,
            onClick: handleCreateClick,
            type: 'primary' as const
        }
    ];
    
    
  return (
    <Main error={error} >
        <Header
            title='Personnel Management'
            actions={headerActions}
        />

        <div className={styles.personnelCards}>
            {
                summaryCards.map((card, index) => (
                    <div className={styles.card} key={index}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>{card.title}</div>
                            <div className={`${styles.cardIcon} ${styles[card.iconColor]}`}>
                                <card.icon />
                            </div>
                        </div>
                        <div className={styles.cardValue}>{card.value}</div>
                        <div className={styles.cardFooter}>
                            <span>{card.footer}</span>
                        </div>
                    </div>
                ))
            }
        </div>

        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Personnel List</div>
                
                <div className={styles.controls}>
                    <Searchbar
                        onSearch={handleSearch}
                        placeholder="Search personnel..."
                        disabled={loading}
                        className={styles.searchbar}
                    />
                    
                    <div className={styles.itemsPerPageControl}>
                        <label htmlFor="itemsPerPage">Items per page:</label>
                        <select
                            id="itemsPerPage"
                            value={storePagination?.itemsPerPage || 10}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            disabled={loading}
                            className={styles.itemsPerPageSelect}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {
                loading ? (
                    <div className={styles.tableResponsive}>
                        <Loading
                            type='skeleton'
                            rows={7}
                            message='Loading personnel data...'
                            delay={0}
                            minDuration={1000}
                        />
                    </div>
                ) : (
                    <>
                        <Table
                            columns={personnelColumns}
                            data={personnel}
                            emptyMessage='No personnel found. Click "New Personnel" to get started.'
                            searchTerm={searchTerm}
                            getRowKey={(item) => item.id || ''}
                        />

                        {
                            storePagination && storePagination.totalPages > 1 && (
                                <Pagination
                                    currentPage={storePagination.currentPage}
                                    totalPages={storePagination.totalPages}
                                    totalItems={storePagination.totalItems}
                                    itemsPerPage={storePagination.itemsPerPage}
                                    onPageChange={handlePageChange}
                                    disabled={loading || isProcessing}
                                />
                            )
                        }
                    </>
                )
            }
        </div>

        {
            isModalCreateOpen && (
                <Modal
                    isOpen={isModalCreateOpen}
                    onClose={closeModalCreate}
                    modalType="personnel"
                    onSubmit={handleSubmitCreate}
                    isProcessing={submitLoading}
                />
            )
        }

        {
            isModalUpdateOpen && (
                <Modal
                    isOpen={isModalUpdateOpen}
                    onClose={closeModalUpdate}
                    modalType='personnel'
                    onSubmit={handleSubmitUpdate}
                    editData={selectedPersonnel}
                    isProcessing={submitLoading}
                />
            )
        }
        
        {
            isModalDeleteOpen && deletePersonnelData && (
                <Modal
                    isOpen={isModalDeleteOpen}
                    onClose={closeModalDelete}
                    modalType='delete'
                    onSubmit={handleConfirmDelete}
                    deleteData={deletePersonnelData}
                    isProcessing={submitLoading}
                />
            )
        }

        <SubmitLoading
            isLoading={submitLoading}
            loadingText={getLoadingText(currentOperation, 'personnel')}
            size='medium'
            variant='overlay'
        />
    </Main>
  )
}

export default PersonnelPage