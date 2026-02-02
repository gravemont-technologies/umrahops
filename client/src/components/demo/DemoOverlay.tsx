import { useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDemo } from "@/context/DemoContext";
import { X, ChevronRight, User, Plane, Building, FileCheck } from "lucide-react";

const DEMO_STEPS = [
    {
        title: "Morning Review",
        description: "Start your day by reviewing critical objectives. Check the Objectives panel for AI-prioritized tasks.",
        action: "Go to Objectives",
        targetTraveler: null
    },
    {
        title: "Verify Traveler Data",
        description: "Deep dive into a specific group. Verify passport details against NUSUK requirements.",
        action: "Inspect Traveler",
        targetTraveler: {
            name: "Ahmed Al-Farsi",
            passport: "N382910X",
            status: "Details Mismatch",
            img: "https://randomuser.me/api/portraits/men/32.jpg"
        }
    },
    {
        title: "Coordinate Hotel",
        description: "Group A needs 50 beds. Generate a WhatsApp message to the hotel manager.",
        action: "Draft Message",
        targetTraveler: null
    },
    {
        title: "Submit to NUSUK",
        description: "All checks passed. Submit the group for visa processing with one click.",
        action: "Simulate Submit",
        targetTraveler: null
    }
];

export function DemoOverlay() {
    const { isDemoMode, stopDemo, currentStep, nextStep } = useDemo();
    const constraintsRef = useRef(null);

    if (!isDemoMode) return null;

    const step = DEMO_STEPS[currentStep] || { title: "Demo Complete", description: "You have completed the walkthrough.", action: "Finish" };
    const isLast = currentStep >= DEMO_STEPS.length;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]" ref={constraintsRef}>
            {/* Draggable Traveler Profile / Instruction Card */}
            <motion.div
                drag
                dragConstraints={constraintsRef}
                initial={{ x: 20, y: 100 }}
                className="pointer-events-auto absolute right-10 top-20 w-80"
            >
                <Card className="shadow-2xl border-primary/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <CardHeader className="p-4 border-b bg-primary/5">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                                    Step {Math.min(currentStep + 1, DEMO_STEPS.length)}/{DEMO_STEPS.length}
                                </Badge>
                                <CardTitle className="text-lg">{step.title}</CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={stopDemo}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
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
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">NUSUK Status</span>
                                        <Badge variant="destructive" className="h-5 px-1.5">{step.targetTraveler.status}</Badge>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="flex items-center gap-1"><Plane className="h-3 w-3" /> Arrival</span>
                                        <span>2026-04-10</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="flex items-center gap-1"><Building className="h-3 w-3" /> Hotel</span>
                                        <span>Pending</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="p-3 bg-muted/20 flex justify-end">
                        <Button size="sm" onClick={isLast ? stopDemo : nextStep} className="gap-2">
                            {step.action}
                            {!isLast && <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
