
import { useState, useEffect } from "react";
import InvoiceForm from "./InvoiceForm";
import PreviewDialog from "./PreviewDialog";
import QuotePreviewDialog from "./QuotePreviewDialog";
import QuoteForm from "./QuoteForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { PrintableDocument, InitialInvoiceData } from "@/types/invoice";
import QuoteList from "./quotes/QuoteList";
import InvoiceList from "./invoices/InvoiceList";
import { printQuote } from "@/utils/quotePrintUtils";

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

interface Invoice extends InitialInvoiceData {
  paymentStatus?: 'paid' | 'unpaid';
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

  const togglePaymentStatus = (invoice: Invoice) => {
    const newStatus = invoice.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    
    // Get all invoices
    const allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    // Update the status of the specific invoice
    const updatedInvoices = allInvoices.map((inv: Invoice) => 
      inv.id === invoice.id ? { ...inv, paymentStatus: newStatus } : inv
    );
    
    // Save back to localStorage
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    
    // Refresh the documents list
    loadDocuments();
    
    // Show confirmation toast
    toast({
      title: `Invoice marked as ${newStatus}`,
      description: `Invoice #${invoice.number} for ${invoice.customer} has been marked as ${newStatus}.`
    });
  };

  return (
    <div className="container mx-auto py-10">
      {showEditForm && (
        activeDocumentType === 'quotes' ? (
          <QuoteForm
            initialData={selectedDocument as Quote}
            onClose={() => {
              setShowEditForm(false);
              setSelectedDocument(null);
            }}
          />
        ) : (
          <InvoiceForm
            initialData={selectedDocument as InitialInvoiceData}
            onClose={() => {
              setShowEditForm(false);
              setSelectedDocument(null);
            }}
          />
        )
      )}

      {showPreviewDialog && selectedDocument && (
        activeDocumentType === 'quotes' ? (
          <QuotePreviewDialog
            open={showPreviewDialog}
            document={selectedDocument as Quote}
            onClose={() => {
              setShowPreviewDialog(false);
            }}
          />
        ) : (
          <PreviewDialog
            open={showPreviewDialog}
            document={{ 
              ...selectedDocument as Invoice, 
              type: 'INVOICE' 
            }}
            onClose={() => {
              setShowPreviewDialog(false);
            }}
          />
        )
      )}

      {showInvoiceForm && selectedDocument && (
        <InvoiceForm
          initialData={{} as InitialInvoiceData}
          quoteData={selectedDocument as Quote}
          onClose={() => {
            setShowInvoiceForm(false);
            setSelectedDocument(null);
          }}
          onSuccess={() => {
            // Update the quote status to 'invoiced'
            const quote = selectedDocument as Quote;
            const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
            const updatedQuotes = quotes.map((q: Quote) => 
              q.id === quote.id ? { ...q, status: 'invoiced' } : q
            );
            localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
            loadDocuments();
          }}
        />
      )}
      
      <AlertDialog open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {activeDocumentType === 'quotes' ? 'quote' : 'invoice'} from our database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {documents.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No {activeDocumentType} found.</p>
        </div>
      ) : (
        activeDocumentType === 'quotes' ? (
          <QuoteList 
            quotes={documents as Quote[]} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onConvertToInvoice={handleConvertToInvoice}
          />
        ) : (
          <InvoiceList 
            invoices={documents as Invoice[]} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onTogglePaymentStatus={togglePaymentStatus}
          />
        )
      )}
    </div>
  );
}
