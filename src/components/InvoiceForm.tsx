import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomerInfoSection } from "./invoice/CustomerInfoSection";
import { InvoiceDetailsSection } from "./invoice/InvoiceDetailsSection";
import { InvoiceItemsSection } from "./invoice/InvoiceItemsSection";
import { calculateTotals, mapInitialDataToFormData } from "@/utils/invoiceUtils";
import { InvoiceFormData, InitialInvoiceData } from "@/types/invoice";

interface InvoiceFormProps {
  onClose: () => void;
  initialData?: InitialInvoiceData;
}

export default function InvoiceForm({ onClose, initialData }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>(() => 
    mapInitialDataToFormData(initialData)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { totalAmount } = calculateTotals(formData.items, formData.tax);
    
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

    const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]');
    let updatedDocs;

    if (initialData) {
      updatedDocs = existingDocs.map((doc: any) => 
        doc.id === initialData.id ? newDocument : doc
      );
    } else {
      updatedDocs = [...existingDocs, newDocument];
      
      const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
      settings.invoiceCounter = (settings.invoiceCounter || 1000) + 1;
      settings.invoicePrefix = settings.invoicePrefix || "INV";
      localStorage.setItem("companySettings", JSON.stringify(settings));
    }

    localStorage.setItem('documents', JSON.stringify(updatedDocs));
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

  const handleItemChange = (index: number, field: keyof InvoiceFormData["items"][0], value: string) => {
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

  const { subtotal, vatAmount, totalAmount } = calculateTotals(formData.items, formData.tax);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <CustomerInfoSection
            customerName={formData.customerName}
            email={formData.email}
            address={formData.address}
            onChange={handleChange}
          />

          <InvoiceDetailsSection
            invoiceNumber={formData.invoiceNumber}
            invoiceDate={formData.invoiceDate}
            dueDate={formData.dueDate}
            onChange={handleChange}
            readOnly={!initialData}
          />

          <InvoiceItemsSection
            items={formData.items}
            onItemChange={handleItemChange}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            subtotal={subtotal}
            vatRate={formData.tax}
            vatAmount={vatAmount}
            totalAmount={totalAmount}
          />

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
