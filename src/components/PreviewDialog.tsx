import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import html2canvas from 'html2canvas';
import { FileDown, Printer, Download } from "lucide-react";
import { useRef } from "react";

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
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Method 1: Print to PDF using browser's print API
  const handlePrint = () => {
    window.print();
  };

  // Method 2: HTML2Canvas and Blob
  const handleCanvasExport = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/png');
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${document.type}_${document.number}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Method 3: Optimized Print to PDF
  const handleOptimizedPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !contentRef.current) return;

    const content = contentRef.current.innerHTML;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.type}_${document.number}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 2cm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] w-full max-h-[85vh] p-8 bg-white overflow-y-auto">
        <div className="flex gap-2 mb-4">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print to PDF
          </Button>
          <Button onClick={handleCanvasExport} variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export as Image
          </Button>
          <Button onClick={handleOptimizedPrint} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Optimized PDF
          </Button>
        </div>

        <div ref={contentRef} className="w-full relative rounded-lg p-8">
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
