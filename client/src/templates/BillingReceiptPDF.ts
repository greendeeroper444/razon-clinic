// // // import { BasePDFTemplate, Colors, Config } from './basePdfTemplate';
// // // import { BillingFormData } from '../types';

// // // export class BillingReceiptPDF extends BasePDFTemplate {
// // //     private billing: BillingFormData;

// // //     constructor(billing: BillingFormData) {
// // //         super();
// // //         this.billing = billing;
// // //     }

// // //     protected buildDocument(): void {
// // //         this.drawHeader('BILLING RECEIPT');

// // //         this.drawPatientAndInvoiceInfo();

// // //         this.drawItemsTable();

// // //         this.drawSummarySection();

// // //         this.drawPaymentStatus();

// // //         this.drawProcessedBySection();

// // //         this.drawNotesSection();

// // //         this.drawFooter();
// // //     }

// // //     private drawPatientAndInvoiceInfo(): void {
// // //         let medicalRecordId = 'N/A';
        
// // //         if (this.billing.medicalRecordId) {
// // //             if (typeof this.billing.medicalRecordId === 'string') {
// // //                 medicalRecordId = this.billing.medicalRecordId;
// // //             } else if (typeof this.billing.medicalRecordId === 'object') {
// // //                 medicalRecordId = (this.billing.medicalRecordId as any).id || 
// // //                 (this.billing.medicalRecordId as any)._id ||
// // //                 JSON.stringify(this.billing.medicalRecordId);
// // //             } else {
// // //                 medicalRecordId = String(this.billing.medicalRecordId);
// // //             }
// // //         }

// // //         const leftContent = [
// // //             this.billing.patientName || 'N/A',
// // //             `Medical Record: ${medicalRecordId}`
// // //         ];

// // //         const rightContent = [
// // //             `Date: ${this.formatDate(this.billing.medicalRecordDate || this.billing.createdAt)}`,
// // //             `Status: ${this.billing.paymentStatus || 'Unknown'}`
// // //         ];

// // //         this.drawTwoColumnSection(
// // //             'Bill To:',
// // //             leftContent,
// // //             'Invoice Details:',
// // //             rightContent
// // //         );
// // //     }

// // //     private drawItemsTable(): void {
// // //         const tableData = this.prepareTableData();
        
// // //         this.drawTable(
// // //             ['Item', 'Quantity', 'Unit Price', 'Subtotal'],
// // //             tableData,
// // //             {
// // //                 0: { halign: 'left', cellWidth: 'auto' },
// // //                 1: { halign: 'center', cellWidth: 30 },
// // //                 2: { halign: 'right', cellWidth: 35 },
// // //                 3: { halign: 'right', cellWidth: 35 }
// // //             },
// // //             'auto'
// // //         );
// // //     }

// // //     private drawSummarySection(): void {
// // //         const itemsSubtotal = this.calculateItemsSubtotal();
// // //         const doctorFee = this.billing.doctorFee || 0;
// // //         const discount = this.billing.discount || 0;
// // //         const total = this.billing.amount;
// // //         const amountPaid = this.billing.amountPaid || 0;
// // //         const change = this.billing.change || 0;

// // //         const summaryX = 120;
// // //         const valueX = 185;

// // //         const summaryItems: Array<{ label: string; value: string; bold?: boolean; color?: [number, number, number] }> = [
// // //             { label: 'Items Subtotal:', value: this.formatCurrency(itemsSubtotal) },
// // //         ];

// // //         if (doctorFee > 0) {
// // //             summaryItems.push({
// // //                 label: 'Doctor Fee:',
// // //                 value: this.formatCurrency(doctorFee)
// // //             });
// // //         }

// // //         if (discount > 0) {
// // //             summaryItems.push({
// // //                 label: 'Discount:',
// // //                 value: `-${this.formatCurrency(discount)}`,
// // //                 color: Colors.success
// // //             });
// // //         }

// // //         this.doc.setDrawColor(...Colors.lightGray);
// // //         this.doc.line(summaryX, this.currentY, valueX + 5, this.currentY);
// // //         this.currentY += 4;

