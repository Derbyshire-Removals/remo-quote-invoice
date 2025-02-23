
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
          <title>Quote Preview</title>
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
            .items-list {
              margin: 2rem 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              padding: 0.5rem 0;
            }
            .item-description {
              flex: 1;
            }
            .item-amount {
              text-align: right;
              margin-left: 2rem;
            }
            .customer-name {
              font-size: 1.2rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .customer-address {
              white-space: pre-line;
              color: #4A5568;
              margin-bottom: 2rem;
            }
            .greeting {
              margin-bottom: 2rem;
            }
            .quote-message {
              margin-bottom: 2rem;
              white-space: pre-line;
            }
            .footer {
              margin-top: 4rem;
            }
            .signature {
              margin-bottom: 2rem;
            }
            .company-details {
              text-align: center;
              color: #718096;
              font-size: 0.875rem;
            }
            @media print {
              .no-print { display: none; }
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="quote-header">
            <div class="company-info">
              ${companySettings?.logoUrl ? `<img src="${companySettings.logoUrl}" alt="Company Logo" class="logo" />` : ''}
              ${companySettings?.name ? `<div style="font-weight: 600;">${companySettings.name}</div>` : ''}
              ${companySettings?.address ? `<div class="company-address">${companySettings.address}</div>` : ''}
            </div>
            <div class="quote-info">
              <div class="quote-title">QUOTE</div>
              <div style="color: #8E9196;">
                <div>Date: ${format(new Date(document.createdAt), 'dd MMM yyyy')}</div>
                <div>Move Date: ${format(new Date(document.moveDate), 'dd MMM yyyy')}</div>
              </div>
            </div>
          </div>

          <div class="customer-name">${document.customerName}</div>
          <div class="customer-address">${document.fromAddress}</div>

          <div class="greeting">Dear ${document.customerName},</div>

          <div class="quote-message">${document.message || 'No message provided'}</div>

          <div class="items-list">
            ${document.items?.map((item: any) => `
              <div class="item">
                <span class="item-description">${item.description}</span>
                <span class="item-amount">£${parseFloat(item.amount).toFixed(2)} + VAT</span>
              </div>
            `).join('') || ''}
          </div>

          <div class="footer">
            <div class="signature">
              <p>If you require any other information please do not hesitate to contact us.</p>
              <p>Yours faithfully,</p>
              <p>${companySettings?.name || 'Derbyshire Removals'}</p>
            </div>

            <div class="company-details">
              <p>${companySettings?.name || 'Derbyshire Removals'} is the trading name used by Nexus Deliveries Ltd</p>
              <p>Company no: ${companySettings?.companyNumber || '#######'} VAT: ${companySettings?.registrationNumber || '#########'}</p>
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
                  {companySettings?.address && <p className="text-gray-600 whitespace-pre-line">{companySettings.address}</p>}
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-bold text-primary mb-1">QUOTE</h1>
                <div className="text-gray-500">
                  <p>Date: {format(new Date(document.createdAt), 'dd MMM yyyy')}</p>
                  <p>Move Date: {format(new Date(document.moveDate), 'dd MMM yyyy')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-lg font-semibold mb-1">{document.customerName}</p>
            <p className="text-gray-600 whitespace-pre-line mb-8">{document.fromAddress}</p>
            
            <p className="mb-8">Dear {document.customerName},</p>
            
            <div className="whitespace-pre-line mb-8">{document.message || 'No message provided'}</div>

            <div className="space-y-2 mb-8">
              {document.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{item.description}</span>
                  <span>£{parseFloat(item.amount).toFixed(2)} + VAT</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-16">
              <p>If you require any other information please do not hesitate to contact us.</p>
              <p>Yours faithfully,</p>
              <p>{companySettings?.name || 'Derbyshire Removals'}</p>
            </div>

            <div className="text-center text-sm text-gray-500 space-y-1">
              <p>{companySettings?.name || 'Derbyshire Removals'} is the trading name used by Nexus Deliveries Ltd</p>
              <p>Company no: {companySettings?.companyNumber || '#######'} VAT: {companySettings?.registrationNumber || '#########'}</p>
            </div>
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
