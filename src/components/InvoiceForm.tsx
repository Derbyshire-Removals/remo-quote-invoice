
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InvoiceFormProps {
  onClose: () => void;
  initialData?: Invoice;
}

interface Invoice {
  id: number;
  number: string;
  customer: string;
  date: string;
  amount: string;
  status: string;
}

export default function InvoiceForm({ onClose, initialData }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    number: initialData?.number || '',
    customer: initialData?.customer || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    amount: initialData?.amount || '',
    status: initialData?.status || 'Unpaid'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.customer || !formData.date || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newInvoice = {
      id: initialData?.id || Date.now(),
      ...formData
    };

    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    let updatedInvoices;

    if (initialData) {
      updatedInvoices = existingInvoices.map((invoice: Invoice) => 
        invoice.id === initialData.id ? newInvoice : invoice
      );
    } else {
      updatedInvoices = [...existingInvoices, newInvoice];
    }

    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    toast.success(initialData ? "Invoice updated successfully" : "Invoice created successfully");
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Invoice Number</Label>
            <Input 
              id="number"
              placeholder="INV-001"
              value={formData.number}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">Customer Name</Label>
            <Input 
              id="customer"
              placeholder="John Doe"
              value={formData.customer}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input 
              id="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount"
              placeholder="£0.00"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit">{initialData ? "Save Changes" : "Create Invoice"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
