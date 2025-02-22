
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
    companyNumber?: string;
  };
}

export default function PreviewDialog({
  open,
  onClose,
  document,
  companySettings
}: PreviewDialogProps) {
  const calculateSubtotal = (items: any[] = []) => {
    return items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handlePrint = () => {
    const printContent = document.querySelector('.print-content');
    const printWindow = window.open('', '', 'width=800,height=600');
    
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print ${document.type} #${document.number}</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 30mm 20mm;
                font-family: system-ui, -apple-system, sans-serif;
              }
              .print-content {
                max-width: 100%;
                width: 100%;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th {
                background-color: #022f5c;
                color: white;
                height: 2rem;
                padding: 0.5rem;
                text-align: left;
                border-right: 1px solid #ffffff33;
              }
              th:last-child {
                border-right: none;
              }
              td {
                padding: 0.5rem;
                border-bottom: 1px solid #e2e8f0;
              }
              .amount-col {
                text-align: right;
                width: 150px;
              }
              .totals {
                margin-top: 3rem;
                text-align: right;
              }
              .notes {
                margin-top: 3rem;
              }
              .pre-line {
                white-space: pre-line;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] w-full max-h-[85vh] p-8 bg-white overflow-y-auto">
        <Button 
          variant="outline" 
          className="absolute right-14 top-4"
          onClick={handlePrint}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        
        <div className="print-content w-full relative rounded-lg p-8">
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

          <div className="mt-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px] text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {document.items?.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right">£{parseFloat(item.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-12 flex flex-col items-end space-y-2">
              <div className="flex gap-8">
                <span className="text-gray-500">Subtotal:</span>
                <span className="w-[150px] text-right">£{calculateSubtotal(document.items).toFixed(2)}</span>
              </div>
              <div className="flex gap-8">
                <span className="text-gray-500">VAT (20%):</span>
                <span className="w-[150px] text-right">£{(calculateSubtotal(document.items) * 0.2).toFixed(2)}</span>
              </div>
              <div className="flex gap-8 font-semibold">
                <span className="text-gray-500">Total:</span>
                <span className="w-[150px] text-right">£{(calculateSubtotal(document.items) * 1.2).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <div>
                <p className="text-[#64748b]">Notes:</p>
                <p className="mt-2 text-gray-900 whitespace-pre-line">{document.notes || 'No notes provided'}</p>
              </div>
              <div>
                <p className="text-[#64748b]">Terms:</p>
                <p className="mt-2 text-gray-900 whitespace-pre-line">{document.terms || 'No terms provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}
