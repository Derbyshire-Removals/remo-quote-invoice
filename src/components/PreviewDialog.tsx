import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

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
  };
}

export default function PreviewDialog({ open, onClose, document, companySettings }: PreviewDialogProps) {
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
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2rem;
              margin-bottom: 40px;
            }
            .company-info { margin-bottom: 2rem; }
            .logo { max-width: 200px; margin-bottom: 1rem; }
            .details { margin-bottom: 30px; }
            .row { display: flex; margin-bottom: 12px; }
            .label { font-weight: 600; width: 150px; color: #64748b; }
            .amount { font-size: 1.5em; margin-top: 30px; }
            .document-title { 
              font-size: 2.5em; 
              color: #1a1f2c;
              font-weight: 700;
              text-align: right;
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
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="left-section">
              ${companySettings?.logoUrl ? `<img src="${companySettings.logoUrl}" alt="Company Logo" class="logo">` : ''}
              ${companySettings?.name ? `<div class="company-name">${companySettings.name}</div>` : ''}
              ${companySettings?.address ? `<div class="address">${companySettings.address}</div>` : ''}
              <div class="bill-to">Bill To:</div>
              <div class="customer-name">${document.customer}</div>
              <div class="address">${document.address || ''}</div>
            </div>
            <div class="right-section">
              <div class="document-title">
                ${document.type}
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] w-full max-h-[85vh] p-8 bg-white overflow-y-auto">
        <div className="w-full relative rounded-lg p-8">
          {/* Header Section with Two Columns */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-4">
              {companySettings?.logoUrl && (
                <img 
                  src={companySettings.logoUrl} 
                  alt="Company Logo" 
                  className="max-w-[200px]"
                />
              )}
              
              {companySettings?.name && (
                <h2 className="text-xl font-semibold text-gray-900">{companySettings.name}</h2>
              )}
              
              {companySettings?.address && (
                <p className="whitespace-pre-line text-gray-600">{companySettings.address}</p>
              )}
              
              <div className="pt-6">
                <p className="text-sm text-gray-500 mb-2">Bill To:</p>
                <p className="font-semibold text-gray-900 mb-1">{document.customer}</p>
                {document.address && (
                  <p className="whitespace-pre-line text-gray-600">{document.address}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="text-right">
                <h1 className="text-4xl font-bold text-gray-900 mb-1">
                  {document.type}
                </h1>
                <h2 className="text-2xl font-semibold text-gray-500">
                  #{document.number}
                </h2>

                <div className="space-y-3 mt-8">
                  <div className="flex justify-end items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">Date:</span>
                    <span className="text-sm text-gray-900">{document.invoiceDate || document.date}</span>
                  </div>
                  
                  {document.dueDate && (
                    <div className="flex justify-end items-center gap-4">
                      <span className="text-sm font-medium text-gray-500">Due Date:</span>
                      <span className="text-sm text-gray-900">{document.dueDate}</span>
                    </div>
                  )}
                  
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

          {/* Invoice Details */}
          <div className="space-y-6 border-t pt-6">
            <div className="grid gap-4">
              <div className="flex items-center">
                <span className="font-medium text-gray-500 w-32">Invoice Number:</span>
                <span className="text-gray-900">{document.number}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-500 w-32">Invoice Date:</span>
                <span className="text-gray-900">{document.invoiceDate || document.date}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-500 w-32">Due Date:</span>
                <span className="text-gray-900">{document.dueDate || document.date}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-500 w-32">Status:</span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  document.status === "Paid" ? "bg-green-100 text-green-800" :
                  document.status === "Unpaid" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                )}>
                  {document.status}
                </span>
              </div>
            </div>

            <div className="flex items-center text-xl mt-8 pt-6 border-t">
              <span className="font-semibold text-gray-900 w-32">Amount:</span>
              <span className="text-2xl font-bold text-gray-900">{document.amount}</span>
            </div>
          </div>

          {/* Print Button */}
          <div className="absolute bottom-4 right-4">
            <Button onClick={handlePrint} className="bg-gray-900 hover:bg-gray-800">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
