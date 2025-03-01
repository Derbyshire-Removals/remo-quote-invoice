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
import { Switch } from "@/components/ui/switch";

interface InvoiceFormProps {
  onClose: () => void;
  initialData?: InitialInvoiceData;
  convertFromQuote?: any; // We need to accept a quote to convert
}

export default function InvoiceForm({ onClose, initialData, convertFromQuote }: InvoiceFormProps) {
  // Set createDepositInvoice to true by default when converting from a quote
  const [createDepositInvoice, setCreateDepositInvoice] = useState(convertFromQuote ? true : false);
  
  const [formData, setFormData] = useState<InvoiceFormData>(() => {
    if (convertFromQuote) {
      // Map quote data to invoice form
      const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
      const nextInvoiceNumber = `${settings.invoicePrefix || "INV"}-${settings.invoiceCounter || 1000}`;
      
      // Create items array with quote message appended to first item description
      let itemsFromQuote = convertFromQuote.items?.map((item: any, index: number) => {
        if (index === 0 && convertFromQuote.message) {
          return {
            description: `${item.description}\n\nQuote notes: ${convertFromQuote.message}`,
            amount: item.amount.toString()
          };
        }
        return {
          description: item.description,
          amount: item.amount.toString()
        };
      }) || [{ description: "", amount: "" }];
      
      return {
        customerName: convertFromQuote.customerName || "",
        email: convertFromQuote.email || "",
        address: convertFromQuote.fromAddress || "",
        invoiceNumber: nextInvoiceNumber,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: "", // Set due date to empty when converting from quote
        tax: "20", // Default VAT rate
        items: itemsFromQuote,
        notes: settings.defaultNotes || "", // Use default notes from settings
        terms: "",
        selectedTermsTemplate: "custom"
      };
    } else {
      // Regular initialization
      return mapInitialDataToFormData(initialData);
    }
  });
  
  const [termsTemplates, setTermsTemplates] = useState<{ name: string; content: string; }[]>([]);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
    setTermsTemplates(settings.termsTemplates || []);
    
    // If we're converting from a quote and have templates, select the first one by default
    if (convertFromQuote && settings.termsTemplates && settings.termsTemplates.length > 0) {
      setFormData(prev => ({
        ...prev,
        terms: settings.termsTemplates[0].content,
        selectedTermsTemplate: settings.termsTemplates[0].name
      }));
    }
  }, [convertFromQuote]);

  useEffect(() => {
    if (convertFromQuote && createDepositInvoice) {
      // Apply 50% to the first item when deposit invoice is selected
      setFormData(prev => {
        if (prev.items.length > 0) {
          const updatedItems = [...prev.items];
          const firstItem = {...updatedItems[0]};
          
          // Calculate 50% of the original amount
          const originalAmount = parseFloat(firstItem.amount);
          if (!isNaN(originalAmount)) {
            const depositAmount = originalAmount * 0.5;
            firstItem.description = `50% Deposit: ${firstItem.description}`;
            firstItem.amount = depositAmount.toString();
            updatedItems[0] = firstItem;
          }
          
          return {
            ...prev,
            items: updatedItems,
            notes: prev.notes + "\nThis is a 50% deposit invoice. Remaining balance will be invoiced upon completion."
          };
        }
        return prev;
      });
    } else if (convertFromQuote && !createDepositInvoice) {
      // Reset to original values if toggling off
      setFormData(prev => {
        const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
        
        // Create items array with quote message appended to first item description
        let itemsFromQuote = convertFromQuote.items?.map((item: any, index: number) => {
          if (index === 0 && convertFromQuote.message) {
            return {
              description: `${item.description}\n\nQuote notes: ${convertFromQuote.message}`,
              amount: item.amount.toString()
            };
          }
          return {
            description: item.description,
            amount: item.amount.toString()
          };
        }) || [{ description: "", amount: "" }];
        
        return {
          ...prev,
          items: itemsFromQuote,
          notes: settings.defaultNotes || ""
        };
      });
    }
  }, [createDepositInvoice, convertFromQuote]);

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
      items: formData.items,
      notes: formData.notes,
      terms: formData.terms,
      convertedFromQuote: convertFromQuote ? convertFromQuote.id : undefined,
      isDepositInvoice: convertFromQuote && createDepositInvoice ? true : undefined
    };

    const existingDocs = JSON.parse(localStorage.getItem('invoices') || '[]');
    let updatedDocs;

    if (initialData) {
      updatedDocs = existingDocs.map((doc: any) => 
        doc.id === initialData.id ? newDocument : doc
      );
    } else {
      updatedDocs = [...existingDocs, newDocument];
      
      // Only increment the counter after saving the invoice
      const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
      settings.invoiceCounter = (settings.invoiceCounter || 1000) + 1;
      settings.invoicePrefix = settings.invoicePrefix || "INV";
      localStorage.setItem("companySettings", JSON.stringify(settings));
    }

    localStorage.setItem('invoices', JSON.stringify(updatedDocs));
    
    if (convertFromQuote) {
      toast.success(createDepositInvoice 
        ? "Quote converted to 50% deposit invoice successfully" 
        : "Quote converted to invoice successfully");
    } else {
      toast.success(initialData ? "Invoice updated successfully" : "Invoice created successfully");
    }
    
    onClose();
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
            {initialData ? "Edit Invoice" : convertFromQuote ? "Convert Quote to Invoice" : "Create New Invoice"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {convertFromQuote && (
            <div className="flex items-center space-x-2">
              <Switch
                id="deposit-invoice"
                checked={createDepositInvoice}
                onCheckedChange={setCreateDepositInvoice}
              />
              <Label htmlFor="deposit-invoice">Create as 50% deposit invoice</Label>
            </div>
          )}

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
            readOnly={false} // Allow editing invoice number for all cases
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
              {initialData ? "Save Changes" : convertFromQuote ? (createDepositInvoice ? "Create 50% Deposit Invoice" : "Create Invoice from Quote") : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
