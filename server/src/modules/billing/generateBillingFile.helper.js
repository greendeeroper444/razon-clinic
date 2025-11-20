const { escapeCSV, formatDate, formatTime } = require('@utils/display');

class GenerateBillingFile {
    constructor() {
        this.escapeCSV = escapeCSV;
        this.formatDate = formatDate;
        this.formatTime = formatTime;
    }

    //safe date formatter
    safeFormatDate(date) {
        if (!date) return '';
        try {
            return this.formatDate(date);
        } catch (error) {
            return '';
        }
    }

    //safe datetime formatter
    safeFormatTime(datetime) {
        if (!datetime) return '';
        try {
            return this.formatTime(datetime);
        } catch (error) {
            return '';
        }
    }

    //format items array to readable string
    formatItems(itemNames, itemQuantities, itemPrices) {
        if (!itemNames || !itemNames.length) return '';
        
        return itemNames.map((name, index) => {
            const qty = itemQuantities?.[index] || 0;
            const price = itemPrices?.[index] || 0;
            const subtotal = qty * price;
            return `${name} (Qty: ${qty}, Price: ₱${price.toFixed(2)}, Subtotal: ₱${subtotal.toFixed(2)})`;
        }).join('; ');
    }

    generateCSV(records) {
        const headers = [
            'PATIENT NAME',
            'ITEMS',
            'DOCTOR FEE',
            'TOTAL AMOUNT',
            'PAYMENT STATUS',
            'MEDICAL RECORD DATE',
            'BILLING CREATED AT',
            'LAST UPDATED'
        ];

        let csv = headers.map(h => this.escapeCSV(h)).join(',') + '\n';

        records.forEach(record => {
            const row = [
                record.patientName || record.medicalRecordId?.personalDetails?.fullName || '',
                this.formatItems(record.itemName, record.itemQuantity, record.itemPrices),
                record.doctorFee || 0,
                record.amount || 0,
                record.paymentStatus || '',
                this.safeFormatDate(record.medicalRecordDate),
                this.safeFormatTime(record.createdAt),
                this.safeFormatTime(record.updatedAt)
            ];

            csv += row.map(field => this.escapeCSV(String(field))).join(',') + '\n';
        });

        return csv;
    }

    async generateXLSX(records) {
        const ExcelJS = require('exceljs');
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Billing Records');

        //define columns based on billing model
        worksheet.columns = [
            // { header: 'MEDICAL RECORD #', key: 'medicalRecordNumber', width: 18 },
            { header: 'PATIENT NAME', key: 'patientName', width: 25 },
            { header: 'DIAGNOSIS', key: 'diagnosis', width: 30 },
            { header: 'ITEM NAME', key: 'itemName', width: 20 },
            { header: 'QUANTITY', key: 'itemQuantity', width: 12 },
            { header: 'UNIT PRICE', key: 'unitPrice', width: 15 },
            { header: 'SUBTOTAL', key: 'subtotal', width: 15 },
            { header: 'DOCTOR FEE', key: 'doctorFee', width: 15 },
            { header: 'TOTAL AMOUNT', key: 'totalAmount', width: 15 },
            { header: 'PAYMENT STATUS', key: 'paymentStatus', width: 15 },
            { header: 'MEDICAL RECORD DATE', key: 'medicalRecordDate', width: 18 },
            { header: 'BILLING CREATED', key: 'createdAt', width: 18 },
            { header: 'LAST UPDATED', key: 'updatedAt', width: 18 }
        ];

        //style the header row
        worksheet.getRow(1).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2E7D32' }
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        //data rows
        records.forEach(record => {
            const medicalRecordNumber = record.medicalRecordId?.medicalRecordNumber || '';
            const patientName = record.patientName || record.medicalRecordId?.personalDetails?.fullName || '';
            const diagnosis = record.medicalRecordId?.diagnosis || '';
            const itemNames = record.itemName || [];
            const itemQuantities = record.itemQuantity || [];
            const itemPrices = record.itemPrices || [];

            if (itemNames.length > 0) {
                itemNames.forEach((itemName, index) => {
                    const quantity = itemQuantities[index] || 0;
                    const unitPrice = itemPrices[index] || 0;
                    const subtotal = quantity * unitPrice;

                    worksheet.addRow({
                        // medicalRecordNumber: index === 0 ? medicalRecordNumber : '',
                        patientName: index === 0 ? patientName : '',
                        diagnosis: index === 0 ? diagnosis : '',
                        itemName: itemName,
                        itemQuantity: quantity,
                        unitPrice: `₱${unitPrice.toFixed(2)}`,
                        subtotal: `₱${subtotal.toFixed(2)}`,
                        doctorFee: index === 0 ? `₱${(record.doctorFee || 0).toFixed(2)}` : '',
                        totalAmount: index === 0 ? `₱${record.amount.toFixed(2)}` : '',
                        paymentStatus: index === 0 ? record.paymentStatus : '',
                        medicalRecordDate: index === 0 ? this.safeFormatDate(record.medicalRecordDate) : '',
                        createdAt: index === 0 ? this.safeFormatTime(record.createdAt) : '',
                        updatedAt: index === 0 ? this.safeFormatTime(record.updatedAt) : ''
                    });
                });
            } else {
                worksheet.addRow({
                    medicalRecordNumber: medicalRecordNumber,
                    patientName: patientName,
                    diagnosis: diagnosis,
                    itemName: 'No items',
                    itemQuantity: 0,
                    unitPrice: '₱0.00',
                    subtotal: '₱0.00',
                    totalAmount: `₱${record.amount.toFixed(2)}`,
                    paymentStatus: record.paymentStatus,
                    medicalRecordDate: this.safeFormatDate(record.medicalRecordDate),
                    createdAt: this.safeFormatTime(record.createdAt),
                    updatedAt: this.safeFormatTime(record.updatedAt)
                });
            }
        });

        //style all cells
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.alignment = { 
                    vertical: 'top', 
                    horizontal: colNumber >= 5 && colNumber <= 8 ? 'right' : 'left',
                    wrapText: true 
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                //highlight payment status
                if (rowNumber > 1 && colNumber === 9) {
                    const status = cell.value;
                    if (status === 'Paid') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFC8E6C9' }
                        };
                    } else if (status === 'Unpaid') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFCDD2' }
                        };
                    } else if (status === 'Pending') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFF9C4' }
                        };
                    }
                }
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }

    generateJSON(records) {
        return JSON.stringify(records, null, 2);
    }
}

module.exports = new GenerateBillingFile();