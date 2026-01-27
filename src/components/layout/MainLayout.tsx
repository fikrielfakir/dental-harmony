import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function MainLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-secondary/30 dark:bg-background/50">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
