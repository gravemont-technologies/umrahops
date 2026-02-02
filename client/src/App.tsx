import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoProvider } from "@/context/DemoContext";
import { LanguageProvider } from "@/context/LanguageContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import GroupDetail from "@/pages/GroupDetail";
import GroupsList from "@/pages/GroupsList";
import JobsQueue from "@/pages/JobsQueue";
import AuditLogs from "@/pages/AuditLogs";
import { Layout } from "@/components/Layout";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />

      {/* Dashboard Routes */}
      <Route path="/dashboard">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>

      <Route path="/dashboard/groups">
        <DashboardLayout>
          <GroupsList />
        </DashboardLayout>
      </Route>

      <Route path="/dashboard/groups/:id">
        <DashboardLayout>
          <GroupDetail />
        </DashboardLayout>
      </Route>

      <Route path="/dashboard/jobs">
        <DashboardLayout>
          <JobsQueue />
        </DashboardLayout>
      </Route>

      <Route path="/dashboard/audit">
        <DashboardLayout>
          <AuditLogs />
        </DashboardLayout>
      </Route>

      {/* Settings Stub */}
      <Route path="/dashboard/settings">
        <DashboardLayout>
          <div className="p-8 text-center text-muted-foreground">Settings module coming soon.</div>
        </DashboardLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DemoProvider>
          <LanguageProvider>
            <Toaster />
            <Router />
          </LanguageProvider>
        </DemoProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
