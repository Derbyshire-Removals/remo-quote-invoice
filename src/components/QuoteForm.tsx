import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuoteFormProps {
  onClose: () => void;
}

export default function QuoteForm({ onClose }: QuoteFormProps) {
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
            <Label htmlFor="toAddress">To Address</Label>
            <Textarea id="toAddress" placeholder="Enter delivery address" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Requirements</Label>
            <Textarea id="notes" placeholder="Enter any special requirements or notes" />
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