
import { InvoiceFormData, InvoiceItem, InitialInvoiceData } from "@/types/invoice";

export const calculateTotals = (items: InvoiceItem[], taxRate: string) => {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const vatRate = parseFloat(taxRate) / 100;
  const vatAmount = subtotal * vatRate;
  const totalAmount = subtotal + vatAmount;

  return {
    subtotal,
    vatAmount,
    totalAmount
  };
};

export const generateNewInvoiceNumber = (incrementCounter = true) => {
  const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
  const prefix = settings.invoicePrefix || "INV";
  const counter = settings.invoiceCounter || 1000;
  return `${prefix}-${counter}`;
};

export const mapInitialDataToFormData = (initialData?: InitialInvoiceData): InvoiceFormData => {
  if (!initialData) {
    const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
    const defaultTemplate = settings.termsTemplates?.[0];
    return {
      customerName: "",
      email: "",
      invoiceNumber: generateNewInvoiceNumber(),
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      address: "",
      tax: "20",
      items: [{ description: "", amount: "" }],
      notes: settings.defaultNotes || "",
      terms: defaultTemplate?.content || "",
      selectedTermsTemplate: defaultTemplate?.name || "custom"
    };
  }

  return {
    customerName: initialData.customer || "",
    email: initialData.email || "",
    invoiceNumber: initialData.number || "",
    invoiceDate: initialData.invoiceDate || "",
    dueDate: initialData.dueDate || "",
    address: initialData.address || "",
    tax: String(initialData.tax || 20),
    items: initialData.items || [{ description: initialData.description || "", amount: initialData.amount.replace('£', '') || "" }],
    notes: initialData.notes || "",
    terms: initialData.terms || "",
    selectedTermsTemplate: "custom"
  };
};
