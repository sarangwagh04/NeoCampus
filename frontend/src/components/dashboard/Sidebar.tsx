import { 
  LayoutDashboard, 
  CalendarCheck, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { logout } from "@/api/axios";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student" },
  { icon: MessageSquare, label: "Neo Chatbot", href: "/student/chatbot" },
  { icon: CalendarCheck, label: "Attendance", href: "/attendance" },
  { icon: GraduationCap, label: "Results", href: "/results" },
  { icon: Calendar, label: "Timetable", href: "/timetable" },
  { icon: BookOpen, label: "Notice Board", href: "/noticeboard" },
  { icon: Sparkles, label: "Stress Buster", href: "/stress-buster" },
  { icon: User, label: "Profile", href: "/profile" },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-sidebar-foreground animate-fade-in">
              NeoCampus
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn("nav-item", isActive && "active")}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium animate-fade-in">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="nav-item w-full text-sidebar-muted hover:text-destructive"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}