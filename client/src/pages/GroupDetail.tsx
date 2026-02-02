import { useState } from "react";
import { useRoute } from "wouter";
import { useGroup } from "@/hooks/use-groups";
import { useGroupTravelers } from "@/hooks/use-travelers";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, UserPlus, ShieldAlert, CheckCircle2, Loader2, Send, Copy } from "lucide-react";
import { Link } from "wouter";
import { CsvUploader } from "@/components/CsvUploader";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function GroupDetail() {
  const { t, isRtl } = useLanguage();
  const [, params] = useRoute("/dashboard/groups/:id");
  const groupId = params?.id || "";

  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const { data: travelers, isLoading: travelersLoading, refetch: refetchTravelers } = useGroupTravelers(groupId);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRiskScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/risk-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("riskScanFailed"));
      }

      toast({
        title: t("riskScanCompleteMsg"),
        description: `${t("scanned") || "Scanned"} ${data.scanned} ${t("travelers")}.`,
      });

      // Refresh travelers to show updated scores
      refetchTravelers();
    } catch (error: any) {
      toast({
        title: t("riskScanFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleNusukSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/nusuk-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("nusukSubmitFailed"));
      }

      toast({
        title: t("submittedToNusukMsg"),
        description: `${t("jobQueued") || "Job queued"} ${data.travelers} ${t("travelers")}. ID: ${data.jobId.slice(0, 8)}...`,
      });
    } catch (error: any) {
      toast({
        title: t("nusukSubmitFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (groupLoading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (!group) return <div className="p-8">{t("groupNotFound")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/groups">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">{group.name}</h1>
            <Badge variant="outline" className="uppercase text-xs">{t("status")}: {t(group.status) || group.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            ID: {group.id} • {t("createdAt")}: {group.createdAt ? format(new Date(group.createdAt), 'PP') : ''}
          </p>
        </div>
        <div className={`ml-auto flex gap-2 ${isRtl ? "mr-auto ml-0" : ""}`}>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRiskScan}
            disabled={isScanning || !travelers?.length}
          >
            {isScanning ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t("scanning")}</>
            ) : (
              <><ShieldAlert className="h-4 w-4" /> {t("runRiskScan")}</>
            )}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const msg = `Salaam, checking availability for Group ${group?.name}. Need ${travelers?.length || 0} beds. Please confirm.`;
              navigator.clipboard.writeText(msg);
              toast({ title: t("copied"), description: t("hotelMsgCopied") });
            }}
          >
            <Copy className="h-4 w-4" /> {t("draftHotelMsg")}
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white gap-2"
            onClick={handleNusukSubmit}
            disabled={isSubmitting || !travelers?.length || group.status === 'submitted'}
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t("submitting")}</>
            ) : (
              <><Send className="h-4 w-4" /> {t("submitToNusuk")}</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("travelers")}</CardTitle>
              <div className="flex gap-2">
                <CsvUploader groupId={groupId} />
                <Button size="sm" variant="ghost">
                  <UserPlus className="h-4 w-4 mr-2" /> {t("manualAdd")}
                </Button>
              </div>
            </div>
            <CardDescription>{t("managePilgrims")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("passport")}</TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("nationality")}</TableHead>
                    <TableHead>{t("riskScore")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {travelersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">{t("loading")}</TableCell>
                    </TableRow>
                  ) : travelers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        {t("noTravelersAdded")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    travelers?.map((traveler) => (
                      <TableRow key={traveler.id}>
                        <TableCell className="font-mono">{traveler.passportNumber}</TableCell>
                        <TableCell className="font-medium">{traveler.name}</TableCell>
                        <TableCell>{traveler.nationality}</TableCell>
                        <TableCell>
                          {traveler.riskScore ? (
                            <Badge variant={traveler.riskScore > 50 ? "destructive" : "secondary"}>
                              {traveler.riskScore}/100
                            </Badge>
                          ) : <span className="text-muted-foreground text-xs">{t("pending") || "Pending"}</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${traveler.nusukStatus === 'accepted' ? 'bg-emerald-500' :
                              traveler.nusukStatus === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                              }`} />
                            <span className="capitalize text-sm">{t(traveler.nusukStatus) || traveler.nusukStatus}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm h-fit">
          <CardHeader>
            <CardTitle>{t("groupStatus") || "Group Status"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">{t("travelersCount")}</span>
              <span className="font-bold">{travelers?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">{t("visaIssued")}</span>
              <span className="font-bold text-emerald-600">0</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">{t("pendingIssues")}</span>
              <span className="font-bold text-amber-600">0</span>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium mb-3">{t("checklist")}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{t("groupCreated")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className={`h-4 w-4 rounded-full border-2 ${travelers?.length ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30"}`} />
                  <span>{t("travelersAdded")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                  <span>{t("riskScanComplete")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                  <span>{t("submittedToNusuk")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

