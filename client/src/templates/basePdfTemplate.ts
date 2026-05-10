// // // import jsPDF from 'jspdf';
// // // import autoTable from 'jspdf-autotable';

// // // declare module 'jspdf' {
// // //     interface jsPDF {
// // //         autoTable: (options: AutoTableOptions) => jsPDF;
// // //         lastAutoTable?: {
// // //             finalY: number;
// // //         };
// // //     }
// // // }

// // // interface AutoTableOptions {
// // //     startY?: number;
// // //     head?: string[][];
// // //     body?: string[][];
// // //     styles?: Record<string, any>;
// // //     headStyles?: Record<string, any>;
// // //     columnStyles?: Record<number, Record<string, any>>;
// // //     margin?: {
// // //         left?: number;
// // //         right?: number;
// // //         top?: number;
// // //         bottom?: number;
// // //     };
// // //     theme?: 'striped' | 'grid' | 'plain';
// // //     [key: string]: any;
// // // }

// // // export const Colors = {
// // //     primary: [59, 130, 246] as [number, number, number],
// // //     success: [34, 197, 94] as [number, number, number],
// // //     warning: [251, 191, 36] as [number, number, number],
// // //     danger: [239, 68, 68] as [number, number, number],
// // //     gray: [100, 100, 100] as [number, number, number],
// // //     lightGray: [200, 200, 200] as [number, number, number],
// // //     black: [0, 0, 0] as [number, number, number],
// // //     white: [255, 255, 255] as [number, number, number],
// // // } as const;

// // // export const Config = {
// // //     clinicName: 'Razon Pediatric Clinic',
// // //     address: '4J38+73R, Gladiola St, Buhangin, Davao City, 8000 Davao del Sur',
// // //     email: 'drnice4kids@gmail.com',
// // //     phone: '+0939-726-6918',
// // //     margins: {
// // //         left: 20,
// // //         right: 20,
// // //         top: 20,
// // //         bottom: 20,
// // //     },
// // //     pageWidth: 210, //A4 width in mm
// // // } as const;

// // // export abstract class BasePDFTemplate {
// // //     protected doc: jsPDF;
// // //     protected currentY: number = 20;

// // //     constructor() {
// // //         this.doc = new jsPDF();
// // //     }

// // //     protected drawHeader(title: string): void {
// // //         //clinic name/logo
// // //         this.doc.setFontSize(24);
// // //         this.doc.setFont('helvetica', 'bold');
// // //         this.doc.setTextColor(...Colors.primary);
// // //         this.doc.text(Config.clinicName, 105, this.currentY, { align: 'center' });
        
// // //         this.currentY += 8;

// // //         //contact information
// // //         this.doc.setFontSize(10);
// // //         this.doc.setFont('helvetica', 'normal');
// // //         this.doc.setTextColor(...Colors.black);
        
// // //         const contactInfo = [
// // //             Config.address,
// // //             `Email: ${Config.email} | Phone: ${Config.phone}`,
// // //         ];
        
// // //         contactInfo.forEach(line => {
// // //             this.doc.text(line, 105, this.currentY, { align: 'center' });
// // //             this.currentY += 5;
// // //         });

// // //         this.currentY += 2;
// // //         this.doc.setDrawColor(...Colors.lightGray);
// // //         this.doc.line(Config.margins.left, this.currentY, 190, this.currentY);
// // //         this.currentY += 10;

// // //         //document title
// // //         this.doc.setFontSize(16);
// // //         this.doc.setFont('helvetica', 'bold');
// // //         this.doc.setTextColor(...Colors.black);
// // //         this.doc.text(title, 105, this.currentY, { align: 'center' });
// // //         this.currentY += 12;
// // //     }

// // //     protected drawTwoColumnSection(
// // //         leftTitle: string,
// // //         leftContent: string[],
// // //         rightTitle: string,
// // //         rightContent: string[]
// // //     ): void {
// // //         const leftX = Config.margins.left;
// // //         const rightX = 110;
// // //         const startY = this.currentY;

// // //         this.doc.setFont('helvetica', 'bold');
// // //         this.doc.setFontSize(10);
// // //         this.doc.text(leftTitle, leftX, startY);
        
// // //         this.doc.setFont('helvetica', 'normal');
// // //         leftContent.forEach((line, index) => {
// // //             this.doc.text(line, leftX, startY + 6 + (index * 6));
// // //         });

// // //         this.doc.setFont('helvetica', 'bold');
// // //         this.doc.text(rightTitle, rightX, startY);
        
// // //         this.doc.setFont('helvetica', 'normal');
// // //         rightContent.forEach((line, index) => {
// // //             this.doc.text(line, rightX, startY + 6 + (index * 6));
// // //         });

// // //         this.currentY = startY + Math.max(leftContent.length, rightContent.length) * 6 + 15;
// // //     }

// // //     protected drawTable(
// // //         headers: string[],
// // //         data: string[][],
// // //         columnStyles?: Record<number, Record<string, any>>,
// // //         tableWidth: 'auto' | 'wrap' | number = 'auto'
// // //     ): void {
// // //         autoTable(this.doc, {
// // //             startY: this.currentY,
// // //             head: [headers],
// // //             body: data,
// // //             styles: {
// // //                 fontSize: 10,
// // //                 cellPadding: 5,
// // //                 halign: 'center',
// // //             },
// // //             headStyles: {
// // //                 fillColor: Colors.primary,
// // //                 textColor: Colors.white,
// // //                 fontStyle: 'bold',
// // //                 halign: 'center',
// // //             },
// // //             columnStyles: columnStyles || {},
// // //             theme: 'striped',
// // //             tableWidth: tableWidth,
// // //             margin: { left: Config.margins.left, right: Config.margins.right },
// // //         });

// // //         this.currentY = this.doc.lastAutoTable?.finalY ? this.doc.lastAutoTable.finalY + 10 : this.currentY + 50;
// // //     }

    
// // //     protected drawSummaryBox(
// // //         items: { label: string; value: string; bold?: boolean }[]
// // //     ): void {
// // //         const summaryX = 120;
// // //         const valueX = 185;
        
// // //         this.doc.setDrawColor(...Colors.lightGray);
// // //         this.doc.line(summaryX, this.currentY, valueX + 5, this.currentY);
// // //         this.currentY += 8;

// // //         items.forEach(item => {
// // //             if (item.bold) {
// // //                 this.doc.setFont('helvetica', 'bold');
// // //                 this.doc.setFontSize(12);
// // //             } else {
// // //                 this.doc.setFont('helvetica', 'normal');
// // //                 this.doc.setFontSize(10);
// // //             }
            
// // //             this.doc.text(item.label, summaryX, this.currentY);
// // //             this.doc.text(item.value, valueX, this.currentY, { align: 'right' });
// // //             this.currentY += item.bold ? 8 : 6;
// // //         });
// // //     }

// // //     protected drawStatusBadge(status: string, x: number, y: number): void {
// // //         let fillColor: [number, number, number];
// // //         let textColor: [number, number, number];
// // //         let text: string;

// // //         switch (status.toLowerCase()) {
// // //             case 'paid':
// // //                 fillColor = Colors.success;
// // //                 textColor = Colors.white;
// // //                 text = 'PAID IN FULL';
// // //                 break;
// // //             case 'partial':
// // //                 fillColor = Colors.warning;
// // //                 textColor = Colors.black;
// // //                 text = 'PARTIALLY PAID';
// // //                 break;
// // //             default:
// // //                 fillColor = Colors.danger;
// // //                 textColor = Colors.white;
// // //                 text = 'UNPAID';
// // //         }

