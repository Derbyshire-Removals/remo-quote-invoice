
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { printQuote } from "@/utils/quotePrintUtils";
import { useToast } from "@/hooks/use-toast";

interface QuoteItem {
  description: string;
  amount: string;
}

interface Quote {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  moveDate?: string;
  fromAddress: string;
  items: QuoteItem[];
  message: string;
  planningNotes?: string;
  total: number;
  createdAt: string;
  createdBy: string;
  status?: 'open' | 'invoiced' | 'lost' | 'expired';
}

export interface QuotePreviewDialogProps {
  open: boolean;
  document: Quote;
  onClose: () => void;
}

export default function QuotePreviewDialog({
  open,
  document,
  onClose
}: QuotePreviewDialogProps) {
  const { toast } = useToast();

  const handlePrint = () => {
    printQuote(document, toast);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] w-full max-h-[85vh] p-8 bg-white overflow-y-auto">
        <div className="w-full relative rounded-lg p-8">
          <div className="flex justify-end mb-6">
            <Button onClick={handlePrint} className="bg-gray-900 hover:bg-gray-800">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="font-bold text-gray-900">{document.customerName}</p>
              <p className="whitespace-pre-line text-gray-600">{document.fromAddress}</p>
            </div>
            
            <div className="text-right">
              <h1 className="text-4xl font-bold text-gray-500 mb-1 uppercase">QUOTE</h1>
              <div className="space-y-1 mt-4">
                <p className="text-sm text-gray-500">Date: {document.createdAt}</p>
                {document.moveDate && (
                  <p className="text-sm text-gray-500">Moving Date: {document.moveDate}</p>
                )}
              </div>
            </div>
          </div>

          <div className="my-8">
            <p className="mb-4">Dear {document.customerName},</p>
            <p className="whitespace-pre-line mb-4">{document.message}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse mb-8">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3">Description</th>
                  <th className="text-right py-3 w-32">Amount</th>
                </tr>
              </thead>
              <tbody>
                {document.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3">{item.description}</td>
                    <td className="text-right py-3">£{parseFloat(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="text-right pt-4 font-semibold">Total:</td>
                  <td className="text-right pt-4 font-semibold">£{document.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {document.planningNotes && (
            <div className="my-8">
              <h3 className="font-semibold mb-2">Planning Notes:</h3>
              <p className="whitespace-pre-line">{document.planningNotes}</p>
            </div>
          )}

          <div className="mt-12">
            <p>If you have any questions or would like to proceed with this quote, please let us know.</p>
            <p className="mt-4">Kind regards,</p>
            <p className="mt-2 font-semibold">{document.createdBy || 'Derbyshire Removals'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