// // //         summaryItems.push({
// // //             label: 'Total Amount:',
// // //             value: this.formatCurrency(total),
// // //             bold: true
// // //         });

// // //         this.drawSummaryBox(summaryItems);

// // //         //add payment information if paid
// // //         if (this.billing.paymentStatus === 'Paid' && amountPaid > 0) {
// // //             this.currentY += 5;
            
// // //             const paymentItems: Array<{ label: string; value: string; color?: [number, number, number] }> = [
// // //                 { label: 'Amount Paid:', value: this.formatCurrency(amountPaid) },
// // //             ];

// // //             if (change > 0) {
// // //                 paymentItems.push({
// // //                     label: 'Change:',
// // //                     value: this.formatCurrency(change),
// // //                     color: Colors.primary
// // //                 });
// // //             }

// // //             this.drawSummaryBox(paymentItems);
// // //         }

// // //         this.doc.setDrawColor(...Colors.primary);
// // //         this.doc.line(summaryX, this.currentY, valueX + 5, this.currentY);
// // //         this.currentY += 15;
// // //     }

// // //     private drawPaymentStatus(): void {
// // //         const summaryX = 120;
// // //         this.drawStatusBadge(this.billing.paymentStatus, summaryX, this.currentY);
// // //         this.currentY += 20;
// // //     }

// // //     private drawProcessedBySection(): void {
// // //         if (!this.billing.processedName && !this.billing.processedRole) {
// // //             return;
// // //         }

// // //         const boxX = Config.margins.left;
// // //         const boxY = this.currentY;
// // //         const boxWidth = 170;
// // //         const boxHeight = 22;

// // //         //draw box background
// // //         this.doc.setFillColor(245, 247, 250); //light blue-gray background
// // //         this.doc.setDrawColor(...Colors.lightGray);
// // //         this.doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'FD');

// // //         //draw content
// // //         this.doc.setFont('helvetica', 'bold');
// // //         this.doc.setFontSize(10);
// // //         this.doc.setTextColor(...Colors.primary);
// // //         this.doc.text('Payment Processed By:', boxX + 5, boxY + 8);

// // //         this.doc.setFont('helvetica', 'normal');
// // //         this.doc.setTextColor(...Colors.black);
// // //         this.doc.setFontSize(9);
        
// // //         const processedName = this.billing.processedName || 'N/A';
// // //         const processedRole = this.billing.processedRole || 'N/A';
// // //         const processedInfo = `${processedName} (${processedRole})`;
        
// // //         this.doc.text(processedInfo, boxX + 5, boxY + 15);

// // //         //timestamp if available
// // //         if (this.billing.updatedAt || this.billing.createdAt) {
// // //             const timestamp = this.formatDateTime(this.billing.updatedAt || this.billing.createdAt);
// // //             this.doc.setFontSize(8);
// // //             this.doc.setTextColor(...Colors.gray);
// // //             this.doc.text(`Processed on: ${timestamp}`, boxX + boxWidth - 5, boxY + 15, { align: 'right' });
// // //         }

// // //         this.currentY = boxY + boxHeight + 10;
// // //     }

// // //     private drawNotesSection(): void {
// // //         const notes = [
// // //             'Please retain this receipt for your records.',
// // //             'All payments are non-refundable unless otherwise specified.',
// // //             'For billing inquiries, please contact our office.'
// // //         ];

// // //         this.drawSection('Notes:', notes, true);
// // //     }

// // //     private prepareTableData(): string[][] {
// // //         const data: string[][] = [];

// // //         if (this.billing.itemName && Array.isArray(this.billing.itemName)) {
// // //             this.billing.itemName.forEach((item, index) => {
// // //                 const quantity = this.billing.itemQuantity?.[index] || 1;
// // //                 const price = this.billing.itemPrices?.[index] || 0;
// // //                 const subtotal = quantity * price;

// // //                 data.push([
// // //                     item,                                       // item
// // //                     quantity.toString(),                        // quantity
// // //                     `P ${price.toLocaleString('en-PH', {        // unit Price
// // //                         minimumFractionDigits: 2,
// // //                         maximumFractionDigits: 2
// // //                     })}`,
// // //                     `P ${subtotal.toLocaleString('en-PH', {     // subtotal
// // //                         minimumFractionDigits: 2,
// // //                         maximumFractionDigits: 2
// // //                     })}`
// // //                 ]);
// // //             });
// // //         }

