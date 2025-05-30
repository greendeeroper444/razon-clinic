import { AppointmentFormProps } from '../../types/appointment'
import styles from '../ModalComponent/ModalComponent.module.css'

const AppointmentForm: React.FC<AppointmentFormProps> = ({
    formData,
    onChange,
    isLoading,
}) => {

  return (
    <div className={styles.sectionDivider}>
        <h4>Patient Information</h4>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='firstName'>First Name *</label>
                <input
                    type='text'
                    id='firstName'
                    name='firstName'
                    value={formData?.firstName || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                    placeholder="Patient's first name"
                />
            </div>
        </div>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='lastName'>Last Name *</label>
                <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    value={formData?.lastName || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                    placeholder="Patient's last name"
                />
            </div>
        </div>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='middleName'>Middle Name (Optional)</label>
                <input
                    type='text'
                    id='middleName'
                    name='middleName'
                    value={formData?.middleName || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    disabled={isLoading}
                    placeholder="Patient's middle name (optional)"
                />
            </div>
        </div>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='birthdate'>Birth Date *</label>
                <input
                    type='date'
                    id='birthdate'
                    name='birthdate'
                    value={formData?.birthdate || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='sex'>Sex *</label>
                <select
                    id='sex'
                    name='sex'
                    value={formData?.sex || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                >
                    <option value=''>Select Sex</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                </select>
            </div>
        </div>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='height'>Height (cm)</label>
                <input
                    type='number'
                    id='height'
                    name='height'
                    value={formData?.height || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    min={30}
                    max={300}
                    placeholder="Height in cm"
                    disabled={isLoading}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='weight'>Weight (kg)</label>
                <input
                    type='number'
                    id='weight'
                    name='weight'
                    value={formData?.weight || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    min={1}
                    max={500}
                    placeholder="Weight in kg"
                    disabled={isLoading}
                />
            </div>
        </div>
        <div className={styles.formGroup}>
            <label htmlFor='religion'>Religion</label>
            <input
                type='text'
                id='religion'
                name='religion'
                value={formData?.religion || ''}
                onChange={onChange}
                className={styles.formControl}
                maxLength={30}
                placeholder="Religion (optional)"
                disabled={isLoading}
            />
        </div>

        {/* mother's information*/}
        <div className={styles.sectionDivider}>
            <h4>Mother's Information</h4>
            
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor='motherName'>Mother's Name</label>
                    <input
                        type='text'
                        id='motherName'
                        name='motherName'
                        value={formData?.motherName || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        maxLength={50}
                        placeholder="Mother's full name"
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor='motherAge'>Mother's Age</label>
                    <input
                        type='number'
                        id='motherAge'
                        name='motherAge'
                        value={formData?.motherAge || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        min={15}
                        max={120}
                        placeholder="Age"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='motherOccupation'>Mother's Occupation</label>
                <input
                    type='text'
                    id='motherOccupation'
                    name='motherOccupation'
                    value={formData?.motherOccupation || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    maxLength={50}
                    placeholder="Mother's occupation"
                    disabled={isLoading}
                />
            </div>
        </div>

        {/* father's information */}
        <div className={styles.sectionDivider}>
            <h4>Father's Information</h4>
            
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor='fatherName'>Father's Name</label>
                    <input
                        type='text'
                        id='fatherName'
                        name='fatherName'
                        value={formData?.fatherName || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        maxLength={50}
                        placeholder="Father's full name"
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor='fatherAge'>Father's Age</label>
                    <input
                        type='number'
                        id='fatherAge'
                        name='fatherAge'
                        value={formData?.fatherAge || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        min={15}
                        max={120}
                        placeholder="Age"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='fatherOccupation'>Father's Occupation</label>
                <input
                    type='text'
                    id='fatherOccupation'
                    name='fatherOccupation'
                    value={formData?.fatherOccupation || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    maxLength={50}
                    placeholder="Father's occupation"
                    disabled={isLoading}
                />
            </div>
        </div>
        <div className={styles.formGroup}>
            <label htmlFor='contactNumber'>Contact Number *</label>
            <input
                type='number'
                id='contactNumber'
                name='contactNumber'
                value={formData?.contactNumber || ''}
                onChange={onChange}
                className={styles.formControl}
                required
                disabled={isLoading}
                placeholder='Enter contact number'
            />
        </div>
        <div className={styles.formGroup}>
            <label htmlFor='address'>Address *</label>
            <input
                type='text'
                id='address'
                name='address'
                value={formData?.address || ''}
                onChange={onChange}
                className={styles.formControl}
                required
                disabled={isLoading}
                placeholder="Enter address"
                title="Address"
            />
        </div>

        {/* appointment details  */}
        <h4>Appointment Details</h4>
        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor='preferredDate'>Preferred Date *</label>
                <input
                    type='date'
                    id='preferredDate'
                    name='preferredDate'
                    value={formData?.preferredDate || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    min={new Date().toISOString().split('T')[0]} //prevent past dates
                    required
                    disabled={isLoading}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor='preferredTime'>Preferred Time *</label>
                <input
                    type='time'
                    id='preferredTime'
                    name='preferredTime'
                    value={formData?.preferredTime || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                    disabled={isLoading}
                />
            </div>
        </div>

        <div className={styles.formGroup}>
            <label htmlFor='reasonForVisit'>Reason for Visit *</label>
            <textarea
                id='reasonForVisit'
                name='reasonForVisit'
                value={formData?.reasonForVisit || ''}
                onChange={onChange}
                className={styles.formControl}
                rows={4}
                minLength={5}
                maxLength={200}
                placeholder="Please describe the reason for your visit (5-200 characters)"
                required
                disabled={isLoading}
            ></textarea>
            <small className={styles.charCount}>
                {(formData?.reasonForVisit || '').length}/200 characters
            </small>
        </div>
    </div>
  )
}

export default AppointmentForm;