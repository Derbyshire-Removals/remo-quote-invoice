import { Button } from "@/components/ui/button";
import { Edit, Trash2, CalendarIcon, MapPin, Clock, XCircle, AlertCircle, Printer, Mail, FileText, ChevronDown, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// No longer need useToast import
import { useState } from "react";
import { Filter } from "@/components/ui/filter";
import { MonthlyGroupedList } from "@/components/ui/monthly-grouped-list";
import { formatDate as formatDateUtil } from "@/utils/dateUtils";

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
  status?: 'open' | 'lost' | 'expired';
}

interface QuoteListProps {
  quotes: Quote[];
  onEdit: (quote: Quote) => void;
  onDelete: (quote: Quote) => void;
  onPreview: (quote: Quote) => void;
  onConvertToInvoice: (quote: Quote) => void;
}

export default function QuoteList({
  quotes,
  onEdit,
  onDelete,
  onPreview,
  onConvertToInvoice
}: QuoteListProps) {
  // No toast instance needed here
  const [filterValue, setFilterValue] = useState("");

  const filteredQuotes = quotes.filter(quote => {
    if (!filterValue) return true;

    const searchTerm = filterValue.toLowerCase();
    return (
      quote.customerName.toLowerCase().includes(searchTerm) ||
      quote.fromAddress.toLowerCase().includes(searchTerm)
    );
  });

  const formatDate = formatDateUtil;

  const getStatusBadge = (status?: 'open' | 'lost' | 'expired') => {
    switch (status) {
      case 'lost':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" /> Lost</Badge>;
      case 'expired':
        return <Badge className="bg-amber-500 hover:bg-amber-600"><AlertCircle className="h-3 w-3 mr-1" /> Expired</Badge>;
      case 'open':
      default:
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="h-3 w-3 mr-1" /> Open</Badge>;
    }
  };

  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handlePrintQuote = (quote: Quote) => {
    onPreview(quote);
  };

  const handleExportToCSV = () => {
    const csvData = [
      ['Date', 'Customer Name', 'Address', 'Email', 'Phone', 'Move Date', 'Total', 'Status', 'Notes'],
      ...filteredQuotes.map(quote => [
        formatDate(quote.createdAt),
        quote.customerName,
        quote.fromAddress,
        quote.email || '',
        quote.phone || '',
        formatDate(quote.moveDate),
        `£${quote.total.toFixed(2)}`,
        quote.status || 'open',
        quote.message || ''
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`)
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotes-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        <Button
          variant="outline"
          onClick={handleExportToCSV}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <MonthlyGroupedList
        items={filteredQuotes}
        dateField="createdAt"
        emptyMessage={quotes.length === 0 ? "No quotes found" : "No matching quotes found"}
        renderHeader={(month, count) => (
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium">{month}</span>
              <Badge variant="outline">{count}</Badge>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          </div>
        )}
        renderItem={(quote) => (
          <div className="border rounded-md p-4 mb-2 bg-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div>
                <h3 className="text-lg font-medium">{quote.customerName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {quote.email ? (
                    <a
                      href={`mailto:${quote.email}`}
                      className="flex items-center hover:text-primary hover:underline"
                      title={quote.email}
                    >
                      <Mail className="h-3 w-3 mr-1 text-primary" />
                      <span className="truncate">{quote.email}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">No email</span>
                  )}
                  {quote.phone && (
                    <span className="hidden md:inline">• {quote.phone}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(quote.status)}
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConvertToInvoice(quote)}
                    title="Convert to Invoice"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Invoice
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handlePrintQuote(quote)} title="Print Quote">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onEdit(quote)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onDelete(quote)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Move Date</div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(quote.moveDate)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">From Address</div>
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-primary hover:underline"
                  title="Click to open in Google Maps"
                  onClick={() => openGoogleMaps(quote.fromAddress)}
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="truncate">{quote.fromAddress}</span>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Total</div>
                <div className="font-medium">£{(quote.total ?? 0).toFixed(2)}</div>
              </div>
            </div>

            {quote.message && (
              <div className="mt-4 text-sm">
                <div className="text-muted-foreground mb-1">Message</div>
                <div className="bg-muted p-2 rounded-md">{quote.message}</div>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}
