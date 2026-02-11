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
import LoginPage from "@/pages/LoginPage";
import { Layout } from "@/components/Layout";
import { useEffect } from "react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const isAuthenticated = localStorage.getItem("umrahos_auth") === "true";

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />

      <Route path="/login" component={LoginPage} />

      {/* Dashboard Routes */}
      <Route path="/dashboard">
        <ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>
      </Route>

      <Route path="/dashboard/groups">
        <ProtectedRoute><DashboardLayout><GroupsList /></DashboardLayout></ProtectedRoute>
      </Route>

      <Route path="/dashboard/groups/:id">
        <ProtectedRoute><DashboardLayout><GroupDetail /></DashboardLayout></ProtectedRoute>
      </Route>

      <Route path="/dashboard/jobs">
        <ProtectedRoute><DashboardLayout><JobsQueue /></DashboardLayout></ProtectedRoute>
      </Route>

      <Route path="/dashboard/audit">
        <ProtectedRoute><DashboardLayout><AuditLogs /></DashboardLayout></ProtectedRoute>
      </Route>

      {/* <Route path="/dashboard/settings">
        <ProtectedRoute>
          <DashboardLayout>
            <div className="p-8 text-center text-muted-foreground">Settings module coming soon.</div>
          </DashboardLayout>
        </ProtectedRoute>
      </Route> */}

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