// // //         const badgeWidth = 70;
// // //         const badgeHeight = 10;

// // //         this.doc.setFillColor(...fillColor);
// // //         this.doc.setTextColor(...textColor);
// // //         this.doc.roundedRect(x, y, badgeWidth, badgeHeight, 3, 3, 'F');
        
// // //         this.doc.setFontSize(9);
// // //         this.doc.setFont('helvetica', 'bold');
// // //         const textWidth = this.doc.getTextWidth(text);
// // //         const textX = x + (badgeWidth - textWidth) / 2;
// // //         this.doc.text(text, textX, y + 7);
        
// // //         this.doc.setTextColor(...Colors.black);
// // //         this.doc.setFont('helvetica', 'normal');
// // //     }

// // //     protected drawSection(title: string, content: string[], bulletPoints: boolean = false): void {
// // //         this.doc.setFont('helvetica', 'bold');
// // //         this.doc.setFontSize(11);
// // //         this.doc.text(title, Config.margins.left, this.currentY);
// // //         this.currentY += 6;

// // //         this.doc.setFont('helvetica', 'normal');
// // //         this.doc.setFontSize(9);
        
// // //         content.forEach(line => {
// // //             const displayLine = bulletPoints ? `• ${line}` : line;
// // //             this.doc.text(displayLine, Config.margins.left, this.currentY);
// // //             this.currentY += 5;
// // //         });

// // //         this.currentY += 5;
// // //     }

// // //     protected drawFooter(additionalInfo?: string[]): void {
// // //         const footerY = 270;
        
// // //         this.doc.setDrawColor(...Colors.lightGray);
// // //         this.doc.line(Config.margins.left, footerY, 190, footerY);

// // //         this.doc.setFont('helvetica', 'normal');
// // //         this.doc.setFontSize(8);
// // //         this.doc.setTextColor(...Colors.gray);

// // //         const footerLines = [
// // //             'This is a computer-generated document and does not require a signature.',
// // //             `Generated on: ${new Date().toLocaleString()}`,
// // //             `Thank you for choosing ${Config.clinicName}!`,
// // //             ...(additionalInfo || [])
// // //         ];

// // //         let yPos = footerY + 5;
// // //         footerLines.forEach(line => {
// // //             this.doc.text(line, 105, yPos, { align: 'center' });
// // //             yPos += 4;
// // //         });
// // //     }

// // //     protected drawDivider(color: [number, number, number] = Colors.lightGray): void {
// // //         this.doc.setDrawColor(...color);
// // //         this.doc.line(Config.margins.left, this.currentY, 190, this.currentY);
// // //         this.currentY += 8;
// // //     }

// // //     protected addWrappedText(text: string, maxWidth: number = 170): void {
// // //         const lines = this.doc.splitTextToSize(text, maxWidth);
// // //         this.doc.text(lines, Config.margins.left, this.currentY);
// // //         this.currentY += lines.length * 5 + 5;
// // //     }

// // //     protected abstract buildDocument(): void;

// // //     public generate(filename: string): void {
// // //         this.buildDocument();
// // //         this.doc.save(filename);
// // //     }

// // //     public getBlob(): Blob {
// // //         this.buildDocument();
// // //         return this.doc.output('blob');
// // //     }
// // // }
// // import jsPDF from 'jspdf';
// // import autoTable from 'jspdf-autotable';

// // declare module 'jspdf' {
// //     interface jsPDF {
// //         autoTable: (options: AutoTableOptions) => jsPDF;
// //         lastAutoTable?: {
// //             finalY: number;
// //         };
// //     }
// // }

// // interface AutoTableOptions {
// //     startY?: number;
// //     head?: string[][];
// //     body?: string[][];
// //     styles?: Record<string, any>;
// //     headStyles?: Record<string, any>;
// //     columnStyles?: Record<number, Record<string, any>>;
// //     margin?: {
// //         left?: number;
// //         right?: number;
// //         top?: number;
// //         bottom?: number;
// //     };
// //     theme?: 'striped' | 'grid' | 'plain';
// //     [key: string]: any;
// // }

// // export const Colors = {
// //     primary: [30, 100, 200] as [number, number, number],       // deeper blue for header title
// //     primaryLight: [59, 130, 246] as [number, number, number],  // medium blue for text accents
// //     success: [34, 197, 94] as [number, number, number],
// //     successDark: [22, 163, 74] as [number, number, number],
// //     warning: [251, 191, 36] as [number, number, number],
// //     danger: [239, 68, 68] as [number, number, number],
// //     gray: [120, 120, 120] as [number, number, number],
// //     lightGray: [210, 210, 210] as [number, number, number],
// //     veryLightGray: [245, 247, 250] as [number, number, number],
// //     black: [0, 0, 0] as [number, number, number],
// //     white: [255, 255, 255] as [number, number, number],
// //     tableHeader: [30, 100, 200] as [number, number, number],
// // } as const;

// // export const Config = {
// //     clinicName: 'RAZON PEDIATRIC CLINIC',
// //     address: 'Gladiola St, Buhangin, Davao City',
// //     email: 'drnice4kids@gmail.com',
// //     phone: '+0939-726-6918',
// //     margins: {
// //         left: 15,
// //         right: 15,
// //         top: 15,
// //         bottom: 15,
// //     },
// //     pageWidth: 210, // A4 width in mm
// //     contentWidth: 180, // 210 - 15 - 15
// // } as const;

// // export abstract class BasePDFTemplate {
// //     protected doc: jsPDF;
// //     protected currentY: number = 15;

// //     constructor() {
// //         this.doc = new jsPDF();
// //     }

// //     /**
// //      * draws the clinic header matching the screenshot layout:
// //      * [icon] RAZON PEDIATRIC CLINIC
// //      *        address  |  phone
// //      * ─────────────────────────────────
// //      */
// //     protected drawHeader(): void {
// //         const leftX = Config.margins.left;
// //         const logoSize = 18;
// //         const logoX = leftX;
// //         const logoY = this.currentY;

// //         //circle background for icon
// //         this.doc.setFillColor(...Colors.primaryLight);
// //         this.doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'F');

// //         //simple cross/plus symbol representing medical (white)
// //         this.doc.setDrawColor(...Colors.white);
// //         this.doc.setLineWidth(1.5);
// //         const cx = logoX + logoSize / 2;
// //         const cy = logoY + logoSize / 2;
// //         this.doc.line(cx - 4, cy, cx + 4, cy);
// //         this.doc.line(cx, cy - 4, cx, cy + 4);
// //         this.doc.setLineWidth(0.5);

// //         // Clinic name — large bold, dark blue
// //         const textStartX = logoX + logoSize + 4;
// //         this.doc.setFontSize(20);
// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setTextColor(...Colors.primary);
// //         this.doc.text(Config.clinicName, textStartX, logoY + 8);

// //         //address & phone on second line — smaller, gray
// //         this.doc.setFontSize(9);
// //         this.doc.setFont('helvetica', 'normal');
// //         this.doc.setTextColor(...Colors.gray);

// //         // Location pin character + address
// //         // const addressLine = `\u{1F4CD} ${Config.address}   |   \u{1F4DE} Phone: ${Config.phone}`;
// //         //jsPDF does not render emoji well; use simple text markers instead
// //         const addressLineSimple = `Gladiola St, Buhangin, Davao City   |   Phone: ${Config.phone}`;
// //         this.doc.text(addressLineSimple, textStartX, logoY + 15);

