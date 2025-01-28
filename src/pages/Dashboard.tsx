import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Receipt, FileText } from "lucide-react";
import DocumentList from "@/components/DocumentList";
import { useState } from "react";
import QuoteForm from "@/components/QuoteForm";
import InvoiceForm from "@/components/InvoiceForm";

export default function Dashboard() {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
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
        <Card className="p-6">
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

      <DocumentList />

      {showQuoteForm && (
        <QuoteForm onClose={() => setShowQuoteForm(false)} />
      )}
      
      {showInvoiceForm && (
        <InvoiceForm onClose={() => setShowInvoiceForm(false)} />
      )}
    </div>
  );
}