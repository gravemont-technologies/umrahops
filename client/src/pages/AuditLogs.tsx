import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ScrollText } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function AuditLogs() {
  const { t, isRtl } = useLanguage();
  const { data: logs, isLoading } = useQuery({
    queryKey: [api.audit.list.path],
    queryFn: async () => {
      const res = await fetch(api.audit.list.path, { credentials: "include" });
      if (!res.ok) throw new Error(t("failedToFetchLogs") || "Failed to fetch logs");
      return api.audit.list.responses[200].parse(await res.json());
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">{t("auditLogs")}</h1>
        <p className="text-muted-foreground">{t("auditLogsDesc")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" /> {t("systemActivity")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`space-y-6 relative border-l-2 border-muted ${isRtl ? "mr-3 ml-0 pr-8 pl-0 border-r-2 border-l-0" : "ml-3 pl-8"} py-2`}>
            {isLoading ? (
              <p className="text-muted-foreground">{t("loadingAuditTrail")}</p>
            ) : logs?.length === 0 ? (
              <p className="text-muted-foreground">{t("noActivityRecorded")}</p>
            ) : (
              logs?.map((log) => (
                <div key={log.id} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute ${isRtl ? "-right-[41px]" : "-left-[41px]"} top-1 h-5 w-5 rounded-full border-4 border-background bg-primary`} />

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                    <div>
                      <p className="font-medium text-foreground">
                        <span className={`uppercase text-xs font-bold text-muted-foreground ${isRtl ? "ml-2" : "mr-2"} tracking-wider`}>
                          {log.action}
                        </span>
                        {log.entityType} <span className="text-muted-foreground text-sm">({log.entityId.slice(0, 8)})</span>
                      </p>
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {log.createdAt ? format(new Date(log.createdAt), 'MMM d, h:mm a') : ''}
                    </time>
                  </div>
                  <div className="mt-2 text-sm bg-muted/30 p-2 rounded border border-border/50 font-mono text-xs overflow-x-auto text-left" dir="ltr">
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