// //         this.currentY = logoY + logoSize + 6;

// //         //divider line
// //         this.doc.setDrawColor(...Colors.lightGray);
// //         this.doc.setLineWidth(0.5);
// //         this.doc.line(Config.margins.left, this.currentY, 195, this.currentY);
// //         this.currentY += 6;
// //     }

// //     /**
// //      * draws the document title block (left) and date/status block (right)
// //      * matching the screenshot layout.
// //      */
// //     protected drawTitleAndMeta(
// //         title: string,
// //         date: string,
// //         status: string
// //     ): void {
// //         const leftX = Config.margins.left;
// //         const rightX = 195;

// //         //title — large bold black
// //         this.doc.setFontSize(16);
// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setTextColor(...Colors.black);
// //         this.doc.text(title, leftX, this.currentY);

// //         //date label + value on the right
// //         this.doc.setFontSize(10);
// //         this.doc.setFont('helvetica', 'normal');
// //         this.doc.setTextColor(...Colors.gray);
// //         this.doc.text('Date:', rightX - 40, this.currentY - 4, { align: 'left' });
// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setTextColor(...Colors.black);
// //         this.doc.text(date, rightX, this.currentY - 4, { align: 'right' });

// //         //status label + value on the right (below date)
// //         this.doc.setFont('helvetica', 'normal');
// //         this.doc.setTextColor(...Colors.gray);
// //         this.doc.text('Status:', rightX - 40, this.currentY + 3, { align: 'left' });

// //         //status value color
// //         const statusLower = status.toLowerCase();
// //         let statusColor: [number, number, number] = Colors.danger;
// //         if (statusLower === 'paid') statusColor = Colors.successDark;
// //         else if (statusLower === 'partial') statusColor = [180, 120, 0];

// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setTextColor(...statusColor);
// //         this.doc.text(status.toUpperCase(), rightX, this.currentY + 3, { align: 'right' });

// //         this.currentY += 10;
// //     }

// //     /**
// //      * draws the "Bill To:" row with patient name in blue
// //      */
// //     protected drawBillTo(patientName: string): void {
// //         const leftX = Config.margins.left;

// //         this.doc.setFontSize(10);
// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setTextColor(...Colors.black);
// //         this.doc.text('Bill To:', leftX, this.currentY);

// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setTextColor(...Colors.primaryLight);
// //         this.doc.text(patientName, leftX + 18, this.currentY);

// //         this.doc.setTextColor(...Colors.black);
// //         this.currentY += 8;
// //     }

// //     protected drawTable(
// //         headers: string[],
// //         data: string[][],
// //         columnStyles?: Record<number, Record<string, any>>,
// //         tableWidth: 'auto' | 'wrap' | number = 'auto'
// //     ): void {
// //         autoTable(this.doc, {
// //             startY: this.currentY,
// //             head: [headers],
// //             body: data,
// //             styles: {
// //                 fontSize: 10,
// //                 cellPadding: 4,
// //                 halign: 'center',
// //                 textColor: Colors.black,
// //             },
// //             headStyles: {
// //                 fillColor: Colors.tableHeader,
// //                 textColor: Colors.white,
// //                 fontStyle: 'bold',
// //                 halign: 'center',
// //             },
// //             bodyStyles: {
// //                 fillColor: Colors.white,
// //             },
// //             alternateRowStyles: {
// //                 fillColor: [250, 250, 250],
// //             },
// //             columnStyles: columnStyles || {},
// //             theme: 'grid',
// //             tableWidth: tableWidth,
// //             margin: { left: Config.margins.left, right: Config.margins.right },
// //             tableLineColor: Colors.lightGray,
// //             tableLineWidth: 0.3,
// //         });

// //         this.currentY = this.doc.lastAutoTable?.finalY
// //             ? this.doc.lastAutoTable.finalY + 6
// //             : this.currentY + 50;
// //     }

// //     /**
// //      * draws the two-column summary section matching the screenshot.
// //      * Left: Items Subtotal, Doctor Fee, (Discount), TOTAL AMOUNT
// //      * Right: Amount Paid, Change
// //      */
// //     protected drawSplitSummary(
// //         leftItems: { label: string; value: string; bold?: boolean }[],
// //         rightItems: { label: string; value: string; bold?: boolean }[]
// //     ): void {
// //         const colLeft = Config.margins.left;
// //         const colRight = 110;
// //         const valueLeftX = 100;
// //         const valueRightX = 192;

// //         const startY = this.currentY;

// //         //light border box around summary
// //         const boxHeight = Math.max(leftItems.length, rightItems.length) * 7 + 10;
// //         this.doc.setDrawColor(...Colors.lightGray);
// //         this.doc.setLineWidth(0.3);
// //         this.doc.rect(colLeft, startY - 2, Config.contentWidth, boxHeight, 'S');

// //         //vertical divider
// //         this.doc.line(colRight - 2, startY - 2, colRight - 2, startY + boxHeight - 2);

// //         let leftY = startY + 4;
// //         leftItems.forEach(item => {
// //             if (item.bold) {
// //                 this.doc.setFont('helvetica', 'bold');
// //                 this.doc.setFontSize(11);
// //             } else {
// //                 this.doc.setFont('helvetica', 'normal');
// //                 this.doc.setFontSize(10);
// //             }
// //             this.doc.setTextColor(...Colors.black);
// //             this.doc.text(item.label, colLeft + 3, leftY);
// //             this.doc.text(item.value, valueLeftX, leftY, { align: 'right' });
// //             leftY += item.bold ? 8 : 7;
// //         });

// //         let rightY = startY + 4;
// //         rightItems.forEach(item => {
// //             if (item.bold) {
// //                 this.doc.setFont('helvetica', 'bold');
// //                 this.doc.setFontSize(11);
// //             } else {
// //                 this.doc.setFont('helvetica', 'normal');
// //                 this.doc.setFontSize(10);
// //             }
// //             this.doc.setTextColor(...Colors.black);
// //             this.doc.text(item.label, colRight + 2, rightY);
// //             this.doc.text(item.value, valueRightX, rightY, { align: 'right' });
// //             rightY += item.bold ? 8 : 7;
// //         });

// //         this.currentY = startY + boxHeight + 6;
// //     }

// //     /**
// //      * draws the "PAID IN FULL" / "PARTIALLY PAID" / "UNPAID" badge
// //      * matching the screenshot (green rounded rectangle with checkmark).
// //      * Positioned on the right side.
// //      */
// //     protected drawStatusBadge(status: string): void {
// //         let fillColor: [number, number, number];
// //         let textColor: [number, number, number];
// //         let text: string;

// //         switch (status.toLowerCase()) {
// //             case 'paid':
// //                 fillColor = Colors.success;
// //                 textColor = Colors.white;
// //                 text = 'PAID IN FULL';
// //                 break;
// //             case 'partial':
// //                 fillColor = Colors.warning;
// //                 textColor = Colors.black;
// //                 text = 'PARTIALLY PAID';
// //                 break;
// //             default:
// //                 fillColor = Colors.danger;
// //                 textColor = Colors.white;
// //                 text = 'UNPAID';
// //         }

// //         const badgeWidth = 60;
// //         const badgeHeight = 10;
// //         const badgeX = 195 - badgeWidth;
// //         const badgeY = this.currentY;

// //         this.doc.setFillColor(...fillColor);
// //         this.doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');

