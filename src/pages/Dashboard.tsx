
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Receipt, FileText, Settings } from "lucide-react";
import DocumentList from "@/components/DocumentList";
import { useState } from "react";
import QuoteForm from "@/components/QuoteForm";
import InvoiceForm from "@/components/InvoiceForm";
import SettingsDialog from "@/components/SettingsDialog";

export default function Dashboard() {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeDocumentType, setActiveDocumentType] = useState<'quotes' | 'invoices'>('quotes');

  // Get company settings from localStorage
  const companySettings = JSON.parse(localStorage.getItem('companySettings') || '{}');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Removal Company Dashboard</h1>
        <div className="space-x-4">
          <Button onClick={() => setShowQuoteForm(true)} className="bg-primary">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              <p className="text-muted-foreground">5 pending quotes</p>
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
              <p className="text-muted-foreground">3 unpaid invoices</p>
            </div>
          </div>
        </Card>
      </div>

      <DocumentList activeDocumentType={activeDocumentType} />

      {showQuoteForm && (
        <QuoteForm onClose={() => setShowQuoteForm(false)} companySettings={companySettings} />
      )}
      
      {showInvoiceForm && (
        <InvoiceForm onClose={() => setShowInvoiceForm(false)} />
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
