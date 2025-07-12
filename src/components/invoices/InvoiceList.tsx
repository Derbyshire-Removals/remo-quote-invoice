import { Button } from "@/components/ui/button";
import { Edit, Trash2, Printer, CheckIcon, Circle, SplitIcon, Star, BellRing, ChevronDown, Calendar, FilterX } from "lucide-react";
import { InitialInvoiceData, ReviewChaseRecord } from "@/types/invoice";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Filter } from "@/components/ui/filter";
import { MonthlyGroupedList } from "@/components/ui/monthly-grouped-list";
import { formatDate as formatDateUtil } from "@/utils/dateUtils";
import { Badge } from "@/components/ui/badge";

interface Invoice extends InitialInvoiceData {
  paymentStatus?: 'paid' | 'unpaid';
  reviewChaseHistory?: ReviewChaseRecord[];
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
  // No longer need hover state with card-based layout
  const [filterValue, setFilterValue] = useState("");
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);

  const filteredInvoices = invoices.filter(invoice => {
    // First apply payment status filter
    if (showUnpaidOnly && invoice.paymentStatus === 'paid') {
      return false;
    }

    // Then apply text search filter
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

  const getChaseStatusColor = (chaseHistory: ReviewChaseRecord[]) => {
    // Check if any record has status 'received'
    if (chaseHistory.some(record => record.status === 'received')) {
      return 'text-green-500';
    }

    // Check if any record has status 'wont_chase'
    if (chaseHistory.some(record => record.status === 'wont_chase')) {
      return 'text-orange-500';
    }

    // Default color for pending or no status
    return 'text-blue-500';
  };

  const getChaseTooltip = (chaseHistory: ReviewChaseRecord[]) => {
    // Get the most recent record
    const latestRecord = chaseHistory[chaseHistory.length - 1];

    // Base tooltip text
    let tooltip = `Chased ${chaseHistory.length} ${chaseHistory.length === 1 ? 'time' : 'times'} - Last: ${new Date(latestRecord.date).toLocaleDateString()} via ${latestRecord.method}`;

    // Add status information if available
    if (chaseHistory.some(record => record.status === 'received')) {
      tooltip += ' - Review received';
    } else if (chaseHistory.some(record => record.status === 'wont_chase')) {
      tooltip += " - Won't chase anymore";
    }

    return tooltip;
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
        <div className="flex items-center gap-2">
          <Button
            variant={showUnpaidOnly ? "default" : "outline"}
            onClick={() => setShowUnpaidOnly(!showUnpaidOnly)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {showUnpaidOnly ? <FilterX className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            {showUnpaidOnly ? "Show All" : "Unpaid Only"}
          </Button>
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
      </div>

      <MonthlyGroupedList
        items={filteredInvoices}
        dateField="date"
        emptyMessage={invoices.length === 0 ? "No invoices found" : "No matching invoices found"}
        renderHeader={(month, count) => (
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium">{month}</span>
              <Badge variant="outline">{count}</Badge>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          </div>
        )}
        renderItem={(invoice) => (
          <div className="border rounded-md p-4 mb-2 bg-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{invoice.customer}</h3>
                  <span className="text-sm text-muted-foreground">({invoice.number})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateUtil(invoice.date)}
                  </div>
                  {invoice.email && (
                    <span className="hidden md:inline">• {invoice.email}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                <div className="flex space-x-1">
                  <Button variant="outline" size="icon" onClick={() => onPreview(invoice)} title="Print Invoice">
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Amount</div>
                <div className="font-medium">{invoice.amount}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Status</div>
                <div>{invoice.status}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Type</div>
                {onChangeInvoiceType ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-full justify-start font-normal p-0">
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
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Review</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className={`p-1 h-7 ${invoice.reviewed ? 'text-yellow-500' : 'text-slate-400'}`}
                    onClick={() => onToggleReviewStatus && onToggleReviewStatus(invoice)}
                    title={invoice.reviewed ? 'Remove review' : 'Mark as reviewed'}
                  >
                    <Star className={`h-5 w-5 ${invoice.reviewed ? 'fill-yellow-500' : ''}`} />
                  </Button>
                  {invoice.reviewChaseHistory && invoice.reviewChaseHistory.length > 0 && (
                    <div
                      className={`flex items-center ${getChaseStatusColor(invoice.reviewChaseHistory)}`}
                      title={getChaseTooltip(invoice.reviewChaseHistory)}
                    >
                      <BellRing className="h-4 w-4" />
                      <span className="text-xs ml-1">{invoice.reviewChaseHistory.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {invoice.address && (
              <div className="mt-4 text-sm">
                <div className="text-muted-foreground mb-1">Address</div>
                <div className="bg-muted p-2 rounded-md">{invoice.address}</div>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}
