
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
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'dd MMM yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Set the document title for saving
    printWindow.document.title = `${document.customerName}'s Quote`;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.customerName}'s Quote</title>
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
            }
            .company-info {
              max-width: 50%;
            }
            .quote-info {
              text-align: right;
              width: 45%;
            }
            .logo {
              max-width: 175px;
              margin-bottom: 1rem;
            }
            .quote-title {
              font-size: 2.5rem;
              color: #022f5c;
              font-weight: 700;
              margin-bottom: 0.5rem;
            }
            .services-list {
              margin-top: 4rem;
              list-style: none;
              padding: 0;
              text-align: right;
              color: #022f5c;
              font-weight: 600;
              font-family: Impact, sans-serif;
            }
            .services-list li {
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
              line-height: 1.5;
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
              ${companySettings?.address ? `<div style="white-space: pre-line;">${companySettings.address}</div>` : ''}
            </div>
            <div class="quote-info">
              <div class="quote-title">QUOTE</div>
              <div style="color: #8E9196;">
                <div>Date: ${formatDate(document.createdAt)}</div>
              </div>
              <ul class="services-list">
                <li>Home/Office Removals</li>
                <li>Local/Long Distance</li>
                <li>Full Packing Available</li>
                <li>Storage Available</li>
                <li>Fully Insured</li>
              </ul>
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
              <p>${document.createdBy || companySettings?.name || 'Derbyshire Removals'}</p>
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
          <div className="flex justify-between mb-12">
            <div className="max-w-[50%]">
              {companySettings?.logoUrl && (
                <img src={companySettings.logoUrl} alt="Company Logo" className="max-w-[175px] mb-4" />
              )}
              <div className="space-y-1">
                {companySettings?.name && <p className="font-semibold">{companySettings.name}</p>}
                {companySettings?.address && <p className="text-gray-600 whitespace-pre-line">{companySettings.address}</p>}
              </div>
            </div>
            <div className="text-right w-[45%]">
              <h1 className="text-4xl font-bold mb-1" style={{ color: '#022f5c' }}>QUOTE</h1>
              <div className="text-gray-500">
                <p>Date: {formatDate(document.createdAt)}</p>
              </div>
              <ul className="mt-16 space-y-2 list-none font-semibold" style={{ color: '#022f5c', fontFamily: 'Impact, sans-serif' }}>
                <li>Home/Office Removals</li>
                <li>Local/Long Distance</li>
                <li>Full Packing Available</li>
                <li>Storage Available</li>
                <li>Fully Insured</li>
              </ul>
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
              <p>{document.createdBy || companySettings?.name || 'Derbyshire Removals'}</p>
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
