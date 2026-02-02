import { useGroups } from "@/hooks/use-groups";
import { useJobs } from "@/hooks/use-jobs";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ObjectivesPanel } from "@/components/demo/ObjectivesPanel";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const { data: jobs, isLoading: jobsLoading } = useJobs();

  // Fetch real stats from API
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      return res.json();
    }
  });

  const activeGroups = stats?.groups || groups?.length || 0;
  const pendingJobs = stats?.pendingJobs || jobs?.filter(j => j.status === 'pending' || j.status === 'processing').length || 0;
  const totalTravelers = stats?.travelers || 0;
  const successRate = stats?.successRate || 100;


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{t("dashboard")}</h1>
          <p className="text-muted-foreground mt-1">{t("overview")}</p>
        </div>
        <CreateGroupDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalGroups")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupsLoading ? "..." : activeGroups}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeTravelers")}</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTravelers}</div>
            <p className="text-xs text-muted-foreground">+180 new arrivals</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("pendingJobs")}</CardTitle>
            <Briefcase className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsLoading ? "..." : pendingJobs}</div>
            <p className="text-xs text-muted-foreground">Processing visas & syncs</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("successRate")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">Visa issuance rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Groups Table */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle>{t("recentGroups")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("groupName")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("createdAt")}</TableHead>
                      <TableHead className="text-right">{t("action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Loading groups...
                        </TableCell>
                      </TableRow>
                    ) : groups?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No groups found. Create one to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      groups?.slice(0, 5).map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                group.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                  group.status === 'submitted' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                    'bg-muted text-muted-foreground'
                              }
                            >
                              {group.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{group.createdAt ? format(new Date(group.createdAt), 'PPP') : 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/dashboard/groups/${group.id}`}>
                              <Button variant="ghost" size="sm">{t("viewDetails")}</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Job Queue Preview */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle>Recent System Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading jobs...</p>
                ) : jobs?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No jobs in queue.</p>
                ) : (
                  jobs?.slice(0, 3).map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                      <div className="flex items-center gap-3">
                        {job.status === 'completed' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> :
                          job.status === 'failed' ? <AlertTriangle className="h-5 w-5 text-destructive" /> :
                            <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
                        }
                        <div>
                          <p className="font-medium text-sm">{job.type.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">ID: {job.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{job.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ObjectivesPanel />
        </div>
      </div>
    </div>
  );
}
