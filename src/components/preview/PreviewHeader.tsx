
import { CompanySettings } from "@/types/company";
import { formatDate } from "./print-utils";

interface PreviewHeaderProps {
  document: any;
  companySettings?: CompanySettings;
}

export function PreviewHeader({ document, companySettings }: PreviewHeaderProps) {
  return (
    <div className="grid grid-cols-2 gap-8 mb-8">
      <div>
        {companySettings?.logoUrl && <img src={companySettings.logoUrl} alt="Company Logo" className="max-w-[175px] mb-4" />}
        
        <div className="space-y-1">
          {companySettings?.name && <p className="font-bold text-gray-900">{companySettings.name}</p>}
          {companySettings?.address && <p className="whitespace-pre-line text-gray-600">{companySettings.address}</p>}
          {companySettings?.companyNumber && <p className="text-gray-600">Company No: {companySettings.companyNumber}</p>}
          {companySettings?.registrationNumber && <p className="text-gray-600">VAT: {companySettings.registrationNumber}</p>}
        </div>
        
        <div className="pt-6">
          <p className="text-sm text-gray-500 mb-2">Bill To:</p>
          <p className="font-semibold text-gray-900 mb-1">{document.customer}</p>
          {document.address && <p className="whitespace-pre-line text-gray-600">{document.address}</p>}
        </div>
      </div>

      <div>
        <div className="text-right">
          <h1 className="text-4xl font-bold text-gray-500 mb-1 uppercase">
            {document.type}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-500">
            #{document.number}
          </h2>

          <div className="space-y-3 mt-8 pt-20">
            <div className="flex justify-end items-center gap-4">
              <span className="text-sm font-medium text-gray-500">Date:</span>
              <span className="text-sm text-gray-900">{formatDate(document.invoiceDate || document.date)}</span>
            </div>
            
            {document.dueDate && (
              <div className="flex justify-end items-center gap-4">
                <span className="text-sm font-medium text-gray-500">Due Date:</span>
                <span className="text-sm text-gray-900">{formatDate(document.dueDate)}</span>
              </div>
            )}
            
            <div className="inline-block mt-4 bg-gray-50 rounded-lg px-6 py-4">
              <div className="flex justify-end items-center gap-4">
                <span className="text-sm font-medium text-gray-500">Balance Due:</span>
                <span className="text-lg font-semibold text-gray-900">{document.amount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
