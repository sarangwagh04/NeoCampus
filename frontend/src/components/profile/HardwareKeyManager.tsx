import { useState } from "react";
import { Usb, Key, Loader2, CheckCircle2, AlertTriangle, Monitor, ExternalLink } from "lucide-react";
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

  const isLocalhost = typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".local")
  );

  const fetchDrives = async () => {
    setLoading(true);
    try {
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
    if (!isLocalhost) {
      toast.info("Hardware key registration requires running NeoCampus locally on your computer.");
      return;
    }
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
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Usb className="w-5 h-5 text-primary" />
            Hardware Security Key
          </DialogTitle>
          <DialogDescription>
            Authenticate seamlessly using a physical USB key with Ed25519 digital signatures.
          </DialogDescription>
        </DialogHeader>

        {/* Cloud Environment Notice Banner */}
        {!isLocalhost && (
          <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-600 dark:text-amber-400">
                  Local System Feature
                </p>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  To experience physical USB hardware authentication, run this project locally on your machine. 
                  Due to browser sandbox security and cloud isolation, remote cloud servers cannot access client USB ports directly.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-muted-foreground">
              <Monitor className="w-3.5 h-3.5" />
              <span>Run locally: python manage.py usb_listener</span>
            </div>
          </div>
        )}
        
        <div className="py-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm">Scanning for local devices...</span>
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
            <div className="text-center py-6 px-4 bg-muted/40 rounded-lg border border-dashed">
              <Usb className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-foreground font-medium">
                {isLocalhost ? "No removable drives found" : "No cloud USB hardware attached"}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
                {isLocalhost
                  ? "Please insert a USB flash drive into your machine and try again."
                  : "Physical USB keys only function on local system installations where the USB listener is active."}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
