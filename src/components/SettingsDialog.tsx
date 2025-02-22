
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CompanySettings {
  logoUrl: string;
  name: string;
  address: string;
  contactInfo: string;
  registrationNumber: string;
  invoicePrefix: string;
  invoiceCounter: number;
  defaultNotes: string;
}

const defaultSettings: CompanySettings = {
  logoUrl: "",
  name: "",
  address: "",
  contactInfo: "",
  registrationNumber: "",
  invoicePrefix: "INV-DR",
  invoiceCounter: 1000,
  defaultNotes: "",
};

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem("companySettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("companySettings", JSON.stringify(settings));
    toast.success("Company settings saved successfully");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Company Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Company Logo URL</Label>
            <Input
              id="logoUrl"
              placeholder="https://example.com/logo.png"
              value={settings.logoUrl}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              placeholder="Your Company Name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Company Address</Label>
            <Textarea
              id="address"
              placeholder="Enter your company address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo">Phone/Email</Label>
            <Input
              id="contactInfo"
              placeholder="Phone: xxx-xxx-xxxx | Email: example@company.com"
              value={settings.contactInfo}
              onChange={(e) => setSettings({ ...settings, contactInfo: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration/VAT Number</Label>
            <Input
              id="registrationNumber"
              placeholder="Company Registration or VAT Number"
              value={settings.registrationNumber}
              onChange={(e) => setSettings({ ...settings, registrationNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultNotes">Default Invoice Notes</Label>
            <Textarea
              id="defaultNotes"
              placeholder="Enter default notes for new invoices"
              value={settings.defaultNotes}
              onChange={(e) => setSettings({ ...settings, defaultNotes: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input
                id="invoicePrefix"
                placeholder="INV-DR"
                value={settings.invoicePrefix}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceCounter">Next Invoice Number</Label>
              <Input
                id="invoiceCounter"
                type="number"
                min="1"
                placeholder="1000"
                value={settings.invoiceCounter}
                onChange={(e) => setSettings({ ...settings, invoiceCounter: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
