
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EmailDialogProps {
  open: boolean;
  onClose: () => void;
  document: any;
}

export default function EmailDialog({ open, onClose, document }: EmailDialogProps) {
  const handleSend = () => {
    // TODO: Implement email sending functionality
    toast.success("Email sent successfully!");
    onClose();
  };

  if (!document) return null;

  // Infer document type from the document number format (QT for quotes, INV for invoices)
  const documentType = document.number?.startsWith('QT') ? 'quote' : 'invoice';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send {documentType} {document.number}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="email" placeholder="recipient@example.com" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              defaultValue={`Your ${documentType} ${document.number} from Removal Company`} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              rows={4}
              defaultValue={`Dear ${document.customer},\n\nPlease find attached your ${documentType} ${document.number}.\n\nBest regards,\nRemoval Company`}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSend}>Send Email</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
