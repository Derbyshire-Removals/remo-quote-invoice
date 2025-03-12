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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [isDepositInvoice, setIsDepositInvoice] = useState(false);
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

  // Toggle payment status function
  const togglePaymentStatus = (invoice: Invoice) => {
    try {
      // Get all invoices
      const allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      // Update the payment status for the specific invoice
      const updatedInvoices = allInvoices.map((doc: Invoice) => {
        if (doc.id === invoice.id) {
          return {
            ...doc,
            paymentStatus: doc.paymentStatus === 'paid' ? 'unpaid' : 'paid'
          };
        }
        return doc;
      });
      
      // Save the updated invoices back to localStorage
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      
      // Update our local state
      if (activeDocumentType === 'invoices') {
        setDocuments(updatedInvoices);
      }
      
      toast({
        title: "Invoice updated",
        description: `Invoice marked as ${invoice.paymentStatus === 'paid' ? 'unpaid' : 'paid'}.`
      });
    } catch (error) {
      console.error("Error toggling payment status:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice payment status.",
        variant: "destructive"
      });
    }
  };

  // Generate remaining invoice function
  const handleGenerateRemainingInvoice = (invoice: Invoice) => {
    try {
      // Get all invoices
      const allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      // Create a new invoice for the remaining amount
      const newInvoice: Invoice = {
        ...invoice,
        id: Date.now(), // Generate a new ID
        linkedInvoiceId: invoice.id, // Link to the original invoice
        invoiceType: 'remaining',
        number: `${invoice.number}-R`, // Append -R to indicate it's the remaining invoice
      };
      
      // Add the new invoice to the array
      const updatedInvoices = [...allInvoices, newInvoice];
      
      // Save the updated invoices back to localStorage
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      
      // Update our local state if we're on the invoices view
      if (activeDocumentType === 'invoices') {
        setDocuments(updatedInvoices);
      }
      
      toast({
        title: "Invoice created",
        description: "Remaining invoice has been created successfully."
      });
    } catch (error) {
      console.error("Error generating remaining invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create remaining invoice.",
        variant: "destructive"
      });
    }
  };

  // New quote to invoice conversion function
  const handleConvertToInvoice = (quote: Quote) => {
    setSelectedDocument(quote);
    setShowConvertDialog(true);
    setDepositPercentage(50); // Default to 50%
    setIsDepositInvoice(false); // Default to full invoice
  };

  // Function to create invoice from quote
  const confirmConversion = () => {
    if (!selectedDocument) return;
    
    const quote = selectedDocument as Quote;
    const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
    const invoiceCounter = settings.invoiceCounter || 1000;
    const invoicePrefix = settings.invoicePrefix || "INV";
    
    // Create base invoice from quote
    const baseInvoice = {
      id: Date.now(),
      type: 'Invoice' as const,
      number: `${invoicePrefix}-${invoiceCounter}`,
      customer: quote.customerName,
      date: new Date().toISOString().split('T')[0],
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: quote.moveDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      address: quote.fromAddress,
      email: quote.email || '',
      items: quote.items,
      amount: `£${quote.total.toFixed(2)}`,
      status: 'Unpaid',
      paymentStatus: 'unpaid',
      notes: quote.planningNotes || '',
      tax: 20, // Default VAT rate
    };

    try {
      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      let newInvoices = [];
      
      // Update company settings (increment invoice counter)
      settings.invoiceCounter = invoiceCounter + 1;
      localStorage.setItem("companySettings", JSON.stringify(settings));

      if (isDepositInvoice) {
        // Calculate deposit amount
        const depositAmount = (quote.total * depositPercentage) / 100;
        const remainingAmount = quote.total - depositAmount;
        
        // Create deposit invoice
        const depositInvoice = {
          ...baseInvoice,
          items: [{
            description: `Deposit payment (${depositPercentage}%) for: ${quote.fromAddress}`,
            amount: depositAmount.toFixed(2)
          }],
          amount: `£${depositAmount.toFixed(2)}`,
          invoiceType: 'deposit' as const,
          isDepositInvoice: true,
        };
        
        // Add deposit invoice
        newInvoices = [...existingInvoices, depositInvoice];
        
        toast({
          title: "Deposit Invoice Created",
          description: `A ${depositPercentage}% deposit invoice has been created.`,
        });
      } else {
        // Add full invoice
        newInvoices = [...existingInvoices, baseInvoice];
        
        toast({
          title: "Invoice Created",
          description: "Quote has been converted to a full invoice.",
        });
      }
      
      // Save invoices
      localStorage.setItem('invoices', JSON.stringify(newInvoices));
      
      // Update quote status if needed
      const existingQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
      const updatedQuotes = existingQuotes.map((q: Quote) => {
        if (q.id === quote.id) {
          return { ...q, status: 'expired' }; // Mark as used
        }
        return q;
      });
      localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
      
      // Close dialog and reload
      setShowConvertDialog(false);
      loadDocuments();
    } catch (error) {
      console.error("Error converting quote to invoice:", error);
      toast({
        title: "Error",
        description: "Failed to convert quote to invoice.",
        variant: "destructive"
      });
    }
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

      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Quote to Invoice</DialogTitle>
            <DialogDescription>
              Create an invoice from this quote. You can either create a full invoice or a deposit invoice.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="depositInvoice"
                checked={isDepositInvoice}
                onChange={(e) => setIsDepositInvoice(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="depositInvoice">Create Deposit Invoice</Label>
            </div>
            
            {isDepositInvoice && (
              <div className="space-y-2">
                <Label htmlFor="depositPercentage">Deposit Percentage (%)</Label>
                <Input
                  id="depositPercentage"
                  type="number"
                  min="1"
                  max="100"
                  value={depositPercentage}
                  onChange={(e) => setDepositPercentage(Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  This will create an invoice for {depositPercentage}% of the total quote amount.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertDialog(false)}>Cancel</Button>
            <Button onClick={confirmConversion}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
