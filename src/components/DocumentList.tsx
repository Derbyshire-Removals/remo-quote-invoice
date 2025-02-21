
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mail, Printer, FileText } from "lucide-react";
import EmailDialog from "./EmailDialog";
import { useState } from "react";

export default function DocumentList() {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const documents = [
    { id: 1, type: 'Quote', number: 'Q001', customer: 'John Doe', date: '2024-02-20', amount: '£550.00', status: 'Pending' },
    { id: 2, type: 'Invoice', number: 'INV001', customer: 'Jane Smith', date: '2024-02-19', amount: '£750.00', status: 'Unpaid' },
    // Add more sample data as needed
  ];

  const handleEmail = (document: any) => {
    setSelectedDocument(document);
    setShowEmailDialog(true);
  };

  const handlePrint = (document: any) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate HTML content for the invoice
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.type} ${document.number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
            .row { display: flex; margin-bottom: 10px; }
            .label { font-weight: bold; width: 100px; }
            .amount { font-size: 1.2em; margin-top: 20px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${document.type} ${document.number}</h1>
          </div>
          <div class="details">
            <div class="row">
              <span class="label">Customer:</span>
              <span>${document.customer}</span>
            </div>
            <div class="row">
              <span class="label">Date:</span>
              <span>${document.date}</span>
            </div>
            <div class="row">
              <span class="label">Status:</span>
              <span>${document.status}</span>
            </div>
            <div class="amount">
              <span class="label">Amount:</span>
              <span>${document.amount}</span>
            </div>
          </div>
          <div class="no-print">
            <button onclick="window.print()">Print</button>
          </div>
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.type}</TableCell>
              <TableCell>{doc.number}</TableCell>
              <TableCell>{doc.customer}</TableCell>
              <TableCell>{doc.date}</TableCell>
              <TableCell>{doc.amount}</TableCell>
              <TableCell>{doc.status}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEmail(doc)}>
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handlePrint(doc)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EmailDialog 
        open={showEmailDialog} 
        onClose={() => setShowEmailDialog(false)}
        document={selectedDocument}
      />
    </div>
  );
}