// // //         //fallback if no items
// // //         if (data.length === 0) {
// // //             data.push([
// // //                 'Medical Services',
// // //                 '1',
// // //                 `P ${this.billing.amount.toLocaleString('en-PH', {
// // //                     minimumFractionDigits: 2,
// // //                     maximumFractionDigits: 2
// // //                 })}`,
// // //                 `P ${this.billing.amount.toLocaleString('en-PH', {
// // //                     minimumFractionDigits: 2,
// // //                     maximumFractionDigits: 2
// // //                 })}`
// // //             ]);
// // //         }

// // //         return data;
// // //     }

// // //     private calculateItemsSubtotal(): number {
// // //         if (!this.billing.itemName || !Array.isArray(this.billing.itemName)) {
// // //             return 0;
// // //         }

// // //         return this.billing.itemName.reduce((sum, _, index) => {
// // //             const quantity = this.billing.itemQuantity?.[index] || 1;
// // //             const price = this.billing.itemPrices?.[index] || 0;
// // //             return sum + (quantity * price);
// // //         }, 0);
// // //     }

// // //     private formatCurrency(amount: number): string {
// // //         return `P ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// // //     }

// // //     private formatDate(date: string | Date): string {
// // //         return new Date(date).toLocaleDateString('en-PH', {
// // //             year: 'numeric',
// // //             month: 'long',
// // //             day: 'numeric'
// // //         });
// // //     }

// // //     private formatDateTime(date: string | Date): string {
// // //         return new Date(date).toLocaleString('en-PH', {
// // //             year: 'numeric',
// // //             month: 'short',
// // //             day: 'numeric',
// // //             hour: '2-digit',
// // //             minute: '2-digit'
// // //         });
// // //     }
// // // }

// // // export const generateBillingReceiptPDF = (billing: BillingFormData): void => {
// // //     const fileName = `billing-receipt-${billing.medicalRecordId}-${new Date().toISOString().split('T')[0]}.pdf`;
// // //     const pdfGenerator = new BillingReceiptPDF(billing);
// // //     pdfGenerator.generate(fileName);
// // // };

// // // export const getBillingReceiptBlob = (billing: BillingFormData): Blob => {
// // //     const pdfGenerator = new BillingReceiptPDF(billing);
// // //     return pdfGenerator.getBlob();
// // // };

// // import { BasePDFTemplate } from './basePdfTemplate';
// // import { BillingFormData } from '../types';

// // export class BillingReceiptPDF extends BasePDFTemplate {
// //     private billing: BillingFormData;

// //     constructor(billing: BillingFormData) {
// //         super();
// //         this.billing = billing;
// //     }

// //     protected buildDocument(): void {
// //         // 1. clinic header (logo + name + address/phone + divider)
// //         this.drawHeader();

// //         // 2. "BILLING RECEIPT" title + date/status on the right
// //         this.drawTitleAndMeta(
// //             'BILLING RECEIPT',
// //             this.formatDate(this.billing.medicalRecordDate || this.billing.createdAt),
// //             this.billing.paymentStatus || 'Unpaid'
// //         );

// //         // 3. "bill to:" patient name row
// //         this.drawBillTo(this.billing.patientName || 'N/A');

// //         // 4. items table
// //         this.drawItemsTable();

// //         // 5. two-column summary + status badge
// //         this.drawSummarySection();

// //         // 6. processed By bar
// //         this.drawProcessedByBar(
// //             this.billing.processedName || 'N/A',
// //             this.billing.processedRole || '',
// //             this.billing.updatedAt || this.billing.createdAt
// //                 ? this.formatTime(this.billing.updatedAt || this.billing.createdAt)
// //                 : undefined
// //         );

// //         // 7. notes bar
// //         this.drawNotesBar([
// //             'All payments are non-refundable. Please retain this receipt.',
// //         ]);
// //     }

