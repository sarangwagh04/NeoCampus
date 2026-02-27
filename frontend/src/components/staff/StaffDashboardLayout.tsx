import { ReactNode, useState, useEffect } from "react";
import { StaffSidebar } from "./StaffSidebar";
import { cn } from "@/lib/utils";

interface StaffDashboardLayoutProps {
  children: ReactNode;
}

export function StaffDashboardLayout({ children }: StaffDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <StaffSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