// //         //checkmark circle on left side of badge (for "paid")
// //         if (status.toLowerCase() === 'paid') {
// //             this.doc.setFillColor(...Colors.successDark);
// //             this.doc.circle(badgeX + 6, badgeY + 5, 3.5, 'F');
// //             this.doc.setDrawColor(...Colors.white);
// //             this.doc.setLineWidth(0.8);
// //             //simple checkmark lines
// //             this.doc.line(badgeX + 4.5, badgeY + 5, badgeX + 5.8, badgeY + 6.5);
// //             this.doc.line(badgeX + 5.8, badgeY + 6.5, badgeX + 8, badgeY + 3.5);
// //             this.doc.setLineWidth(0.5);
// //         }

// //         this.doc.setFontSize(9);
// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setTextColor(...textColor);
// //         const textX = status.toLowerCase() === 'paid' ? badgeX + 12 : badgeX + 5;
// //         const textWidth = this.doc.getTextWidth(text);
// //         const availWidth = status.toLowerCase() === 'paid' ? badgeWidth - 12 : badgeWidth - 10;
// //         this.doc.text(text, textX + (availWidth - textWidth) / 2, badgeY + 6.5);

// //         this.doc.setTextColor(...Colors.black);
// //         this.doc.setFont('helvetica', 'normal');

// //         this.currentY = badgeY + badgeHeight + 6;
// //     }

// //     /**
// //      * draws a thin bottom bar with "Processed By" on left and timestamp on right.
// //      */
// //     protected drawProcessedByBar(
// //         name: string,
// //         role: string,
// //         timestamp?: string
// //     ): void {
// //         const barX = Config.margins.left;
// //         const barY = this.currentY;
// //         const barWidth = Config.contentWidth;
// //         const barHeight = 14;

// //         this.doc.setFillColor(...Colors.veryLightGray);
// //         this.doc.setDrawColor(...Colors.lightGray);
// //         this.doc.setLineWidth(0.3);
// //         this.doc.rect(barX, barY, barWidth, barHeight, 'FD');

// //         // "processed By:" label
// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setFontSize(9);
// //         this.doc.setTextColor(...Colors.black);
// //         this.doc.text('Processed By:', barX + 3, barY + 6);

// //         //name in blue
// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setTextColor(...Colors.primaryLight);
// //         this.doc.text(name, barX + 30, barY + 6);

// //         //role in gray (optional)
// //         if (role) {
// //             this.doc.setFont('helvetica', 'normal');
// //             this.doc.setTextColor(...Colors.gray);
// //             this.doc.text(`(${role})`, barX + 30 + this.doc.getTextWidth(name) + 2, barY + 6);
// //         }

// //         //timestamp on the right
// //         if (timestamp) {
// //             this.doc.setFont('helvetica', 'normal');
// //             this.doc.setFontSize(9);
// //             this.doc.setTextColor(...Colors.black);
// //             this.doc.text('Time:', barX + barWidth - 40, barY + 6);
// //             this.doc.setFont('helvetica', 'bold');
// //             this.doc.text(timestamp, barX + barWidth - 2, barY + 6, { align: 'right' });
// //         }

// //         this.doc.setTextColor(...Colors.black);
// //         this.currentY = barY + barHeight + 5;
// //     }

// //     /**
// //      * draws notes line(s) at the bottom with a small printer icon area.
// //      */
// //     protected drawNotesBar(notes: string[]): void {
// //         const barX = Config.margins.left;
// //         const barY = this.currentY;

// //         //small icon placeholder box
// //         this.doc.setFillColor(...Colors.veryLightGray);
// //         this.doc.setDrawColor(...Colors.lightGray);
// //         this.doc.setLineWidth(0.3);
// //         const iconSize = 8;
// //         this.doc.rect(barX, barY, iconSize, iconSize, 'FD');

// //         //printer symbol (simplified)
// //         this.doc.setFillColor(...Colors.gray);
// //         this.doc.rect(barX + 1.5, barY + 2, 5, 3.5, 'F');
// //         this.doc.setFillColor(...Colors.white);
// //         this.doc.rect(barX + 2, barY + 4, 4, 2.5, 'F');
// //         this.doc.setFillColor(...Colors.gray);
// //         this.doc.rect(barX + 2, barY + 1, 4, 1.5, 'F');

// //         //notes text
// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setFontSize(8);
// //         this.doc.setTextColor(...Colors.black);
// //         this.doc.text('Notes:', barX + iconSize + 3, barY + 5);

// //         this.doc.setFont('helvetica', 'normal');
// //         this.doc.setTextColor(...Colors.gray);
// //         const notesText = notes.join('  •  ');
// //         this.doc.text(notesText, barX + iconSize + 17, barY + 5);

// //         this.currentY = barY + iconSize + 4;
// //     }

// //     protected drawSection(title: string, content: string[], bulletPoints: boolean = false): void {
// //         this.doc.setFont('helvetica', 'bold');
// //         this.doc.setFontSize(11);
// //         this.doc.setTextColor(...Colors.black);
// //         this.doc.text(title, Config.margins.left, this.currentY);
// //         this.currentY += 6;

// //         this.doc.setFont('helvetica', 'normal');
// //         this.doc.setFontSize(9);

// //         content.forEach(line => {
// //             const displayLine = bulletPoints ? `• ${line}` : line;
// //             this.doc.text(displayLine, Config.margins.left, this.currentY);
// //             this.currentY += 5;
// //         });

// //         this.currentY += 5;
// //     }

// //     protected drawDivider(color: [number, number, number] = Colors.lightGray): void {
// //         this.doc.setDrawColor(...color);
// //         this.doc.setLineWidth(0.3);
// //         this.doc.line(Config.margins.left, this.currentY, 195, this.currentY);
// //         this.currentY += 6;
// //     }

// //     protected addWrappedText(text: string, maxWidth: number = 170): void {
// //         const lines = this.doc.splitTextToSize(text, maxWidth);
// //         this.doc.text(lines, Config.margins.left, this.currentY);
// //         this.currentY += lines.length * 5 + 5;
// //     }

// //     protected abstract buildDocument(): void;

// //     public generate(filename: string): void {
// //         this.buildDocument();
// //         this.doc.save(filename);
// //     }

// //     public getBlob(): Blob {
// //         this.buildDocument();
// //         return this.doc.output('blob');
// //     }
// // }


// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// declare module 'jspdf' {
//     interface jsPDF {
//         autoTable: (options: AutoTableOptions) => jsPDF;
//         lastAutoTable?: {
//             finalY: number;
//         };
//     }
// }

// interface AutoTableOptions {
//     startY?: number;
//     head?: string[][];
//     body?: string[][];
//     styles?: Record<string, any>;
//     headStyles?: Record<string, any>;
//     columnStyles?: Record<number, Record<string, any>>;
//     margin?: {
//         left?: number;
//         right?: number;
//         top?: number;
//         bottom?: number;
//     };
//     theme?: 'striped' | 'grid' | 'plain';
//     [key: string]: any;
// }

// export const Colors = {
//     primary:        [30, 100, 200]  as [number, number, number],
//     primaryLight:   [59, 130, 246]  as [number, number, number],
//     success:        [34, 197, 94]   as [number, number, number],
//     successDark:    [22, 163, 74]   as [number, number, number],
//     warning:        [251, 191, 36]  as [number, number, number],
//     danger:         [239, 68, 68]   as [number, number, number],
//     gray:           [120, 120, 120] as [number, number, number],
//     lightGray:      [210, 210, 210] as [number, number, number],
//     veryLightGray:  [245, 247, 250] as [number, number, number],
//     black:          [0, 0, 0]       as [number, number, number],
//     white:          [255, 255, 255] as [number, number, number],
//     tableHeader:    [30, 100, 200]  as [number, number, number],
// } as const;