// //     // ─── private helpers ───────────────────────────────────────────────────────

// //     private drawItemsTable(): void {
// //         const tableData = this.prepareTableData();

// //         this.drawTable(
// //             ['Item', 'Qty', 'Unit Price', 'Subtotal'],
// //             tableData,
// //             {
// //                 0: { halign: 'left', cellWidth: 'auto' },
// //                 1: { halign: 'center', cellWidth: 18 },
// //                 2: { halign: 'right', cellWidth: 38 },
// //                 3: { halign: 'right', cellWidth: 38 },
// //             },
// //             'auto'
// //         );
// //     }

// //     private drawSummarySection(): void {
// //         const itemsSubtotal = this.calculateItemsSubtotal();
// //         const doctorFee    = this.billing.doctorFee  || 0;
// //         const discount     = this.billing.discount   || 0;
// //         const total        = this.billing.amount;
// //         const amountPaid   = this.billing.amountPaid || 0;
// //         const change       = this.billing.change     || 0;

// //         // ── left column: cost breakdown ──────────────────────────────────────
// //         const leftItems: { label: string; value: string; bold?: boolean }[] = [
// //             {
// //                 label: 'Items Subtotal:',
// //                 value: this.formatCurrency(itemsSubtotal),
// //             },
// //         ];

// //         if (doctorFee > 0) {
// //             leftItems.push({
// //                 label: 'Doctor Fee:',
// //                 value: this.formatCurrency(doctorFee),
// //             });
// //         }

// //         if (discount > 0) {
// //             leftItems.push({
// //                 label: 'Discount:',
// //                 value: `-${this.formatCurrency(discount)}`,
// //             });
// //         }

// //         leftItems.push({
// //             label: 'TOTAL AMOUNT:',
// //             value: this.formatCurrency(total),
// //             bold: true,
// //         });

// //         // ── right column: payment info ───────────────────────────────────────
// //         const rightItems: { label: string; value: string; bold?: boolean }[] = [];

// //         if (amountPaid > 0) {
// //             rightItems.push({
// //                 label: 'Amount Paid:',
// //                 value: this.formatCurrency(amountPaid),
// //             });
// //         }

// //         if (change >= 0 && amountPaid > 0) {
// //             rightItems.push({
// //                 label: 'Change:',
// //                 value: this.formatCurrency(change),
// //             });
// //         }

// //         //draw the split summary box
// //         this.drawSplitSummary(leftItems, rightItems);

// //         // ── status badge (right-aligned, below the summary box) ──────────────
// //         this.drawStatusBadge(this.billing.paymentStatus || 'unpaid');
// //     }

// //     // ─── table data preparation ─────────────────────────────────────────────

// //     private prepareTableData(): string[][] {
// //         const data: string[][] = [];

// //         if (this.billing.itemName && Array.isArray(this.billing.itemName)) {
// //             this.billing.itemName.forEach((item, index) => {
// //                 const quantity = this.billing.itemQuantity?.[index] || 1;
// //                 const price    = this.billing.itemPrices?.[index]   || 0;
// //                 const subtotal = quantity * price;

// //                 data.push([
// //                     item,
// //                     quantity.toString(),
// //                     this.formatCurrency(price),
// //                     this.formatCurrency(subtotal),
// //                 ]);
// //             });
// //         }

// //         //fallback row if no items
// //         if (data.length === 0) {
// //             data.push([
// //                 'Medical Services',
// //                 '1',
// //                 this.formatCurrency(this.billing.amount),
// //                 this.formatCurrency(this.billing.amount),
// //             ]);
// //         }

// //         return data;
// //     }

// //     private calculateItemsSubtotal(): number {
// //         if (!this.billing.itemName || !Array.isArray(this.billing.itemName)) {
// //             return 0;
// //         }
// //         return this.billing.itemName.reduce((sum, _, index) => {
// //             const quantity = this.billing.itemQuantity?.[index] || 1;
// //             const price    = this.billing.itemPrices?.[index]   || 0;
// //             return sum + quantity * price;
// //         }, 0);
// //     }

// //     // ─── formatters ─────────────────────────────────────────────────────────

