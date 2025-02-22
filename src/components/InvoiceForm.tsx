
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InvoiceItem {
  description: string;
  amount: string;
}

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
    items?: InvoiceItem[];
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
    tax: "20",
    items: [{ description: "", amount: "" }] as InvoiceItem[]
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
        tax: String(initialData.tax || 20),
        items: initialData.items || [{ description: initialData.description || "", amount: initialData.amount.replace('£', '') || "" }]
      });
    } else {
      const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
      const prefix = settings.invoicePrefix || "INV";
      const counter = settings.invoiceCounter || 1000;
      const newInvoiceNumber = `${prefix}-${counter}`;
      
      console.log("Generated invoice number:", newInvoiceNumber); // Debug log
      
      setFormData(prev => ({
        ...prev,
        invoiceNumber: newInvoiceNumber
      }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const vatRate = parseFloat(formData.tax) / 100;
    const vatAmount = subtotal * vatRate;
    const totalAmount = subtotal + vatAmount;
    
    // Ensure we have a valid invoice number
    if (!formData.invoiceNumber) {
      toast.error("Invalid invoice number");
      return;
    }

    const newDocument = {
      id: initialData?.id || Date.now(),
      type: 'Invoice' as const,
      number: formData.invoiceNumber,
      customer: formData.customerName,
      date: formData.invoiceDate,
      amount: `£${totalAmount.toFixed(2)}`,
      status: 'Unpaid',
      email: formData.email,
      address: formData.address,
      tax: parseInt(formData.tax),
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      items: formData.items
    };

    console.log("Saving document:", newDocument); // Debug log

    const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]');
    let updatedDocs;

    if (initialData) {
      updatedDocs = existingDocs.map((doc: any) => 
        doc.id === initialData.id ? newDocument : doc
      );
    } else {
      updatedDocs = [...existingDocs, newDocument];
      
      // Update the invoice counter in settings
      const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
      settings.invoiceCounter = (settings.invoiceCounter || 1000) + 1;
      settings.invoicePrefix = settings.invoicePrefix || "INV";
      localStorage.setItem("companySettings", JSON.stringify(settings));
      
      console.log("Updated settings:", settings); // Debug log
    }

    localStorage.setItem('documents', JSON.stringify(updatedDocs));
    console.log("Saved documents:", updatedDocs); // Debug log
    
    toast.success(initialData ? "Invoice updated successfully" : "Invoice created successfully");
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", amount: "" }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const vatRate = parseFloat(formData.tax) / 100;
  const vatAmount = subtotal * vatRate;
  const totalAmount = subtotal + vatAmount;

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
                readOnly={!initialData}
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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Invoice Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr,auto,auto] gap-4 items-start">
                <div className="space-y-2">
                  <Label htmlFor={`item-${index}-description`}>Description</Label>
                  <Textarea 
                    id={`item-${index}-description`}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Enter item description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`item-${index}-amount`}>Amount</Label>
                  <Input
                    id={`item-${index}-amount`}
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                    className="w-32"
                    placeholder="0.00"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mt-8"
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex flex-col items-end space-y-2 text-lg">
              <div className="flex justify-between w-64">
                <span>Subtotal:</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64">
                <span>VAT ({formData.tax}%):</span>
                <span>£{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 font-semibold">
                <span>Total:</span>
                <span>£{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax">VAT (%)</Label>
            <Input 
              id="tax" 
              type="number" 
              placeholder="20"
              value={formData.tax}
              onChange={handleChange}
              className="w-32"
            />
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
