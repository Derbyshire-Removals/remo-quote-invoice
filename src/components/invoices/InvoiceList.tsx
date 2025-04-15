
import { useState } from 'react';
import { Star } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { InitialInvoiceData } from '@/types/invoice';
import { Filter } from '@/components/ui/filter';

interface Invoice extends InitialInvoiceData {
  paymentStatus?: 'paid' | 'unpaid';
}

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onPreview: (invoice: Invoice) => void;
  onTogglePaymentStatus?: (invoice: Invoice) => void;
  onGenerateRemainingInvoice?: (invoice: Invoice) => void;
  onChangeInvoiceType?: (invoice: Invoice, type: 'deposit' | 'remaining' | 'full') => void;
  onToggleReviewStatus?: (invoice: Invoice) => void;
}

export default function InvoiceList({
  invoices,
  onEdit,
  onDelete,
  onPreview,
  onTogglePaymentStatus,
  onGenerateRemainingInvoice,
  onChangeInvoiceType,
  onToggleReviewStatus
}: InvoiceListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState("");

  const toggleDropdown = (invoiceId: number) => {
    setSelectedInvoice(selectedInvoice === invoiceId ? null : invoiceId);
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!filterValue) return true;
    
    const searchTerm = filterValue.toLowerCase();
    return (
      invoice.customer?.toLowerCase().includes(searchTerm) ||
      invoice.number?.toLowerCase().includes(searchTerm)
    );
  });

  const getStatusStyle = (status?: string, paymentStatus?: string) => {
    const finalStatus = paymentStatus || status;
    if (finalStatus?.toLowerCase() === 'paid') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-amber-100 text-amber-800';
  };

  const formatCurrency = (amount: string | undefined) => {
    if (!amount) return '£0.00';
    return amount.startsWith('£') ? amount : `£${amount}`;
  };

  const getInvoiceTypeText = (invoice: Invoice) => {
    if (invoice.invoiceType === 'deposit') {
      return '(Deposit)';
    } else if (invoice.invoiceType === 'remaining') {
      return '(Remaining)';
    }
    return '';
  };

  return (
    <div className="w-full">
      <div className="p-4 border-b">
        <Filter 
          value={filterValue}
          onChange={setFilterValue}
          placeholder="Filter by customer name or invoice number..."
        />
      </div>
      <Table className="border border-gray-200">
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Review</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                {invoices.length === 0 ? "No invoices found" : "No matching invoices found"}
              </TableCell>
            </TableRow>
          ) : (
            filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  {invoice.number} {getInvoiceTypeText(invoice)}
                </TableCell>
                <TableCell>{invoice.customer}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(
                      invoice.status,
                      invoice.paymentStatus
                    )}`}
                  >
                    {invoice.paymentStatus?.toUpperCase() || invoice.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost" 
                    className="p-1 h-7"
                    onClick={() => onToggleReviewStatus && onToggleReviewStatus(invoice)}
                    title={invoice.hasReview ? 'Remove review status' : 'Mark as reviewed'}
                  >
                    <Star 
                      className={`h-5 w-5 ${invoice.hasReview ? 'text-yellow-500' : 'text-slate-400'}`}
                      fill={invoice.hasReview ? "currentColor" : "none"}
                      stroke={invoice.hasReview ? "#f59e0b" : "currentColor"}
                    />
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreview(invoice)}
                      className="h-8 px-2"
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(invoice)}
                      className="h-8 px-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTogglePaymentStatus && onTogglePaymentStatus(invoice)}
                      className="h-8 px-2"
                    >
                      {invoice.paymentStatus === 'paid' || invoice.status?.toLowerCase() === 'paid'
                        ? 'Mark Unpaid'
                        : 'Mark Paid'}
                    </Button>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDropdown(invoice.id as number)}
                        className="h-8 px-2"
                      >
                        More
                      </Button>
                      {selectedInvoice === invoice.id && (
                        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-40">
                          {invoice.invoiceType === 'deposit' && (
                            <button
                              onClick={() => onGenerateRemainingInvoice && onGenerateRemainingInvoice(invoice)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                              Create Remaining
                            </button>
                          )}
                          <button
                            onClick={() =>
                              onChangeInvoiceType &&
                              onChangeInvoiceType(
                                invoice,
                                invoice.invoiceType === 'deposit' ? 'full' : 'deposit'
                              )
                            }
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          >
                            {invoice.invoiceType === 'deposit' ? 'Mark as Full' : 'Mark as Deposit'}
                          </button>
                          <button
                            onClick={() => onDelete(invoice)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
