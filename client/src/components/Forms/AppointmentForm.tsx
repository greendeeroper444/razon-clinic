import { useEffect, useState } from 'react';
import { AppointmentFormProps } from '../../types/appointment'
import styles from '../ModalComponent/ModalComponent.module.css'
import { User } from '../../types/auth';


const AppointmentForm: React.FC<AppointmentFormProps> = ({
    formData,
    onChange,
    isLoading,
    patients
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);


    useEffect(() => {
        //check if user is authenticated
        const token = localStorage.getItem('token');
        const userDataString = localStorage.getItem('userData');
        
        if (token && userDataString) {
            try {
                const userData = JSON.parse(userDataString) as User;
                setIsAuthenticated(true);
                setCurrentUser(userData);
            } catch (error) {
                //handle invalid JSON
                console.error("Error parsing user data:", error);
                //clear invalid data
                localStorage.removeItem('userData');
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
        }
    }, [location.pathname]);


  return (
    
    <>
        <div className={styles.formGroup}>
            <label htmlFor='patientId'>Patient</label>
                       
            {
                currentUser && (currentUser.role === 'Doctor' || currentUser.role === 'Staff') ? (
                    //doctor/staff view - show all patients
                    <select
                        id='patientId'
                        name='patientId'
                        value={formData.patientId || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        required
                        disabled={isLoading}
                    >
                        <option value=''>Select Patient</option>
                        {
                            isLoading ? (
                                <option value='' disabled>Loading patients...</option>
                            ) : (
                                patients.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.fullName}
                                </option>
                                ))
                            )
                        }
                    </select>
                ) : (
                    //patient view - show only their own information
                    <select
                        id='patientId'
                        name='patientId'
                        value={formData.patientId || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        required
                        disabled={isLoading}
                    >
                        <option value=''>Select Patient</option>
                        {
                            currentUser ? (
                                <option key={currentUser.id} value={currentUser.id}>
                                    {currentUser.fullName}
                                </option>
                            ) : (
                                <option value='' disabled>No patient data available</option>
                            )
                        }
                    </select>
                )
            }
        </div>

        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='preferredDate'>Preferred Date</label>
                <input
                    type='date'
                    id='preferredDate'
                    name='preferredDate'
                    value={formData.preferredDate || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='preferredTime'>Preferred Time</label>
                <input
                    type='time'
                    id='preferredTime'
                    name='preferredTime'
                    value={formData.preferredTime || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                />
            </div>
        </div>

        {/* <div className={styles.formGroup}>
            <label htmlFor='status'>Appointment Status</label>
            <select
                id='status'
                name='status'
                value={formData.status || 'Scheduled'}
                onChange={onChange}
                className={styles.formControl}
            >
                <option value='Scheduled'>Scheduled</option>
                <option value='Completed'>Completed</option>
                <option value='Cancelled'>Cancelled</option>
                <option value='Rebooked'>Rebooked</option>
            </select>
        </div> */}

        <div className={styles.formGroup}>
            <label htmlFor='reasonForVisit'>Reason for Visit</label>
            <textarea
                id='reasonForVisit'
                name='reasonForVisit'
                value={formData.reasonForVisit || ''}
                onChange={onChange}
                className={styles.formControl}
                rows={4}
                maxLength={200}
                required
            ></textarea>
        </div>
    </>
  )
}

export default AppointmentForm