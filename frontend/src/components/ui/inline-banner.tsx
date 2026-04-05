import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useState, useEffect } from "react";

interface InlineBannerProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  autoClose?: number;
  className?: string;
}

const bannerConfig = {
  success: {
    icon: CheckCircle,
    bgClass: "bg-success/10 border-success/20",
    textClass: "text-success",
    iconClass: "text-success",
  },
  error: {
    icon: XCircle,
    bgClass: "bg-destructive/10 border-destructive/20",
    textClass: "text-destructive",
    iconClass: "text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-warning/10 border-warning/20",
    textClass: "text-warning",
    iconClass: "text-warning",
  },
  info: {
    icon: Info,
    bgClass: "bg-primary/10 border-primary/20",
    textClass: "text-primary",
    iconClass: "text-primary",
  },
};

export function InlineBanner({
  type,
  message,
  onClose,
  autoClose,
  className,
}: InlineBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = bannerConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border animate-slide-up",
        config.bgClass,
        className
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", config.iconClass)} />
      <span className={cn("flex-1 text-sm font-medium", config.textClass)}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className={cn(
            "p-1 rounded-md hover:bg-black/10 transition-colors",
            config.textClass
          )}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
