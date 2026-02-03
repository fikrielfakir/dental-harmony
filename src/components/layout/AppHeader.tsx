import { Bell, Search, User, LogOut, ChevronDown, Stethoscope, LayoutDashboard, Users, Calendar, FileText, Receipt, Pill, BarChart3, UserCog, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { key: "dashboard", href: "/", icon: LayoutDashboard },
  { key: "patients", href: "/patients", icon: Users },
  { key: "appointments", href: "/appointments", icon: Calendar },
  { key: "clinical", href: "/clinical", icon: FileText },
  { key: "billing", href: "/billing", icon: Receipt },
  { key: "prescriptions", href: "/prescriptions", icon: Pill },
  { key: "reports", href: "/reports", icon: BarChart3 },
  { key: "staff", href: "/staff", icon: UserCog },
  { key: "settings", href: "/settings", icon: Settings },
];

export function AppHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, logout } = useStore();
  
  const initials = currentUser
    ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`
    : "U";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 mica border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 pr-4 border-r border-border/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shadow-sm overflow-hidden border border-primary/20">
            <img src="/assets/logo.png" alt="DentalCare Logo" className="h-full w-full object-cover p-1" />
          </div>
          <span className="font-bold text-base leading-none hidden md:block">DentalCare</span>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 text-sm font-medium relative group",
                    "hover:bg-secondary/80 hover:text-foreground",
                    isActive
                      ? "text-primary bg-secondary/50 shadow-inner"
                      : "text-muted-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{t(`nav.${item.key}`)}</span>
                <div className={cn(
                  "absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full transition-transform duration-200",
                  "scale-x-0 group-hover:scale-x-100"
                )} />
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={t('nav.search')}
            className="pl-9 h-8 w-48 bg-background/50 border-transparent hover:bg-background transition-all focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-md text-xs"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 mica-card mt-2">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Appointment Reminder</span>
              <span className="text-sm text-muted-foreground">
                John Smith's appointment starts in 30 minutes
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-1 h-8">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mica-card mt-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
