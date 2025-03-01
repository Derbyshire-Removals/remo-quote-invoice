
export interface InvoiceItem {
  description: string;
  amount: string;
}

export interface InvoiceFormData {
  customerName: string;
  email: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  address: string;
  tax: string;
  items: InvoiceItem[];
  notes: string;
  terms: string;
  selectedTermsTemplate?: string;
}

export interface InitialInvoiceData {
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
  notes?: string;
  terms?: string;
  isDepositInvoice?: boolean;
}

export interface QuoteItem {
  description: string;
  amount: string;
}

export interface Quote {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  moveDate?: string;
  fromAddress: string;
  destinationAddress?: string;
  items: QuoteItem[];
  message: string;
  planningNotes?: string;
  total: number;
  createdAt: string;
  createdBy: string;
}
