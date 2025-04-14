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
  invoiceType?: 'deposit' | 'remaining' | 'full';
  hasReview?: boolean;
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
  isDepositInvoice?: boolean; // Legacy field - kept for backwards compatibility
  invoiceType?: 'deposit' | 'remaining' | 'full';
  linkedInvoiceId?: number;
  type?: string;
  paymentStatus?: 'paid' | 'unpaid';
  hasReview?: boolean;
}

export interface CompanySettings {
  name?: string;
  logoUrl?: string;
  address?: string;
  contactInfo?: string;
  registrationNumber?: string;
  companyNumber?: string;
  phone?: string;
  email?: string;
  invoicePrefix?: string;
  invoiceCounter?: number;
  defaultNotes?: string;
  termsTemplates?: {
    name: string;
    content: string;
  }[];
}

export interface PrintableDocument {
  type: string;
  number: string;
  customer: string;
  address?: string;
  invoiceDate?: string;
  date: string;
  dueDate?: string;
  items?: InvoiceItem[];
  notes?: string;
  terms?: string;
  amount: string;
  paymentStatus?: 'paid' | 'unpaid';
  isDepositInvoice?: boolean;
  invoiceType?: 'deposit' | 'remaining' | 'full';
}

export interface QuoteItem {
  description: string;
  amount: string;
}

export interface Quote {
  id: string | number;
  customerName: string;
  email?: string;
  phone?: string;
  moveDate?: string;
  fromAddress: string;
  items: QuoteItem[];
  message: string;
  planningNotes?: string;
  total: number;
  createdAt: string;
  createdBy: string;
  status?: 'open' | 'lost' | 'expired';
}

export interface Enquiry {
  id: string;
  customerName: string;
  phone: string;
  hasWhatsapp: boolean;
  email?: string;
  moveDate?: string;
  fromAddress: string;
  fromBedrooms: number;
  toAddress: string;
  accessIssues?: string;
  gettingMoreQuotes?: boolean;
  services: {
    packaging: boolean;
    storage: boolean;
    disassembly: boolean;
  };
  notes?: string;
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'lost';
  createdAt: string;
}
