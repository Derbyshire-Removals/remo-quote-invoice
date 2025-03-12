
import { useState, useEffect } from "react";
import InvoiceForm from "./InvoiceForm";
import QuoteForm from "./QuoteForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { PrintableDocument, InitialInvoiceData } from "@/types/invoice";
import QuoteList from "./quotes/QuoteList";
import InvoiceList from "./invoices/InvoiceList";
import { printQuote } from "@/utils/quotePrintUtils";
import { openPrintWindow } from "@/utils/printUtils";

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

interface QuoteItem {
  description: string;
  amount: string;
}

interface Invoice extends InitialInvoiceData {
  paymentStatus?: 'paid' | 'unpaid';
}

interface DocumentListProps {
  activeDocumentType: 'quotes' | 'invoices';
  onChangeDocumentType?: (type: 'quotes' | 'invoices') => void;
}

export default function DocumentList({ activeDocumentType }: DocumentListProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Quote | Invoice | null>(null);
  const [documents, setDocuments] = useState<(Quote | Invoice)[]>([]);
  const { toast } = useToast();

  const storageKey = activeDocumentType;

  // Function to load documents from localStorage
  const loadDocuments = () => {
    const storedDocs = localStorage.getItem(storageKey);
    if (storedDocs) {
      try {
        const parsedDocs = JSON.parse(storedDocs);
        setDocuments(parsedDocs);
      } catch (e) {
        console.error(`Error parsing ${storageKey}:`, e);
        setDocuments([]);
      }
    } else {
      setDocuments([]);
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

  const handlePrint = (document: Quote | Invoice) => {
    // Get company settings
    const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
    
    if (activeDocumentType === 'quotes') {
      // Print the quote directly
      printQuote(document as Quote, toast);
    } else {
      // Print the invoice directly
      openPrintWindow({ 
        ...document as Invoice, 
        type: 'INVOICE' 
      }, settings);
    }
  };

  const handleDelete = (document: Quote | Invoice) => {
    setSelectedDocument(document);
    setShowDeleteDialog(true);
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
            onPreview={handlePrint}
          />
        ) : (
          <InvoiceList 
            invoices={documents as Invoice[]} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePrint}
            onTogglePaymentStatus={togglePaymentStatus}
            onGenerateRemainingInvoice={handleGenerateRemainingInvoice}
          />
        )
      )}
    </div>
  );
}
