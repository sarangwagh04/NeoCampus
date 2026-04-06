import { useState } from "react";
import { Usb, Key, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/api/axios";

export function HardwareKeyManager() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [drives, setDrives] = useState<string[]>([]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      // Assuming 'api' is configured with base URL
      const response = await api.get("/auth/hardware-drives/");
      setDrives(response.data.drives || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch available drives.");
    } finally {
      setLoading(false);
    }
  };

  const registerKey = async (drive: string) => {
    setRegistering(true);
    try {
      await api.post("/auth/hardware-register/", { drive });
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span>Security key successfully registered to {drive}</span>
        </div>
      );
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Registration failed.";
      toast.error(`Error: ${msg}`);
    } finally {
      setRegistering(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchDrives();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto mt-4 gap-2">
          <Key className="w-4 h-4" />
          Register Security Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Usb className="w-5 h-5" />
            Hardware Security Key
          </DialogTitle>
          <DialogDescription>
            Select a removable drive to securely store your digital signature key. 
            This will allow you to log in automatically when the key is plugged in.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Scanning for devices...</span>
            </div>
          ) : drives.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium mb-3">Available Drives</h4>
              <div className="grid gap-2">
                {drives.map((drive) => (
                  <Button
                    key={drive}
                    variant="secondary"
                    className="justify-start gap-3 h-12"
                    onClick={() => registerKey(drive)}
                    disabled={registering}
                  >
                    <Usb className="w-5 h-5 text-muted-foreground" />
                    <span>Drive {drive}</span>
                    {registering && <Loader2 className="w-4 h-4 ml-auto animate-spin" />}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 px-4 bg-muted/50 rounded-lg border border-dashed">
              <Usb className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-foreground font-medium">No removable drives found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Please insert a USB drive and try again.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
