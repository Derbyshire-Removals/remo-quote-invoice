
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceItem } from "@/types/invoice";

interface PreviewItemsProps {
  items?: InvoiceItem[];
}

export function PreviewItems({ items = [] }: PreviewItemsProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="w-[150px] text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.description}</TableCell>
            <TableCell className="text-right">£{parseFloat(item.amount).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
