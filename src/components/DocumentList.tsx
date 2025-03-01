
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, CalendarIcon, FileText, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import InvoiceForm from "./InvoiceForm";
import PreviewDialog from "./PreviewDialog";
import QuotePreviewDialog from "./QuotePreviewDialog";
import QuoteForm from "./QuoteForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format, isValid, parseISO } from "date-fns";

interface QuoteItem {
  description: string;
  amount: string;
}

interface Quote {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  moveDate: string;
  fromAddress: string;
  destinationAddress?: string;
  items: QuoteItem[];
  message: string;
  total: number;
  createdAt: string;
  createdBy: string;
  planningNotes?: string;
}

interface Invoice {
  id: number;
  number: string;
  customer: string;
  date: string;
  amount: string;
  status: string;
}

interface DocumentListProps {
  activeDocumentType: 'quotes' | 'invoices';
}

export default function DocumentList({ activeDocumentType }: DocumentListProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Quote | Invoice | null>(null);
  const [documents, setDocuments] = useState<(Quote | Invoice)[]>([]);
  const { toast } = useToast();

  const storageKey = activeDocumentType;

  // Function to load documents from localStorage
  const loadDocuments = () => {
    const storedDocs = localStorage.getItem(storageKey);
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs));
    } else {
      setDocuments([]); // Initialize with empty array if no documents exist
    }
  };

  useEffect(() => {
    // Initial load
    loadDocuments();

    // Subscribe to storage changes from other windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadDocuments();
      }
    };

    // Set up an interval to check for changes every second
    const interval = setInterval(loadDocuments, 1000);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [storageKey]);

  const confirmDelete = () => {
    if (selectedDocument) {
      const updatedDocs = documents.filter(doc => doc.id !== selectedDocument.id);
      localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
      setShowDeleteDialog(false);
      toast({
        title: "Document deleted",
        description: `${activeDocumentType === 'quotes' ? 'Quote' : 'Invoice'} has been deleted.`
      });
    }
  };

  const handleEdit = (document: Quote | Invoice) => {
    setSelectedDocument(document);
    setShowEditForm(true);
  };

  const handlePreview = (document: Quote | Invoice) => {
    setSelectedDocument(document);
    setShowPreviewDialog(true);
  };

  const handleDelete = (document: Quote | Invoice) => {
    setSelectedDocument(document);
    setShowDeleteDialog(true);
  };

  const handleConvertToInvoice = (quote: Quote) => {
    setSelectedDocument(quote);
    setShowInvoiceForm(true);
  };

  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const formatDate = (dateString: string) => {
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

  const renderQuoteColumns = () => (
    <TableRow>
      <TableHead>Customer</TableHead>
      <TableHead>Moving Date</TableHead>
      <TableHead>From Address</TableHead>
      <TableHead>Destination</TableHead>
      <TableHead>Total</TableHead>
      <TableHead>Created</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  );

  const renderInvoiceColumns = () => (
    <TableRow>
      <TableHead>Number</TableHead>
      <TableHead>Customer</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  );

  const renderQuoteRow = (doc: Quote) => (
    <TableRow key={doc.id}>
      <TableCell>{doc.customerName}</TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {formatDate(doc.moveDate)}
        </div>
      </TableCell>
      <TableCell 
        className="max-w-[180px] truncate cursor-pointer hover:text-primary hover:underline" 
        title="Click to open in Google Maps"
        onClick={() => openGoogleMaps(doc.fromAddress)}
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {doc.fromAddress}
        </div>
      </TableCell>
      <TableCell 
        className={`max-w-[180px] truncate ${doc.destinationAddress ? 'cursor-pointer hover:text-primary hover:underline' : ''}`}
        title={doc.destinationAddress ? "Click to open in Google Maps" : "No destination address"}
        onClick={() => doc.destinationAddress && openGoogleMaps(doc.destinationAddress)}
      >
        {doc.destinationAddress ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {doc.destinationAddress}
          </div>
        ) : (
          <span className="text-muted-foreground italic">None</span>
        )}
      </TableCell>
      <TableCell>£{(doc.total ?? 0).toFixed(2)}</TableCell>
      <TableCell>{formatDate(doc.createdAt)}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => handlePreview(doc)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleEdit(doc)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleDelete(doc)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleConvertToInvoice(doc)}>
            <FileText className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const renderInvoiceRow = (doc: Invoice) => (
    <TableRow key={doc.id}>
      <TableCell>{doc.number}</TableCell>
      <TableCell>{doc.customer}</TableCell>
      <TableCell>{doc.date}</TableCell>
      <TableCell>{doc.amount}</TableCell>
      <TableCell>{doc.status}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => handlePreview(doc)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleEdit(doc)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleDelete(doc)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {activeDocumentType === 'quotes' ? renderQuoteColumns() : renderInvoiceColumns()}
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            activeDocumentType === 'quotes' 
              ? renderQuoteRow(doc as Quote)
              : renderInvoiceRow(doc as Invoice)
          ))}
        </TableBody>
      </Table>

      {showEditForm && selectedDocument && activeDocumentType === 'quotes' && (
        <QuoteForm 
          onClose={() => setShowEditForm(false)}
          initialData={selectedDocument as Quote}
        />
      )}

      {showEditForm && selectedDocument && activeDocumentType === 'invoices' && (
        <InvoiceForm 
          onClose={() => setShowEditForm(false)}
          initialData={selectedDocument as Invoice}
        />
      )}

      {showInvoiceForm && selectedDocument && (
        <InvoiceForm 
          onClose={() => setShowInvoiceForm(false)}
          convertFromQuote={selectedDocument as Quote}
        />
      )}

      {showPreviewDialog && selectedDocument && activeDocumentType === 'invoices' && (
        <PreviewDialog
          open={showPreviewDialog}
          onClose={() => setShowPreviewDialog(false)}
          document={selectedDocument}
          companySettings={JSON.parse(localStorage.getItem("companySettings") || "{}")}
        />
      )}

      {showPreviewDialog && selectedDocument && activeDocumentType === 'quotes' && (
        <QuotePreviewDialog
          open={showPreviewDialog}
          onClose={() => setShowPreviewDialog(false)}
          document={selectedDocument}
          companySettings={JSON.parse(localStorage.getItem("companySettings") || "{}")}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {activeDocumentType === 'quotes' ? 'quote' : 'invoice'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
