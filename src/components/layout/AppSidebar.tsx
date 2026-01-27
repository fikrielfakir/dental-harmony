import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Receipt,
  Pill,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Clinical Records", href: "/clinical", icon: FileText },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "Prescriptions", href: "/prescriptions", icon: Pill },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Staff", href: "/staff", icon: UserCog },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out h-screen",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex-shrink-0">
          <Stethoscope className="h-6 w-6" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col animate-fade-in">
            <span className="font-bold text-lg">DentalCare</span>
            <span className="text-xs text-sidebar-foreground/60">Practice Management</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          
          const linkContent = (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground/80"
                )
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="animate-fade-in">{item.name}</span>
              )}
            </NavLink>
          );

          if (sidebarCollapsed) {
            return (
              <Tooltip key={item.name} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
