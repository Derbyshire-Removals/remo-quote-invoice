
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface QuoteItem {
  description: string;
  amount: string;
}

interface QuoteFormProps {
  onClose: () => void;
}

export default function QuoteForm({ onClose }: QuoteFormProps) {
  const defaultMessage = "Following our recent conversation I have the pleasure in quoting for the removal of furniture/goods from the above address and delivery to #DESTINATION_ADDRESS.";
  const [items, setItems] = useState<QuoteItem[]>([{ description: "", amount: "" }]);

  const handleItemChange = (index: number, field: keyof QuoteItem, value: string) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { description: "", amount: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Quote Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr,auto,auto] gap-4 items-start">
                <div className="space-y-2">
                  <Label htmlFor={`item-${index}-description`}>Description</Label>
                  <Textarea 
                    id={`item-${index}-description`}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Enter item description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`item-${index}-amount`}>Amount</Label>
                  <Input
                    id={`item-${index}-amount`}
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                    className="w-32"
                    placeholder="0.00"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mt-8"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex justify-end text-lg font-semibold">
              <span>Total: £{calculateTotal().toFixed(2)}</span>
            </div>
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
