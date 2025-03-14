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

export default function DocumentList({ activeDocumentType, onChangeDocumentType }: DocumentListProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Quote | Invoice | null>(null);
  const [documents, setDocuments] = useState<(Quote | Invoice)[]>([]);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [isDepositInvoice, setIsDepositInvoice] = useState(false);
  const { toast } = useToast();

  const storageKey = activeDocumentType;

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
    loadDocuments();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadDocuments();
      }
    };

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
    const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
    
    if (activeDocumentType === 'quotes') {
      printQuote(document as Quote, toast);
    } else {
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

  const togglePaymentStatus = (invoice: Invoice) => {
    try {
      const allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      const updatedInvoices = allInvoices.map((doc: Invoice) => {
        if (doc.id === invoice.id) {
          return {
            ...doc,
            paymentStatus: doc.paymentStatus === 'paid' ? 'unpaid' : 'paid'
          };
        }
        return doc;
      });
      
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      
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

  const handleGenerateRemainingInvoice = (invoice: Invoice) => {
    try {
      const allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      const newInvoice: Invoice = {
        ...invoice,
        id: Date.now(),
        linkedInvoiceId: invoice.id,
        invoiceType: 'remaining',
        number: `${invoice.number}-R`,
      };
      
      const updatedInvoices = [...allInvoices, newInvoice];
      
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      
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

  const handleConvertToInvoice = (quote: Quote) => {
    setSelectedDocument(quote);
    setShowConvertDialog(true);
    setDepositPercentage(50);
    setIsDepositInvoice(false);
  };

  const confirmConversion = () => {
    if (!selectedDocument) return;
    
    const quote = selectedDocument as Quote;
    const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
    const invoiceCounter = settings.invoiceCounter || 1000;
    const invoicePrefix = settings.invoicePrefix || "INV";
    
    // Create a deep copy of quote items
    const quoteItems = [...quote.items];
    
    // Append the quote message to the first item's description if items exist
    if (quoteItems.length > 0 && quote.message) {
      quoteItems[0] = {
        ...quoteItems[0],
        description: `${quoteItems[0].description}\n\nQuote Message: ${quote.message}`
      };
    }
    
    // Get the first terms template if available
    const firstTemplate = settings.termsTemplates?.[0];
    
    const baseInvoice = {
      id: Date.now(),
      type: 'Invoice' as const,
      number: `${invoicePrefix}-${invoiceCounter}`,
      customer: quote.customerName,
      date: new Date().toISOString().split('T')[0],
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      address: quote.fromAddress,
      email: quote.email || '',
      items: quoteItems.map(item => ({
        description: item.description,
        amount: item.amount
      })),
      amount: `£${quote.total.toFixed(2)}`,
      status: 'Unpaid',
      paymentStatus: 'unpaid',
      notes: settings.defaultNotes || '',
      tax: 20,
      terms: firstTemplate?.content || '',
      selectedTermsTemplate: firstTemplate?.name || 'custom'
    };

    try {
      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      let newInvoices = [];
      
      settings.invoiceCounter = invoiceCounter + 1;
      localStorage.setItem("companySettings", JSON.stringify(settings));

      if (isDepositInvoice) {
        const depositAmount = (quote.total * depositPercentage) / 100;
        
        const depositInvoice = {
          ...baseInvoice,
          items: quoteItems.map(item => ({
            description: item.description,
            amount: ((parseFloat(item.amount) * depositPercentage) / 100).toFixed(2)
          })),
          amount: `£${depositAmount.toFixed(2)}`,
          invoiceType: 'deposit' as const,
          isDepositInvoice: true,
        };
        
        newInvoices = [...existingInvoices, depositInvoice];
        
        toast({
          title: "Deposit Invoice Created",
          description: `A ${depositPercentage}% deposit invoice has been created.`,
        });
      } else {
        newInvoices = [...existingInvoices, baseInvoice];
        
        toast({
          title: "Invoice Created",
          description: "Quote has been converted to a full invoice.",
        });
      }
      
      localStorage.setItem('invoices', JSON.stringify(newInvoices));
      
      const existingQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
      const updatedQuotes = existingQuotes.map((q: Quote) => {
        if (q.id === quote.id) {
          return { ...q, status: 'expired' };
        }
        return q;
      });
      localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
      
      if (onChangeDocumentType) {
        onChangeDocumentType('invoices');
      }
      
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

  const handleChangeInvoiceType = (invoice: Invoice, newType: 'deposit' | 'remaining' | 'full') => {
    try {
      const allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      const updatedInvoices = allInvoices.map((doc: Invoice) => {
        if (doc.id === invoice.id) {
          return {
            ...doc,
            invoiceType: newType,
            isDepositInvoice: newType === 'deposit'
          };
        }
        return doc;
      });
      
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      
      if (activeDocumentType === 'invoices') {
        setDocuments(updatedInvoices);
      }
      
      toast({
        title: "Invoice type changed",
        description: `Invoice type updated to ${newType === 'deposit' ? 'Deposit' : newType === 'remaining' ? 'Remaining' : 'Full'}.`
      });
    } catch (error) {
      console.error("Error changing invoice type:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice type.",
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
            onChangeInvoiceType={handleChangeInvoiceType}
          />
        )
      )}
    </div>
  );
}
