
interface PreviewNotesAndTermsProps {
  notes?: string;
  terms?: string;
}

export function PreviewNotesAndTerms({ notes, terms }: PreviewNotesAndTermsProps) {
  return (
    <div className="mt-12 space-y-6">
      <div>
        <p className="text-[#64748b]">Notes:</p>
        <p className="mt-2 text-gray-900 whitespace-pre-line">
          {notes || 'No notes provided'}
        </p>
      </div>
      <div>
        <p className="text-[#64748b]">Terms:</p>
        <p className="mt-2 text-gray-900 whitespace-pre-line">
          {terms || 'No terms provided'}
        </p>
      </div>
    </div>
  );
}
