
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

interface CompanySettings {
  logoUrl: string;
  name: string;
  address: string;
  phone: string;  // Changed from contactInfo
  email: string;  // Added new field
  registrationNumber: string;
  companyNumber: string;
  invoicePrefix: string;
  invoiceCounter: number;
  defaultNotes: string;
  openaiApiKey?: string; // API key for OpenAI integration
  termsTemplates: {
    name: string;
    content: string;
  }[];
}

const defaultSettings: CompanySettings = {
  logoUrl: "",
  name: "",
  address: "",
  phone: "",    // Changed from contactInfo
  email: "",    // Added new field
  registrationNumber: "",
  companyNumber: "",
  invoicePrefix: "INV-DR",
  invoiceCounter: 1000,
  defaultNotes: "",
  openaiApiKey: "", // Default empty API key
  termsTemplates: [
    {
      name: "Standard Terms",
      content: "1. Payment is due within 30 days\n2. Late payments will incur a fee\n3. All prices are exclusive of VAT"
    }
  ]
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
      const parsedSettings = JSON.parse(savedSettings);
      // Handle migration of old contactInfo field to separate phone and email fields
      let phone = "";
      let email = "";
      if (parsedSettings.contactInfo) {
        const parts = parsedSettings.contactInfo.split('|');
        phone = parts[0]?.trim() || "";
        email = parts[1]?.trim() || "";
      }
      setSettings({
        ...defaultSettings,
        ...parsedSettings,
        phone: parsedSettings.phone || phone,
        email: parsedSettings.email || email,
        termsTemplates: parsedSettings.termsTemplates || defaultSettings.termsTemplates
      });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("companySettings", JSON.stringify(settings));
    toast.success("Company settings saved successfully");
    onClose();
  };

  const handleAddTemplate = () => {
    setSettings(prev => ({
      ...prev,
      termsTemplates: [...prev.termsTemplates, { name: "", content: "" }]
    }));
  };

  const handleRemoveTemplate = (index: number) => {
    setSettings(prev => ({
      ...prev,
      termsTemplates: prev.termsTemplates.filter((_, i) => i !== index)
    }));
  };

  const handleTemplateChange = (index: number, field: 'name' | 'content', value: string) => {
    setSettings(prev => ({
      ...prev,
      termsTemplates: prev.termsTemplates.map((template, i) =>
        i === index ? { ...template, [field]: value } : template
      )
    }));
  };

  const handleExportData = () => {
    try {
      // Collect all localStorage data
      const allData: Record<string, any> = {};
      
      // List of all possible localStorage keys used in the app
      const keys = [
        'companySettings',
        'invoices',
        'quotes', 
        'enquiries',
        'documents'
      ];
      
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            allData[key] = JSON.parse(data);
          } catch {
            allData[key] = data; // Store as string if not JSON
          }
        }
      });
      
      // Create and download the backup file
      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
      console.error("Export error:", error);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          // Restore each data type to localStorage
          Object.keys(importedData).forEach(key => {
            const value = typeof importedData[key] === 'string' 
              ? importedData[key] 
              : JSON.stringify(importedData[key]);
            localStorage.setItem(key, value);
          });
          
          // Refresh settings state if company settings were imported
          if (importedData.companySettings) {
            setSettings({
              ...defaultSettings,
              ...importedData.companySettings,
              termsTemplates: importedData.companySettings.termsTemplates || defaultSettings.termsTemplates
            });
          }
          
          toast.success("Data imported successfully! Please refresh the page to see all changes.");
        } catch (error) {
          toast.error("Failed to import data. Please check the file format.");
          console.error("Import error:", error);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
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
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="e.g., +44 123 456 7890"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@company.com"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
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
            <Label htmlFor="companyNumber">Company Number</Label>
            <Input
              id="companyNumber"
              placeholder="Company Number"
              value={settings.companyNumber}
              onChange={(e) => setSettings({ ...settings, companyNumber: e.target.value })}
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

          <div className="space-y-2">
            <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
            <Input
              id="openaiApiKey"
              type="password"
              placeholder="sk-..."
              value={settings.openaiApiKey}
              onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Required for AI-powered form filling from pasted text</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Terms & Conditions Templates</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTemplate}>
                Add Template
              </Button>
            </div>
            {settings.termsTemplates.map((template, index) => (
              <div key={index} className="space-y-2 border p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <Input
                    placeholder="Template Name"
                    value={template.name}
                    onChange={(e) => handleTemplateChange(index, 'name', e.target.value)}
                    className="mb-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveTemplate(index)}
                  >
                    Remove
                  </Button>
                </div>
                <Textarea
                  placeholder="Template Content"
                  value={template.content}
                  onChange={(e) => handleTemplateChange(index, 'content', e.target.value)}
                  rows={4}
                />
              </div>
            ))}
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

          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Data Backup & Restore</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Export your data for backup or import from a previous backup
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button 
                variant="outline" 
                onClick={handleImportData}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
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
