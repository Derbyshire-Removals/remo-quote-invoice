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
  ];

  const handleEmail = (document: any) => {
    setSelectedDocument(document);
    setShowEmailDialog(true);
  };

  const handlePreviewPDF = (document: any) => {
    // For demonstration, we'll use a placeholder PDF URL
    // In a real application, this would be an API endpoint that generates the PDF
    const pdfUrl = document.type === 'Invoice' 
      ? `/api/invoices/${document.id}/pdf`
      : `/api/quotes/${document.id}/pdf`;
    
    // Open PDF in a new tab
    window.open(pdfUrl, '_blank');
    
    console.log('Opening PDF preview for:', document);
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
                  <Button variant="outline" size="icon">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handlePreviewPDF(doc)}>
                    <FileText className="h-4 w-4" />
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