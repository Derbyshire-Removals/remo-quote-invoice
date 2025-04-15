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
      selectedTermsTemplate: defaultTemplate?.name || "custom",
      invoiceType: "full"
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
    selectedTermsTemplate: "custom",
    invoiceType: initialData.invoiceType || (initialData.isDepositInvoice ? "deposit" : "full")
  };
};

export const getUnpaidInvoicesCount = (): number => {
  const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
  return invoices.filter((invoice: any) => 
    invoice.paymentStatus === 'unpaid' || 
    (!invoice.paymentStatus && invoice.status?.toLowerCase() === 'unpaid')
  ).length;
};

export const normalizeInvoiceType = (invoice: any): 'deposit' | 'remaining' | 'full' => {
  if (invoice.invoiceType) {
    return invoice.invoiceType;
  }
  
  // Legacy support
  if (invoice.isDepositInvoice) {
    return 'deposit';
  }
  
  return 'full';
};

export const updateInvoiceType = (
  invoiceId: number, 
  newType: 'deposit' | 'remaining' | 'full'
): boolean => {
  try {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    const updatedInvoices = invoices.map((invoice: any) => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          invoiceType: newType,
          isDepositInvoice: newType === 'deposit' // Update legacy field for backward compatibility
        };
      }
      return invoice;
    });
    
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    return true;
  } catch (error) {
    console.error("Error updating invoice type:", error);
    return false;
  }
};

export const generateRemainingInvoice = (depositInvoice: any): any => {
  // Get the template index to use for remaining invoices (second template if available)
  const settings = JSON.parse(localStorage.getItem("companySettings") || "{}");
  const templates = settings.termsTemplates || [];
  
  // Use second template if available, otherwise use first or empty
  const templateIndex = templates.length >= 2 ? 1 : (templates.length === 1 ? 0 : -1);
  const selectedTemplate = templateIndex >= 0 ? templates[templateIndex] : null;
  
  // Create a new invoice with today's date and the appropriate template
  const remainingInvoice = {
    ...depositInvoice,
    id: Date.now(),
    linkedInvoiceId: depositInvoice.id,
    invoiceType: 'remaining',
    number: `${depositInvoice.number}-R`,
    invoiceDate: new Date().toISOString().split('T')[0],
    date: new Date().toISOString().split('T')[0],
    terms: selectedTemplate?.content || depositInvoice.terms || "",
    selectedTermsTemplate: selectedTemplate?.name || "custom",
  };
  
  return remainingInvoice;
};
