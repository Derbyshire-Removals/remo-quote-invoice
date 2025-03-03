
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Enquiry } from "@/types/invoice";
import { Calendar, CheckSquare, Home, MessageSquare, Package, Phone, Truck, Wrench } from "lucide-react";

interface EnquiryFormProps {
  onClose: () => void;
  initialData?: Enquiry;
}

export default function EnquiryForm({ onClose, initialData }: EnquiryFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Enquiry, 'id' | 'createdAt' | 'status'>>({
    customerName: initialData?.customerName || "",
    phone: initialData?.phone || "",
    hasWhatsapp: initialData?.hasWhatsapp || false,
    email: initialData?.email || "",
    moveDate: initialData?.moveDate || "",
    fromAddress: initialData?.fromAddress || "",
    fromBedrooms: initialData?.fromBedrooms || 2,
    toAddress: initialData?.toAddress || "",
    accessIssues: initialData?.accessIssues || "",
    gettingMoreQuotes: initialData?.gettingMoreQuotes || false,
    services: {
      packaging: initialData?.services.packaging || false,
      storage: initialData?.services.storage || false,
      disassembly: initialData?.services.disassembly || false,
    },
    notes: initialData?.notes || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: parseInt(value, 10) || 0
    }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    if (id === 'hasWhatsapp' || id === 'gettingMoreQuotes') {
      setFormData(prev => ({
        ...prev,
        [id]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: {
          ...prev.services,
          [id]: checked
        }
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const enquiryData: Enquiry = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData,
      status: initialData?.status || 'new',
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    // Get existing enquiries from localStorage
    const existingEnquiries = JSON.parse(localStorage.getItem('enquiries') || '[]');
    
    let updatedEnquiries;
    if (initialData) {
      // Update existing enquiry
      updatedEnquiries = existingEnquiries.map((enquiry: Enquiry) => 
        enquiry.id === initialData.id ? enquiryData : enquiry
      );
    } else {
      // Add new enquiry
      updatedEnquiries = [...existingEnquiries, enquiryData];
    }
    
    // Save to localStorage
    localStorage.setItem('enquiries', JSON.stringify(updatedEnquiries));

    // Show success message
    toast({
      title: initialData ? "Enquiry Updated" : "Enquiry Created",
      description: initialData 
        ? "The enquiry has been successfully updated."
        : "The enquiry has been successfully created.",
    });

    // Close the form
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Enquiry" : "New Enquiry"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input 
                id="customerName" 
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="customer@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <Input 
                  id="phone" 
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 h-10 mb-2">
                <MessageSquare className="h-4 w-4" />
                <Label htmlFor="hasWhatsapp" className="cursor-pointer">Has WhatsApp</Label>
                <Switch 
                  id="hasWhatsapp"
                  checked={formData.hasWhatsapp}
                  onCheckedChange={(checked) => handleSwitchChange('hasWhatsapp', checked)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moveDate">Moving Date</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <Input 
                  id="moveDate" 
                  type="date"
                  value={formData.moveDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromBedrooms">Number of Bedrooms</Label>
              <Input 
                id="fromBedrooms" 
                type="number"
                min={0}
                max={10}
                value={formData.fromBedrooms}
                onChange={handleNumberChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromAddress">Moving From (house number, postcode, beds)</Label>
            <div className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <Textarea 
                id="fromAddress" 
                placeholder="Enter pickup address"
                value={formData.fromAddress}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toAddress">Moving To (house number, postcode)</Label>
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <Textarea 
                id="toAddress" 
                placeholder="Enter destination address"
                value={formData.toAddress}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessIssues">Any access / parking issues</Label>
            <Textarea 
              id="accessIssues" 
              placeholder="Describe any access or parking issues"
              value={formData.accessIssues}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 h-10">
              <CheckSquare className="h-4 w-4" />
              <Label htmlFor="gettingMoreQuotes" className="cursor-pointer">Is customer getting more quotes?</Label>
              <Switch 
                id="gettingMoreQuotes"
                checked={formData.gettingMoreQuotes}
                onCheckedChange={(checked) => handleSwitchChange('gettingMoreQuotes', checked)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Services Required</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="packaging" 
                  checked={formData.services.packaging}
                  onCheckedChange={(checked) => handleSwitchChange('packaging', checked === true)}
                />
                <Label htmlFor="packaging" className="cursor-pointer flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Packaging</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="storage" 
                  checked={formData.services.storage}
                  onCheckedChange={(checked) => handleSwitchChange('storage', checked === true)}
                />
                <Label htmlFor="storage" className="cursor-pointer flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Storage</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="disassembly" 
                  checked={formData.services.disassembly}
                  onCheckedChange={(checked) => handleSwitchChange('disassembly', checked === true)}
                />
                <Label htmlFor="disassembly" className="cursor-pointer flex items-center space-x-2">
                  <Wrench className="h-4 w-4" />
                  <span>Disassembly</span>
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes}
              onChange={handleInputChange}
              className="min-h-[100px]"
              placeholder="Any additional notes or requirements"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initialData ? "Update Enquiry" : "Create Enquiry"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
