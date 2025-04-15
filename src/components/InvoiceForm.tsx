
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomerInfoSection } from "./invoice/CustomerInfoSection";
import { InvoiceDetailsSection } from "./invoice/InvoiceDetailsSection";
import { InvoiceItemsSection } from "./invoice/InvoiceItemsSection";
import { calculateTotals, mapInitialDataToFormData } from "@/utils/invoiceUtils";
import { InvoiceFormData, InitialInvoiceData } from "@/types/invoice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvoiceFormProps {
  onClose: () => void;
  initialData?: InitialInvoiceData;
  onSuccess?: () => void;
}

export default function InvoiceForm({ onClose, initialData, onSuccess }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>(() => {
    return mapInitialDataToFormData(initialData);
  });

  const [termsTemplates, setTermsTemplates] = useState<{ name: string; content: string; }[]>([]);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
    setTermsTemplates(settings.termsTemplates || []);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { totalAmount } = calculateTotals(formData.items, formData.tax);

    if (!formData.invoiceNumber) {
      toast.error("Invalid invoice number");
      return;
    }

    try {
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
        items: formData.items,
        notes: formData.notes,
        terms: formData.terms,
        paymentStatus: initialData?.paymentStatus || 'unpaid',
        invoiceType: formData.invoiceType || 'full',
        isDepositInvoice: formData.invoiceType === 'deposit',
        linkedInvoiceId: initialData?.linkedInvoiceId,
        reviewed: initialData?.reviewed || false,
        reviewChaseHistory: initialData?.reviewChaseHistory || []
      };

      const existingDocs = JSON.parse(localStorage.getItem('invoices') || '[]');
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

      localStorage.setItem('invoices', JSON.stringify(updatedDocs));

      toast.success(initialData ? "Invoice updated successfully" : "Invoice created successfully");

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error(`Error creating invoice: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleTemplateChange = (templateName: string) => {
    if (templateName === "custom") {
      setFormData(prev => ({
        ...prev,
        selectedTermsTemplate: "custom"
      }));
    } else {
      const template = termsTemplates.find(t => t.name === templateName);
      if (template) {
        setFormData(prev => ({
          ...prev,
          terms: template.content,
          selectedTermsTemplate: templateName
        }));
      }
    }
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
          <DialogTitle>
            {initialData ? "Edit Invoice" : "Create New Invoice"}
          </DialogTitle>
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
            readOnly={false}
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Terms & Conditions Template</Label>
              <Select
                value={formData.selectedTermsTemplate}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select terms template" />
                </SelectTrigger>
                <SelectContent>
                  {termsTemplates.map((template, index) => (
                    <SelectItem key={index} value={template.name}>
                      {template.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Terms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                placeholder="Enter terms and conditions"
                value={formData.terms}
                onChange={handleChange}
                rows={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit">
              {initialData ? "Save Changes" : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
