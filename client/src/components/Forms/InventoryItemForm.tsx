import React from 'react'
import styles from '../ModalComponent/ModalComponent.module.css';
import { InventoryItemFormProps } from '../../types';



const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
    formData,
    onChange,
    isRestockMode = false
}) => {
  return (
    <>
        {/* show item name as read-only in restock mode */}
        {
            isRestockMode && (
                <div className={styles.formGroup}>
                    <label htmlFor="itemName">Item Name</label>
                    <input
                        type="text"
                        id="itemName"
                        name="itemName"
                        value={formData.itemName || ''}
                        className={styles.formControl}
                        readOnly
                        disabled
                    />
                </div>
            )
        }

        {/* show all fields in normal mode */}
        {
            !isRestockMode && (
                <>
                    <div className={styles.formGroup}>
                        <label htmlFor="itemName">Item Name</label>
                        <input
                            type="text"
                            id="itemName"
                            name="itemName"
                            value={formData.itemName || ''}
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
                            <option value="Vaccine">Vaccine</option>
                            <option value="Medical Supply">Medical Supply</option>
                        </select>
                    </div>
                </>
            )
        }

        {/* always show quantity fields */}
        <div className={styles.formGroup}>
            <label htmlFor="quantityInStock">Quantity in Stock</label>
            <input
                type="number"
                id="quantityInStock"
                name="quantityInStock"
                value={formData.quantityInStock || ''}
                onChange={onChange}
                className={styles.formControl}
                min="0"
                required
            />
        </div>

        <div className={styles.formGroup}>
            <label htmlFor="quantityUsed">Quantity Used</label>
            <input
                type="number"
                id="quantityUsed"
                name="quantityUsed"
                value={formData.quantityUsed || 0}
                onChange={onChange}
                className={styles.formControl}
                min="0"
                readOnly={!isRestockMode}
                disabled={!isRestockMode}
            />
        </div>

        {/* hide expiry date in restock mode */}
        {
            !isRestockMode && (
                <div className={styles.formGroup}>
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                        type="date"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate || ''}
                        onChange={onChange}
                        className={styles.formControl}
                        required
                    />
                </div>
            )
        }
    </>
  )
}

export default InventoryItemForm