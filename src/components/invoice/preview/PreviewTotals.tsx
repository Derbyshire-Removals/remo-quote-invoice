
import { calculateSubtotal, calculateVAT } from "@/utils/printUtils";
import { InvoiceItem } from "@/types/invoice";

interface PreviewTotalsProps {
  items?: InvoiceItem[];
  vatRate?: number;
}

export function PreviewTotals({ items = [], vatRate = 20 }: PreviewTotalsProps) {
  const subtotal = calculateSubtotal(items);
  const vatAmount = calculateVAT(subtotal, vatRate);
  const totalAmount = subtotal + vatAmount;

  return (
    <div className="mt-12 flex flex-col items-end space-y-2">
      <div className="flex gap-8">
        <span className="text-gray-500">Subtotal:</span>
        <span className="w-[150px] text-right">£{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex gap-8">
        <span className="text-gray-500">VAT ({vatRate}%):</span>
        <span className="w-[150px] text-right">£{vatAmount.toFixed(2)}</span>
      </div>
      <div className="flex gap-8 font-semibold">
        <span className="text-gray-500">Total:</span>
        <span className="w-[150px] text-right">£{totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}
