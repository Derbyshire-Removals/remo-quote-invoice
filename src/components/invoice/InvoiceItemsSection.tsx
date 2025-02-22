
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { InvoiceItem } from "@/types/invoice";

interface InvoiceItemsSectionProps {
  items: InvoiceItem[];
  onItemChange: (index: number, field: keyof InvoiceItem, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  subtotal: number;
  vatRate: string;
  vatAmount: number;
  totalAmount: number;
}

export function InvoiceItemsSection({
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
  subtotal,
  vatRate,
  vatAmount,
  totalAmount
}: InvoiceItemsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Invoice Items</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
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
              onChange={(e) => onItemChange(index, "description", e.target.value)}
              placeholder="Enter item description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`item-${index}-amount`}>Amount</Label>
            <Input
              id={`item-${index}-amount`}
              type="number"
              value={item.amount}
              onChange={(e) => onItemChange(index, "amount", e.target.value)}
              className="w-32"
              placeholder="0.00"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="mt-8"
            onClick={() => onRemoveItem(index)}
            disabled={items.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex flex-col items-end space-y-2 text-lg">
        <div className="flex justify-between w-64">
          <span>Subtotal:</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-64">
          <span>VAT ({vatRate}%):</span>
          <span>£{vatAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-64 font-semibold">
          <span>Total:</span>
          <span>£{totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
