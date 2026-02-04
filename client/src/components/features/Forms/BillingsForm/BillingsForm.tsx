import React, { useState, useEffect } from 'react'
import styles from './BillingsForm.module.css'
import { BillingFormProps, InventoryItem, InventoryItemOption, MedicalRecordOption } from '../../../../types';
import { getInventoryItems, getMedicalRecordsForBilling } from '../../../../services';
import Select from '../../../ui/Select/Select';
import Input from '../../../ui/Input/Input';
import { useBillingStore } from '../../../../stores';
import useScrollToError from '../../../../hooks/useScrollToError';
import { getFieldError } from '../../../../utils';

const BillingForm: React.FC<BillingFormProps> = ({
    formData,
    onChange
}) => {
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecordOption[]>([]);
    const [availableItems, setAvailableItems] = useState<InventoryItemOption[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const validationErrors = useBillingStore((state) => state.validationErrors);
        
    const { fieldRefs } = useScrollToError({
        validationErrors,
        fieldOrder: [
            'medicalRecordId',
            'patientName',
            'doctorFee',
            'paymentStatus'
        ],
        scrollBehavior: 'smooth',
        scrollBlock: 'center',
        focusDelay: 300
    });


    //fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const [medicalRecordsResponse, inventoryItemsResponse] = await Promise.all([
                    getMedicalRecordsForBilling(),
                    getInventoryItems()
                ]);

                if (medicalRecordsResponse.success) {
                    setMedicalRecords(medicalRecordsResponse.data.medicalRecords);
                }

                if (inventoryItemsResponse.success) {
                    //transform the inventory items to match expected structure
                    const transformedItems = inventoryItemsResponse.data.inventoryItems.map((item: InventoryItem) => ({
                        name: item.itemName,
                        category: item.category,
                        price: item.price,
                        availableQuantity: item.quantityInStock,
                        id: item.id
                    }));
                    
                    setAvailableItems(transformedItems);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    //handle medical record selection
    const handleMedicalRecordChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRecordId = e.target.value;
        const selectedRecord = medicalRecords.find(record => record.id === selectedRecordId);
        
        onChange(e);
        
        //auto-fill patient name if record is selected
        if (selectedRecord) {
            onChange({
                target: {
                    name: 'patientName',
                    value: selectedRecord.patientName
                }
            } as any);
        }
    };

    const addNewItem = () => {
        const currentItems = formData.itemName || [];
        const currentQuantities = formData.itemQuantity || [];
        const currentPrices = formData.itemPrices || [];
        
        //add empty item
        onChange({
            target: {
                name: 'itemName',
                value: [...currentItems, '']
            }
        } as any);
        
        onChange({
            target: {
                name: 'itemQuantity',
                value: [...currentQuantities, 1]
            }
        } as any);

        onChange({
            target: {
                name: 'itemPrices',
                value: [...currentPrices, 0]
            }
        } as any);
    };

    const removeItem = (index: number) => {
        const currentItems = formData.itemName || [];
        const currentQuantities = formData.itemQuantity || [];
        const currentPrices = formData.itemPrices || [];
        
        const newItems = currentItems.filter((_, i) => i !== index);
        const newQuantities = currentQuantities.filter((_, i) => i !== index);
        const newPrices = currentPrices.filter((_, i) => i !== index);
        
        onChange({
            target: {
                name: 'itemName',
                value: newItems
            }
        } as any);
        
        onChange({
            target: {
                name: 'itemQuantity',
                value: newQuantities
            }
        } as any);

        onChange({
            target: {
                name: 'itemPrices',
                value: newPrices
            }
        } as any);

        updateTotalAmount(newQuantities, newPrices, formData.doctorFee || 0);
    };

    const updateItemName = (index: number, itemName: string) => {
        const currentItems = formData.itemName || [];
        const currentPrices = formData.itemPrices || [];
        const newItems = [...currentItems];
        const newPrices = [...currentPrices];
        
        newItems[index] = itemName;
        
        //find price for selected item
        const selectedItem = availableItems.find(item => item.name === itemName);
        if (selectedItem) {
            newPrices[index] = selectedItem.price;
        } else {
            newPrices[index] = 0;
        }
        
        onChange({
            target: {
                name: 'itemName',
                value: newItems
            }
        } as any);

        onChange({
            target: {
                name: 'itemPrices',
                value: newPrices
            }
        } as any);

        updateTotalAmount(formData.itemQuantity || [], newPrices, formData.doctorFee || 0);
    };

    const updateQuantity = (index: number, quantity: number) => {
        const currentQuantities = formData.itemQuantity || [];
        const newQuantities = [...currentQuantities];
        
        //check available stock
        const itemName = formData.itemName?.[index];
        if (itemName) {
            const availableItem = availableItems.find(item => item.name === itemName);
            if (availableItem && quantity > availableItem.availableQuantity) {
                alert(`Only ${availableItem.availableQuantity} units available for ${itemName}`);
                return;
            }
        }
        
        newQuantities[index] = quantity;
        
        onChange({
            target: {
                name: 'itemQuantity',
                value: newQuantities
            }
        } as any);

        updateTotalAmount(newQuantities, formData.itemPrices || [], formData.doctorFee || 0);
    };

    const updateUnitPrice = (index: number, price: number) => {
        const currentPrices = formData.itemPrices || [];
        const newPrices = [...currentPrices];
        newPrices[index] = price;
        
        onChange({
            target: {
                name: 'itemPrices',
                value: newPrices
            }
        } as any);

        updateTotalAmount(formData.itemQuantity || [], newPrices, formData.doctorFee || 0);
    };

    const handleDoctorFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const doctorFee = parseFloat(e.target.value) || 0;
        
        onChange({
            target: {
                name: 'doctorFee',
                value: doctorFee
            }
        } as any);

        updateTotalAmount(formData.itemQuantity || [], formData.itemPrices || [], doctorFee);
    };

    const updateTotalAmount = (quantities: number[], prices: number[], doctorFee: number) => {
        const itemsTotal = quantities.reduce((sum, qty, index) => {
            return sum + (qty * (prices[index] || 0));
        }, 0);

        const total = itemsTotal + (doctorFee || 0);

        onChange({
            target: {
                name: 'amount',
                value: total
            }
        } as any);
    };

    const getItemTotal = (index: number): number => {
        const quantity = formData.itemQuantity?.[index] || 0;
        const price = formData.itemPrices?.[index] || 0;
        return quantity * price;
    };

    const getAvailableStock = (itemName: string): number => {
        const item = availableItems.find(item => item.name === itemName);
        return item?.availableQuantity || 0;
    };

    const getItemsSubtotal = (): number => {
        const quantities = formData.itemQuantity || [];
        const prices = formData.itemPrices || [];
        return quantities.reduce((sum, qty, index) => {
            return sum + (qty * (prices[index] || 0));
        }, 0);
    };

    if (loading) {
        return <div className={styles.loading}>Loading billing data...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                <button type='submit' onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

  return (
    <>
        <Select
            ref={(el) => { fieldRefs.current['medicalRecordId'] = el; }}
            label='Select Medical Record *'
            name='medicalRecordId'
            value={formData?.medicalRecordId || ''}
            onChange={handleMedicalRecordChange}
            placeholder='Choose a medical record...'
            leftIcon='user'
            options={medicalRecords.map(record => ({
                value: record.id,
                label: `${record.patientName} - ${record.date} (${record.diagnosis})`
            }))}
            error={getFieldError(validationErrors, 'medicalRecordId')}
        />

        <Input
            ref={(el) => { fieldRefs.current['patientName'] = el; }}
            type='text'
            label='Patient Name *'
            name='patientName'
            value={formData?.patientName || ''}
            onChange={onChange}
            placeholder="Enter patient's full name"
            leftIcon='user'
            maxLength={100}
            error={getFieldError(validationErrors, 'patientName')}
        />

        <div className={styles.billingSection}>
            <div className={styles.sectionHeader}>
                <h4>Billing Items</h4>
                <button 
                    type="button" 
                    onClick={addNewItem}
                    className={styles.addItemBtn}
                >
                    + Add Item
                </button>
            </div>

            {
                formData.itemName && formData.itemName.length > 0 && (
                    <div className={styles.tableContainer}>
                        <table className={styles.billingTable}>
                            <thead>
                                <tr className={styles.tableHeader}>
                                    <th className={styles.tableHeaderCell}>Item Name</th>
                                    <th className={styles.tableHeaderCell}>Available</th>
                                    <th className={styles.tableHeaderCell}>Quantity</th>
                                    <th className={styles.tableHeaderCell}>Unit Price</th>
                                    <th className={styles.tableHeaderCell}>Total</th>
                                    <th className={styles.tableHeaderCell}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    formData.itemName.map((item, index) => (
                                        <tr key={index} className={styles.tableRow}>
                                            <td className={styles.tableCell}>
                                                <select
                                                    title='Select Item'
                                                    value={item}
                                                    onChange={(e) => updateItemName(index, e.target.value)}
                                                    className={styles.itemSelect}
                                                >
                                                    <option value="">Select item...</option>
                                                    {
                                                        availableItems.map((availableItem) => (
                                                            <option 
                                                                key={`${availableItem.name}-${availableItem.category}`} 
                                                                value={availableItem.name}
                                                                disabled={availableItem.availableQuantity === 0}
                                                                className={availableItem.availableQuantity === 0 ? styles.outOfStock : ''}
                                                            >
                                                                {availableItem.name} ({availableItem.availableQuantity} {availableItem.availableQuantity === 0 ? 'out of stock' : 'stocks'})
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </td>

                                            <td className={styles.tableCell}>
                                                <span className={styles.stockInfo}>
                                                    {item ? getAvailableStock(item) : '-'}
                                                </span>
                                            </td>

                                            <td className={styles.tableCell}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={item ? getAvailableStock(item) : undefined}
                                                    value={formData.itemQuantity?.[index] || 1}
                                                    onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                                    className={styles.quantityInput}
                                                    disabled={!item}
                                                    placeholder='Quantity'
                                                />
                                            </td>

                                            <td className={styles.tableCell}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.itemPrices?.[index] || 0}
                                                    onChange={(e) => updateUnitPrice(index, parseFloat(e.target.value) || 0)}
                                                    className={styles.priceInput}
                                                    placeholder="₱0"
                                                    readOnly
                                                />
                                            </td>

                                            <td className={styles.tableCell}>
                                                <span className={styles.totalCell}>
                                                    ₱{getItemTotal(index).toFixed(2)}
                                                </span>
                                            </td>

                                            <td className={styles.tableCell}>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className={styles.removeBtn}
                                                    title="Remove item"
                                                >
                                                    &times;
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                )
            }
        </div>

        <Input
            ref={(el) => { fieldRefs.current['doctorFee'] = el; }}
            type='number'
            label='Doctor Fee'
            name='doctorFee'
            value={formData?.doctorFee || ''}
            onChange={handleDoctorFeeChange}
            placeholder="Enter doctor's fee"
            leftIcon='dollar'
            min={0}
            step={0.01}
            error={getFieldError(validationErrors, 'doctorFee')}
        />

        <Select
            ref={(el) => { fieldRefs.current['paymentStatus'] = el; }}
            name='paymentStatus'
            label='Payment Status'
            title='Select Status'
            leftIcon='status'
            placeholder='Select Status'
            value={formData.paymentStatus || ''}
            onChange={onChange}
            options={[
                { value: 'Unpaid', label: 'Unpaid' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Paid', label: 'Paid' }
            ]}
            error={getFieldError(validationErrors, 'paymentStatus')}
        />

        <div className={styles.totalSection}>
            <div className={styles.totalBreakdown}>
                <div className={styles.subtotalRow}>
                    <span className={styles.subtotalLabel}>Items Subtotal:</span>
                    <span className={styles.subtotalAmount}>
                        ₱{getItemsSubtotal().toFixed(2)}
                    </span>
                </div>
                <div className={styles.subtotalRow}>
                    <span className={styles.subtotalLabel}>Doctor Fee:</span>
                    <span className={styles.subtotalAmount}>
                        ₱{(formData.doctorFee || 0).toFixed(2)}
                    </span>
                </div>
                <div className={styles.totalDivider}></div>
                <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Total Amount:</span>
                    <span className={styles.totalAmount}>
                        ₱{(formData.amount || 0).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    </>
  )
}

export default BillingForm