// // ── A5 landscape: 210 mm wide × 148 mm tall (half of A4, crosswise) ──────────
// export const Config = {
//     clinicName:   'RAZON PEDIATRIC CLINIC',
//     address:      'Gladiola St, Buhangin, Davao City',
//     email:        'drnice4kids@gmail.com',
//     phone:        '+0939-726-6918',
//     margins: {
//         left:   12,
//         right:  12,
//         top:    10,
//         bottom: 10,
//     },
//     pageWidth:    210,   // half-A4 landscape width  (mm)
//     pageHeight:   148,   // half-A4 landscape height (mm)
//     contentWidth: 186,   // pageWidth  - left margin - right margin
//     rightEdge:    198,   // pageWidth  - margins.right
// } as const;

// export abstract class BasePDFTemplate {
//     protected doc: jsPDF;
//     protected currentY: number = Config.margins.top;

//     constructor() {
//         // landscape A4 sheet = 297×210 mm, but we want the HALF crosswise size
//         // which is 210×148 mm (same as A4 rotated but only half its height).
//         // jsPDF custom page: new jsPDF(orientation, unit, [width, height])
//         this.doc = new jsPDF('l', 'mm', [Config.pageWidth, Config.pageHeight]);
//     }

//     // ── Header ────────────────────────────────────────────────────────────────
//     protected drawHeader(): void {
//         const leftX    = Config.margins.left;
//         const logoSize = 14;
//         const logoX    = leftX;
//         const logoY    = this.currentY;

//         // Blue circle with white cross
//         this.doc.setFillColor(...Colors.primaryLight);
//         this.doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'F');

//         this.doc.setDrawColor(...Colors.white);
//         this.doc.setLineWidth(1.2);
//         const cx = logoX + logoSize / 2;
//         const cy = logoY + logoSize / 2;
//         this.doc.line(cx - 3, cy, cx + 3, cy);
//         this.doc.line(cx, cy - 3, cx, cy + 3);
//         this.doc.setLineWidth(0.4);

//         // Clinic name
//         const textStartX = logoX + logoSize + 4;
//         this.doc.setFontSize(16);
//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setTextColor(...Colors.primary);
//         this.doc.text(Config.clinicName, textStartX, logoY + 6.5);

//         // Address & phone line
//         this.doc.setFontSize(8);
//         this.doc.setFont('helvetica', 'normal');
//         this.doc.setTextColor(...Colors.gray);
//         this.doc.text(
//             `${Config.address}   |   Phone: ${Config.phone}`,
//             textStartX,
//             logoY + 12.5
//         );

//         this.currentY = logoY + logoSize + 4;

//         // Divider
//         this.doc.setDrawColor(...Colors.lightGray);
//         this.doc.setLineWidth(0.4);
//         this.doc.line(Config.margins.left, this.currentY, Config.rightEdge, this.currentY);
//         this.currentY += 5;
//     }

//     // ── Title + Date / Status ─────────────────────────────────────────────────
//     protected drawTitleAndMeta(title: string, date: string, status: string): void {
//         const leftX  = Config.margins.left;
//         const rightX = Config.rightEdge;

//         this.doc.setFontSize(14);
//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setTextColor(...Colors.black);
//         this.doc.text(title, leftX, this.currentY);

//         // Date row
//         this.doc.setFontSize(9);
//         this.doc.setFont('helvetica', 'normal');
//         this.doc.setTextColor(...Colors.gray);
//         this.doc.text('Date:', rightX - 42, this.currentY - 4);
//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setTextColor(...Colors.black);
//         this.doc.text(date, rightX, this.currentY - 4, { align: 'right' });

//         // Status row
//         this.doc.setFont('helvetica', 'normal');
//         this.doc.setTextColor(...Colors.gray);
//         this.doc.text('Status:', rightX - 42, this.currentY + 3.5);

//         const statusLower = status.toLowerCase();
//         let statusColor: [number, number, number] = Colors.danger;
//         if (statusLower === 'paid')    statusColor = Colors.successDark;
//         else if (statusLower === 'partial') statusColor = [180, 120, 0];

//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setTextColor(...statusColor);
//         this.doc.text(status.toUpperCase(), rightX, this.currentY + 3.5, { align: 'right' });

//         this.currentY += 10;
//     }

//     // ── Bill To ───────────────────────────────────────────────────────────────
//     protected drawBillTo(patientName: string): void {
//         const leftX = Config.margins.left;

//         this.doc.setFontSize(9);
//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setTextColor(...Colors.black);
//         this.doc.text('Bill To:', leftX, this.currentY);

//         this.doc.setTextColor(...Colors.primaryLight);
//         this.doc.text(patientName, leftX + 18, this.currentY);

//         this.doc.setTextColor(...Colors.black);
//         this.currentY += 6;
//     }

//     // ── Items table ───────────────────────────────────────────────────────────
//     protected drawTable(
//         headers: string[],
//         data: string[][],
//         columnStyles?: Record<number, Record<string, any>>,
//         tableWidth: 'auto' | 'wrap' | number = 'auto'
//     ): void {
//         autoTable(this.doc, {
//             startY: this.currentY,
//             head: [headers],
//             body: data,
//             styles: {
//                 fontSize: 8.5,
//                 cellPadding: 3,
//                 halign: 'center',
//                 textColor: Colors.black,
//             },
//             headStyles: {
//                 fillColor: Colors.tableHeader,
//                 textColor: Colors.white,
//                 fontStyle: 'bold',
//                 halign: 'center',
//             },
//             bodyStyles:          { fillColor: Colors.white },
//             alternateRowStyles:  { fillColor: [250, 250, 250] },
//             columnStyles:        columnStyles || {},
//             theme:               'grid',
//             tableWidth:          tableWidth,
//             margin:              { left: Config.margins.left, right: Config.margins.right },
//             tableLineColor:      Colors.lightGray,
//             tableLineWidth:      0.25,
//         });

//         this.currentY = this.doc.lastAutoTable?.finalY
//             ? this.doc.lastAutoTable.finalY + 5
//             : this.currentY + 35;
//     }

//     // ── Split summary box ─────────────────────────────────────────────────────
//     protected drawSplitSummary(
//         leftItems:  { label: string; value: string; bold?: boolean }[],
//         rightItems: { label: string; value: string; bold?: boolean }[]
//     ): void {
//         const colLeft     = Config.margins.left;
//         const midX        = colLeft + Config.contentWidth / 2;  // vertical divider
//         const valueLeftX  = midX - 3;
//         const valueRightX = Config.rightEdge;
//         const lineH       = 6;
//         const boldLineH   = 7;

//         const rowCount  = Math.max(leftItems.length, rightItems.length);
//         const boxHeight = rowCount * lineH + 6;
//         const startY    = this.currentY;

//         // Border
//         this.doc.setDrawColor(...Colors.lightGray);
//         this.doc.setLineWidth(0.25);
//         this.doc.rect(colLeft, startY, Config.contentWidth, boxHeight, 'S');

//         // Vertical divider
//         this.doc.line(midX, startY, midX, startY + boxHeight);

