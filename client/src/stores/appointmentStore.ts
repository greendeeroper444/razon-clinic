import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { getAppointments, getMyAppointment, updateAppointment, deleteAppointment, getAppointmentById, updateAppointmentStatus } from '../services'
import { AppointmentFormData, Patient, AppointmentStatus, ExtendedAppointmentState, OperationType } from '../types'
import { toast } from 'sonner'


export const useAppointmentStore = create<ExtendedAppointmentState>()(
    devtools(
        (set, get) => ({
            appointments: [],
            patients: [],
            loading: false,
            fetchLoading: false,
            submitLoading: false,
            statusLoading: false, 
            error: null,
            isProcessing: false,
            selectedAppointment: null,
            isModalOpen: false,
            isStatusModalOpen: false,
            isDeleteModalOpen: false,
            deleteAppointmentData: null,
            currentAppointment: null,
            viewMode: 'user' as 'admin' | 'user',
            currentOperation: null as OperationType,

            //fetch all appointments with patient extraction (admin view)
            fetchAppointments: async () => {
                try {
                    // set({ loading: true, error: null });
                    set({ fetchLoading: true, loading: true, error: null, viewMode: 'admin' });
                    
                    const response = await getAppointments();
                    
                    if (response.data.success) {
                        const appointments = response.data.data;
                        
                        //extract unique patients from appointments
                        const uniquePatients = Array.from(
                            new Map(
                                appointments
                                .filter(appointment => appointment?.id)
                                .map(appointment => [
                                    appointment.id,
                                    {
                                        id: appointment.id,
                                        firstName: appointment.firstName || 'N/A',
                                        patientNumber: appointment.appointmentNumber || 'N/A'
                                    }
                                ])
                            ).values()
                        )
                        
                        set({ 
                            appointments,
                            patients: uniquePatients as Patient[],
                            loading: false 
                        })
                    } else {
                        set({ error: 'Failed to fetch appointments', loading: false })
                    }
                } catch (error) {
                    console.error('Error fetching appointments:', error)
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching appointments', 
                        loading: false 
                    })
                }
            },

            //fetch only current user's appointments
            fetchMyAppointments: async () => {
                try {
                    // set({ loading: true, error: null });
                    set({ fetchLoading: true, loading: true, error: null, viewMode: 'user' });
                    
                    const response = await getMyAppointment();
                    
                    if (response.data.success) {
                        const appointments = response.data.data;
                        
                        //extract unique patients from appointments (usually just the current user)
                        const uniquePatients = Array.from(
                            new Map(
                                appointments
                                .filter(appointment => appointment?.id)
                                .map(appointment => [
                                    appointment.id,
                                    {
                                        id: appointment.id,
                                        firstName: appointment.firstName || 'N/A',
                                        patientNumber: appointment.appointmentNumber || 'N/A'
                                    }
                                ])
                            ).values()
                        )
                        
                        set({ 
                            appointments,
                            patients: uniquePatients as Patient[],
                            loading: false 
                        })
                    } else {
                        set({ error: 'Failed to fetch your appointments', loading: false })
                    }
                } catch (error) {
                    console.error('Error fetching my appointments:', error)
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching your appointments', 
                        loading: false 
                    })
                }
            },


             //fetch appointment by ID for details page
            fetchAppointmentById: async (appointmentId: string) => {
                try {
                    // set({ loading: true, error: null });
                    set({ fetchLoading: true, loading: true, error: null });
                    
                    const response = await getAppointmentById(appointmentId);
                    
                    if (response.data.success) {
                        set({ 
                            currentAppointment: response.data.data,
                            loading: false 
                        })
                    } else {
                        set({ 
                            error: 'Failed to load appointment details', 
                            loading: false 
                        })
                    }
                } catch (error) {
                   console.error('Error fetching appointments:', error)
                    set({ 
                        fetchLoading: false,
                        error: 'An error occurred while fetching appointments', 
                        loading: false 
                    })
                }
            },


            //update appointment
            updateAppointmentData: async (id: string, data: AppointmentFormData) => {
                try {
                    // set({ loading: true });
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'update' });
                    
                    await updateAppointment(id, data);

                    // //refresh data - fetch all appointments and user appointments
                    // await Promise.all([
                    //     get().fetchAppointments(),
                    //     get().fetchMyAppointments()
                    // ]);
                    
                    //only fetch appointment by id if we have a current appointment loaded
                    const currentState = get();
                    if (currentState.viewMode === 'admin') {
                        await get().fetchAppointments();
                    } else {
                        await get().fetchMyAppointments();
                    }

                    if (currentState.currentAppointment) {
                        await get().fetchAppointmentById(id)
                    }
                    
                    toast.success('Updated appointment successfully!')
                    set({ isModalOpen: false, selectedAppointment: null })

                    setTimeout(() => {
                        set({ 
                            submitLoading: false, 
                            isProcessing: false,
                            currentOperation: null
                        })
                    }, 500)

                } catch (error) {
                    console.error('Error updating appointment:', error)
                    toast.error('Failed to update appointment');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isModalOpen: false, 
                        selectedAppointment: null,
                        currentOperation: null
                    })
                } 
                // finally {
                //     set({ submitLoading: false, isProcessing: false })
                // }
            },

            //update appointment status
            updateAppointmentStatus: async (id: string, status: string) => {
                try {
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'status' });
                    
                    const response = await updateAppointmentStatus(id, status);
                    
                    if (response.data.success) {
                        //update current appointment if it exists
                        const currentState = get()
                        if (currentState.currentAppointment && currentState.currentAppointment.id === id) {
                            set({
                                currentAppointment: {
                                    ...currentState.currentAppointment,
                                    status: status as AppointmentStatus,
                                    updatedAt: new Date().toISOString()
                                }
                            })
                        }

                        //update appointments list
                        const updatedAppointments = currentState.appointments.map(appointment => 
                            appointment.id === id 
                                ? { ...appointment, status: status as AppointmentStatus, updatedAt: new Date().toISOString() }
                                : appointment
                        )
                        

                        toast.success('Status updated successfully!');

                        set({ 
                            appointments: updatedAppointments,
                            isStatusModalOpen: false,
                            selectedAppointment: null,
                        })

                        setTimeout(() => {
                            set({ 
                                submitLoading: false,
                                isProcessing: false,
                                currentOperation: null
                            })
                        }, 500)
                    } else {
                        throw new Error(response.data.message || 'Failed to update status')
                    }
                } catch (error) {
                    console.error('Error updating appointment status:', error)
                    toast.error('Failed to update appointment status');
                    set({ 
                        submitLoading: false, 
                        isProcessing: false,
                        isStatusModalOpen: false,
                        selectedAppointment: null,
                        currentOperation: null
                    })
                } 
                // finally {
                //     set({ submitLoading: false, isProcessing: false })
                // }
            },

            //delete appointment
            deleteAppointment: async (id: string) => {
                try {
                    // set({ isProcessing: true });
                    set({ submitLoading: true, isProcessing: true, currentOperation: 'delete' });
                    
                    //delete the appointment first
                    await deleteAppointment(id);

                    //refresh data - fetch all appointments and user appointments
                    // await Promise.all([
                    //     get().fetchAppointments(),
                    //     get().fetchMyAppointments()
                    // ]);
                    const currentState = get();
                    
                    if (currentState.viewMode === 'admin') {
                        await get().fetchAppointments();
                    } else {
                        await get().fetchMyAppointments();
                    }

                    
                    toast.success('Appointment deleted successfully!')

                    set({ 
                        isDeleteModalOpen: false, 
                        deleteAppointmentData: null 
                    })

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
                        isStatusModalOpen: false,
                        selectedAppointment: null,
                        currentOperation: null
                    })
                } 
                // finally {
                //     set({ submitLoading: false, isProcessing: false })
                // }
            },



            //modal actions
            openUpdateModal: (appointment: AppointmentFormData) => {
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
                    isModalOpen: true 
                })
            },

            openStatusModal: (appointment: AppointmentFormData) => {
                set({
                    selectedAppointment: appointment,
                    isStatusModalOpen: true
                })
            },

            openDeleteModal: (appointment: AppointmentFormData) => {
                const patientName = appointment.firstName || 'Unknown Patient'
                const appointmentDate = appointment.birthdate || appointment.preferredDate
                
                set({
                    deleteAppointmentData: {
                        id: appointment.id,
                        itemName: `${patientName}'s appointment on ${appointmentDate}`,
                        itemType: 'Appointment'
                    },
                    isDeleteModalOpen: true
                })
            },

            closeUpdateModal: () => {
                set({ isModalOpen: false, selectedAppointment: null })
            },

            closeStatusModal: () => {
                set({ isStatusModalOpen: false, selectedAppointment: null })
            },

            closeDeleteModal: () => {
                set({ isDeleteModalOpen: false, deleteAppointmentData: null })
            },

            //utility actions
            setLoading: (loading: boolean) => set({ loading }),
            setError: (error: string | null) => set({ error }),
            clearCurrentAppointment: () => set({ currentAppointment: null })
        }),
        {
            name: 'appointment-store' //for Redux DevTools
        }
    )
)