// //     private formatCurrency(amount: number): string {
// //         return `P ${amount.toLocaleString('en-PH', {
// //             minimumFractionDigits: 2,
// //             maximumFractionDigits: 2,
// //         })}`;
// //     }

// //     private formatDate(date: string | Date): string {
// //         return new Date(date).toLocaleDateString('en-PH', {
// //             year:  'numeric',
// //             month: 'short',
// //             day:   'numeric',
// //         });
// //     }

// //     private formatTime(date: string | Date): string {
// //         return new Date(date).toLocaleTimeString('en-PH', {
// //             hour:   '2-digit',
// //             minute: '2-digit',
// //         });
// //     }
// // }

// // // ─── convenience exports ─────────────────────────────────────────────────────

// // export const generateBillingReceiptPDF = (billing: BillingFormData): void => {
// //     const medRecId = billing.medicalRecordId
// //         ? typeof billing.medicalRecordId === 'string'
// //             ? billing.medicalRecordId
// //             : (billing.medicalRecordId as any).id ?? JSON.stringify(billing.medicalRecordId)
// //         : 'unknown';

// //     const fileName = `billing-receipt-${medRecId}-${new Date().toISOString().split('T')[0]}.pdf`;
// //     new BillingReceiptPDF(billing).generate(fileName);
// // };

// // export const getBillingReceiptBlob = (billing: BillingFormData): Blob => {
// //     return new BillingReceiptPDF(billing).getBlob();
// // };



// import { BasePDFTemplate, Colors, Config } from './basePdfTemplate';
// import { BillingFormData } from '../types';

// export class BillingReceiptPDF extends BasePDFTemplate {
//     private billing: BillingFormData;

//     constructor(billing: BillingFormData) {
//         super();
//         this.billing = billing;
//     }

//     protected buildDocument(): void {
//         // 1. Clinic header
//         this.drawHeader();

//         // 2. "BILLING RECEIPT" + date / status
//         this.drawTitleAndMeta(
//             'BILLING RECEIPT',
//             this.formatDate(this.billing.medicalRecordDate || this.billing.createdAt),
//             this.billing.paymentStatus || 'Unpaid'
//         );

//         // 3. Bill To
//         this.drawBillTo(this.billing.patientName || 'N/A');

//         // 4. Items table
//         this.drawItemsTable();

//         // 5. Summary box + badge
//         this.drawSummarySection();

//         // 6. Processed by
//         this.drawProcessedByBar(
//             this.billing.processedName || 'N/A',
//             this.billing.processedRole || '',
//             this.billing.updatedAt || this.billing.createdAt
//                 ? this.formatTime(this.billing.updatedAt || this.billing.createdAt)
//                 : undefined
//         );

//         // 7. Notes
//         this.drawNotesBar([
//             'All payments are non-refundable. Please retain this receipt.',
//         ]);
//     }

//     // ── Private section renderers ─────────────────────────────────────────────

//     private drawItemsTable(): void {
//         this.drawTable(
//             ['Item', 'Qty', 'Unit Price', 'Subtotal'],
//             this.prepareTableData(),
//             {
//                 0: { halign: 'left',   cellWidth: 'auto' },
//                 1: { halign: 'center', cellWidth: 18 },
//                 2: { halign: 'right',  cellWidth: 42 },
//                 3: { halign: 'right',  cellWidth: 42 },
//             },
//             'auto'
//         );
//     }

//     private drawSummarySection(): void {
//         const itemsSubtotal = this.calculateItemsSubtotal();
//         const doctorFee     = this.billing.doctorFee  || 0;
//         const discount      = this.billing.discount   || 0;
//         const total         = this.billing.amount;
//         const amountPaid    = this.billing.amountPaid || 0;
//         const change        = this.billing.change     || 0;

//         // Left column
//         const leftItems: { label: string; value: string; bold?: boolean }[] = [
//             { label: 'Items Subtotal:', value: this.formatCurrency(itemsSubtotal) },
//         ];
//         if (doctorFee > 0) leftItems.push({ label: 'Doctor Fee:',  value: this.formatCurrency(doctorFee) });
//         if (discount  > 0) leftItems.push({ label: 'Discount:',    value: `-${this.formatCurrency(discount)}` });
//         leftItems.push({ label: 'TOTAL AMOUNT:', value: this.formatCurrency(total), bold: true });

