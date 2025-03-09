
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Printer, CheckIcon, Circle, SplitIcon } from "lucide-react";
import { InitialInvoiceData } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";

interface Invoice extends InitialInvoiceData {
  paymentStatus?: 'paid' | 'unpaid';
}

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onPreview: (invoice: Invoice) => void;
  onTogglePaymentStatus: (invoice: Invoice) => void;
  onGenerateRemainingInvoice?: (invoice: Invoice) => void;
}

export default function InvoiceList({ 
  invoices, 
  onEdit, 
  onDelete, 
  onPreview,
  onTogglePaymentStatus,
  onGenerateRemainingInvoice
}: InvoiceListProps) {
  const { toast } = useToast();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.number}</TableCell>
              <TableCell>{invoice.customer}</TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell>{invoice.amount}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>
                {invoice.invoiceType === 'deposit' && "Deposit (50%)"}
                {invoice.invoiceType === 'remaining' && "Remaining (50%)"}
                {invoice.invoiceType === 'full' ? "Full" : 
                 !invoice.invoiceType && invoice.isDepositInvoice ? "Deposit (50%)" : 
                 !invoice.invoiceType && !invoice.isDepositInvoice ? "Full" : ""}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost" 
                    className={`p-1 h-7 ${invoice.paymentStatus === 'paid' ? 'text-green-600' : 'text-slate-400'}`}
                    onClick={() => onTogglePaymentStatus(invoice)}
                    title={invoice.paymentStatus === 'paid' ? 'Mark as unpaid' : 'Mark as paid'}
                  >
                    {invoice.paymentStatus === 'paid' ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </Button>
                  <span className={invoice.paymentStatus === 'paid' ? 'text-green-600 font-medium' : 'text-slate-400'}>
                    {invoice.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => onPreview(invoice)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onEdit(invoice)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onDelete(invoice)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  {((invoice.isDepositInvoice || invoice.invoiceType === 'deposit') && !invoice.linkedInvoiceId) && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Generate Remaining 50% Invoice"
                      onClick={() => onGenerateRemainingInvoice && onGenerateRemainingInvoice(invoice)}
                    >
                      <SplitIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
