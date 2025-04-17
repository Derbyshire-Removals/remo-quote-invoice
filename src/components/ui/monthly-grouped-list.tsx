import { ReactNode, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { groupByMonth, sortMonthKeys, getCurrentMonth } from "@/utils/dateUtils";

interface MonthlyGroupedListProps<T> {
  items: T[];
  dateField?: string;
  renderItem: (item: T) => ReactNode;
  renderHeader?: (month: string, count: number) => ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function MonthlyGroupedList<T extends { [key: string]: any }>({
  items,
  dateField = 'createdAt',
  renderItem,
  renderHeader,
  emptyMessage = "No items found",
  className
}: MonthlyGroupedListProps<T>) {
  // Group items by month
  const groupedItems = groupByMonth(items, dateField);
  
  // Get sorted month keys (newest first)
  const monthKeys = sortMonthKeys(Object.keys(groupedItems));
  
  // Get current month for default expansion
  const currentMonth = getCurrentMonth();
  
  // Set default value to current month if it exists in the data
  const defaultValue = monthKeys.includes(currentMonth) ? [currentMonth] : 
                       monthKeys.length > 0 ? [monthKeys[0]] : [];
  
  // State for tracking which months are expanded
  const [value, setValue] = useState<string[]>(defaultValue);

  // If there are no items, show the empty message
  if (items.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <Accordion 
      type="multiple" 
      value={value} 
      onValueChange={setValue}
      className={className}
    >
      {monthKeys.map(month => (
        <AccordionItem key={month} value={month}>
          <AccordionTrigger className="px-4 hover:no-underline">
            {renderHeader ? (
              renderHeader(month, groupedItems[month].length)
            ) : (
              <div className="flex justify-between w-full">
                <span>{month}</span>
                <span className="text-muted-foreground">
                  {groupedItems[month].length} item{groupedItems[month].length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1">
              {groupedItems[month].map((item, index) => (
                <div key={index}>
                  {renderItem(item)}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