//         // Right column
//         const rightItems: { label: string; value: string; bold?: boolean }[] = [];
//         if (amountPaid > 0) rightItems.push({ label: 'Amount Paid:', value: this.formatCurrency(amountPaid) });
//         if (amountPaid > 0) rightItems.push({ label: 'Change:',      value: this.formatCurrency(change) });

//         this.drawSplitSummary(leftItems, rightItems);
//         this.drawStatusBadge(this.billing.paymentStatus || 'unpaid');
//     }

//     // ── Data helpers ──────────────────────────────────────────────────────────

//     private prepareTableData(): string[][] {
//         const data: string[][] = [];

//         if (this.billing.itemName && Array.isArray(this.billing.itemName)) {
//             this.billing.itemName.forEach((item, i) => {
//                 const qty      = this.billing.itemQuantity?.[i] || 1;
//                 const price    = this.billing.itemPrices?.[i]   || 0;
//                 const subtotal = qty * price;
//                 data.push([item, qty.toString(), this.formatCurrency(price), this.formatCurrency(subtotal)]);
//             });
//         }

//         if (data.length === 0) {
//             data.push([
//                 'Medical Services', '1',
//                 this.formatCurrency(this.billing.amount),
//                 this.formatCurrency(this.billing.amount),
//             ]);
//         }

//         return data;
//     }

//     private calculateItemsSubtotal(): number {
//         if (!this.billing.itemName || !Array.isArray(this.billing.itemName)) return 0;
//         return this.billing.itemName.reduce((sum, _, i) => {
//             const qty   = this.billing.itemQuantity?.[i] || 1;
//             const price = this.billing.itemPrices?.[i]   || 0;
//             return sum + qty * price;
//         }, 0);
//     }

//     // ── Formatters ────────────────────────────────────────────────────────────

//     private formatCurrency(amount: number): string {
//         return `P ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//     }

//     private formatDate(date: string | Date): string {
//         return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
//     }

//     private formatTime(date: string | Date): string {
//         return new Date(date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
//     }
// }

// // ── Convenience exports ───────────────────────────────────────────────────────

// export const generateBillingReceiptPDF = (billing: BillingFormData): void => {
//     const medRecId = billing.medicalRecordId
//         ? typeof billing.medicalRecordId === 'string'
//             ? billing.medicalRecordId
//             : (billing.medicalRecordId as any).id ?? JSON.stringify(billing.medicalRecordId)
//         : 'unknown';

//     const fileName = `billing-receipt-${medRecId}-${new Date().toISOString().split('T')[0]}.pdf`;
//     new BillingReceiptPDF(billing).generate(fileName);
// };

// export const getBillingReceiptBlob = (billing: BillingFormData): Blob => {
//     return new BillingReceiptPDF(billing).getBlob();
// };


import { BasePDFTemplate } from './basePdfTemplate';
import { BillingFormData } from '../types';

export class BillingReceiptPDF extends BasePDFTemplate {
    private billing: BillingFormData;

    constructor(billing: BillingFormData) {
        super();
        this.billing = billing;
    }

    protected buildDocument(): void {
        // 1. Clinic header
        this.drawHeader();

        // 2. "BILLING RECEIPT" + date / status
        this.drawTitleAndMeta(
            'BILLING RECEIPT',
            this.formatDate(this.billing.medicalRecordDate || this.billing.createdAt),
            this.billing.paymentStatus || 'Unpaid'
        );

        // 3. Bill To
        this.drawBillTo(this.billing.patientName || 'N/A');

        // 4. Items table
        this.drawItemsTable();

        // 5. Summary box + badge
        this.drawSummarySection();

        // 6. Processed by
        this.drawProcessedByBar(
            this.billing.processedName || 'N/A',
            this.billing.processedRole || '',
            this.billing.updatedAt || this.billing.createdAt
                ? this.formatTime(this.billing.updatedAt || this.billing.createdAt)
                : undefined
        );

        // 7. Notes
        this.drawNotesBar([
            'All payments are non-refundable. Please retain this receipt.',
        ]);
    }

