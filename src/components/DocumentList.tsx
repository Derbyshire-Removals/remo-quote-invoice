
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Quote | Invoice | null>(null);
  const [documents, setDocuments] = useState<(Quote | Invoice)[]>([]);
  const { toast } = useToast();

  const storageKey = activeDocumentType;

  // Function to load documents from localStorage
  const loadDocuments = () => {
    console.log(`Loading ${storageKey} from localStorage`);
    const storedDocs = localStorage.getItem(storageKey);
    if (storedDocs) {
      try {
        const parsedDocs = JSON.parse(storedDocs);
        console.log(`Loaded ${parsedDocs.length} ${storageKey}:`, parsedDocs);
        setDocuments(parsedDocs);
      } catch (e) {
        console.error(`Error parsing ${storageKey}:`, e);
        setDocuments([]);
      }
    } else {
      console.log(`No ${storageKey} found in localStorage`);
      setDocuments([]); // Initialize with empty array if no documents exist
    }
  };

  useEffect(() => {
    // Initial load
    loadDocuments();

    // Subscribe to storage changes from other windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        console.log(`Storage event detected for ${storageKey}`);
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

  const handleConvertToInvoice = (quote: Quote) => {
    setSelectedDocument(quote);
    setShowInvoiceForm(true);
  };

  const handleGenerateRemainingInvoice = (invoice: Invoice) => {
    // Let's create a function to generate the remaining 50% invoice
    const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
    const nextInvoiceNumber = `${settings.invoicePrefix || "INV"}-${settings.invoiceCounter || 1000}`;
    
    // Get original invoice details
    const originalItems = invoice.items || [];
    
    // Create new items with "Remaining 50%" prefix
    const remainingItems = originalItems.map(item => {
      // Calculate original amount before 50% was applied
      const originalAmount = parseFloat(item.amount) * 2;
      
      // Create the remaining 50% item
      return {
        description: item.description.startsWith('50% Deposit:') 
          ? `Remaining 50%: ${item.description.replace('50% Deposit:', '').trim()}`
          : `Remaining 50%: ${item.description}`,
        amount: (originalAmount * 0.5).toString() // Remaining 50%
      };
    });
    
    // Generate a new invoice
    const currentDate = new Date().toISOString().split('T')[0];
    
    const newInvoice = {
      id: Date.now(),
      type: 'Invoice' as const,
      number: nextInvoiceNumber,
      customer: invoice.customer,
      date: currentDate,
      amount: invoice.amount, // The amount should be the same as the deposit
      status: 'Unpaid',
      email: invoice.email,
      address: invoice.address,
      tax: invoice.tax,
      invoiceDate: currentDate,
      dueDate: "", // Set appropriate due date
      items: remainingItems,
      notes: invoice.notes,
      terms: invoice.terms,
      invoiceType: 'remaining',
      linkedInvoiceId: invoice.id,
      convertedFromQuote: invoice.convertedFromQuote,
      paymentStatus: 'unpaid'
    };
    
    // Update the original invoice to mark that it has a linked invoice
    const allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    // Mark the original invoice as linked
    const updatedInvoices = allInvoices.map((inv: Invoice) => 
      inv.id === invoice.id ? 
        { ...inv, linkedInvoiceId: newInvoice.id, invoiceType: inv.invoiceType || 'deposit' } : 
        inv
    );
    
    // Add the new invoice
    updatedInvoices.push(newInvoice);
    
    // Save back to localStorage
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    
    // Increment the counter
    settings.invoiceCounter = (settings.invoiceCounter || 1000) + 1;
    localStorage.setItem("companySettings", JSON.stringify(settings));
    
    // Refresh the documents list
    loadDocuments();
    
    // Show success message
    toast({
      title: "Remaining invoice generated",
      description: `Remaining 50% invoice #${nextInvoiceNumber} has been generated.`
    });
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

      {showInvoiceForm && selectedDocument && (
        <InvoiceForm
          initialData={{} as InitialInvoiceData}
          convertFromQuote={selectedDocument as Quote}
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
            onPreview={handlePrint}
            onConvertToInvoice={handleConvertToInvoice}
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
