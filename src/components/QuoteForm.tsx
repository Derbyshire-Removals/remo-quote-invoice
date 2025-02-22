
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuoteFormProps {
  onClose: () => void;
}

export default function QuoteForm({ onClose }: QuoteFormProps) {
  const defaultMessage = "Following our recent conversation I have the pleasure in quoting for the removal of furniture/goods from the above address and delivery to #DESTINATION_ADDRESS.";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" placeholder="Enter customer name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="customer@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="Enter phone number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moveDate">Moving Date</Label>
              <Input id="moveDate" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromAddress">From Address</Label>
            <Textarea id="fromAddress" placeholder="Enter pickup address" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quoteMessage">Quote Message</Label>
            <Textarea 
              id="quoteMessage" 
              defaultValue={defaultMessage}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Quote</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
