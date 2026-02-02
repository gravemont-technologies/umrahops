import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ScrollText } from "lucide-react";

export default function AuditLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: [api.audit.list.path],
    queryFn: async () => {
      const res = await fetch(api.audit.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.audit.list.responses[200].parse(await res.json());
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system activities and changes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" /> System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 relative border-l-2 border-muted ml-3 pl-8 py-2">
            {isLoading ? (
              <p className="text-muted-foreground">Loading audit trail...</p>
            ) : logs?.length === 0 ? (
              <p className="text-muted-foreground">No activity recorded yet.</p>
            ) : (
              logs?.map((log) => (
                <div key={log.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-background bg-primary" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                    <div>
                      <p className="font-medium text-foreground">
                        <span className="uppercase text-xs font-bold text-muted-foreground mr-2 tracking-wider">
                          {log.action}
                        </span>
                        {log.entityType} <span className="text-muted-foreground text-sm">({log.entityId.slice(0, 8)})</span>
                      </p>
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {log.createdAt ? format(new Date(log.createdAt), 'MMM d, h:mm a') : ''}
                    </time>
                  </div>
                  <div className="mt-2 text-sm bg-muted/30 p-2 rounded border border-border/50 font-mono text-xs overflow-x-auto">
                    {JSON.stringify(log.payload, null, 2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
