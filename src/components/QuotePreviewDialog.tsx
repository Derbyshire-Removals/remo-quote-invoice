
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

interface QuotePreviewDialogProps {
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

export default function QuotePreviewDialog({
  open,
  onClose,
  document,
  companySettings
}: QuotePreviewDialogProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quote #${document.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #1A1F2C;
              font-size: 14px;
              background-color: #fff;
            }
            .quote-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3rem;
              padding: 2rem;
              background-color: #F6F6F7;
              border-radius: 12px;
            }
            .company-info {
              max-width: 60%;
            }
            .quote-info {
              text-align: right;
            }
            .logo {
              max-width: 175px;
              margin-bottom: 1rem;
            }
            .quote-title {
              font-size: 2.5rem;
              color: #9b87f5;
              font-weight: 700;
              margin-bottom: 0.5rem;
            }
            .quote-number {
              color: #8E9196;
              font-size: 1.25rem;
              margin-bottom: 1.5rem;
            }
            .customer-section {
              padding: 2rem;
              background-color: #F1F0FB;
              border-radius: 12px;
              margin-bottom: 2rem;
            }
            .section-title {
              color: #7E69AB;
              font-size: 0.875rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 2rem 0;
            }
            .items-table th {
              background-color: #9b87f5;
              color: white;
              text-align: left;
              padding: 1rem;
              font-weight: 500;
            }
            .items-table td {
              padding: 1rem;
              border-bottom: 1px solid #E5DEFF;
            }
            .items-table tr:last-child td {
              border-bottom: none;
            }
            .amount-cell {
              text-align: right;
            }
            .total-section {
              padding: 2rem;
              background-color: #F1F0FB;
              border-radius: 12px;
              margin-top: 2rem;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 0.5rem;
              font-size: 1.1rem;
            }
            .total-label {
              color: #7E69AB;
              margin-right: 2rem;
              font-weight: 500;
            }
            .total-value {
              font-weight: 600;
              color: #1A1F2C;
            }
            .message-section {
              margin-top: 3rem;
              padding: 2rem;
              background-color: #F1F0FB;
              border-radius: 12px;
            }
            @media print {
              .no-print { display: none; }
              body { margin: 0; padding: 20px; }
              .items-table th {
                background-color: #9b87f5 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="quote-header">
            <div class="company-info">
              ${companySettings?.logoUrl ? `<img src="${companySettings.logoUrl}" alt="Company Logo" class="logo" />` : ''}
              ${companySettings?.name ? `<div style="font-weight: 600;">${companySettings.name}</div>` : ''}
              ${companySettings?.address ? `<div style="color: #8E9196; margin-top: 0.5rem;">${companySettings.address}</div>` : ''}
            </div>
            <div class="quote-info">
              <div class="quote-title">QUOTE</div>
              <div class="quote-number">#${document.id}</div>
              <div style="color: #8E9196;">
                <div>Date: ${format(new Date(document.createdAt), 'dd MMM yyyy')}</div>
                <div>Move Date: ${format(new Date(document.moveDate), 'dd MMM yyyy')}</div>
              </div>
            </div>
          </div>

          <div class="customer-section">
            <div class="section-title">CUSTOMER DETAILS</div>
            <div style="font-weight: 600; font-size: 1.1rem;">${document.customerName}</div>
            <div style="color: #8E9196; margin-top: 0.5rem;">
              <div>Email: ${document.email}</div>
              <div>Phone: ${document.phone}</div>
              <div style="margin-top: 0.5rem;">From Address: ${document.fromAddress}</div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 70%">Description</th>
                <th style="width: 30%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${document.items?.map((item: any) => `
                <tr>
                  <td>${item.description}</td>
                  <td class="amount-cell">£${parseFloat(item.amount).toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Total Amount:</span>
              <span class="total-value">£${document.total.toFixed(2)}</span>
            </div>
          </div>

          <div class="message-section">
            <div class="section-title">QUOTE MESSAGE</div>
            <div style="white-space: pre-line; color: #1A1F2C; margin-top: 0.5rem;">
              ${document.message || 'No message provided'}
            </div>
          </div>

          <div class="no-print">
            <button onclick="window.print()">Print Quote</button>
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
        <div className="w-full relative">
          <div className="bg-gray-50 p-8 rounded-lg mb-12">
            <div className="flex justify-between">
              <div className="max-w-[60%]">
                {companySettings?.logoUrl && (
                  <img src={companySettings.logoUrl} alt="Company Logo" className="max-w-[175px] mb-4" />
                )}
                <div className="space-y-1">
                  {companySettings?.name && <p className="font-semibold">{companySettings.name}</p>}
                  {companySettings?.address && <p className="text-gray-600">{companySettings.address}</p>}
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-bold text-primary mb-1">QUOTE</h1>
                <p className="text-xl text-gray-500 mb-6">#{document.id}</p>
                <div className="text-gray-500">
                  <p>Date: {format(new Date(document.createdAt), 'dd MMM yyyy')}</p>
                  <p>Move Date: {format(new Date(document.moveDate), 'dd MMM yyyy')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-8 rounded-lg mb-12">
            <h2 className="text-sm font-semibold text-primary mb-2">CUSTOMER DETAILS</h2>
            <p className="text-xl font-semibold mb-2">{document.customerName}</p>
            <div className="text-gray-600 space-y-1">
              <p>Email: {document.email}</p>
              <p>Phone: {document.phone}</p>
              <p className="mt-2">From Address: {document.fromAddress}</p>
            </div>
          </div>

          <div className="mb-12">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-primary text-white text-left p-4 rounded-tl-lg">Description</th>
                  <th className="bg-primary text-white text-right p-4 rounded-tr-lg w-[200px]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {document.items?.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-purple-100">
                    <td className="py-4 px-4">{item.description}</td>
                    <td className="py-4 px-4 text-right">£{parseFloat(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-purple-50 p-8 rounded-lg text-right mb-12">
            <div className="flex justify-end items-center gap-8">
              <span className="text-lg font-medium text-primary">Total Amount:</span>
              <span className="text-lg font-bold">£{document.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-purple-50 p-8 rounded-lg">
            <h2 className="text-sm font-semibold text-primary mb-2">QUOTE MESSAGE</h2>
            <p className="whitespace-pre-line text-gray-800">{document.message || 'No message provided'}</p>
          </div>

          <div className="absolute bottom-4 right-4">
            <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
              <Printer className="mr-2 h-4 w-4" />
              Print Quote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
