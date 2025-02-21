import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mail, Printer, FileText } from "lucide-react";
import EmailDialog from "./EmailDialog";
import { useState } from "react";
import { toast } from "sonner";

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

  const handlePreviewPDF = async (document: any) => {
    if (document.type === 'Quote') {
      // For quotes, we'll keep using the placeholder URL for now
      const pdfUrl = `/api/quotes/${document.id}/pdf`;
      window.open(pdfUrl, '_blank');
      return;
    }

    const apiKey = localStorage.getItem("invoice_generator_api_key");
    if (!apiKey) {
      toast.error("Please set up your Invoice Generator API key in settings first");
      return;
    }

    try {
      const response = await fetch("https://invoice-generator.com", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Your Company Name",
          to: document.customer,
          number: document.number,
          date: document.date,
          items: [
            {
              name: "Removal Services",
              quantity: 1,
              unit_cost: parseFloat(document.amount.replace('£', ''))
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF. Please check your API key and try again.");
    }
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
