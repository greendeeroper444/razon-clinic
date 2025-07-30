import React, { useState, useEffect } from 'react'
import styles from './InventoryItemForm.module.css'
import { InventoryItemFormProps } from '../../../../types';

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
    formData,
    onChange,
    isRestockMode = false,
    isAddQuantityMode = false
}) => {
    const [addQuantity, setAddQuantity] = useState<string>('');
    const [originalStock, setOriginalStock] = useState<number>(0);

    useEffect(() => {
        if (isAddQuantityMode && !originalStock) {
            setOriginalStock(parseInt(String(formData.quantityInStock)) || 0);
        }
    }, [isAddQuantityMode, formData.quantityInStock, originalStock]);

    //handle add quantity change
    const handleAddQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddQuantity(value);
        
        const addQty = parseInt(value) || 0;
        const newTotalStock = originalStock + addQty;
        
        //create a synthetic event for the quantity in stock field
        const syntheticEvent = {
            target: {
                name: 'quantityInStock',
                value: newTotalStock.toString()
            }
        } as React.ChangeEvent<HTMLInputElement>;
        
        //update the main form data
        onChange(syntheticEvent);
    };

  return (
    <>
        {/* show add quantity field in add quantity mode */}
        {
            isAddQuantityMode && (
                <div className={styles.formGroup}>
                    <label htmlFor='addQuantity'>Add quantity for <strong>{formData.itemName}</strong></label>
                    <input
                        type='number'
                        id='addQuantity'
                        name='addQuantity'
                        value={addQuantity}
                        onChange={handleAddQuantityChange}
                        className={styles.formControl}
                        min='0'
                        placeholder='Enter quantity to add'
                        autoFocus
                    />
                </div>
            )
        }

        {/* show all fields in normal mode */}
        {
            !isRestockMode && !isAddQuantityMode && (
                <>
                    <div className={styles.formGroup}>
                        <label htmlFor='itemName'>Item Name</label>
                        <input
                            type="text"
                            id='itemName'
                            name='itemName'
                            value={formData.itemName || ''}
                            onChange={onChange}
                            className={styles.formControl}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor='category'>Category</label>
                        <select
                            id='category'
                            name='category'
                            value={formData.category || ''}
                            onChange={onChange}
                            className={styles.formControl}
                            required
                        >
                            <option value=''>Select Category</option>
                            <option value='Vaccine'>Vaccine</option>
                            <option value='Medical Supply'>Medical Supply</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor='price'>Price</label>
                        <input
                            type='number'
                            id='price'
                            name='price'
                            value={formData.price || ''}
                            onChange={onChange}
                            className={styles.formControl}
                            min='0'
                            required
                            readOnly={isAddQuantityMode}
                            disabled={isAddQuantityMode}
                        />
                    </div>
                </>
            )
        }

        {/* always show quantity fields */}
        <div className={styles.formGroup}>
            <label htmlFor='quantityInStock'>Quantity in Stock</label>
            <input
                type='number'
                id='quantityInStock'
                name='quantityInStock'
                value={formData.quantityInStock || ''}
                onChange={onChange}
                className={styles.formControl}
                min='0'
                required
                readOnly={isAddQuantityMode}
                disabled={isAddQuantityMode}
            />
        </div>

        <div className={styles.formGroup}>
            <label htmlFor='quantityUsed'>Quantity Used</label>
            <input
                type='number'
                id='quantityUsed'
                name='quantityUsed'
                value={formData.quantityUsed || 0}
                onChange={onChange}
                className={styles.formControl}
                min='0'
                readOnly={isRestockMode}
                disabled={isRestockMode}
            />
        </div>

        {/* hide expiry date in restock mode */}
        {
            !isRestockMode && (
                <div className={styles.formGroup}>
                    <label htmlFor='expiryDate'>Expiry Date</label>
                    <input
                        type='date'
                        id='expiryDate'
                        name='expiryDate'
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