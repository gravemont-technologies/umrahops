import { useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDemo } from "@/context/DemoContext";
import { X, ChevronRight, User, Plane, Building, FileCheck } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

const DEMO_STEPS = [
    {
        title: "demoStep1Title",
        description: "demoStep1Desc",
        action: "demoStep1Action",
        targetTraveler: null
    },
    {
        title: "demoStep2Title",
        description: "demoStep2Desc",
        action: "demoStep2Action",
        targetTraveler: {
            name: "Ahmed Al-Farsi",
            passport: "N382910X",
            status: "detailsMismatch",
            img: "https://randomuser.me/api/portraits/men/32.jpg"
        }
    },
    {
        title: "demoStep3Title",
        description: "demoStep3Desc",
        action: "demoStep3Action",
        targetTraveler: null
    },
    {
        title: "demoStep4Title",
        description: "demoStep4Desc",
        action: "demoStep4Action",
        targetTraveler: null
    }
];

export function DemoOverlay() {
    const { isDemoMode, stopDemo, currentStep, nextStep } = useDemo();
    const { t, isRtl } = useLanguage();
    const constraintsRef = useRef(null);

    if (!isDemoMode) return null;

    const step = DEMO_STEPS[currentStep] || { title: "demoComplete", description: "demoCompleteDesc", action: "demoFinish", targetTraveler: null };
    const isLast = currentStep >= DEMO_STEPS.length;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]" ref={constraintsRef}>
            {/* Draggable Traveler Profile / Instruction Card */}
            <motion.div
                drag
                dragConstraints={constraintsRef}
                initial={{ x: 20, y: 100 }}
                className={`pointer-events-auto absolute ${isRtl ? "left-10" : "right-10"} top-20 w-80`}
            >
                <Card className="shadow-2xl border-primary/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <CardHeader className="p-4 border-b bg-primary/5">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                                    {t("step")} {Math.min(currentStep + 1, DEMO_STEPS.length)}/{DEMO_STEPS.length}
                                </Badge>
                                <CardTitle className="text-lg">{t(step.title)}</CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={stopDemo}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t(step.description)}
                        </p>

                        {step.targetTraveler && (
                            <div className="rounded-lg border p-3 bg-muted/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-10 w-10 border-2 border-background">
                                        <AvatarImage src={step.targetTraveler.img} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-sm">{step.targetTraveler.name}</div>
                                        <div className="text-xs font-mono text-muted-foreground">{step.targetTraveler.passport}</div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">{t("nusukStatus")}</span>
                                        <Badge variant="destructive" className="h-5 px-1.5">{t(step.targetTraveler.status)}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center border-t pt-2">
                                        <span className="flex items-center gap-1"><Plane className="h-3 w-3" /> {t("arrival")}</span>
                                        <span className="font-medium">2026-04-10</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {t("hotel")}</span>
                                        <span className="font-medium text-amber-600">{t("pending")}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="p-3 bg-muted/20 flex justify-end">
                        <Button size="sm" onClick={isLast ? stopDemo : nextStep} className="gap-2">
                            {t(step.action)}
                            {!isLast && <ChevronRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
