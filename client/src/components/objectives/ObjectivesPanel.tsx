import { useObjectives } from "@/hooks/use-objectives";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BrainCircuit } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function ObjectivesPanel({ groupId }: { groupId?: string }) {
    const { t } = useLanguage();
    // useObjectives is fully typed and hits /api/objectives
    const { objectives, isLoading, toggleObjective } = useObjectives(groupId);

    const handleToggle = (id: string, current: boolean) => {
        toggleObjective({ id, isCompleted: !current });
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
                                        {t("aiGenerated")} • {obj.createdAt ? new Date(obj.createdAt).toLocaleDateString() : 'N/A'}
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
