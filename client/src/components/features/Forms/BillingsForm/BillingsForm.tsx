import React, { useState, useEffect } from 'react'
import styles from './BillingsForm.module.css'
import { BillingFormProps, InventoryItemOption, MedicalRecordOption } from '../../../../types';
import { getInventoryItemsForBilling, getMedicalRecordsForBilling } from '../../../../services';

const BillingForm: React.FC<BillingFormProps> = ({
    formData,
    onChange
}) => {
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecordOption[]>([]);
    const [availableItems, setAvailableItems] = useState<InventoryItemOption[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    //fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const [medicalRecordsResponse, inventoryItemsResponse] = await Promise.all([
                    getMedicalRecordsForBilling(),
                    getInventoryItemsForBilling()
                ]);

                if (medicalRecordsResponse.data.success) {
                    setMedicalRecords(medicalRecordsResponse.data.data);
                }

                if (inventoryItemsResponse.data.success) {
                    setAvailableItems(inventoryItemsResponse.data.data);
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
            } as React.ChangeEvent<HTMLInputElement>);
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
        } as React.ChangeEvent<HTMLInputElement>);
        
        onChange({
            target: {
                name: 'itemQuantity',
                value: [...currentQuantities, 1]
            }
        } as React.ChangeEvent<HTMLInputElement>);

        onChange({
            target: {
                name: 'itemPrices',
                value: [...currentPrices, 0]
            }
        } as React.ChangeEvent<HTMLInputElement>);
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
        } as React.ChangeEvent<HTMLInputElement>);
        
        onChange({
            target: {
                name: 'itemQuantity',
                value: newQuantities
            }
        } as React.ChangeEvent<HTMLInputElement>);

        onChange({
            target: {
                name: 'itemPrices',
                value: newPrices
            }
        } as React.ChangeEvent<HTMLInputElement>);

        updateTotalAmount(newQuantities, newPrices);
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
        } as React.ChangeEvent<HTMLInputElement>);

        onChange({
            target: {
                name: 'itemPrices',
                value: newPrices
            }
        } as React.ChangeEvent<HTMLInputElement>);

        updateTotalAmount(formData.itemQuantity || [], newPrices);
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
        } as React.ChangeEvent<HTMLInputElement>);

        updateTotalAmount(newQuantities, formData.itemPrices || []);
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
        } as React.ChangeEvent<HTMLInputElement>);

        updateTotalAmount(formData.itemQuantity || [], newPrices);
    };

    const updateTotalAmount = (quantities: number[], prices: number[]) => {
        const total = quantities.reduce((sum, qty, index) => {
            return sum + (qty * (prices[index] || 0));
        }, 0);

        onChange({
            target: {
                name: 'amount',
                value: total
            }
        } as React.ChangeEvent<HTMLInputElement>);
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

    if (loading) {
        return <div className={styles.loading}>Loading billing data...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

  return (
    <>
        <div className={styles.formGroup}>
            <label htmlFor="medicalRecordId" className={styles.fieldLabel}>
                Select Medical Record *
            </label>
            <select
                id="medicalRecordId"
                name="medicalRecordId"
                value={formData.medicalRecordId || ''}
                onChange={handleMedicalRecordChange}
                className={styles.formControl}
                required
            >
                <option value="">Choose a medical record...</option>
                {
                    medicalRecords.map((record) => (
                        <option key={record.id} value={record.id}>
                            {record.patientName} - {record.date} ({record.diagnosis})
                        </option>
                    ))
                }
            </select>
        </div>

        <div className={styles.formGroup}>
            <label htmlFor="patientName" className={styles.fieldLabel}>
                Patient Name *
            </label>
            <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName || ''}
                onChange={onChange}
                className={styles.formControl}
                placeholder="Enter patient's full name"
                required
                maxLength={100}
            />
        </div>

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
                    <div className={styles.billingTable}>
                        <div className={styles.tableHeader}>
                            <div className={styles.tableHeaderCell}>Item Name</div>
                            <div className={styles.tableHeaderCell}>Available</div>
                            <div className={styles.tableHeaderCell}>Quantity</div>
                            <div className={styles.tableHeaderCell}>Unit Price</div>
                            <div className={styles.tableHeaderCell}>Total</div>
                            <div className={styles.tableHeaderCell}>Action</div>
                        </div>

                        {
                            formData.itemName.map((item, index) => (
                                <div key={index} className={styles.tableRow}>
                                    <div className={styles.tableCell}>
                                        <select
                                            value={item}
                                            onChange={(e) => updateItemName(index, e.target.value)}
                                            className={styles.itemSelect}
                                        >
                                            <option value="">Select item...</option>
                                            {
                                                availableItems.map((availableItem) => (
                                                    <option key={`${availableItem.name}-${availableItem.category}`} value={availableItem.name}>
                                                        {availableItem.name} ({availableItem.category}) 
                                                        {/* - Stock: {availableItem.availableQuantity} */}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    <div className={styles.tableCell}>
                                        <span className={styles.stockInfo}>
                                            {item ? getAvailableStock(item) : '-'}
                                        </span>
                                    </div>

                                    <div className={styles.tableCell}>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item ? getAvailableStock(item) : undefined}
                                            value={formData.itemQuantity?.[index] || 1}
                                            onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                            className={styles.quantityInput}
                                            disabled={!item}
                                        />
                                    </div>

                                    <div className={styles.tableCell}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.itemPrices?.[index] || 0}
                                            onChange={(e) => updateUnitPrice(index, parseFloat(e.target.value) || 0)}
                                            className={styles.priceInput}
                                            placeholder="₱0"
                                        />
                                    </div>

                                    <div className={styles.tableCell}>
                                        <span className={styles.totalCell}>
                                            ₱{getItemTotal(index).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className={styles.tableCell}>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className={styles.removeBtn}
                                            title="Remove item"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </div>

        <div className={styles.formGroup}>
            <label htmlFor="paymentStatus" className={styles.fieldLabel}>
                Payment Status
            </label>
            <select
                id="paymentStatus"
                name="paymentStatus"
                value={formData.paymentStatus || 'Unpaid'}
                onChange={onChange}
                className={styles.formControl}
            >
                <option value="Unpaid">Unpaid</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
            </select>
        </div>

        <div className={styles.totalSection}>
            <span className={styles.totalLabel}>Total Amount:</span>
            <span className={styles.totalAmount}>
                ₱{(formData.amount || 0).toFixed(2)}
            </span>
        </div>
    </>
  )
}

export default BillingForm