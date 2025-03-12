
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CalendarIcon, MapPin, CheckCircle, Clock, XCircle, AlertCircle, Printer, Mail, FileInvoice } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
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
  const { toast } = useToast();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Invalid date';
      }
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Moving Date</TableHead>
            <TableHead>From Address</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote.id}>
              <TableCell>{quote.customerName}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {quote.email ? (
                  <a 
                    href={`mailto:${quote.email}`}
                    className="flex items-center hover:text-primary hover:underline group"
                    title={quote.email}
                  >
                    <Mail className="h-4 w-4 mr-1 text-primary" />
                    <span className="truncate">{quote.email}</span>
                  </a>
                ) : (
                  <span className="text-gray-400 italic">No email</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(quote.moveDate)}
                </div>
              </TableCell>
              <TableCell 
                className="max-w-[150px] truncate cursor-pointer hover:text-primary hover:underline" 
                title="Click to open in Google Maps"
                onClick={() => openGoogleMaps(quote.fromAddress)}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {quote.fromAddress}
                </div>
              </TableCell>
              <TableCell>£{(quote.total ?? 0).toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(quote.status)}</TableCell>
              <TableCell>{formatDate(quote.createdAt)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handlePrintQuote(quote)} title="Print Quote">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onConvertToInvoice(quote)} 
                    title="Convert to Invoice"
                  >
                    <FileInvoice className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onEdit(quote)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onDelete(quote)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
