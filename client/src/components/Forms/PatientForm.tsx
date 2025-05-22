import React, { ChangeEvent } from 'react';
import { PatientFormData } from '../../types';
import styles from '../ModalComponent/ModalComponent.module.css';

interface PatientFormProps {
  formData: PatientFormData;
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
          maxLength={30}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
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

      <div className={styles.formNote}>
        <small>* Either email or contact number is required</small>
      </div>
    </>
  );
};

export default PatientForm;