
import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [, setLocation] = useLocation();
    const { t, isRtl } = useLanguage();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple PIN for MVP/Demo
        if (pin === "7860" || pin === "1234") {
            localStorage.setItem("umrahos_auth", "true");
            setLocation("/dashboard");
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-display font-bold">UmrahOps Access</CardTitle>
                    <CardDescription>Enter your PIN to access the dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Enter PIN (7860)"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className={`text-center text-lg tracking-widest ${error ? "border-destructive ring-destructive" : ""}`}
                                autoFocus
                                maxLength={4}
                            />
                            {error && (
                                <p className="text-sm text-destructive text-center font-medium animate-shake">
                                    Invalid PIN. Try 7860.
                                </p>
                            )}
                        </div>
                        <Button type="submit" className="w-full h-11 text-base group">
                            Access Dashboard
                            <ArrowRight className={`ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180" : ""}`} />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
