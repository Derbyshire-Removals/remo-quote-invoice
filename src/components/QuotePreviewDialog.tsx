import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

interface QuotePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  document: any;
  companySettings?: {
    name?: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    registrationNumber?: string;
    companyNumber?: string;
  };
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

export default function QuotePreviewDialog({
  open,
  onClose,
  document,
  companySettings
}: QuotePreviewDialogProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.title = `${document.customerName}'s Quote`;
    
    // Calculate the total (without VAT)
    const calculateSubtotal = (items: any[]) => {
      return items.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);
    };
    
    const subtotal = calculateSubtotal(document.items || []);
    const vat = subtotal * 0.2; // 20% VAT
    const total = subtotal + vat;
    
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.customerName}'s Quote</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #1A1F2C;
              font-size: 14px;
              background-color: #fff;
            }
            .quote-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3rem;
            }
            .company-info {
              max-width: 50%;
            }
            .quote-info {
              text-align: right;
              width: 45%;
            }
            .logo {
              max-width: 175px;
              margin-bottom: 1rem;
            }
            .quote-title {
              font-size: 2.5rem;
              color: #022f5c;
              font-weight: 700;
              margin-bottom: 0.5rem;
            }
            .services-list {
              margin-top: 4rem;
              list-style: none;
              padding: 0;
              text-align: right;
              color: #022f5c;
              font-weight: 600;
              font-family: Impact, sans-serif;
            }
            .services-list li {
              margin-bottom: 0.5rem;
            }
            .items-list {
              margin: 2rem 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              padding: 0.5rem 0;
            }
            .item-description {
              flex: 1;
            }
            .item-amount {
              text-align: right;
              margin-left: 2rem;
            }
            .customer-section {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 2rem;
            }
            .customer-details {
              max-width: 50%;
            }
            .trusted-trader-logo {
              width: 150px;
            }
            .customer-name {
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .customer-address {
              white-space: pre-line;
              color: #4A5568;
              margin-bottom: 2rem;
              line-height: 1.5;
            }
            .greeting {
              margin-bottom: 2rem;
            }
            .quote-message {
              margin-bottom: 2rem;
              white-space: pre-line;
            }
            .footer {
              margin-top: 4rem;
            }
            .signature {
              margin-bottom: 2rem;
            }
            .company-details {
              text-align: center;
              color: #718096;
              font-size: 0.875rem;
            }
            @media print {
              .no-print { display: none; }
              body { margin: 0; padding: 20px; }
            }
            .terms-and-conditions {
              page-break-before: always;
              margin-top: 40px;
            }
            .terms-and-conditions h2 {
              color: #022f5c;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .terms-and-conditions h3 {
              color: #022f5c;
              font-size: 18px;
              margin: 15px 0;
            }
            .terms-and-conditions p {
              margin: 10px 0;
            }
            .terms-and-conditions ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .terms-and-conditions ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            .totals-section {
              margin-top: 1rem;
              margin-bottom: 2rem;
              width: 100%;
              display: flex;
              justify-content: flex-end;
            }
            .totals-table {
              width: 50%;
              border-collapse: collapse;
            }
            .totals-row {
              text-align: right;
            }
            .totals-label {
              padding: 8px;
              color: #64748b;
              font-weight: 500;
              text-align: left;
            }
            .totals-value {
              padding: 8px;
              text-align: right;
              font-weight: 400;
            }
            .totals-row.total {
              font-weight: 600;
              font-size: 16px;
            }
            .totals-row.total .totals-label,
            .totals-row.total .totals-value {
              padding-top: 12px;
              border-top: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="quote-header">
            <div class="company-info">
              ${companySettings?.logoUrl ? `<img src="${companySettings.logoUrl}" alt="Company Logo" class="logo" />` : ''}
              ${companySettings?.name ? `<div style="font-weight: 600;">${companySettings.name}</div>` : ''}
              ${companySettings?.address ? `<div style="white-space: pre-line;">${companySettings.address}</div>` : ''}
              ${companySettings?.phone ? `<div style="color: #4A5568;">${companySettings.phone}</div>` : ''}
            </div>
            <div class="quote-info">
              <div class="quote-title">QUOTE</div>
              <div style="color: #8E9196;">
                <div>Date: ${formatDate(document.createdAt)}</div>
              </div>
              <ul class="services-list">
                <li>Home/Office Removals</li>
                <li>Local/Long Distance</li>
                <li>Full Packing Available</li>
                <li>Storage Available</li>
                <li>Fully Insured</li>
              </ul>
            </div>
          </div>

          <div class="customer-section">
            <div class="customer-details">
              <div class="customer-name">${document.customerName}</div>
              <div class="customer-address">${document.fromAddress}</div>
            </div>
            <img src="https://derbyshireremovals.com/images/derbyshire-trusted-trader-logo.gif" alt="Derbyshire Trusted Trader" class="trusted-trader-logo" />
          </div>

          <div class="greeting">Dear ${document.customerName},</div>

          <div class="quote-message">${document.message || 'No message provided'}</div>

          <div class="items-list">
            ${document.items?.map((item: any) => `
              <div class="item">
                <span class="item-description">${item.description}</span>
                <span class="item-amount">£${parseFloat(item.amount).toFixed(2)} + VAT</span>
              </div>
            `).join('') || ''}
          </div>

          ${document.items && document.items.length > 1 ? `
          <div class="totals-section">
            <table class="totals-table">
              <tr class="totals-row">
                <td class="totals-label">Subtotal:</td>
                <td class="totals-value">£${subtotal.toFixed(2)}</td>
              </tr>
              <tr class="totals-row">
                <td class="totals-label">VAT (20%):</td>
                <td class="totals-value">£${vat.toFixed(2)}</td>
              </tr>
              <tr class="totals-row total">
                <td class="totals-label">Total:</td>
                <td class="totals-value">£${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          ` : ''}

          <div class="footer">
            <div class="signature">
              <p>If you require any other information please do not hesitate to contact us.</p>
              <p>Yours faithfully,</p>
              <p>${document.createdBy || companySettings?.name || 'Derbyshire Removals'}</p>
            </div>

            <div class="company-details">
              <p>Derbyshire Removals is the trading name used by Nexus Deliveries Ltd</p>
              <p>Company no: ${companySettings?.companyNumber || '#######'} VAT: ${companySettings?.registrationNumber || '#########'}</p>
            </div>
          </div>

          <div class="terms-and-conditions">
            <h2><strong>Derbyshire Removals</strong></h2>

            <h3>1. CONDITIONS OF BUSINESS</h3>
            <p>We handle, remove and care for your property only under these Conditions of Business. In these conditions: we, our and us refer to Derbyshire Removals: you means the customer or the customer's agents.</p>

            <p><strong>1. ESTIMATES</strong></p>
            <p><em>We may amend our estimate and you agree to pay any extra amount if:</em></p>
            <p>a. extra work is done or extra goods are handled or dealt with; or</p>
            <p>b. goods are to be collected from or delivered to premises above a second floor unless previously agreed in writing; or</p>
            <p>c. during the work we supply extra services or work on Saturday, Sunday or general holiday, at your request; or</p>
            <p>d. when we collect or deliver the goods the work cannot be done conveniently by means of adequate staircases, lifts, doorways, or there is no suitable road and approach for our vehicle unless you have given adequate notice in writing; or</p>
            <p>e. at our discretion we have to use window or other tackle. The use of such equipment shall be at your risk and expense; or</p>
            <p>f. costs are altered by any circumstances or delay beyond our control; or</p>
            <p>g. you do not accept the estimate within 21 days.</p>

            <p><strong>2. WORK NOT INCLUDED</strong></p>
            <p>Unless we have agreed differently in writing our estimate does not include taking down or putting up unit furniture, fitments and fixtures, disconnecting and reconnecting appliances and fittings, laying fitted floor coverings, moving deep freezers loaded with goods or moving night storage heaters not dismantled or any other items we specifically exclude in writing. If any of our employees does such work at your request without our prior agreement we shall not be liable for any loss or damage occurring whatever the cause. But the rest of these conditions shall still apply to such work.</p>

            <p><strong>3. PAYMENT</strong></p>
            <p>Unless we have agreed differently in writing, our charges shall be payable; Four weeks in advance for rental and other charges for goods stored.</p>

            <p><strong>4. DECLARATION OF OWNERSHIP</strong></p>
            <p>By signing this Contract you declare that the property to be handled is either your own property free of any legal charge or burden on it or that you have the complete authority of anyone owning or having a legal interest in it to enter into this contract on their behalf. You agree to cover us fully against any claims, charges, costs and demands made against us arising from any claim to the goods by anyone else.</p>

            <p><strong>5. YOUR RESPONSIBILITIES</strong></p>
            <p>You agree:</p>
            <p>a. to be present or represented during the removal to ensure that nothing that should be removed is left behind and that no goods are taken away in error, or to provide in advance a list of all items to be removed.</p>
            <p>b. to arrange proper protection for goods left in unoccupied or unattended premises or where other people such as tenants or workmen are present. If such protection is not properly arranged we shall not be liable for damage or loss however caused.</p>
            <p>c. not to offer for removal or storage, jewellery, watches, trinkets, precious stones, money, deeds, securities, stamps and coins (or similar collections of any kind) or livestock.</p>
            <p>d. not to offer for removal, packing or warehousing any article or substance which is dangerous, damaging or explosive, nor to offer for warehousing any article or substance including food or anything likely to encourage vermin or other pests or likely to cause infection. You will cover us fully against any claims made and for any loss or damage that we or someone else may suffer through the presence of any such article or substance among goods. If such article or substance is discovered we may remove, self destroy or other dispose of it.</p>
            <p>e. to pay or repay to us any parking or meter suspension charges we may have to pay during any work for you.</p>
            <p>f. pay any toll/road/bridge charges that are incurred during the removal.</p>

            <p><strong>6 CANCELLING THE REMOVAL</strong></p>
            <p>If you cancel the work we shall be entitled to make the following charges:</p>
            <p>a. for cancellation or postponement 11 working days or more before the start of the work – no charge.</p>
            <p>b. 8 to 10 working days – 25% of the removal charge.</p>
            <p>c. 7 to 4 working days  – 50% of the removal charge.</p>

            <p>D 3 working days or less – 100% or the removal charge</p>

            <p><strong>7. ROUTE AND METHOD</strong></p>
            <p>You agree that we may:</p>
            <p>a. at any time interchange the goods between vehicles and warehouses and may also decide what route or by what means the goods shall be carried or stored</p>
            <p>b. enter into any contract with any other business to carry out the whole or any part of this contract or to cause any of the property to be stored by any other business. All these conditions shall apply to such a sub-contractor.</p>

            <p><strong>8. LIMITS OF OUR LIABILITY</strong></p>
            <p>If we are liable for any loss, failure to produce or damages we will pay only:</p>
            <p>a. the cost of repairing or replacing the damaged or missing article, or up to £20 for any one article, suite, service or complete case or package or other container and their contents whichever is the smaller amount. We shall choose whether to repair or replace any damaged or missing article if we repair no claim can be made against us for depreciation.</p>

            <p><strong>9. OTHER LIABILITIES</strong></p>
            <p>We shall not be liable at all for any loss, failure to produce or damage however caused.</p>
            <p>a. by fire save that should we receive your written instructions and a declaration value three clear days before the removal starts we will arrange insurance against the risk in your name and for your account;</p>
            <p>b. by war, war invasion, acts of foreign enemies, hostilities (whether war is declared or not), civil war, rebellion, insurrection or military coup, wear and tear or graded deterioration, leakage or deficiency of articles of a perishable or leaky nature, acts of God, consequential loss or circumstances beyond our control;</p>
            <p>c. by vermin, moth or other infestations;</p>
            <p>d. arising from any process of cleaning, repairing or restoring of the goods unless such work was carried out by us in which case our liability is limited as in clause 8;</p>
            <p>e. to any articles in wardrobes or drawers or in ay package, bundle, case or any other container not both packed and unpacked by our employees. If goods are only packed and dispatched by us no claim shall be made against us after the goods leave our hands for any loss or damage however caused.</p>
            <p>f. for jewellery, watches, trinkets, precious stones, money, deeds, securities, stamps, coins or similar collections of any kind, nor livestock, plants or animals;</p>
            <p>g. if goods are removed from or delivered to unattended or unoccupied premises or where third parties present (see clause 5b);</p>
            <p>h. if goods are proved to be brittle or to have any inherent defect or to suffer from any inherent vice.</p>

            <p><strong>10. DEEP FREEZE</strong></p>
            <p>We shall not be liable for:</p>
            <p>a. damage to any deep freeze in which goods are packed however caused</p>
            <p>b. loss or damage to the contents of any deep freezer however caused</p>
            <p>c. for death, injury, sickness or disease to any person arising from the removal or warehousing of any deep freezer in which goods are packed</p>
            <p>d. If any goods are moved/removed at your request by yourself or third parties.</p>

            <p><strong>11. SELF ASSEMBLY KIT FURNITURE</strong></p>
            <p>We shall not be liable for any damage to or reduction in quality of any furniture which is unsuitable for removal or carriage (particularly system furniture sold in the form of dismantled kits). Having dismantled such furniture at your instruction, we will not be responsible for the quality or state of that furniture upon re-assembling either by us or by you not for any damage to the furniture during dismantling or re-assembling.</p>

            <p><strong>12. TIME LIMITS FOR OTHER CLAIMS</strong></p>
            <p>You must notify us in writing of loss or damage within the time stated below, otherwise we will not be liable, the time limits are essential;</p>
            <p>a. for goods removed from our warehouse by anyone except us – at the time the goods are removed</p>
            <p>b. in other cases for goods alleged to be damaged – within 7 days after the delivery of the goods</p>
            <p>c. in the case of goods alleged to be lost or which we fail to produce – within 7 days after the goods should normally have been delivered alone or with other goods</p>

            <p><strong>13. PAYMENT OF OTHER CONTRACTORS</strong></p>
            <p>We must pay all charges claimed by any previous removal/storage contractor, carrier or freight forwarder and any other charges, duties or levies raised upon the goods. You agree to repay to us such charges, duties or levies.</p>

            <p><strong>14. IF OUR CHARGES ARE NOT PAID</strong></p>
            <p>If our charges are not paid (see clause 3) we may take all or any part of the goods in our hands to store or keep them in store and we shall be entitled to charge for warehousing them and for any expenses in connection with taking them to store and removal from store. All these conditions shall continue to apply to them.</p>

            <p><strong>15. LIEN</strong></p>
            <p>("Lien" means the right to keep possession for someone else property until a debt is paid)</p>
            <p>a. General Lien</p>
            <p>We shall have a general lien upon all goods in our possession for all money you owe us or for liabilities incurred by us and for payments we make on your behalf. If part of the goods have been delivered, removed, dispatched or sold, the general lien shall apply to any goods that remain in our possession.</p>
            <p>We shall be entitled to charge warehouse rent and all other expenses while we maintain a lien on the goods. All these conditions shall continue to apply to them.</p>
            <p>b. Particular Lien</p>
            <p>We shall have a particular lien until money due on those goods is paid and the same condition as in 15a shall apply.</p>

            <p><strong>16. END OF AGREEMENT/POWER OF SALE</strong></p>
            <p>We may at any time give you 30 days written notice requiring you to remove all goods from our care, custody or control and to pay all debts then due. If you do not remove the goods we shall have the power to sell or otherwise dispose of all or part of them without further notice. We may put the proceeds of the sale towards payment of all debts and any expense incurred by the sale or disposal.</p>
            <p>Any surplus will be paid to you without interest.</p>

            <p><strong>17. STORAGE ADDITIONAL CONDITIONS</strong></p>
            <p>a. Registered Address: you must provide an address to which all communications are to be directed and shall notify us in writing of any change. All communications to you will be treated as having been duly served and received 3 days after posting.</p>
            <p>*if sent by post to the registered address from which the last communication was received from you or</p>
            <p>*if there is no registered address, by publication in a public newspaper circulating in the area from which the goods were removed</p>
            <p>b. Inventory, if we provide an inventory or receipt for the goods it need not state the contents of any article, suite, case, bundle, package or other container. The inventory or receipt shall be final except for any specific item which you point out in writing within 7 days of receiving the inventory. No claim may be made in respect of any item not described in the inventory or receipt</p>
            <p>c. Revision of your storage charges. Storage charges are subject to revision each year and you agree to pay any increased charge which may result from the revision.</p>
            <p>d. Termination by us. If payments due are not in arrears we may only end this agreement by giving 30 days notice.</p>
            <p>e. Termination by you. You must give at least 14 clear working days notice in writing. If we are able to agree to release the goods earlier, the storage charges may still be payable to the date when the notice would have ended.</p>
            <p>f. The minimum period for storage shall be one week</p>
            <p>g. Storage Insurance covers all risks up to the value insured excluding jewellery, watches, trinkets, precious stones, money, deeds, securities, stamps and coins or similar collections of any kind of barometers and livestock.</p>

            <p><strong>18. THIS AGREEMENT</strong></p>
            <p>This agreement is treated as having been made at our office stated on this form. If it is in the United Kingdom or The Republic of Ireland, this agreement will be governed by English Law. None of our servants or agents has authority to alter or vary these conditions in any way.</p>
          </div>

          <div class="no-print">
            <button onclick="window.print()">Print Quote</button>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Calculate totals for the preview display
  const calculateSubtotal = (items: any[] = []) => {
    return items.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);
  };
  
  const subtotal = calculateSubtotal(document.items);
  const vat = subtotal * 0.2; // 20% VAT
  const total = subtotal + vat;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[210mm] w-full max-h-[85vh] p-8 bg-white overflow-y-auto">
        <div className="w-full relative">
          <div className="flex justify-end mb-4">
            <Button onClick={handlePrint} variant="outline" className="bg-black text-white hover:bg-black/90">
              <Printer className="mr-2" />
              Print Quote
            </Button>
          </div>
          <div className="flex justify-between mb-12">
            <div className="max-w-[50%]">
              {companySettings?.logoUrl && <img src={companySettings.logoUrl} alt="Company Logo" className="max-w-[175px] mb-4" />}
              <div className="space-y-1">
                {companySettings?.name && <p className="font-semibold">{companySettings.name}</p>}
                {companySettings?.address && <p className="text-gray-600 whitespace-pre-line">{companySettings.address}</p>}
                {companySettings?.phone && <p className="text-gray-600">{companySettings.phone}</p>}
              </div>
            </div>
            <div className="text-right w-[45%]">
              <h1 className="text-4xl font-bold mb-1" style={{color: '#022f5c'}}>QUOTE</h1>
              <div className="text-gray-500">
                <p>Date: {formatDate(document.createdAt)}</p>
              </div>
              <ul className="mt-16 space-y-2 list-none font-semibold" style={{color: '#022f5c', fontFamily: 'Impact, sans-serif'}}>
                <li>Home/Office Removals</li>
                <li>Local/Long Distance</li>
                <li>Full Packing Available</li>
                <li>Storage Available</li>
                <li>Fully Insured</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-start mb-8">
            <div className="max-w-[50%]">
              <p className="font-semibold mb-1">{document.customerName}</p>
              <p className="text-gray-600 whitespace-pre-line">{document.fromAddress}</p>
            </div>
            <img 
              src="https://derbyshireremovals.com/images/derbyshire-trusted-trader-logo.gif" 
              alt="Derbyshire Trusted Trader" 
              className="w-[150px]"
            />
          </div>

          <div className="mb-8">
            <p className="mb-8">Dear {document.customerName},</p>
            
            <div className="whitespace-pre-line mb-8">{document.message || 'No message provided'}</div>

            <div className="space-y-2 mb-8">
              {document.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{item.description}</span>
                  <span className="ml-8">£{parseFloat(item.amount).toFixed(2)} + VAT</span>
                </div>
              ))}
            </div>

            {document.items && document.items.length > 1 && (
              <div className="flex justify-end mb-8">
                <table className="w-1/2">
                  <tbody>
                    <tr>
                      <td className="text-gray-500 py-1 text-right pr-8">Subtotal:</td>
                      <td className="text-right py-1">£{subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="text-gray-500 py-1 text-right pr-8">VAT (20%):</td>
                      <td className="text-right py-1">£{vat.toFixed(2)}</td>
                    </tr>
                    <tr className="font-semibold">
                      <td className="text-gray-500 py-1 text-right pr-8 border-t">Total:</td>
                      <td className="text-right py-1 border-t">£{total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="space-y-4 mb-16">
              <p>If you require any other information please do not hesitate to contact us.</p>
              <p>Yours faithfully,</p>
              <p>{document.createdBy || companySettings?.name || 'Derbyshire Removals'}</p>
            </div>

            <div className="text-center text-sm text-gray-500 space-y-1">
              <p>Derbyshire Removals is the trading name used by Nexus Deliveries Ltd</p>
              <p>Company no: {companySettings?.companyNumber || '#######'} VAT: {companySettings?.registrationNumber || '#########'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
