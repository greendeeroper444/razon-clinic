const { formatDate, formatTime } = require('@utils/display');

class GenerateReportFile {
    constructor() {
        this.formatDate = formatDate;
        this.formatTime = formatTime;
    }

    safeFormatDate(date) {
        if (!date) return '';
        try {
            return this.formatDate(date);
        } catch (error) {
            return '';
        }
    }

    safeFormatTime(datetime) {
        if (!datetime) return '';
        try {
            return this.formatTime(datetime);
        } catch (error) {
            return '';
        }
    }

    // ==================== INVENTORY REPORT XLSX ====================
    async generateInventoryXLSX(records) {
        const ExcelJS = require('exceljs');
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory Report');

        worksheet.columns = [
            { header: 'ITEM NAME', key: 'itemName', width: 30 },
            { header: 'CATEGORY', key: 'category', width: 15 },
            { header: 'PRICE', key: 'price', width: 12 },
            { header: 'QUANTITY IN STOCK', key: 'quantityInStock', width: 18 },
            { header: 'QUANTITY USED', key: 'quantityUsed', width: 15 },
            { header: 'QUANTITY REMAINING', key: 'quantityRemaining', width: 20 },
            { header: 'TOTAL VALUE', key: 'totalValue', width: 15 },
            { header: 'EXPIRY DATE', key: 'expiryDate', width: 15 },
            { header: 'STATUS', key: 'status', width: 15 },
            { header: 'CREATED AT', key: 'createdAt', width: 18 },
            { header: 'LAST UPDATED', key: 'updatedAt', width: 18 }
        ];

        worksheet.getRow(1).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1976D2' } //blue for inventory
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        records.forEach(record => {
            const quantityRemaining = record.quantityInStock - record.quantityUsed;
            const totalValue = record.quantityInStock * record.price;
            
            let status = 'OK';
            if (quantityRemaining < 10) {
                status = 'Low Stock';
            }
            
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            if (new Date(record.expiryDate) <= thirtyDaysFromNow) {
                status = 'Expiring Soon';
            }
            
            if (new Date(record.expiryDate) < new Date()) {
                status = 'Expired';
            }

            worksheet.addRow({
                itemName: record.itemName,
                category: record.category,
                price: `₱${record.price.toFixed(2)}`,
                quantityInStock: record.quantityInStock,
                quantityUsed: record.quantityUsed,
                quantityRemaining: quantityRemaining,
                totalValue: `₱${totalValue.toFixed(2)}`,
                expiryDate: this.safeFormatDate(record.expiryDate),
                status: status,
                createdAt: this.safeFormatTime(record.createdAt),
                updatedAt: this.safeFormatTime(record.updatedAt)
            });
        });

        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.alignment = { 
                    vertical: 'top', 
                    horizontal: [3, 4, 5, 6, 7].includes(colNumber) ? 'right' : 'left',
                    wrapText: true 
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                //highlight status column
                if (rowNumber > 1 && colNumber === 9) {
                    const status = cell.value;
                    if (status === 'OK') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFC8E6C9' } //green
                        };
                    } else if (status === 'Low Stock') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFF9C4' } //yellow
                        };
                    } else if (status === 'Expiring Soon') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFE0B2' } //orange
                        };
                    } else if (status === 'Expired') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFCDD2' } //red
                        };
                    }
                }
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }

    // ==================== SALES REPORT XLSX ====================
    async generateSalesXLSX(records) {
        const ExcelJS = require('exceljs');
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
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

        worksheet.getRow(1).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2E7D32' } //green for sales
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        records.forEach(record => {
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
                    patientName: patientName,
                    diagnosis: diagnosis,
                    itemName: 'No items',
                    itemQuantity: 0,
                    unitPrice: '₱0.00',
                    subtotal: '₱0.00',
                    doctorFee: `₱${(record.doctorFee || 0).toFixed(2)}`,
                    totalAmount: `₱${record.amount.toFixed(2)}`,
                    paymentStatus: record.paymentStatus,
                    medicalRecordDate: this.safeFormatDate(record.medicalRecordDate),
                    createdAt: this.safeFormatTime(record.createdAt),
                    updatedAt: this.safeFormatTime(record.updatedAt)
                });
            }
        });

        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.alignment = { 
                    vertical: 'top', 
                    horizontal: [4, 5, 6, 7, 8].includes(colNumber) ? 'right' : 'left',
                    wrapText: true 
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

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
}

module.exports = new GenerateReportFile();