
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FilterProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function Filter({ placeholder = "Filter by name or address...", value, onChange }: FilterProps) {
  return (
    <div className="relative mb-4 w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 w-full"
      />
    </div>
  );
}