    // ── Private section renderers ─────────────────────────────────────────────

    private drawItemsTable(): void {
        this.drawTable(
            ['Item', 'Qty', 'Unit Price', 'Subtotal'],
            this.prepareTableData(),
            {
                0: { halign: 'left',   cellWidth: 'auto' },
                1: { halign: 'center', cellWidth: 18 },
                2: { halign: 'right',  cellWidth: 42 },
                3: { halign: 'right',  cellWidth: 42 },
            },
            'auto'
        );
    }

    private drawSummarySection(): void {
        const itemsSubtotal = this.calculateItemsSubtotal();
        const doctorFee     = this.billing.doctorFee  || 0;
        const discount      = this.billing.discount   || 0;
        const total         = this.billing.amount;
        const amountPaid    = this.billing.amountPaid || 0;
        const change        = this.billing.change     || 0;

        // Left column
        const leftItems: { label: string; value: string; bold?: boolean }[] = [
            { label: 'Items Subtotal:', value: this.formatCurrency(itemsSubtotal) },
        ];
        if (doctorFee > 0) leftItems.push({ label: 'Doctor Fee:',  value: this.formatCurrency(doctorFee) });
        if (discount  > 0) leftItems.push({ label: 'Discount:',    value: `-${this.formatCurrency(discount)}` });
        leftItems.push({ label: 'TOTAL AMOUNT:', value: this.formatCurrency(total), bold: true });

        // Right column
        const rightItems: { label: string; value: string; bold?: boolean }[] = [];
        if (amountPaid > 0) rightItems.push({ label: 'Amount Paid:', value: this.formatCurrency(amountPaid) });
        if (amountPaid > 0) rightItems.push({ label: 'Change:',      value: this.formatCurrency(change) });

        this.drawSplitSummary(leftItems, rightItems);
        this.drawStatusBadge(this.billing.paymentStatus || 'unpaid');
    }

    // ── Data helpers ──────────────────────────────────────────────────────────

    private prepareTableData(): string[][] {
        const data: string[][] = [];

        if (this.billing.itemName && Array.isArray(this.billing.itemName)) {
            this.billing.itemName.forEach((item, i) => {
                const qty      = this.billing.itemQuantity?.[i] || 1;
                const price    = this.billing.itemPrices?.[i]   || 0;
                const subtotal = qty * price;
                data.push([item, qty.toString(), this.formatCurrency(price), this.formatCurrency(subtotal)]);
            });
        }

        if (data.length === 0) {
            data.push([
                'Medical Services', '1',
                this.formatCurrency(this.billing.amount),
                this.formatCurrency(this.billing.amount),
            ]);
        }

        return data;
    }

    private calculateItemsSubtotal(): number {
        if (!this.billing.itemName || !Array.isArray(this.billing.itemName)) return 0;
        return this.billing.itemName.reduce((sum, _, i) => {
            const qty   = this.billing.itemQuantity?.[i] || 1;
            const price = this.billing.itemPrices?.[i]   || 0;
            return sum + qty * price;
        }, 0);
    }

    // ── Formatters ────────────────────────────────────────────────────────────

    private formatCurrency(amount: number): string {
        return `P ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    private formatDate(date: string | Date): string {
        return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    private formatTime(date: string | Date): string {
        return new Date(date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
    }
}

// ── Convenience exports ───────────────────────────────────────────────────────

export const generateBillingReceiptPDF = (billing: BillingFormData): void => {
    const medRecId = billing.medicalRecordId
        ? typeof billing.medicalRecordId === 'string'
            ? billing.medicalRecordId
            : (billing.medicalRecordId as any).id ?? JSON.stringify(billing.medicalRecordId)
        : 'unknown';

    const fileName = `billing-receipt-${medRecId}-${new Date().toISOString().split('T')[0]}.pdf`;
    new BillingReceiptPDF(billing).generate(fileName);
};

export const getBillingReceiptBlob = (billing: BillingFormData): Blob => {
    return new BillingReceiptPDF(billing).getBlob();
};