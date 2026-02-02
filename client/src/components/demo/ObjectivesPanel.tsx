import { useObjectives } from "@/hooks/use-objectives";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

export function ObjectivesPanel({ groupId }: { groupId?: string }) {
    const { t } = useLanguage();
    const { objectives, isLoading, toggleObjective, createObjective } = useObjectives(groupId);
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleToggle = (id: string, current: boolean) => {
        toggleObjective({ id, isCompleted: !current });
    };

    const generateAIObjectives = async () => {
        setIsGenerating(true);
        // Simulate AI analysis of group status
        setTimeout(() => {
            createObjective({
                groupId: groupId || null,
                title: t("aiTask1") || "Verify Mahram relationship for Traveler #14 (Potential mismatch)",
                type: "critical",
                isCompleted: false
            });
            createObjective({
                groupId: groupId || null,
                title: t("aiTask2") || "Confirm Hotel Check-in for 50 beds with Pullman Zamzam",
                type: "routine",
                isCompleted: false
            });
            setIsGenerating(false);
            toast({ title: t("aiObjectivesUpdated"), description: t("newTasksGenerated") });
        }, 1500);
    };

    if (isLoading) return <div className="p-4"><Loader2 className="animate-spin" /></div>;

    const active = objectives?.filter(o => !o.isCompleted) || [];
    const completed = objectives?.filter(o => o.isCompleted) || [];

    return (
        <Card className="h-full border-l-4 border-l-primary/20 shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    {t("executiveObjectives")}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={generateAIObjectives} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    <span className="ml-2 text-xs">{t("aiScan")}</span>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[400px] overflow-y-auto p-4 pt-0">
                    <div className="space-y-4">
                        {active.length === 0 && completed.length === 0 && (
                            <div className="text-center text-muted-foreground py-8 text-sm">
                                {t("noActiveObjectives")}
                            </div>
                        )}

                        {active.map(obj => (
                            <div key={obj.id} className="flex items-start space-x-3 p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow">
                                <Checkbox
                                    checked={obj.isCompleted}
                                    onCheckedChange={() => handleToggle(obj.id, obj.isCompleted)}
                                />
                                <div className="grid gap-1.5 leading-none px-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {obj.title}
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        {obj.type === 'critical' && <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase mr-2">{t("critical")}</Badge>}
                                        {t("aiGenerated")} • {new Date(obj.createdAt!).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {completed.length > 0 && (
                            <div className="pt-4 border-t opacity-50">
                                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">{t("completed")}</h4>
                                {completed.map(obj => (
                                    <div key={obj.id} className="flex items-center space-x-2 py-1">
                                        <Checkbox checked={true} onCheckedChange={() => handleToggle(obj.id, true)} />
                                        <span className="text-sm line-through text-muted-foreground px-2">{obj.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