//         // Left items
//         let ly = startY + 5;
//         leftItems.forEach(item => {
//             const bold = !!item.bold;
//             this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
//             this.doc.setFontSize(bold ? 9.5 : 8.5);
//             this.doc.setTextColor(...Colors.black);
//             this.doc.text(item.label, colLeft + 3, ly);
//             this.doc.text(item.value, valueLeftX, ly, { align: 'right' });
//             ly += bold ? boldLineH : lineH;
//         });

//         // Right items
//         let ry = startY + 5;
//         rightItems.forEach(item => {
//             const bold = !!item.bold;
//             this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
//             this.doc.setFontSize(bold ? 9.5 : 8.5);
//             this.doc.setTextColor(...Colors.black);
//             this.doc.text(item.label, midX + 3, ry);
//             this.doc.text(item.value, valueRightX, ry, { align: 'right' });
//             ry += bold ? boldLineH : lineH;
//         });

//         this.currentY = startY + boxHeight + 5;
//     }

//     // ── Status badge ──────────────────────────────────────────────────────────
//     protected drawStatusBadge(status: string): void {
//         let fillColor: [number, number, number];
//         let textColor: [number, number, number];
//         let text: string;

//         switch (status.toLowerCase()) {
//             case 'paid':
//                 fillColor = Colors.success;
//                 textColor = Colors.white;
//                 text = 'PAID IN FULL';
//                 break;
//             case 'partial':
//                 fillColor = Colors.warning;
//                 textColor = Colors.black;
//                 text = 'PARTIALLY PAID';
//                 break;
//             default:
//                 fillColor = Colors.danger;
//                 textColor = Colors.white;
//                 text = 'UNPAID';
//         }

//         const badgeWidth  = 52;
//         const badgeHeight = 9;
//         const badgeX      = Config.rightEdge - badgeWidth;
//         const badgeY      = this.currentY;

//         this.doc.setFillColor(...fillColor);
//         this.doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');

//         if (status.toLowerCase() === 'paid') {
//             this.doc.setFillColor(...Colors.successDark);
//             this.doc.circle(badgeX + 5.5, badgeY + 4.5, 3, 'F');
//             this.doc.setDrawColor(...Colors.white);
//             this.doc.setLineWidth(0.7);
//             this.doc.line(badgeX + 4.2, badgeY + 4.5, badgeX + 5.3, badgeY + 5.8);
//             this.doc.line(badgeX + 5.3, badgeY + 5.8, badgeX + 7.2, badgeY + 3.2);
//             this.doc.setLineWidth(0.4);
//         }

//         this.doc.setFontSize(8.5);
//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setTextColor(...textColor);
//         const isPaid     = status.toLowerCase() === 'paid';
//         const textStartX = isPaid ? badgeX + 11 : badgeX + 4;
//         const availW     = isPaid ? badgeWidth - 13 : badgeWidth - 8;
//         const textW      = this.doc.getTextWidth(text);
//         this.doc.text(text, textStartX + (availW - textW) / 2, badgeY + 6);

//         this.doc.setTextColor(...Colors.black);
//         this.doc.setFont('helvetica', 'normal');
//         this.currentY = badgeY + badgeHeight + 5;
//     }

//     // ── Processed-by bar ─────────────────────────────────────────────────────
//     protected drawProcessedByBar(name: string, role: string, timestamp?: string): void {
//         const barX      = Config.margins.left;
//         const barY      = this.currentY;
//         const barWidth  = Config.contentWidth;
//         const barHeight = 11;

//         this.doc.setFillColor(...Colors.veryLightGray);
//         this.doc.setDrawColor(...Colors.lightGray);
//         this.doc.setLineWidth(0.25);
//         this.doc.rect(barX, barY, barWidth, barHeight, 'FD');

//         // Label
//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setFontSize(8.5);
//         this.doc.setTextColor(...Colors.black);
//         this.doc.text('Processed By:', barX + 3, barY + 5.5);

//         const labelW = this.doc.getTextWidth('Processed By:');

//         // Name in blue
//         this.doc.setTextColor(...Colors.primaryLight);
//         this.doc.text(name, barX + labelW + 5, barY + 5.5);

//         // Role in gray
//         if (role) {
//             const nameW = this.doc.getTextWidth(name);
//             this.doc.setFont('helvetica', 'normal');
//             this.doc.setTextColor(...Colors.gray);
//             this.doc.text(`(${role})`, barX + labelW + nameW + 7, barY + 5.5);
//         }

//         // Timestamp
//         if (timestamp) {
//             this.doc.setFont('helvetica', 'normal');
//             this.doc.setFontSize(8.5);
//             this.doc.setTextColor(...Colors.black);
//             this.doc.text('Time:', Config.rightEdge - 26, barY + 5.5);
//             this.doc.setFont('helvetica', 'bold');
//             this.doc.text(timestamp, Config.rightEdge, barY + 5.5, { align: 'right' });
//         }

//         this.doc.setTextColor(...Colors.black);
//         this.currentY = barY + barHeight + 3;
//     }

//     // ── Notes bar ─────────────────────────────────────────────────────────────
//     protected drawNotesBar(notes: string[]): void {
//         const barX   = Config.margins.left;
//         const barY   = this.currentY;
//         const iconSz = 7;

//         // Printer icon box
//         this.doc.setFillColor(...Colors.veryLightGray);
//         this.doc.setDrawColor(...Colors.lightGray);
//         this.doc.setLineWidth(0.25);
//         this.doc.rect(barX, barY, iconSz, iconSz, 'FD');

//         this.doc.setFillColor(...Colors.gray);
//         this.doc.rect(barX + 1, barY + 1.8, 5, 3, 'F');
//         this.doc.setFillColor(...Colors.white);
//         this.doc.rect(barX + 1.5, barY + 3.5, 4, 2.5, 'F');
//         this.doc.setFillColor(...Colors.gray);
//         this.doc.rect(barX + 1.5, barY + 1, 4, 1.2, 'F');

//         // Notes text
//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setFontSize(8);
//         this.doc.setTextColor(...Colors.black);
//         this.doc.text('Notes:', barX + iconSz + 2, barY + 5);

//         this.doc.setFont('helvetica', 'normal');
//         this.doc.setTextColor(...Colors.gray);
//         this.doc.text(notes.join('  •  '), barX + iconSz + 16, barY + 5);

//         this.currentY = barY + iconSz + 2;
//     }

//     // ── Generic helpers ───────────────────────────────────────────────────────
//     protected drawSection(title: string, content: string[], bulletPoints = false): void {
//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setFontSize(9);
//         this.doc.setTextColor(...Colors.black);
//         this.doc.text(title, Config.margins.left, this.currentY);
//         this.currentY += 5;

//         this.doc.setFont('helvetica', 'normal');
//         this.doc.setFontSize(8);
//         content.forEach(line => {
//             this.doc.text(bulletPoints ? `• ${line}` : line, Config.margins.left, this.currentY);
//             this.currentY += 4.5;
//         });
//         this.currentY += 3;
//     }

//     protected drawDivider(color: [number, number, number] = Colors.lightGray): void {
//         this.doc.setDrawColor(...color);
//         this.doc.setLineWidth(0.3);
//         this.doc.line(Config.margins.left, this.currentY, Config.rightEdge, this.currentY);
//         this.currentY += 4;
//     }

//     protected addWrappedText(text: string, maxWidth = Config.contentWidth): void {
//         const lines = this.doc.splitTextToSize(text, maxWidth);
//         this.doc.setFontSize(8);
//         this.doc.text(lines, Config.margins.left, this.currentY);
//         this.currentY += lines.length * 4.5 + 3;
//     }

