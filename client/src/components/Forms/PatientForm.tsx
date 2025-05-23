import React, { ChangeEvent } from 'react'
import styles from '../ModalComponent/ModalComponent.module.css';
import { PersonalPatientFormData } from '../../types/personalPatient';

interface PatientFormProps {
    formData: PersonalPatientFormData;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({
    formData,
    onChange
}) => {
  return (
    <>
        <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input
            type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName || ''}
                onChange={onChange}
                className={styles.formControl}
                required
                minLength={3}
                maxLength={50}
            />
        </div>

        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor="email">Email (Optional)</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    placeholder="example@email.com"
                />
            </div>

            <div className={styles.formGroup}>
            <label htmlFor="contactNumber">Contact Number</label>
            <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber || ''}
                onChange={onChange}
                className={styles.formControl}
                placeholder="09123456789 or +639123456789"
                pattern="^(09|\+639)\d{9}$"
                required
            />
            </div>
        </div>

        <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <label htmlFor="birthdate">Birthdate</label>
                <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="sex">Sex</label>
                <select
                    id="sex"
                    name="sex"
                    value={formData.sex || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    required
                >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>

        <div className={styles.formGroup}>
            <label htmlFor="address">Address</label>
            <textarea
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={onChange}
                className={styles.formControl}
                rows={3}
                required
                placeholder="Enter complete address"
            ></textarea>
        </div>

        <div className={styles.formGroup}>
            <label htmlFor="religion">Religion</label>
            <input
                type="text"
                id="religion"
                name="religion"
                value={formData.religion || ''}
                onChange={onChange}
                className={styles.formControl}
                placeholder="Enter religion (optional)"
                maxLength={30}
            />
        </div>

         {/* mother's information section */}
        <div className={styles.formSection}>
            <h4>Mother's Information</h4>
            
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="motherName">Mother's Name</label>
                    <input
                        type="text"
                        id="motherName"
                        name="motherInfo.name"
                        value={formData.motherInfo?.name || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        placeholder="Enter mother's full name"
                        maxLength={50}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="motherAge">Mother's Age</label>
                    <input
                        type="number"
                        id="motherAge"
                        name="motherInfo.age"
                        value={formData.motherInfo?.age || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        placeholder="Enter age"
                        min={15}
                        max={120}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="motherOccupation">Mother's Occupation</label>
                <input
                    type="text"
                    id="motherOccupation"
                    name="motherInfo.occupation"
                    value={formData.motherInfo?.occupation || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    placeholder="Enter mother's occupation"
                    maxLength={50}
                />
            </div>
        </div>

        {/* father's information section */}
        <div className={styles.formSection}>
            <h4>Father's Information</h4>
            
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="fatherName">Father's Name</label>
                    <input
                        type="text"
                        id="fatherName"
                        name="fatherInfo.name"
                        value={formData.fatherInfo?.name || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        placeholder="Enter father's full name"
                        maxLength={50}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="fatherAge">Father's Age</label>
                    <input
                        type="number"
                        id="fatherAge"
                        name="fatherInfo.age"
                        value={formData.fatherInfo?.age || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        placeholder="Enter age"
                        min={15}
                        max={120}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="fatherOccupation">Father's Occupation</label>
                <input
                    type="text"
                    id="fatherOccupation"
                    name="fatherInfo.occupation"
                    value={formData.fatherInfo?.occupation || ''}
                    onChange={onChange}
                    className={styles.formControl}
                    placeholder="Enter father's occupation"
                    maxLength={50}
                />
            </div>
        </div>
    </>
  )
}

export default PatientForm