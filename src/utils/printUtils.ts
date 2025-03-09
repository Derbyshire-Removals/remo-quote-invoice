
import { format } from "date-fns";
import { CompanySettings, InvoiceItem, PrintableDocument } from "@/types/invoice";

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Calculate the subtotal from the invoice items
 */
export const calculateSubtotal = (items: InvoiceItem[] = []): number => {
  return items.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);
};

/**
 * Calculate VAT based on subtotal and VAT rate
 */
export const calculateVAT = (subtotal: number, vatRate: number = 20): number => {
  return subtotal * (vatRate / 100);
};

/**
 * Generate the HTML content for printing
 */
export const generatePrintContent = (
  document: PrintableDocument,
  companySettings?: CompanySettings
): string => {
  // Log the settings received to help debug
  console.log("Generating print content with settings:", companySettings);
  
  // Fallback to localStorage if no settings were provided
  if (!companySettings) {
    const savedSettings = localStorage.getItem("companySettings");
    if (savedSettings) {
      companySettings = JSON.parse(savedSettings);
      console.log("Using fallback settings from localStorage:", companySettings);
    }
  }

  const subtotal = calculateSubtotal(document.items || []);
  const vatAmount = calculateVAT(subtotal);
  const totalAmount = subtotal + vatAmount;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${document.type} ${document.number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { 
            font-family: 'Inter', sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            color: #1a1f2c;
            font-size: 14px;
          }
          .header { 
            width: 100%;
            display: table;
            margin-bottom: 40px;
          }
          .left-section {
            display: table-cell;
            width: 65%;
            vertical-align: top;
            padding-right: 2rem;
          }
          .right-section {
            display: table-cell;
            width: 35%;
            vertical-align: top;
            text-align: right;
          }
          .company-info { margin-bottom: 2rem; }
          .logo { max-width: 175px; margin-bottom: 1rem; }
          .details { margin-bottom: 30px; }
          .row { display: flex; margin-bottom: 12px; }
          .label { font-weight: 600; width: 150px; color: #64748b; }
          .amount { font-size: 1.5em; margin-top: 30px; }
          .document-title { 
            font-size: 2.5em; 
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
          }
          .document-number {
            font-size: 1.5em;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 3rem;
          }
          .company-name {
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          .bill-to {
            color: #64748b;
            font-size: 0.875rem;
            margin: 1.5rem 0 0.5rem 0;
          }
          .customer-name {
            font-weight: 600;
          }
          .address {
            white-space: pre-line;
            line-height: 1.5;
          }
          .company-details {
            margin-bottom: 0.25rem;
          }
          .balance-box {
            display: inline-block;
            background-color: #f8f9fa;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
          }
          .balance-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #64748b;
            margin-right: 1rem;
          }
          .balance-amount {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a1f2c;
          }
          .date-row {
            margin-bottom: 0.75rem;
            text-align: right;
          }
          .date-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #64748b;
            margin-right: 1rem;
          }
          .date-value {
            font-size: 0.875rem;
            color: #1a1f2c;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
          }
          th {
            background-color: #022f5c;
            color: white;
            font-weight: 600;
            text-align: left;
            padding: 0.5rem;
            border-bottom: 1px solid #e2e8f0;
          }
          td {
            padding: 0.5rem;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:last-child td {
            border-bottom: none;
          }
          .amount-cell {
            text-align: right;
          }
          .notes-content, .terms-content {
            white-space: pre-line;
            line-height: 1.5;
            margin: 0;
          }
          .totals-section {
            margin-top: 1rem;
            width: 100%;
          }
          .totals-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 0.5rem;
          }
          .totals-label {
            color: #64748b;
            margin-right: 2rem;
          }
          .totals-value {
            width: 150px;
            text-align: right;
          }
          @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 20px; }
            .header { page-break-inside: avoid; }
            th {
              background-color: #022f5c !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="left-section">
            ${companySettings?.logoUrl ? `<img src="${companySettings.logoUrl}" alt="Company Logo" class="logo">` : ''}
            ${companySettings?.name ? `<div class="company-name">${companySettings.name}</div>` : ''}
            ${companySettings?.address ? `<div class="address">${companySettings.address}</div>` : ''}
            ${companySettings?.phone ? `<div class="company-details">Phone: ${companySettings.phone}</div>` : ''}
            ${companySettings?.email ? `<div class="company-details">Email: ${companySettings.email}</div>` : ''}
            ${companySettings?.companyNumber ? `<div class="company-details">Company No: ${companySettings.companyNumber}</div>` : ''}
            ${companySettings?.registrationNumber ? `<div class="company-details">VAT: ${companySettings.registrationNumber}</div>` : ''}
            
            <div class="bill-to">Bill To:</div>
            <div class="customer-name">${document.customer}</div>
            <div class="address">${document.address || ''}</div>
          </div>
          <div class="right-section">
            <div class="document-title">${document.type}</div>
            <div class="document-number">#${document.number}</div>
            <div class="date-row">
              <span class="date-label">Date:</span>
              <span class="date-value">${formatDate(document.invoiceDate || document.date)}</span>
            </div>
            ${document.dueDate ? `
              <div class="date-row">
                <span class="date-label">Due Date:</span>
                <span class="date-value">${formatDate(document.dueDate)}</span>
              </div>
            ` : ''}
            <div class="balance-box">
              <span class="balance-label">Balance Due:</span>
              <span class="balance-amount">${document.amount}</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 80%">Description</th>
              <th style="width: 20%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${document.items?.map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="amount-cell">£${parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="totals-row">
            <span class="totals-label">Subtotal:</span>
            <span class="totals-value">£${subtotal.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label">VAT (20%):</span>
            <span class="totals-value">£${vatAmount.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label" style="font-weight: 600;">Total:</span>
            <span class="totals-value" style="font-weight: 600;">£${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 3rem; space-y: 1.5rem;">
          <div>
            <p style="color: #64748b; margin: 0;">Notes:</p>
            <p class="notes-content">${document.notes || 'No notes provided'}</p>
          </div>
          <div style="margin-top: 1.5rem; margin: 0;">
            <p style="color: #64748b;">Terms:</p>
            <p class="terms-content">${document.terms || 'No terms provided'}</p>
          </div>
        </div>

        <div class="no-print">
          <button onclick="window.print()">Print</button>
        </div>
      </body>
    </html>
  `;
};

/**
 * Open a print window with the generated content
 */
export const openPrintWindow = (
  document: PrintableDocument,
  companySettings?: CompanySettings
): Window | null => {
  // Log to verify settings are being received
  console.log("Opening print window with settings:", companySettings);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error("Failed to open print window. Please check your browser settings.");
    return null;
  }
  
  const content = generatePrintContent(document, companySettings);
  printWindow.document.write(content);
  printWindow.document.close();
  
  return printWindow;
};
