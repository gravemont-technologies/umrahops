import { useJobs } from "@/hooks/use-jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function JobsQueue() {
  const { data: jobs, isLoading } = useJobs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">System Jobs Queue</h1>
        <p className="text-muted-foreground">Background processes and automation status.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading queue...</div>
        ) : jobs?.length === 0 ? (
           <Card className="p-12 text-center text-muted-foreground border-dashed">
             No jobs in history.
           </Card>
        ) : (
          jobs?.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <div className="flex items-center p-4 gap-4">
                <div className={`p-3 rounded-full ${
                  job.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                  job.status === 'failed' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                   {job.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> :
                    job.status === 'failed' ? <XCircle className="h-5 w-5" /> :
                    <Activity className="h-5 w-5 animate-pulse" />
                   }
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-base uppercase tracking-wide">{job.type.replace('_', ' ')}</h3>
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-mono text-xs">ID: {job.id}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.createdAt ? format(new Date(job.createdAt), 'PP pp') : ''}
                    </div>
                  </div>
                  {job.status === 'failed' && (
                    <div className="mt-2 text-sm text-destructive bg-destructive/5 p-2 rounded">
                      Processing failed. Check logs for details.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
