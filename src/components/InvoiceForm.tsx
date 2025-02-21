
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface InvoiceFormProps {
  onClose: () => void;
  initialData?: {
    id: number;
    number: string;
    customer: string;
    date: string;
    amount: string;
    status: string;
    email?: string;
    description?: string;
    address?: string;
    tax?: number;
    invoiceDate?: string;
    dueDate?: string;
  };
}

export default function InvoiceForm({ onClose, initialData }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    address: "",
    description: "",
    amount: "",
    tax: "20"
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        customerName: initialData.customer || "",
        email: initialData.email || "",
        invoiceNumber: initialData.number || "",
        invoiceDate: initialData.invoiceDate || "",
        dueDate: initialData.dueDate || "",
        address: initialData.address || "",
        description: initialData.description || "",
        amount: initialData.amount.replace('£', '') || "",
        tax: String(initialData.tax || 20)
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the changes
    console.log("Form submitted:", formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input 
                id="customerName" 
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="customer@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input 
                id="invoiceNumber" 
                placeholder="INV001"
                value={formData.invoiceNumber}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input 
                id="invoiceDate" 
                type="date"
                value={formData.invoiceDate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                id="dueDate" 
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Billing Address</Label>
            <Textarea 
              id="address" 
              placeholder="Enter billing address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Service Description</Label>
            <Textarea 
              id="description" 
              placeholder="Enter service details"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">VAT (%)</Label>
              <Input 
                id="tax" 
                type="number" 
                placeholder="20"
                value={formData.tax}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit">{initialData ? "Save Changes" : "Create Invoice"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
