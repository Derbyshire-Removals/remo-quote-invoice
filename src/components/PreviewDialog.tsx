
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

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
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate HTML content for the invoice
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.type} ${document.number}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              max-width: 800px; 
              margin: 0 auto; 
            }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 30px; }
            .logo { max-width: 200px; margin-bottom: 15px; }
            .details { margin-bottom: 20px; }
            .row { display: flex; margin-bottom: 10px; }
            .label { font-weight: bold; width: 150px; }
            .amount { font-size: 1.2em; margin-top: 20px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${companySettings?.logoUrl ? `
            <div class="header">
              <img src="${companySettings.logoUrl}" alt="Company Logo" class="logo">
            </div>
          ` : ''}
          
          <div class="company-info">
            ${companySettings?.name ? `<h2>${companySettings.name}</h2>` : ''}
            ${companySettings?.address ? `<p>${companySettings.address}</p>` : ''}
            ${companySettings?.contactInfo ? `<p>${companySettings.contactInfo}</p>` : ''}
            ${companySettings?.registrationNumber ? `<p>Registration/VAT: ${companySettings.registrationNumber}</p>` : ''}
          </div>

          <div class="header">
            <h1>${document.type} ${document.number}</h1>
          </div>
          
          <div class="details">
            <div class="row">
              <span class="label">Customer:</span>
              <span>${document.customer}</span>
            </div>
            <div class="row">
              <span class="label">Date:</span>
              <span>${document.date}</span>
            </div>
            <div class="row">
              <span class="label">Status:</span>
              <span>${document.status}</span>
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

    // Write the content to the new window
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] w-full min-h-[297mm] p-8">
        <div className="bg-white w-full h-full relative">
          {companySettings?.logoUrl && (
            <div className="text-center mb-8">
              <img src={companySettings.logoUrl} alt="Company Logo" className="max-w-[200px] mx-auto" />
            </div>
          )}
          
          <div className="mb-8">
            {companySettings?.name && <h2 className="text-xl font-bold">{companySettings.name}</h2>}
            {companySettings?.address && <p>{companySettings.address}</p>}
            {companySettings?.contactInfo && <p>{companySettings.contactInfo}</p>}
            {companySettings?.registrationNumber && (
              <p>Registration/VAT: {companySettings.registrationNumber}</p>
            )}
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">{document.type} {document.number}</h1>
          </div>
          
          <div className="space-y-4">
            <div className="flex">
              <span className="font-bold w-32">Customer:</span>
              <span>{document.customer}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">Date:</span>
              <span>{document.date}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-32">Status:</span>
              <span>{document.status}</span>
            </div>
            <div className="flex text-lg mt-8">
              <span className="font-bold w-32">Amount:</span>
              <span>{document.amount}</span>
            </div>
          </div>

          <div className="absolute bottom-4 right-4">
            <Button onClick={handlePrint}>
              <Printer className="mr-2" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
