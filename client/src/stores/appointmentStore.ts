import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
    getAppointments,
    getMyAppointments,
    updateAppointment,
    deleteAppointment,
    getAppointmentById,
    updateAppointmentStatus as updateAppointmentStatusService,
    addAppointment,
    requestCancellation as requestCancellationService,
    approveCancellation as approveCancellationService,
    rejectCancellation as rejectCancellationService,
} from '../services'
import { AppointmentFormData, AppointmentStatus, ExtendedAppointmentState, OperationType, FetchParams } from '../types'
import { toast } from 'sonner'
import { handleStoreError } from '../utils'

export const useAppointmentStore = create<ExtendedAppointmentState>()(
    devtools(
        (set, get) => ({
            appointments: [],
            loading: false,
            fetchLoading: false,
            submitLoading: false,
            statusLoading: false, 
            error: null,
            isProcessing: false,
            selectedAppointment: null,
            isModalCreateOpen: false,
            isModalUpdateOpen: false,
            isModalStatusOpen: false,
            isModalDeleteOpen: false,
            isModalCancelOpen: false,
            cancelAppointmentData: null,
            deleteAppointmentData: null,
            currentAppointment: null,
            viewMode: 'user' as 'admin' | 'user',
            currentOperation: null as OperationType,
            validationErrors: {},
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPreviousPage: false,
                startIndex: 1,
                endIndex: 0,
                isUnlimited: false,
                nextPage: null,
                previousPage: null,
                remainingItems: 0,
                searchTerm: null
            },

            clearValidationErrors: () => set({ validationErrors: {} }),

            addAppointment: async (data: AppointmentFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'create',
                        validationErrors: {}
                    });
                    
                    await addAppointment(data);
                    
                    const currentState = get();
                    if (currentState.viewMode === 'admin') {
                        await get().fetchAppointments({});
                    } else {
                        await get().fetchMyAppointments({});
                    }
                    
                    toast.success('Appointment added successfully!');

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        });
                    }, 500);

                } catch (error) {
                    handleStoreError(error, {
                        set,
                        defaultMessage: 'Failed to add appointment'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            fetchAppointments: async (params: FetchParams) => {
                const currentState = get();
                
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...');
                    return;
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null, viewMode: 'admin' });
                    
                    const response = await getAppointments(params);
                    
                    if (response.success) {
                        const appointments = response.data.appointments || [];
                        const pagination = response.data.pagination || {};
                        
                        set({ 
                            appointments,
                            pagination: {
                                currentPage: pagination.currentPage || 1,
                                totalPages: pagination.totalPages || 1,
                                totalItems: pagination.totalItems || 0,
                                itemsPerPage: pagination.itemsPerPage || 10,
                                hasNextPage: pagination.hasNextPage || false,
                                hasPreviousPage: pagination.hasPreviousPage || false,
                                startIndex: pagination.startIndex || 1,
                                endIndex: pagination.endIndex || 0,
                                isUnlimited: pagination.isUnlimited || false,
                                nextPage: pagination.nextPage,
                                previousPage: pagination.previousPage,
                                remainingItems: pagination.remainingItems || 0,
                                searchTerm: pagination.searchTerm || params.search || null
                            },
                            fetchLoading: false,
                            loading: false 
                        });
                    } else {
                        set({ 
                            error: response.message || 'Failed to fetch appointments', 
                            fetchLoading: false,
                            loading: false 
                        });
                    }
                } catch (error) {
                    console.error('Error fetching appointments:', error);
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching appointments', 
                        loading: false 
                    });
                }
            },

            fetchMyAppointments: async (params: FetchParams) => {
                const currentState = get();
                
                if (currentState.fetchLoading) {
                    console.log('Fetch already in progress, skipping...');
                    return;
                }

                try {
                    set({ fetchLoading: true, loading: true, error: null, viewMode: 'user' });
                    
                    const response = await getMyAppointments(params);
                    
                    if (response.success) {
                        const appointments = response.data.appointments || [];
                        const pagination = response.data.pagination || {};
                        
                        set({ 
                            appointments,
                            pagination: {
                                currentPage: pagination.currentPage || 1,
                                totalPages: pagination.totalPages || 1,
                                totalItems: pagination.totalItems || 0,
                                itemsPerPage: pagination.itemsPerPage || 10,
                                hasNextPage: pagination.hasNextPage || false,
                                hasPreviousPage: pagination.hasPreviousPage || false,
                                startIndex: pagination.startIndex || 1,
                                endIndex: pagination.endIndex || 0,
                                isUnlimited: pagination.isUnlimited || false,
                                nextPage: pagination.nextPage,
                                previousPage: pagination.previousPage,
                                remainingItems: pagination.remainingItems || 0,
                                searchTerm: pagination.searchTerm || null
                            },
                            fetchLoading: false,
                            loading: false 
                        });
                    } else {
                        set({ 
                            error: response.message || 'Failed to fetch appointments', 
                            fetchLoading: false,
                            loading: false 
                        });
                    }
                } catch (error) {
                    console.error('Error fetching appointments:', error);
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching appointments', 
                        loading: false 
                    });
                }
            },

            fetchAppointmentById: async (appointmentId: string) => {
                try {
                    set({ fetchLoading: true, loading: true, error: null });
                    
                    const response = await getAppointmentById(appointmentId);
                    
                    if (response.success) {
                        set({ 
                            currentAppointment: response.data,
                            fetchLoading: false,
                            loading: false 
                        })
                    } else {
                        set({ 
                            error: 'Failed to load appointment details', 
                            fetchLoading: false,
                            loading: false 
                        })
                    }
                } catch (error) {
                    console.error('Error fetching appointment:', error)
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching appointment', 
                        loading: false 
                    })
                }
            },

            updateAppointmentData: async (id: string, data: AppointmentFormData) => {
                try {
                    set({ 
                        submitLoading: true, 
                        isProcessing: true, 
                        currentOperation: 'update',
                        validationErrors: {}
                    });
                    
                    await updateAppointment(id, data);
                    
                    const currentState = get();
                    if (currentState.viewMode === 'admin') {
                        await get().fetchAppointments({});
                    } else {
                        await get().fetchMyAppointments({});
                    }

                    if (currentState.currentAppointment) {
                        await get().fetchAppointmentById(id)
                    }
                    
                    toast.success('Updated appointment successfully!')
                    set({ isModalUpdateOpen: false, selectedAppointment: null });

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        });
                    }, 500);

                } catch (error) {
                    handleStoreError(error, {
                        set,
                        defaultMessage: 'Failed to update appointment'
                    });

                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        currentOperation: null
                    });

                    throw error;
                }
            },

            updateAppointmentStatus: async (id: string, status: string, cancellationReason?: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'status' });
                    
                    const response = await updateAppointmentStatusService(id, status, cancellationReason);
                    
                    if (response.success) {
                        const currentState = get();

                        if (currentState.currentAppointment && currentState.currentAppointment.id === id) {
                            set({
                                currentAppointment: {
                                    ...currentState.currentAppointment,
                                    status: status as AppointmentStatus,
                                    ...(cancellationReason && { cancellationReason }),
                                    updatedAt: new Date().toISOString()
                                }
                            });
                        }

                        if (currentState.viewMode === 'admin') {
                            await get().fetchAppointments({});
                        } else {
                            await get().fetchMyAppointments({});
                        }

                        toast.success(
                            status === 'Cancelled'
                                ? 'Appointment cancelled successfully!'
                                : 'Status updated successfully!'
                        );

                        set({ 
                            isModalStatusOpen: false,
                            isModalCancelOpen: false,
                            selectedAppointment: null,
                            cancelAppointmentData: null
                        });

                        setTimeout(() => {
                            set({ 
                                submitLoading: false,
                                isProcessing: false,
                                currentOperation: null
                            });
                        }, 500);
                    } else {
                        throw new Error(response.data?.message || 'Failed to update status');
                    }
                } catch (error) {
                    console.error('Error updating appointment status:', error);
                    toast.error(
                        status === 'Cancelled'
                            ? 'Failed to cancel appointment'
                            : 'Failed to update appointment status'
                    );
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalStatusOpen: false,
                        isModalCancelOpen: false,
                        selectedAppointment: null,
                        cancelAppointmentData: null,
                        currentOperation: null
                    });
                }
            },

            // NEW: User requests cancellation (needs admin approval)
            requestCancellation: async (id: string, cancellationReason?: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'status' });

                    const response = await requestCancellationService(id, cancellationReason);

                    if (response.success) {
                        const currentState = get();

                        // Update currentAppointment in-place if we're on the details page
                        if (currentState.currentAppointment && currentState.currentAppointment.id === id) {
                            set({
                                currentAppointment: {
                                    ...currentState.currentAppointment,
                                    status: 'CancellationRequested' as AppointmentStatus,
                                    ...(cancellationReason && { cancellationReason }),
                                    updatedAt: new Date().toISOString()
                                }
                            });
                        }

                        if (currentState.viewMode === 'admin') {
                            await get().fetchAppointments({});
                        } else {
                            await get().fetchMyAppointments({});
                        }

                        toast.success('Cancellation request submitted. Awaiting admin approval.');

                        set({
                            isModalCancelOpen: false,
                            cancelAppointmentData: null,
                        });
                    } else {
                        throw new Error(response.message || 'Failed to request cancellation');
                    }
                } catch (error) {
                    console.error('Error requesting cancellation:', error);
                    toast.error('Failed to submit cancellation request');
                } finally {
                    set({ submitLoading: false, isProcessing: false, currentOperation: null });
                }
            },

            // NEW: Admin approves the cancellation request
            approveCancellation: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'status' });

                    const response = await approveCancellationService(id);

                    if (response.success) {
                        const currentState = get();

                        if (currentState.currentAppointment && currentState.currentAppointment.id === id) {
                            set({
                                currentAppointment: {
                                    ...currentState.currentAppointment,
                                    status: 'Cancelled' as AppointmentStatus,
                                    updatedAt: new Date().toISOString()
                                }
                            });
                        }

                        await get().fetchAppointments({});

                        toast.success('Cancellation approved. Appointment is now Cancelled.');
                    } else {
                        throw new Error(response.message || 'Failed to approve cancellation');
                    }
                } catch (error) {
                    console.error('Error approving cancellation:', error);
                    toast.error('Failed to approve cancellation');
                } finally {
                    set({ submitLoading: false, isProcessing: false, currentOperation: null });
                }
            },

            // NEW: Admin rejects the cancellation request
            rejectCancellation: async (id: string, revertStatus = 'Scheduled') => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'status' });

                    const response = await rejectCancellationService(id, revertStatus);

                    if (response.success) {
                        const currentState = get();

                        if (currentState.currentAppointment && currentState.currentAppointment.id === id) {
                            set({
                                currentAppointment: {
                                    ...currentState.currentAppointment,
                                    status: revertStatus as AppointmentStatus,
                                    cancellationReason: undefined,
                                    updatedAt: new Date().toISOString()
                                }
                            });
                        }

                        await get().fetchAppointments({});

                        toast.success(`Cancellation rejected. Appointment reverted to ${revertStatus}.`);
                    } else {
                        throw new Error(response.message || 'Failed to reject cancellation');
                    }
                } catch (error) {
                    console.error('Error rejecting cancellation:', error);
                    toast.error('Failed to reject cancellation');
                } finally {
                    set({ submitLoading: false, isProcessing: false, currentOperation: null });
                }
            },

            deleteAppointment: async (id: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    await deleteAppointment(id);
                    const currentState = get();
                    
                    if (currentState.viewMode === 'admin') {
                        await get().fetchAppointments({});
                    } else {
                        await get().fetchMyAppointments({});
                    }
                    
                    toast.success('Appointment deleted successfully!')
                    set({ isModalDeleteOpen: false, deleteAppointmentData: null })

                    setTimeout(() => {
                        set({ 
                            submitLoading: false,
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)

                } catch (error) {
                    console.error('Error deleting appointment:', error)
                    toast.error('Failed to delete appointment');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalStatusOpen: false,
                        selectedAppointment: null,
                        currentOperation: null
                    })
                }
            },

            openModalCreate: () => {
                set({ 
                    isModalCreateOpen: true,
                    validationErrors: {}
                })
            },

            openModalUpdate: (appointment: AppointmentFormData) => {
                const formData: AppointmentFormData & { id?: string } = {
                    id: appointment.id,
                    firstName: appointment.firstName,
                    lastName: appointment.lastName,
                    middleName: appointment.middleName || null,
                    preferredDate: appointment.preferredDate.split('T')[0],
                    preferredTime: appointment.preferredTime,
                    reasonForVisit: appointment.reasonForVisit,
                    status: appointment.status,
                    birthdate: appointment.birthdate,
                    sex: appointment.sex,
                    height: appointment.height,
                    weight: appointment.weight,
                    temperature: appointment.temperature,
                    bloodPressure: appointment.bloodPressure || { systolic: '', diastolic: '' },
                    religion: appointment.religion,
                    motherName: appointment.motherInfo?.name || '',
                    motherAge: appointment.motherInfo?.age || '',
                    motherOccupation: appointment.motherInfo?.occupation || '',
                    fatherName: appointment.fatherInfo?.name || '',
                    fatherAge: appointment.fatherInfo?.age || '',
                    fatherOccupation: appointment.fatherInfo?.occupation || '',
                    motherInfo: appointment.motherInfo,
                    fatherInfo: appointment.fatherInfo,
                    contactNumber: appointment.contactNumber,
                    address: appointment.address
                }
                
                set({ 
                    selectedAppointment: formData, 
                    isModalUpdateOpen: true,
                    validationErrors: {}
                })
            },

            openModalStatus: (appointment: AppointmentFormData) => {
                set({
                    selectedAppointment: appointment,
                    isModalStatusOpen: true
                })
            },

            openModalCancel: (appointment: AppointmentFormData) => {
                set({
                    cancelAppointmentData: appointment,
                    isModalCancelOpen: true
                })
            },

            openModalDelete: (appointment: AppointmentFormData) => {
                const userName = appointment.firstName || 'Unknown User'
                const appointmentDate = appointment.preferredDate
                
                set({
                    deleteAppointmentData: {
                        id: appointment.id,
                        itemName: `${userName}'s appointment on ${appointmentDate}`,
                        itemType: 'Appointment'
                    },
                    isModalDeleteOpen: true
                })
            },

            closeModalCreate: () => {
                set({ 
                    isModalCreateOpen: false, 
                    selectedAppointment: null,
                    validationErrors: {}
                })
            },

            closeModalUpdate: () => {
                set({ 
                    isModalUpdateOpen: false, 
                    selectedAppointment: null,
                    validationErrors: {}
                })
            },

            closeModalStatus: () => {
                set({ 
                    isModalStatusOpen: false, 
                    selectedAppointment: null,
                })
            },

            closeModalCancel: () => {
                set({
                    isModalCancelOpen: false,
                    cancelAppointmentData: null
                })
            },

            closeModalDelete: () => {
                set({ 
                    isModalDeleteOpen: false, 
                    deleteAppointmentData: null 
                })
            },

            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
            clearCurrentAppointment: () => set({ currentAppointment: null })
        }),
        {
            name: 'appointment-store'
        }
    )
)