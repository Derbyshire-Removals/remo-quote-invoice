
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { CompanySettings, PrintableDocument } from "@/types/invoice";
import { openPrintWindow } from "@/utils/printUtils";
import { PreviewHeader } from "@/components/invoice/preview/PreviewHeader";
import { PreviewItems } from "@/components/invoice/preview/PreviewItems";
import { PreviewTotals } from "@/components/invoice/preview/PreviewTotals";
import { PreviewFooter } from "@/components/invoice/preview/PreviewFooter";
import { useEffect, useState } from "react";

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  document: PrintableDocument;
  companySettings?: CompanySettings;
}

export default function PreviewDialog({
  open,
  onClose,
  document,
  companySettings
}: PreviewDialogProps) {
  const [settings, setSettings] = useState<CompanySettings | undefined>(companySettings);

  // Ensure we have the latest company settings
  useEffect(() => {
    if (!companySettings) {
      const savedSettings = localStorage.getItem("companySettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } else {
      setSettings(companySettings);
    }
  }, [companySettings]);

  const handlePrint = () => {
    // Log to confirm we're passing company settings
    console.log("Printing with company settings:", settings);
    openPrintWindow(document, settings);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] w-full max-h-[85vh] p-8 bg-white overflow-y-auto">
        <DialogTitle className="sr-only">
          {document.type} Preview
        </DialogTitle>
        <DialogDescription className="sr-only">
          Preview your {document.type.toLowerCase()} before printing
        </DialogDescription>
        
        <div className="w-full relative rounded-lg p-8">
          <div className="flex justify-end mb-6">
            <Button onClick={handlePrint} className="bg-gray-900 hover:bg-gray-800">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>

          <PreviewHeader 
            document={document} 
            companySettings={settings} 
          />
          
          <div className="mt-8">
            <PreviewItems items={document.items} />
            
            <PreviewTotals items={document.items} />
            
            <PreviewFooter 
              notes={document.notes} 
              terms={document.terms} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
