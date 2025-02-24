
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PreviewTableProps {
  items: any[];
}

export function PreviewTable({ items }: PreviewTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="w-[150px] text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items?.map((item: any, index: number) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.description}</TableCell>
            <TableCell className="text-right">£{parseFloat(item.amount).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
