
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface QuoteItem {
  description: string;
  amount: string;
}

interface Quote {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  moveDate: string;
  fromAddress: string;
  items: QuoteItem[];
  message: string;
  total: number;
  createdAt: string;
}

interface QuoteFormProps {
  onClose: () => void;
}

export default function QuoteForm({ onClose }: QuoteFormProps) {
  const { toast } = useToast();
  const defaultMessage = "Following our recent conversation I have the pleasure in quoting for the removal of furniture/goods from the above address and delivery to #DESTINATION_ADDRESS.";
  const [items, setItems] = useState<QuoteItem[]>([{ description: "Removal costs incl insurance", amount: "" }]);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    moveDate: "",
    fromAddress: "",
    message: defaultMessage
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newQuote: Quote = {
      id: crypto.randomUUID(),
      ...formData,
      items,
      total: calculateTotal(),
      createdAt: new Date().toISOString()
    };

    // Get existing quotes from localStorage
    const existingQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    
    // Add new quote
    const updatedQuotes = [...existingQuotes, newQuote];
    
    // Save to localStorage
    localStorage.setItem('quotes', JSON.stringify(updatedQuotes));

    // Show success message
    toast({
      title: "Quote Created",
      description: "The quote has been successfully created.",
    });

    // Close the form
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input 
                id="customerName" 
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="customer@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moveDate">Moving Date</Label>
              <Input 
                id="moveDate" 
                type="date"
                value={formData.moveDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromAddress">From Address</Label>
            <Textarea 
              id="fromAddress" 
              placeholder="Enter pickup address"
              value={formData.fromAddress}
              onChange={handleInputChange}
              required
            />
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
                    required
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
                    required
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
            <Label htmlFor="message">Quote Message</Label>
            <Textarea 
              id="message" 
              value={formData.message}
              onChange={handleInputChange}
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Quote</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
