import React, { useState, useEffect } from 'react'
import { InventoryItemFormProps } from '../../../../types';
import Input from '../../../ui/Input/Input';
import Select from '../../../ui/Select/Select';
import useScrollToError from '../../../../hooks/useScrollToError';
import { useInventoryStore } from '../../../../stores';

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
    formData,
    onChange,
    isRestockMode = false,
    isAddQuantityMode = false
}) => {
    const [addQuantity, setAddQuantity] = useState<string>('');
    const [originalStock, setOriginalStock] = useState<number>(0);
    const validationErrors = useInventoryStore((state) => state.validationErrors);

    const { fieldRefs } = useScrollToError({
        validationErrors,
        fieldOrder: [
            'itemName',
            'category',
            'price',
            'quantityInStock',
            'quantityUsed',
            'expiryDate'
        ],
        scrollBehavior: 'smooth',
        scrollBlock: 'center',
        focusDelay: 300
    });

    const getFieldError = (fieldName: string): string | undefined => {
        const errors = validationErrors[fieldName];
        return errors && errors.length > 0 ? errors[0] : undefined;
    };

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
                <Input
                    type='number'
                    label={
                        <>
                            Add quantity for <strong>{formData?.itemName}</strong>
                        </>
                    }
                    name='addQuantity'
                    value={addQuantity}
                    onChange={handleAddQuantityChange}
                    min='0'
                    placeholder='Enter quantity to add'
                    autoFocus
                />
            )
        }

        {/* show all fields in normal mode */}
        {
            !isRestockMode && !isAddQuantityMode && (
                <>
                    <Input
                        ref={(el) => { fieldRefs.current['itemName'] = el; }}
                        type='text'
                        label='Item Name'
                        name='itemName'
                        placeholder='Item name'
                        value={formData?.itemName || ''}
                        onChange={onChange}
                        error={getFieldError('itemName')}
                    />

                    <br />

                    <Select
                        ref={(el) => { fieldRefs.current['category'] = el; }}
                        name='category'
                        label='Category'
                        title='Select Category'
                        leftIcon='pill'
                        placeholder='Select Category'
                        value={formData.category || ''}
                        onChange={onChange}
                        options={[
                            { value: 'Vaccine', label: 'Vaccine' },
                            { value: 'Medical Supply', label: 'Medical Supply' }
                        ]}
                        error={getFieldError('category')}
                    />

                    <Input
                        ref={(el) => { fieldRefs.current['price'] = el; }}
                        type='number'
                        label='Price'
                        name='price'
                        placeholder='Enter price'
                        value={formData?.price || ''}
                        onChange={onChange}
                        min='0'
                        readOnly={isAddQuantityMode}
                        disabled={isAddQuantityMode}
                        error={getFieldError('price')}
                    />

                </>
            )
        }

        <br />

        {/* always show quantity fields */}
        <Input
            ref={(el) => { fieldRefs.current['quantityInStock'] = el; }}
            type='number'
            label='Quantity in Stock'
            name='quantityInStock'
            placeholder='Enter quantity in stock'
            value={formData?.quantityInStock || ''}
            onChange={onChange}
            min='0'
            readOnly={isAddQuantityMode}
            disabled={isAddQuantityMode}
            error={getFieldError('quantityInStock')}
        />

        <br />

        <Input
            ref={(el) => { fieldRefs.current['quantityUsed'] = el; }}
            type='number'
            label='Quantity Used'
            name='quantityUsed'
            placeholder='Enter quantity used'
            value={formData?.quantityUsed || 0}
            onChange={onChange}
            min='0'
            readOnly={isRestockMode}
            disabled={isRestockMode}
            error={getFieldError('quantityUsed')}
        />

        <br />

        {/* hide expiry date in restock mode */}
        {
            !isRestockMode && (
                <Input
                    ref={(el) => { fieldRefs.current['expiryDate'] = el; }}
                    type='date'
                    label='Expiry Date'
                    name='expiryDate'
                    value={formData?.expiryDate || ''}
                    onChange={onChange}
                    leftIcon='calendar'
                    error={getFieldError('expiryDate')}
                />
            )
        }
    </>
  )
}

export default InventoryItemForm