//     protected abstract buildDocument(): void;

//     public generate(filename: string): void {
//         this.buildDocument();
//         this.doc.save(filename);
//     }

//     public getBlob(): Blob {
//         this.buildDocument();
//         return this.doc.output('blob');
//     }
// }



import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: AutoTableOptions) => jsPDF;
        lastAutoTable?: {
            finalY: number;
        };
    }
}

interface AutoTableOptions {
    startY?: number;
    head?: string[][];
    body?: string[][];
    styles?: Record<string, any>;
    headStyles?: Record<string, any>;
    columnStyles?: Record<number, Record<string, any>>;
    margin?: {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    };
    theme?: 'striped' | 'grid' | 'plain';
    [key: string]: any;
}

export const Colors = {
    primary:        [30, 100, 200]  as [number, number, number],
    primaryLight:   [59, 130, 246]  as [number, number, number],
    success:        [34, 197, 94]   as [number, number, number],
    successDark:    [22, 163, 74]   as [number, number, number],
    warning:        [251, 191, 36]  as [number, number, number],
    danger:         [239, 68, 68]   as [number, number, number],
    gray:           [120, 120, 120] as [number, number, number],
    lightGray:      [210, 210, 210] as [number, number, number],
    veryLightGray:  [245, 247, 250] as [number, number, number],
    black:          [0, 0, 0]       as [number, number, number],
    white:          [255, 255, 255] as [number, number, number],
    tableHeader:    [30, 100, 200]  as [number, number, number],
} as const;

// ── Half-A4 crosswise (landscape): 210 mm wide × 148 mm tall ─────────────────
export const Config = {
    clinicName:   'RAZON PEDIATRIC CLINIC',
    address:      'Gladiola St, Buhangin, Davao City',
    email:        'drnice4kids@gmail.com',
    phone:        '+0939-726-6918',
    margins: {
        left:   12,
        right:  12,
        top:    7,      // tightened from 10
        bottom: 5,
    },
    pageWidth:    210,
    pageHeight:   148,
    contentWidth: 186,  // 210 - 12 - 12
    rightEdge:    198,  // 210 - 12
} as const;

export abstract class BasePDFTemplate {
    protected doc: jsPDF;
    protected currentY: number = Config.margins.top;

    constructor() {
        this.doc = new jsPDF('l', 'mm', [Config.pageWidth, Config.pageHeight]);
    }

    // ── Header (~24 mm tall) ──────────────────────────────────────────────────
    protected drawHeader(): void {
        const leftX    = Config.margins.left;
        const logoSize = 13;
        const logoX    = leftX;
        const logoY    = this.currentY;

        // Blue circle with white cross
        this.doc.setFillColor(...Colors.primaryLight);
        this.doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 'F');

        this.doc.setDrawColor(...Colors.white);
        this.doc.setLineWidth(1.2);
        const cx = logoX + logoSize / 2;
        const cy = logoY + logoSize / 2;
        this.doc.line(cx - 2.8, cy, cx + 2.8, cy);
        this.doc.line(cx, cy - 2.8, cx, cy + 2.8);
        this.doc.setLineWidth(0.4);

