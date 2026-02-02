import { useGroups } from "@/hooks/use-groups";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

import { useLanguage } from "@/context/LanguageContext";

export default function GroupsList() {
  const { t, isRtl } = useLanguage();
  const { data: groups, isLoading } = useGroups();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">{t("allGroups")}</h1>
          <p className="text-muted-foreground">{t("manageGroupsDesc")}</p>
        </div>
        <CreateGroupDialog />
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className={`absolute ${isRtl ? "right-2.5" : "left-2.5"} top-2.5 h-4 w-4 text-muted-foreground`} />
          <Input placeholder={t("searchGroups")} className={isRtl ? "pr-9" : "pl-9"} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">{t("filter")}</Button>
          <Button variant="outline" size="sm">{t("sort")}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/20 animate-pulse" />
          ))
        ) : groups?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            {t("noGroupsCreateAbove")}
          </div>
        ) : (
          groups?.map((group) => (
            <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer border-border/60 hover:border-primary/50 group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {group.name}
                    </CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {t(group.status) || group.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t("createdAt")}</span>
                      <span>{group.createdAt ? format(new Date(group.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ID</span>
                      <span className="font-mono text-xs">{group.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

