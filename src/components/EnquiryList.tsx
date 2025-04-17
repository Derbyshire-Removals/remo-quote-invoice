import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MessageSquare, Calendar, Share, Clipboard, MapPin, FileText as QuoteIcon, ChevronDown, Route } from "lucide-react";
import { useState, useEffect } from "react";
import { Enquiry } from "@/types/invoice";
import EnquiryForm from "./EnquiryForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QuoteForm from "./QuoteForm";
import { Filter } from "./ui/filter";
import { MonthlyGroupedList } from "./ui/monthly-grouped-list";
import { formatDate as formatDateUtil } from "@/utils/dateUtils";

interface EnquiryListProps {
  onQuoteCreated?: (quoteId: string) => void;
}

export default function EnquiryList({ onQuoteCreated }: EnquiryListProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportText, setExportText] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const { toast } = useToast();

  const storageKey = 'enquiries';

  const loadEnquiries = () => {
    const storedDocs = localStorage.getItem(storageKey);
    if (storedDocs) {
      setEnquiries(JSON.parse(storedDocs));
    } else {
      setEnquiries([]); // Initialize with empty array if no documents exist
    }
  };

  useEffect(() => {
    loadEnquiries();

    // Load company address from settings
    const savedSettings = localStorage.getItem("companySettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCompanyAddress(settings.address || "");
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadEnquiries();
      } else if (e.key === "companySettings") {
        // Update company address if settings change
        const settings = e.newValue ? JSON.parse(e.newValue) : {};
        setCompanyAddress(settings.address || "");
      }
    };

    const interval = setInterval(loadEnquiries, 1000);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredEnquiries = enquiries.filter(enquiry => {
    if (!filterValue) return true;

    const searchTerm = filterValue.toLowerCase();
    return (
      enquiry.customerName.toLowerCase().includes(searchTerm) ||
      enquiry.fromAddress.toLowerCase().includes(searchTerm) ||
      enquiry.toAddress.toLowerCase().includes(searchTerm)
    );
  });

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

  const formatDate = formatDateUtil;

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
    const text = generateExportText(enquiry);
    setExportText(text);
    setSelectedEnquiry(enquiry);
    setShowExportDialog(true);
  };

  const generateExportText = (enquiry: Enquiry) => {
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

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const getGoogleMapsRouteUrl = (enquiry: Enquiry) => {
    // Create a directions URL with waypoints
    // Format: https://www.google.com/maps/dir/?api=1&origin=ORIGIN&destination=DESTINATION&waypoints=WAYPOINT

    if (!companyAddress) {
      return null; // Return null if company address is not available
    }

    const origin = encodeURIComponent(companyAddress);
    const waypoint = encodeURIComponent(enquiry.fromAddress);
    const destination = encodeURIComponent(enquiry.toAddress);

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoint}`;
  };

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

  const handleConvertToQuote = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowQuoteForm(true);
  };

  const updateEnquiryStatus = (enquiryId: string) => {
    const updatedEnquiries = enquiries.map(enquiry =>
      enquiry.id === enquiryId
        ? { ...enquiry, status: 'quoted' as const }
        : enquiry
    );

    localStorage.setItem(storageKey, JSON.stringify(updatedEnquiries));
    setEnquiries(updatedEnquiries);

    toast({
      title: "Enquiry status updated",
      description: "The enquiry status has been changed to 'quoted'."
    });
  };

  const handleQuoteFormClose = (quoteCreated: string | boolean = false) => {
    setShowQuoteForm(false);

    if (quoteCreated && selectedEnquiry) {
      updateEnquiryStatus(selectedEnquiry.id);

      if (typeof quoteCreated === 'string' && onQuoteCreated) {
        onQuoteCreated(quoteCreated);
      }
    }

    setSelectedEnquiry(null);
  };

  return (
    <div className="rounded-md border">
      <div className="p-4 border-b">
        <Filter
          value={filterValue}
          onChange={setFilterValue}
          placeholder="Filter by customer name or address..."
        />
      </div>

      <MonthlyGroupedList
        items={filteredEnquiries}
        dateField="createdAt"
        emptyMessage={enquiries.length === 0 ? "No enquiries found" : "No matching enquiries found"}
        renderHeader={(month, count) => (
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium">{month}</span>
              <Badge variant="outline">{count}</Badge>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          </div>
        )}
        renderItem={(enquiry) => (
          <div className="border rounded-md p-4 mb-2 bg-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div>
                <h3 className="text-lg font-medium">{enquiry.customerName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {enquiry.phone}
                    {enquiry.hasWhatsapp && (
                      <div title="Has WhatsApp">
                        <MessageSquare className="h-3 w-3 text-green-500" />
                      </div>
                    )}
                  </div>
                  {enquiry.email && (
                    <span className="hidden md:inline">• {enquiry.email}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(enquiry.status)}>{enquiry.status}</Badge>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConvertToQuote(enquiry)}
                    title="Convert to Quote"
                  >
                    <QuoteIcon className="h-3 w-3 mr-1 text-blue-500" />
                    Quote
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleExport(enquiry)}
                    title="Export to text"
                  >
                    <Share className="h-4 w-4" />
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Move Date</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(enquiry.moveDate)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">From</div>
                {renderAddressWithMapLink(enquiry.fromAddress)}
                <div className="text-xs text-muted-foreground mt-1">
                  {enquiry.fromBedrooms} bedroom{enquiry.fromBedrooms !== 1 ? 's' : ''}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">To</div>
                {renderAddressWithMapLink(enquiry.toAddress)}
              </div>
            </div>

            {companyAddress && (
              <div className="mt-2 flex justify-end">
                <a
                  href={getGoogleMapsRouteUrl(enquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs flex items-center text-primary hover:underline"
                  title="View complete route: Company → From → To"
                >
                  <Route className="h-3 w-3 mr-1" />
                  View complete route on Google Maps
                </a>
              </div>
            )}

            {enquiry.notes && (
              <div className="mt-4 text-sm">
                <div className="text-muted-foreground mb-1">Notes</div>
                <div className="bg-muted p-2 rounded-md">{enquiry.notes}</div>
              </div>
            )}
          </div>
        )}
      />

      {showEditForm && selectedEnquiry && (
        <EnquiryForm
          onClose={() => setShowEditForm(false)}
          initialData={selectedEnquiry}
        />
      )}

      {showQuoteForm && selectedEnquiry && (
        <QuoteForm
          onClose={handleQuoteFormClose}
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
