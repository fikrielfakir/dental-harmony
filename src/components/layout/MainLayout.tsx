import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background selection:bg-primary/20">
      <AppHeader />
      <main className="flex-1 overflow-auto p-4 md:p-6 bg-secondary/10 dark:bg-background/50">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
