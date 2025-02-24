
import { calculateSubtotal } from "./print-utils";

interface PreviewTotalsProps {
  items: any[];
}

export function PreviewTotals({ items }: PreviewTotalsProps) {
  return (
    <div className="mt-12 flex flex-col items-end space-y-2">
      <div className="flex gap-8">
        <span className="text-gray-500">Subtotal:</span>
        <span className="w-[150px] text-right">£{calculateSubtotal(items).toFixed(2)}</span>
      </div>
      <div className="flex gap-8">
        <span className="text-gray-500">VAT (20%):</span>
        <span className="w-[150px] text-right">£{(calculateSubtotal(items) * 0.2).toFixed(2)}</span>
      </div>
      <div className="flex gap-8 font-semibold">
        <span className="text-gray-500">Total:</span>
        <span className="w-[150px] text-right">£{(calculateSubtotal(items) * 1.2).toFixed(2)}</span>
      </div>
    </div>
  );
}
