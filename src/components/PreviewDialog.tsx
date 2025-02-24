
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { PreviewHeader } from "./preview/PreviewHeader";
import { PreviewTable } from "./preview/PreviewTable";
import { PreviewTotals } from "./preview/PreviewTotals";
import { PreviewNotesAndTerms } from "./preview/PreviewNotesAndTerms";
import { handlePrint } from "./preview/print-utils";
import { CompanySettings } from "@/types/company";

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  document: any;
  companySettings?: CompanySettings;
}

export default function PreviewDialog({
  open,
  onClose,
  document,
  companySettings
}: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] w-full max-h-[85vh] p-8 bg-white overflow-y-auto">
        <div className="w-full relative rounded-lg p-8">
          <div className="flex justify-end mb-6">
            <Button 
              onClick={() => handlePrint(document, companySettings)} 
              className="bg-gray-900 hover:bg-gray-800"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>

          <PreviewHeader document={document} companySettings={companySettings} />
          
          <div className="mt-8">
            <PreviewTable items={document.items || []} />
            <PreviewTotals items={document.items || []} />
            <PreviewNotesAndTerms notes={document.notes} terms={document.terms} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
