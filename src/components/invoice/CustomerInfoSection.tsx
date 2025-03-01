
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CustomerInfoSectionProps {
  customerName: string;
  email: string;
  address: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readOnly?: boolean;
}

export function CustomerInfoSection({ customerName, email, address, onChange, readOnly }: CustomerInfoSectionProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input 
            id="customerName" 
            placeholder="Enter customer name"
            value={customerName}
            onChange={onChange}
            readOnly={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="customer@example.com"
            value={email}
            onChange={onChange}
            readOnly={readOnly}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Billing Address</Label>
        <Textarea 
          id="address" 
          placeholder="Enter billing address"
          value={address}
          onChange={onChange}
          readOnly={readOnly}
        />
      </div>
    </>
  );
}
