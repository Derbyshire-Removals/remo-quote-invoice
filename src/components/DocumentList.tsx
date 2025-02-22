
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mail, Eye, FileText, Edit } from "lucide-react";
import EmailDialog from "./EmailDialog";
import { useState, useEffect } from "react";
import InvoiceForm from "./InvoiceForm";
import PreviewDialog from "./PreviewDialog";

interface Document {
  id: number;
  type: 'Quote' | 'Invoice';
  number: string;
  customer: string;
  date: string;
  amount: string;
  status: string;
}

interface DocumentListProps {
  activeDocumentType: 'quotes' | 'invoices';
}

export default function DocumentList({ activeDocumentType }: DocumentListProps) {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Function to load documents from localStorage
  const loadDocuments = () => {
    const storedDocs = localStorage.getItem('documents');
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs));
    }
  };

  useEffect(() => {
    // Initial load
    loadDocuments();

    // Subscribe to storage changes from other windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'documents') {
        loadDocuments();
      }
    };

    // Set up an interval to check for changes every second
    const interval = setInterval(loadDocuments, 1000);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Filter documents based on active type
  const filteredDocuments = documents.filter(doc => 
    activeDocumentType === 'quotes' ? doc.type === 'Quote' : doc.type === 'Invoice'
  );

  const handleEmail = (document: Document) => {
    setSelectedDocument(document);
    setShowEmailDialog(true);
  };

  const handleEdit = (document: Document) => {
    setSelectedDocument(document);
    setShowEditForm(true);
  };

  const handlePreview = (document: Document) => {
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
          {filteredDocuments.map((doc) => (
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