        // Clinic name
        const textStartX = logoX + logoSize + 4;
        this.doc.setFontSize(15);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...Colors.primary);
        this.doc.text(Config.clinicName, textStartX, logoY + 6);

        // Address & phone
        this.doc.setFontSize(7.5);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...Colors.gray);
        this.doc.text(
            `${Config.address}   |   Phone: ${Config.phone}`,
            textStartX,
            logoY + 11.5
        );

        this.currentY = logoY + logoSize + 2;   // ← was +4

        // Divider
        this.doc.setDrawColor(...Colors.lightGray);
        this.doc.setLineWidth(0.4);
        this.doc.line(Config.margins.left, this.currentY, Config.rightEdge, this.currentY);
        this.currentY += 4;                      // ← was +5
    }

    // ── Title + Date / Status (~9 mm) ─────────────────────────────────────────
    protected drawTitleAndMeta(title: string, date: string, status: string): void {
        const leftX  = Config.margins.left;
        const rightX = Config.rightEdge;

        this.doc.setFontSize(13);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...Colors.black);
        this.doc.text(title, leftX, this.currentY);

        // Date
        this.doc.setFontSize(8.5);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...Colors.gray);
        this.doc.text('Date:', rightX - 42, this.currentY - 3.5);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...Colors.black);
        this.doc.text(date, rightX, this.currentY - 3.5, { align: 'right' });

        // Status
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...Colors.gray);
        this.doc.text('Status:', rightX - 42, this.currentY + 3);

        const statusLower = status.toLowerCase();
        let statusColor: [number, number, number] = Colors.danger;
        if (statusLower === 'paid')         statusColor = Colors.successDark;
        else if (statusLower === 'partial') statusColor = [180, 120, 0];

        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...statusColor);
        this.doc.text(status.toUpperCase(), rightX, this.currentY + 3, { align: 'right' });

        this.currentY += 8;                      // ← was +10
    }

    // ── Bill To (~5 mm) ───────────────────────────────────────────────────────
    protected drawBillTo(patientName: string): void {
        const leftX = Config.margins.left;

        this.doc.setFontSize(8.5);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...Colors.black);
        this.doc.text('Bill To:', leftX, this.currentY);

        this.doc.setTextColor(...Colors.primaryLight);
        this.doc.text(patientName, leftX + 17, this.currentY);

        this.doc.setTextColor(...Colors.black);
        this.currentY += 5;                      // ← was +6
    }

    // ── Items table ───────────────────────────────────────────────────────────
    protected drawTable(
        headers: string[],
        data: string[][],
        columnStyles?: Record<number, Record<string, any>>,
        tableWidth: 'auto' | 'wrap' | number = 'auto'
    ): void {
        autoTable(this.doc, {
            startY: this.currentY,
            head: [headers],
            body: data,
            styles: {
                fontSize: 8,
                cellPadding: 2,              // ← was 3
                halign: 'center',
                textColor: Colors.black,
            },
            headStyles: {
                fillColor: Colors.tableHeader,
                textColor: Colors.white,
                fontStyle: 'bold',
                halign: 'center',
            },
            bodyStyles:         { fillColor: Colors.white },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            columnStyles:       columnStyles || {},
            theme:              'grid',
            tableWidth:         tableWidth,
            margin:             { left: Config.margins.left, right: Config.margins.right },
            tableLineColor:     Colors.lightGray,
            tableLineWidth:     0.25,
        });

        this.currentY = this.doc.lastAutoTable?.finalY
            ? this.doc.lastAutoTable.finalY + 3  // ← was +5
            : this.currentY + 30;
    }

    // ── Split summary box ─────────────────────────────────────────────────────
    protected drawSplitSummary(
        leftItems:  { label: string; value: string; bold?: boolean }[],
        rightItems: { label: string; value: string; bold?: boolean }[]
    ): void {
        const colLeft     = Config.margins.left;
        const midX        = colLeft + Config.contentWidth / 2;
        const valueLeftX  = midX - 3;
        const valueRightX = Config.rightEdge;
        const lineH       = 5.5;                // ← was 6
        const boldLineH   = 6.5;               // ← was 7

        const rowCount  = Math.max(leftItems.length, rightItems.length);
        const boxHeight = rowCount * lineH + 5; // ← was +6
        const startY    = this.currentY;

        // Border
        this.doc.setDrawColor(...Colors.lightGray);
        this.doc.setLineWidth(0.25);
        this.doc.rect(colLeft, startY, Config.contentWidth, boxHeight, 'S');

        // Vertical divider
        this.doc.line(midX, startY, midX, startY + boxHeight);

        // Left items
        let ly = startY + 4.5;               // ← was +5
        leftItems.forEach(item => {
            const bold = !!item.bold;
            this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
            this.doc.setFontSize(bold ? 9 : 8);  // ← was 9.5 / 8.5
            this.doc.setTextColor(...Colors.black);
            this.doc.text(item.label, colLeft + 3, ly);
            this.doc.text(item.value, valueLeftX, ly, { align: 'right' });
            ly += bold ? boldLineH : lineH;
        });

        // Right items
        let ry = startY + 4.5;
        rightItems.forEach(item => {
            const bold = !!item.bold;
            this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
            this.doc.setFontSize(bold ? 9 : 8);
            this.doc.setTextColor(...Colors.black);
            this.doc.text(item.label, midX + 3, ry);
            this.doc.text(item.value, valueRightX, ry, { align: 'right' });
            ry += bold ? boldLineH : lineH;
        });

        this.currentY = startY + boxHeight + 3; // ← was +5
    }

    // ── Status badge (~12 mm) ─────────────────────────────────────────────────
    protected drawStatusBadge(status: string): void {
        let fillColor: [number, number, number];
        let textColor: [number, number, number];
        let text: string;

        switch (status.toLowerCase()) {
            case 'paid':
                fillColor = Colors.success;
                textColor = Colors.white;
                text = 'PAID IN FULL';
                break;
            case 'partial':
                fillColor = Colors.warning;
                textColor = Colors.black;
                text = 'PARTIALLY PAID';
                break;
            default:
                fillColor = Colors.danger;
                textColor = Colors.white;
                text = 'UNPAID';
        }

        const badgeWidth  = 52;
        const badgeHeight = 8;               // ← was 9
        const badgeX      = Config.rightEdge - badgeWidth;
        const badgeY      = this.currentY;

        this.doc.setFillColor(...fillColor);
        this.doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');

        if (status.toLowerCase() === 'paid') {
            this.doc.setFillColor(...Colors.successDark);
            this.doc.circle(badgeX + 5.5, badgeY + 4, 2.8, 'F');
            this.doc.setDrawColor(...Colors.white);
            this.doc.setLineWidth(0.7);
            this.doc.line(badgeX + 4.2, badgeY + 4, badgeX + 5.2, badgeY + 5.2);
            this.doc.line(badgeX + 5.2, badgeY + 5.2, badgeX + 7, badgeY + 2.8);
            this.doc.setLineWidth(0.4);
        }

        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...textColor);
        const isPaid     = status.toLowerCase() === 'paid';
        const textStartX = isPaid ? badgeX + 11 : badgeX + 4;
        const availW     = isPaid ? badgeWidth - 13 : badgeWidth - 8;
        const textW      = this.doc.getTextWidth(text);
        this.doc.text(text, textStartX + (availW - textW) / 2, badgeY + 5.2);

        this.doc.setTextColor(...Colors.black);
        this.doc.setFont('helvetica', 'normal');
        this.currentY = badgeY + badgeHeight + 3; // ← was +5
    }

    // ── Processed-by bar (~10 mm) ─────────────────────────────────────────────
    protected drawProcessedByBar(name: string, role: string, timestamp?: string): void {
        const barX      = Config.margins.left;
        const barY      = this.currentY;
        const barWidth  = Config.contentWidth;
        const barHeight = 10;                // ← was 11

        this.doc.setFillColor(...Colors.veryLightGray);
        this.doc.setDrawColor(...Colors.lightGray);
        this.doc.setLineWidth(0.25);
        this.doc.rect(barX, barY, barWidth, barHeight, 'FD');

        // Label
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(8);
        this.doc.setTextColor(...Colors.black);
        this.doc.text('Processed By:', barX + 3, barY + 5);

        const labelW = this.doc.getTextWidth('Processed By:');

        // Name
        this.doc.setTextColor(...Colors.primaryLight);
        this.doc.text(name, barX + labelW + 5, barY + 5);

        // Role
        if (role) {
            const nameW = this.doc.getTextWidth(name);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(...Colors.gray);
            this.doc.text(`(${role})`, barX + labelW + nameW + 7, barY + 5);
        }

        // Timestamp
        if (timestamp) {
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(8);
            this.doc.setTextColor(...Colors.black);
            this.doc.text('Time:', Config.rightEdge - 26, barY + 5);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(timestamp, Config.rightEdge, barY + 5, { align: 'right' });
        }

        this.doc.setTextColor(...Colors.black);
        this.currentY = barY + barHeight + 2; // ← was +3
    }

    // ── Notes bar (~8 mm) ─────────────────────────────────────────────────────
    protected drawNotesBar(notes: string[]): void {
        const barX   = Config.margins.left;
        const barY   = this.currentY;
        const iconSz = 6.5;                  // ← was 7

        // Printer icon box
        this.doc.setFillColor(...Colors.veryLightGray);
        this.doc.setDrawColor(...Colors.lightGray);
        this.doc.setLineWidth(0.25);
        this.doc.rect(barX, barY, iconSz, iconSz, 'FD');

        this.doc.setFillColor(...Colors.gray);
        this.doc.rect(barX + 1, barY + 1.8, 4.5, 2.5, 'F');
        this.doc.setFillColor(...Colors.white);
        this.doc.rect(barX + 1.5, barY + 3.2, 3.5, 2.2, 'F');
        this.doc.setFillColor(...Colors.gray);
        this.doc.rect(barX + 1.5, barY + 0.9, 3.5, 1.1, 'F');

        // Notes text
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(...Colors.black);
        this.doc.text('Notes:', barX + iconSz + 2, barY + 4.5);

        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...Colors.gray);
        this.doc.text(notes.join('  •  '), barX + iconSz + 15, barY + 4.5);

        this.currentY = barY + iconSz + 1;
    }

    // ── Generic helpers ───────────────────────────────────────────────────────
    protected drawSection(title: string, content: string[], bulletPoints = false): void {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(8.5);
        this.doc.setTextColor(...Colors.black);
        this.doc.text(title, Config.margins.left, this.currentY);
        this.currentY += 4.5;

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(7.5);
        content.forEach(line => {
            this.doc.text(bulletPoints ? `• ${line}` : line, Config.margins.left, this.currentY);
            this.currentY += 4;
        });
        this.currentY += 2;
    }

    protected drawDivider(color: [number, number, number] = Colors.lightGray): void {
        this.doc.setDrawColor(...color);
        this.doc.setLineWidth(0.3);
        this.doc.line(Config.margins.left, this.currentY, Config.rightEdge, this.currentY);
        this.currentY += 4;
    }

    protected addWrappedText(text: string, maxWidth = Config.contentWidth): void {
        const lines = this.doc.splitTextToSize(text, maxWidth);
        this.doc.setFontSize(8);
        this.doc.text(lines, Config.margins.left, this.currentY);
        this.currentY += lines.length * 4.5 + 3;
    }

    protected abstract buildDocument(): void;

    public generate(filename: string): void {
        this.buildDocument();
        this.doc.save(filename);
    }

    public getBlob(): Blob {
        this.buildDocument();
        return this.doc.output('blob');
    }
}