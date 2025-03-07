import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MessageSquare, Calendar, FileText, Clipboard, MapPin, FileText as QuoteIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Enquiry, Quote } from "@/types/invoice";
import EnquiryForm from "./EnquiryForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format, isValid, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QuoteForm from "./QuoteForm";

export default function EnquiryList() {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportText, setExportText] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
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

  const handleExport = (enquiry: Enquiry) => {
    // Generate formatted text for export
    const text = generateExportText(enquiry);
    setExportText(text);
    setSelectedEnquiry(enquiry);
    setShowExportDialog(true);
  };

  const generateExportText = (enquiry: Enquiry) => {
    // Generate a nicely formatted text representation of the enquiry
    const servicesRequested = [];
    if (enquiry.services.packaging) servicesRequested.push("Packaging");
    if (enquiry.services.storage) servicesRequested.push("Storage");
    if (enquiry.services.disassembly) servicesRequested.push("Disassembly/Reassembly");

    return `
NEW REMOVAL ENQUIRY

Customer: ${enquiry.customerName}
Phone: ${enquiry.phone}${enquiry.hasWhatsapp ? ' (Has WhatsApp)' : ''}
Email: ${enquiry.email || 'Not provided'}

Move Details:
- Date: ${formatDate(enquiry.moveDate)}
- From: ${enquiry.fromAddress} (${enquiry.fromBedrooms} bedroom${enquiry.fromBedrooms !== 1 ? 's' : ''})
- To: ${enquiry.toAddress}
- Access Issues: ${enquiry.accessIssues || 'None mentioned'}

Additional Services Requested:
${servicesRequested.length > 0 ? servicesRequested.join(', ') : 'None'}

Customer Notes:
${enquiry.notes || 'None provided'}

Additional Information:
- Getting Other Quotes: ${enquiry.gettingMoreQuotes ? 'Yes' : 'No/Unknown'}
- Current Status: ${enquiry.status.toUpperCase()}
- Created: ${formatDate(enquiry.createdAt)}

FOLLOW-UP ACTIONS:
[ ] Call customer to confirm details
[ ] Schedule site visit if needed
[ ] Prepare quote
[ ] Update status in system
`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportText).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The enquiry details have been copied to your clipboard."
      });
      setShowExportDialog(false);
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the text manually.",
        variant: "destructive"
      });
      console.error('Failed to copy text: ', err);
    });
  };

  // Function to generate Google Maps URL from an address
  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };
  
  // Function to render address cell with Google Maps link
  const renderAddressWithMapLink = (address: string) => {
    return (
      <a 
        href={getGoogleMapsUrl(address)} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center hover:text-primary hover:underline group max-w-[150px] truncate"
      >
        <span className="truncate">{address}</span>
        <MapPin className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  };

  // New function to convert enquiry to quote
  const handleConvertToQuote = (enquiry: Enquiry) => {
    // Set the enquiry as selected and prepare to show the quote form
    setSelectedEnquiry(enquiry);
    setShowQuoteForm(true);
  };

  // Function to update enquiry status to 'quoted'
  const updateEnquiryStatus = (enquiryId: string) => {
    const updatedEnquiries = enquiries.map(enquiry => 
      enquiry.id === enquiryId 
        ? { ...enquiry, status: 'quoted' } 
        : enquiry
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updatedEnquiries));
    setEnquiries(updatedEnquiries);
    
    toast({
      title: "Enquiry status updated",
      description: "The enquiry status has been changed to 'quoted'."
    });
  };

  // Function to close quote form and update status
  const handleQuoteFormClose = (quoteCreated: boolean = false) => {
    setShowQuoteForm(false);
    
    // If a quote was created and we have a selected enquiry, update its status
    if (quoteCreated && selectedEnquiry) {
      updateEnquiryStatus(selectedEnquiry.id);
    }
    
    setSelectedEnquiry(null);
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
              <TableCell>
                {renderAddressWithMapLink(enquiry.fromAddress)}
              </TableCell>
              <TableCell>
                {renderAddressWithMapLink(enquiry.toAddress)}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(enquiry.status)}>{enquiry.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleConvertToQuote(enquiry)} 
                    title="Convert to Quote"
                    disabled={enquiry.status === 'quoted' || enquiry.status === 'converted'}
                  >
                    <QuoteIcon className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleExport(enquiry)} 
                    title="Export to text"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleEdit(enquiry)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleDelete(enquiry)}
                  >
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

      {showQuoteForm && selectedEnquiry && (
        <QuoteForm 
          onClose={(created) => handleQuoteFormClose(created)}
          initialData={{
            id: crypto.randomUUID(),
            customerName: selectedEnquiry.customerName,
            email: selectedEnquiry.email || '',
            phone: selectedEnquiry.phone,
            moveDate: selectedEnquiry.moveDate || '',
            fromAddress: selectedEnquiry.fromAddress,
            items: [{ description: "Removal costs incl insurance", amount: "" }],
            message: `Following our recent conversation I have the pleasure in quoting for the removal of furniture/goods from ${selectedEnquiry.fromAddress} and delivery to ${selectedEnquiry.toAddress}.`,
            total: 0,
            createdAt: new Date().toISOString(),
            createdBy: ''
          }}
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

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Enquiry</DialogTitle>
            <DialogDescription>
              Copy this text to share with your sales team
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-xs md:text-sm">{exportText}</pre>
            </div>
            <Button onClick={copyToClipboard} className="ml-auto">
              <Clipboard className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
