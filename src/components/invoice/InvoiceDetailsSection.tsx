
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvoiceDetailsSectionProps {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

export function InvoiceDetailsSection({ 
  invoiceNumber, 
  invoiceDate, 
  dueDate, 
  onChange,
  readOnly
}: InvoiceDetailsSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="invoiceNumber">Invoice Number</Label>
        <Input 
          id="invoiceNumber" 
          placeholder="INV001"
          value={invoiceNumber}
          onChange={onChange}
          readOnly={readOnly}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="invoiceDate">Invoice Date</Label>
        <Input 
          id="invoiceDate" 
          type="date"
          value={invoiceDate}
          onChange={onChange}
          readOnly={readOnly}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input 
          id="dueDate" 
          type="date"
          value={dueDate}
          onChange={onChange}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
