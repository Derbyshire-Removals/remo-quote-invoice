
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Receipt, FileText, Settings, MessageCircle } from "lucide-react";
import DocumentList from "@/components/DocumentList";
import { useState, useEffect } from "react";
import QuoteForm from "@/components/QuoteForm";
import InvoiceForm from "@/components/InvoiceForm";
import SettingsDialog from "@/components/SettingsDialog";
import EnquiryForm from "@/components/EnquiryForm";
import EnquiryList from "@/components/EnquiryList";
import { getUnpaidInvoicesCount } from "@/utils/invoiceUtils";

export default function Dashboard() {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeDocumentType, setActiveDocumentType] = useState<'enquiries' | 'quotes' | 'invoices'>('enquiries');
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState<number>(0);

  // Get company settings from localStorage
  const companySettings = JSON.parse(localStorage.getItem('companySettings') || '{}');

  // Update unpaid invoices count
  useEffect(() => {
    const updateUnpaidCount = () => {
      setUnpaidInvoicesCount(getUnpaidInvoicesCount());
    };

    // Initial count
    updateUnpaidCount();

    // Set up interval to check every 5 seconds
    const intervalId = setInterval(updateUnpaidCount, 5000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Removal Company Dashboard</h1>
        <div className="space-x-4">
          <Button onClick={() => setShowEnquiryForm(true)} className="bg-primary">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Enquiry
          </Button>
          <Button onClick={() => setShowQuoteForm(true)} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Quote
          </Button>
          <Button onClick={() => setShowInvoiceForm(true)} variant="outline">
            <Receipt className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
          <Button onClick={() => setShowSettings(true)} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card 
          className={`p-6 cursor-pointer transition-colors ${activeDocumentType === 'enquiries' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setActiveDocumentType('enquiries')}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Enquiries</h2>
              <p className="text-muted-foreground">New customer enquiries</p>
            </div>
          </div>
        </Card>
        <Card 
          className={`p-6 cursor-pointer transition-colors ${activeDocumentType === 'quotes' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setActiveDocumentType('quotes')}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Quotes</h2>
            </div>
          </div>
        </Card>
        <Card 
          className={`p-6 cursor-pointer transition-colors ${activeDocumentType === 'invoices' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setActiveDocumentType('invoices')}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Invoices</h2>
              {unpaidInvoicesCount > 0 && (
                <p className="text-muted-foreground">{unpaidInvoicesCount} unpaid invoice{unpaidInvoicesCount !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {activeDocumentType === 'enquiries' ? (
        <EnquiryList />
      ) : (
        <DocumentList activeDocumentType={activeDocumentType} />
      )}

      {showQuoteForm && (
        <QuoteForm onClose={() => setShowQuoteForm(false)} companySettings={companySettings} />
      )}
      
      {showInvoiceForm && (
        <InvoiceForm onClose={() => setShowInvoiceForm(false)} />
      )}

      {showEnquiryForm && (
        <EnquiryForm onClose={() => setShowEnquiryForm(false)} />
      )}

      {showSettings && (
        <SettingsDialog 
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
