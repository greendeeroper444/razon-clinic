import React, { ChangeEvent } from 'react';
import { InventoryItemFormData } from '../../types';
import styles from '../ModalComponent/ModalComponent.module.css';

interface InventoryItemFormProps {
  formData: InventoryItemFormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  formData,
  onChange
}) => {
  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor="medicine">Medicine Name</label>
        <input
          type="text"
          id="medicine"
          name="medicine"
          value={formData.medicine || ''}
          onChange={onChange}
          className={styles.formControl}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category || ''}
          onChange={onChange}
          className={styles.formControl}
          required
        >
          <option value="">Select Category</option>
          <option value="antibiotics">Antibiotics</option>
          <option value="painkillers">Painkillers</option>
          <option value="antihistamines">Antihistamines</option>
          <option value="vitamins">Vitamins</option>
          <option value="supplies">Medical Supplies</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="minLevel">Minimum Stock Level</label>
        <input
          type="number"
          id="minLevel"
          name="minLevel"
          value={formData.minLevel || ''}
          onChange={onChange}
          className={styles.formControl}
          min="0"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="expirationDate">Expiration Date</label>
        <input
          type="date"
          id="expirationDate"
          name="expirationDate"
          value={formData.expirationDate || ''}
          onChange={onChange}
          className={styles.formControl}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="location">Storage Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location || ''}
          onChange={onChange}
          className={styles.formControl}
          required
        />
      </div>
    </>
  );
};

export default InventoryItemForm;