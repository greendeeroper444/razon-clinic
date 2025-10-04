import { BasePDFTemplate, Colors } from './basePdfTemplate';
import { BillingFormData } from '../types';

export class BillingReceiptPDF extends BasePDFTemplate {
    private billing: BillingFormData;

    constructor(billing: BillingFormData) {
        super();
        this.billing = billing;
    }

    protected buildDocument(): void {
        this.drawHeader('BILLING RECEIPT');

        this.drawPatientAndInvoiceInfo();

        this.drawItemsTable();

        this.drawSummarySection();

        this.drawPaymentStatus();

        this.drawNotesSection();

        this.drawFooter();
    }

    private drawPatientAndInvoiceInfo(): void {
        let medicalRecordId = 'N/A';
        
        if (this.billing.medicalRecordId) {
            if (typeof this.billing.medicalRecordId === 'string') {
                medicalRecordId = this.billing.medicalRecordId;
            } else if (typeof this.billing.medicalRecordId === 'object') {
                medicalRecordId = (this.billing.medicalRecordId as any).id || 
                (this.billing.medicalRecordId as any)._id ||
                JSON.stringify(this.billing.medicalRecordId);
            } else {
                medicalRecordId = String(this.billing.medicalRecordId);
            }
        }

        const leftContent = [
            this.billing.patientName || 'N/A',
            `Medical Record: ${medicalRecordId}`
        ];

        const rightContent = [
            `Date: ${this.formatDate(this.billing.medicalRecordDate || this.billing.createdAt)}`,
            `Status: ${this.billing.paymentStatus || 'Unknown'}`
        ];

        this.drawTwoColumnSection(
            'Bill To:',
            leftContent,
            'Invoice Details:',
            rightContent
        );
    }

    private drawItemsTable(): void {
        const tableData = this.prepareTableData();
        
        this.drawTable(
            ['Item', 'Quantity', 'Unit Price', 'Subtotal'],
            tableData,
            {
                0: { halign: 'left', cellWidth: 'auto' },
                1: { halign: 'center', cellWidth: 30 },
                2: { halign: 'right', cellWidth: 35 },
                3: { halign: 'right', cellWidth: 35 }
            },
            'auto'
        );
    }

    private drawSummarySection(): void {
        const taxRate = 0;
        const taxAmount = this.billing.amount * taxRate;
        const total = this.billing.amount + taxAmount;

        const summaryX = 120;
        const valueX = 185;

        const summaryItems = [
            { label: 'Subtotal:', value: this.formatCurrency(this.billing.amount) },
        ];

        if (taxRate > 0) {
            summaryItems.push({
                label: `Tax (${(taxRate * 100).toFixed(0)}%):`,
                value: this.formatCurrency(taxAmount)
            });
        }

        this.doc.setDrawColor(...Colors.lightGray);
        this.doc.line(summaryX, this.currentY, valueX + 5, this.currentY);
        this.currentY += 4;

        summaryItems.push({
            label: 'Total Amount:',
            value: this.formatCurrency(total),
            bold: true
        });

        this.drawSummaryBox(summaryItems);

        this.doc.setDrawColor(...Colors.primary);
        this.doc.line(summaryX, this.currentY, valueX + 5, this.currentY);
        this.currentY += 15;
    }

    private drawPaymentStatus(): void {
        const summaryX = 120;
        this.drawStatusBadge(this.billing.paymentStatus, summaryX, this.currentY);
        this.currentY += 20;
    }

    private drawNotesSection(): void {
        const notes = [
            'Please retain this receipt for your records.',
            'All payments are non-refundable unless otherwise specified.',
            'For billing inquiries, please contact our office.'
        ];

        this.drawSection('Notes:', notes, true);
    }

    private prepareTableData(): string[][] {
        const data: string[][] = [];

        if (this.billing.itemName && Array.isArray(this.billing.itemName)) {
            this.billing.itemName.forEach((item, index) => {
                const quantity = this.billing.itemQuantity?.[index] || 1;
                const price = this.billing.itemPrices?.[index] || 0;
                const subtotal = quantity * price;

                data.push([
                    item,
                    quantity.toString(),
                    `P ${price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    `P ${subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                ]);
            });
        }

        if (data.length === 0) {
            data.push([
                'Medical Services',
                '1',
                `P ${this.billing.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `P ${this.billing.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ]);
        }

        return data;
    }

    private formatCurrency(amount: number): string {
        return `P ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    private formatDate(date: string | Date): string {
        return new Date(date).toLocaleDateString();
    }
}

export const generateBillingReceiptPDF = (billing: BillingFormData): void => {
    const fileName = `billing-receipt-${billing.medicalRecordId}-${new Date().toISOString().split('T')[0]}.pdf`;
    const pdfGenerator = new BillingReceiptPDF(billing);
    pdfGenerator.generate(fileName);
};

export const getBillingReceiptBlob = (billing: BillingFormData): Blob => {
    const pdfGenerator = new BillingReceiptPDF(billing);
    return pdfGenerator.getBlob();
};