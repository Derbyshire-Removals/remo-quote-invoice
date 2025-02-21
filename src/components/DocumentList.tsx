
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mail, Eye, FileText, Edit } from "lucide-react";
import EmailDialog from "./EmailDialog";
import { useState } from "react";
import InvoiceForm from "./InvoiceForm";
import PreviewDialog from "./PreviewDialog";

export default function DocumentList() {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
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

  const handleEdit = (document: any) => {
    setSelectedDocument(document);
    setShowEditForm(true);
  };

  const handlePreview = (document: any) => {
    // Get company settings from localStorage
    const savedSettings = localStorage.getItem("companySettings");
    const companySettings = savedSettings ? JSON.parse(savedSettings) : null;
    
    setSelectedDocument(document);
    setShowPreviewDialog(true);
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
                  <Button variant="outline" size="icon" onClick={() => handlePreview(doc)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {doc.type === 'Invoice' && (
                    <Button variant="outline" size="icon" onClick={() => handleEdit(doc)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
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

      {showEditForm && selectedDocument && (
        <InvoiceForm 
          onClose={() => setShowEditForm(false)}
          initialData={selectedDocument}
        />
      )}

      {showPreviewDialog && selectedDocument && (
        <PreviewDialog
          open={showPreviewDialog}
          onClose={() => setShowPreviewDialog(false)}
          document={selectedDocument}
          companySettings={JSON.parse(localStorage.getItem("companySettings") || "{}")}
        />
      )}
    </div>
  );
}
