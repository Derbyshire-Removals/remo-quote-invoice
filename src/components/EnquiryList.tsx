
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, MessageSquare, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Enquiry } from "@/types/invoice";
import EnquiryForm from "./EnquiryForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format, isValid, parseISO } from "date-fns";

export default function EnquiryList() {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const { toast } = useToast();

  const storageKey = 'enquiries';

  // Function to load enquiries from localStorage
  const loadEnquiries = () => {
    const storedDocs = localStorage.getItem(storageKey);
    if (storedDocs) {
      setEnquiries(JSON.parse(storedDocs));
    } else {
      setEnquiries([]); // Initialize with empty array if no documents exist
    }
  };

  useEffect(() => {
    // Initial load
    loadEnquiries();

    // Subscribe to storage changes from other windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadEnquiries();
      }
    };

    // Set up an interval to check for changes every second
    const interval = setInterval(loadEnquiries, 1000);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const confirmDelete = () => {
    if (selectedEnquiry) {
      const updatedEnquiries = enquiries.filter(enquiry => enquiry.id !== selectedEnquiry.id);
      localStorage.setItem(storageKey, JSON.stringify(updatedEnquiries));
      setEnquiries(updatedEnquiries);
      setShowDeleteDialog(false);
      toast({
        title: "Enquiry deleted",
        description: "The enquiry has been deleted."
      });
    }
  };

  const handleEdit = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowEditForm(true);
  };

  const handleDelete = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowDeleteDialog(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Invalid date';
      }
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-yellow-500';
      case 'quoted': return 'bg-green-500';
      case 'converted': return 'bg-purple-500';
      case 'lost': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Move Date</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enquiries.map((enquiry) => (
            <TableRow key={enquiry.id}>
              <TableCell>{enquiry.customerName}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  {enquiry.phone}
                  {enquiry.hasWhatsapp && (
                    <div className="flex items-center" title="Has WhatsApp">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(enquiry.moveDate)}
                </div>
              </TableCell>
              <TableCell className="max-w-[150px] truncate">{enquiry.fromAddress}</TableCell>
              <TableCell className="max-w-[150px] truncate">{enquiry.toAddress}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(enquiry.status)}>{enquiry.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(enquiry)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(enquiry)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showEditForm && selectedEnquiry && (
        <EnquiryForm 
          onClose={() => setShowEditForm(false)}
          initialData={selectedEnquiry}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the enquiry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
