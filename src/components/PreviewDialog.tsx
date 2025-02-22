import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  document: any;
  companySettings?: {
    name?: string;
    logoUrl?: string;
    address?: string;
    contactInfo?: string;
    registrationNumber?: string;
    companyNumber?: string;
  };
}
export default function PreviewDialog({
  open,
  onClose,
  document,
  companySettings
}: PreviewDialogProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.type} ${document.number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #1a1f2c;
            }
            .header { 
              width: 100%;
              display: table;
              margin-bottom: 40px;
            }
            .left-section {
              display: table-cell;
              width: 50%;
              vertical-align: top;
              padding-right: 2rem;
            }
            .right-section {
              display: table-cell;
              width: 50%;
              vertical-align: top;
              text-align: right;
            }
            .company-info { margin-bottom: 2rem; }
            .logo { max-width: 175px; margin-bottom: 1rem; }
            .details { margin-bottom: 30px; }
            .row { display: flex; margin-bottom: 12px; }
            .label { font-weight: 600; width: 150px; color: #64748b; }
            .amount { font-size: 1.5em; margin-top: 30px; }
            .document-title { 
              font-size: 2.5em; 
              color: #64748b;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 0.5rem;
            }
            .document-number {
              font-size: 1.5em;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 3rem;
            }
            .company-name {
              font-size: 1.5em;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .bill-to {
              color: #64748b;
              font-size: 0.875rem;
              margin: 1.5rem 0 0.5rem 0;
            }
            .customer-name {
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .address {
              white-space: pre-line;
              line-height: 1.5;
            }
            .balance-box {
              display: inline-block;
              background-color: #f8f9fa;
              padding: 1rem 1.5rem;
              border-radius: 0.5rem;
              margin-top: 1rem;
            }
            .balance-label {
              font-size: 0.875rem;
              font-weight: 500;
              color: #64748b;
              margin-right: 1rem;
            }
            .balance-amount {
              font-size: 1.25rem;
              font-weight: 600;
              color: #1a1f2c;
            }
            .date-row {
              margin-bottom: 0.75rem;
              text-align: right;
            }
            .date-label {
              font-size: 0.875rem;
              font-weight: 500;
              color: #64748b;
              margin-right: 1rem;
            }
            .date-value {
              font-size: 0.875rem;
              color: #1a1f2c;
            }
            @media print {
              .no-print { display: none; }
              body { margin: 0; padding: 20px; }
              .header { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="left-section">
              ${companySettings?.logoUrl ? `<img src="${companySettings.logoUrl}" alt="Company Logo" class="logo">` : ''}
              ${companySettings?.name ? `<div class="company-name">${companySettings.name}</div>` : ''}
              ${companySettings?.address ? `<div class="address">${companySettings.address}</div>` : ''}
              ${companySettings?.companyNumber ? `<div class="company-details">Company No: ${companySettings.companyNumber}</div>` : ''}
              ${companySettings?.registrationNumber ? `<div class="company-details">VAT: ${companySettings.registrationNumber}</div>` : ''}
              <div class="bill-to">Bill To:</div>
              <div class="customer-name">${document.customer}</div>
              <div class="address">${document.address || ''}</div>
            </div>
            <div class="right-section">
              <div class="document-title">${document.type}</div>
              <div class="document-number">#${document.number}</div>
              <div class="date-row">
                <span class="date-label">Date:</span>
                <span class="date-value">${formatDate(document.invoiceDate || document.date)}</span>
              </div>
              ${document.dueDate ? `
                <div class="date-row">
                  <span class="date-label">Due Date:</span>
                  <span class="date-value">${formatDate(document.dueDate)}</span>
                </div>
              ` : ''}
              <div class="balance-box">
                <span class="balance-label">Balance Due:</span>
                <span class="balance-amount">${document.amount}</span>
              </div>
            </div>
          </div>

          <div class="details">
            <div class="row">
              <span class="label">Invoice Number:</span>
              <span>${document.number}</span>
            </div>
            <div class="row">
              <span class="label">Invoice Date:</span>
              <span>${document.invoiceDate || document.date}</span>
            </div>
            <div class="row">
              <span class="label">Due Date:</span>
              <span>${document.dueDate || document.date}</span>
            </div>
            <div class="row">
              <span class="label">Status:</span>
              <span class="status">${document.status}</span>
            </div>
            <div class="amount">
              <span class="label">Amount:</span>
              <span>${document.amount}</span>
            </div>
          </div>
          
          <div class="no-print">
            <button onclick="window.print()">Print</button>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };
  return <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] w-full max-h-[85vh] p-8 bg-white overflow-y-auto">
        <div className="w-full relative rounded-lg p-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              {companySettings?.logoUrl && <img src={companySettings.logoUrl} alt="Company Logo" className="max-w-[175px] mb-4" />}
              
              <div className="space-y-1">
                {companySettings?.name && <p className="font-bold text-gray-900">{companySettings.name}</p>}
                
                {companySettings?.address && <p className="whitespace-pre-line text-gray-600">{companySettings.address}</p>}

                {companySettings?.companyNumber && <p className="text-gray-600">Company No: {companySettings.companyNumber}</p>}

                {companySettings?.registrationNumber && <p className="text-gray-600">VAT: {companySettings.registrationNumber}</p>}
              </div>
              
              <div className="pt-6">
                <p className="text-sm text-gray-500 mb-2">Bill To:</p>
                <p className="font-semibold text-gray-900 mb-1">{document.customer}</p>
                {document.address && <p className="whitespace-pre-line text-gray-600">{document.address}</p>}
              </div>
            </div>

            <div>
              <div className="text-right">
                <h1 className="text-4xl font-bold text-gray-500 mb-1 uppercase">
                  {document.type}
                </h1>
                <h2 className="text-2xl font-semibold text-gray-500">
                  #{document.number}
                </h2>

                <div className="space-y-3 mt-8 pt-20">
                  <div className="flex justify-end items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">Date:</span>
                    <span className="text-sm text-gray-900">{formatDate(document.invoiceDate || document.date)}</span>
                  </div>
                  
                  {document.dueDate && <div className="flex justify-end items-center gap-4">
                      <span className="text-sm font-medium text-gray-500">Due Date:</span>
                      <span className="text-sm text-gray-900">{formatDate(document.dueDate)}</span>
                    </div>}
                  
                  <div className="inline-block mt-4 bg-gray-50 rounded-lg px-6 py-4">
                    <div className="flex justify-end items-center gap-4">
                      <span className="text-sm font-medium text-gray-500">Balance Due:</span>
                      <span className="text-lg font-semibold text-gray-900">{document.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          

          <div className="absolute bottom-4 right-4">
            <Button onClick={handlePrint} className="bg-gray-900 hover:bg-gray-800">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}