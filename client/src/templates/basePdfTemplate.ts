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
    primary: [59, 130, 246] as [number, number, number],
    success: [34, 197, 94] as [number, number, number],
    warning: [251, 191, 36] as [number, number, number],
    danger: [239, 68, 68] as [number, number, number],
    gray: [100, 100, 100] as [number, number, number],
    lightGray: [200, 200, 200] as [number, number, number],
    black: [0, 0, 0] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
} as const;

export const Config = {
    clinicName: 'Razon Pediatric Clinic',
    address: '4J38+73R, Gladiola St, Buhangin, Davao City, 8000 Davao del Sur',
    email: 'drnice4kids@gmail.com',
    phone: '+0939-726-6918',
    margins: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
    },
    pageWidth: 210, //A4 width in mm
} as const;

export abstract class BasePDFTemplate {
    protected doc: jsPDF;
    protected currentY: number = 20;

    constructor() {
        this.doc = new jsPDF();
    }

    protected drawHeader(title: string): void {
        //clinic name/logo
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...Colors.primary);
        this.doc.text(Config.clinicName, 105, this.currentY, { align: 'center' });
        
        this.currentY += 8;

        //contact information
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...Colors.black);
        
        const contactInfo = [
            Config.address,
            `Email: ${Config.email} | Phone: ${Config.phone}`,
        ];
        
        contactInfo.forEach(line => {
            this.doc.text(line, 105, this.currentY, { align: 'center' });
            this.currentY += 5;
        });

        this.currentY += 2;
        this.doc.setDrawColor(...Colors.lightGray);
        this.doc.line(Config.margins.left, this.currentY, 190, this.currentY);
        this.currentY += 10;

        //document title
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...Colors.black);
        this.doc.text(title, 105, this.currentY, { align: 'center' });
        this.currentY += 12;
    }

    protected drawTwoColumnSection(
        leftTitle: string,
        leftContent: string[],
        rightTitle: string,
        rightContent: string[]
    ): void {
        const leftX = Config.margins.left;
        const rightX = 110;
        const startY = this.currentY;

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(10);
        this.doc.text(leftTitle, leftX, startY);
        
        this.doc.setFont('helvetica', 'normal');
        leftContent.forEach((line, index) => {
            this.doc.text(line, leftX, startY + 6 + (index * 6));
        });

        this.doc.setFont('helvetica', 'bold');
        this.doc.text(rightTitle, rightX, startY);
        
        this.doc.setFont('helvetica', 'normal');
        rightContent.forEach((line, index) => {
            this.doc.text(line, rightX, startY + 6 + (index * 6));
        });

        this.currentY = startY + Math.max(leftContent.length, rightContent.length) * 6 + 15;
    }

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
                fontSize: 10,
                cellPadding: 5,
                halign: 'center',
            },
            headStyles: {
                fillColor: Colors.primary,
                textColor: Colors.white,
                fontStyle: 'bold',
                halign: 'center',
            },
            columnStyles: columnStyles || {},
            theme: 'striped',
            tableWidth: tableWidth,
            margin: { left: Config.margins.left, right: Config.margins.right },
        });

        this.currentY = this.doc.lastAutoTable?.finalY ? this.doc.lastAutoTable.finalY + 10 : this.currentY + 50;
    }

    
    protected drawSummaryBox(
        items: { label: string; value: string; bold?: boolean }[]
    ): void {
        const summaryX = 120;
        const valueX = 185;
        
        this.doc.setDrawColor(...Colors.lightGray);
        this.doc.line(summaryX, this.currentY, valueX + 5, this.currentY);
        this.currentY += 8;

        items.forEach(item => {
            if (item.bold) {
                this.doc.setFont('helvetica', 'bold');
                this.doc.setFontSize(12);
            } else {
                this.doc.setFont('helvetica', 'normal');
                this.doc.setFontSize(10);
            }
            
            this.doc.text(item.label, summaryX, this.currentY);
            this.doc.text(item.value, valueX, this.currentY, { align: 'right' });
            this.currentY += item.bold ? 8 : 6;
        });
    }

    protected drawStatusBadge(status: string, x: number, y: number): void {
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

        const badgeWidth = 70;
        const badgeHeight = 10;

        this.doc.setFillColor(...fillColor);
        this.doc.setTextColor(...textColor);
        this.doc.roundedRect(x, y, badgeWidth, badgeHeight, 3, 3, 'F');
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        const textWidth = this.doc.getTextWidth(text);
        const textX = x + (badgeWidth - textWidth) / 2;
        this.doc.text(text, textX, y + 7);
        
        this.doc.setTextColor(...Colors.black);
        this.doc.setFont('helvetica', 'normal');
    }

    protected drawSection(title: string, content: string[], bulletPoints: boolean = false): void {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(11);
        this.doc.text(title, Config.margins.left, this.currentY);
        this.currentY += 6;

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(9);
        
        content.forEach(line => {
            const displayLine = bulletPoints ? `• ${line}` : line;
            this.doc.text(displayLine, Config.margins.left, this.currentY);
            this.currentY += 5;
        });

        this.currentY += 5;
    }

    protected drawFooter(additionalInfo?: string[]): void {
        const footerY = 270;
        
        this.doc.setDrawColor(...Colors.lightGray);
        this.doc.line(Config.margins.left, footerY, 190, footerY);

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(8);
        this.doc.setTextColor(...Colors.gray);

        const footerLines = [
            'This is a computer-generated document and does not require a signature.',
            `Generated on: ${new Date().toLocaleString()}`,
            `Thank you for choosing ${Config.clinicName}!`,
            ...(additionalInfo || [])
        ];

        let yPos = footerY + 5;
        footerLines.forEach(line => {
            this.doc.text(line, 105, yPos, { align: 'center' });
            yPos += 4;
        });
    }

    protected drawDivider(color: [number, number, number] = Colors.lightGray): void {
        this.doc.setDrawColor(...color);
        this.doc.line(Config.margins.left, this.currentY, 190, this.currentY);
        this.currentY += 8;
    }

    protected addWrappedText(text: string, maxWidth: number = 170): void {
        const lines = this.doc.splitTextToSize(text, maxWidth);
        this.doc.text(lines, Config.margins.left, this.currentY);
        this.currentY += lines.length * 5 + 5;
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