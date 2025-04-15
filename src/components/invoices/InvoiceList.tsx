import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Printer, CheckIcon, Circle, SplitIcon, Star } from "lucide-react";
import { InitialInvoiceData } from "@/types/invoice";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Filter } from "@/components/ui/filter";

interface Invoice extends InitialInvoiceData {
  paymentStatus?: 'paid' | 'unpaid';
}

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onPreview: (invoice: Invoice) => void;
  onTogglePaymentStatus: (invoice: Invoice) => void;
  onToggleReviewStatus?: (invoice: Invoice) => void;
  onGenerateRemainingInvoice?: (invoice: Invoice) => void;
  onChangeInvoiceType?: (invoice: Invoice, type: 'deposit' | 'remaining' | 'full') => void;
  onShowCustomersWithoutReviews?: () => void;
}

export default function InvoiceList({
  invoices,
  onEdit,
  onDelete,
  onPreview,
  onTogglePaymentStatus,
  onToggleReviewStatus,
  onGenerateRemainingInvoice,
  onChangeInvoiceType,
  onShowCustomersWithoutReviews
}: InvoiceListProps) {
  const [_, setHoveredRow] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState("");

  const filteredInvoices = invoices.filter(invoice => {
    if (!filterValue) return true;

    const searchTerm = filterValue.toLowerCase();
    return (
      invoice.customer.toLowerCase().includes(searchTerm) ||
      (invoice.address && invoice.address.toLowerCase().includes(searchTerm))
    );
  });

  const getInvoiceTypeDisplay = (invoice: Invoice) => {
    if (invoice.invoiceType === 'deposit') return "Deposit (50%)";
    if (invoice.invoiceType === 'remaining') return "Remaining (50%)";
    if (invoice.invoiceType === 'full') return "Full";
    if (!invoice.invoiceType && invoice.isDepositInvoice) return "Deposit (50%)";
    if (!invoice.invoiceType && !invoice.isDepositInvoice) return "Full";
    return "Unknown";
  };

  return (
    <div className="rounded-md border">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <div className="flex-grow">
          <Filter
            value={filterValue}
            onChange={setFilterValue}
            placeholder="Filter by customer name or address..."
          />
        </div>
        {onShowCustomersWithoutReviews && (
          <Button
            variant="outline"
            onClick={onShowCustomersWithoutReviews}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Star className="h-4 w-4 text-yellow-500" />
            Show Customers Needing Reviews
          </Button>
        )}
      </div>

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
            <TableHead>Review</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                {invoices.length === 0 ? "No invoices found" : "No matching invoices found"}
              </TableCell>
            </TableRow>
          ) : (
            filteredInvoices.map((invoice, index) => (
              <TableRow
                key={invoice.id}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <TableCell>{invoice.number}</TableCell>
                <TableCell>{invoice.customer}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.amount}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>
                  {onChangeInvoiceType ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-full justify-start font-normal">
                          {getInvoiceTypeDisplay(invoice)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => onChangeInvoiceType(invoice, 'full')}>
                          Full
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onChangeInvoiceType(invoice, 'deposit')}>
                          Deposit (50%)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onChangeInvoiceType(invoice, 'remaining')}>
                          Remaining (50%)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    getInvoiceTypeDisplay(invoice)
                  )}
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className={`p-1 h-7 ${invoice.reviewed ? 'text-yellow-500' : 'text-slate-400'}`}
                      onClick={() => onToggleReviewStatus && onToggleReviewStatus(invoice)}
                      title={invoice.reviewed ? 'Remove review' : 'Mark as reviewed'}
                    >
                      <Star className={`h-5 w-5 ${invoice.reviewed ? 'fill-yellow-500' : ''}`} />
                    </Button>
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
                    {((invoice.invoiceType === 'deposit' || (!invoice.invoiceType && invoice.isDepositInvoice)) && !invoice.linkedInvoiceId) && (
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
