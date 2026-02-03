import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageSquare, Zap, X, Send, Bot, ChevronUp } from "lucide-react";

const BOOSTS = [
    {
        title: "boost1Title",
        content: "boost1Content"
    },
    {
        title: "boost2Title",
        content: "boost2Content"
    },
    {
        title: "boost3Title",
        content: "boost3Content"
    }
];

const WITTY_RESPONSES: Record<string, string> = {
    delay: "respDelay",
    urgent: "respUrgent",
    coffee: "respCoffee",
    hello: "respHello",
    help: "respHelp",
    scan: "respScan",
};

export function OfficeAssistant() {
    const { t, isRtl } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: t("officeAssistantWelcome") }
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");

        // Simple rule-based logic
        let botResponseKey = "respDefault";
        const lower = userMsg.toLowerCase();

        if (lower.includes('delay') || lower.includes('late')) botResponseKey = "delay";
        else if (lower.includes('urgent') || lower.includes('asap')) botResponseKey = "urgent";
        else if (lower.includes('coffee') || lower.includes('tired')) botResponseKey = "coffee";
        else if (lower.includes('hello') || lower.includes('hi') || lower.includes('salaam')) botResponseKey = "hello";
        else if (lower.includes('scan') || lower.includes('upload')) botResponseKey = "scan";
        else if (lower.includes('help')) botResponseKey = "help";

        const responseText = WITTY_RESPONSES[botResponseKey] ? t(WITTY_RESPONSES[botResponseKey]) : t("respDefault");

        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'bot', text: responseText }]);
        }, 500);
    };

    if (!isOpen) {
        return (
            <Button
                className={`fixed bottom-4 ${isRtl ? "left-4" : "right-4"} rounded-full h-12 w-12 shadow-lg z-50 bg-primary hover:bg-primary/90`}
                onClick={() => setIsOpen(true)}
            >
                <Bot className="h-6 w-6 text-white" />
            </Button>
        );
    }

    return (
        <Card className={`fixed bottom-4 ${isRtl ? "left-4" : "right-4"} w-80 h-[500px] shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 border-primary/20`}>
            <CardHeader className="p-3 border-b bg-muted/50 flex flex-row items-center justify-between space-y-0 text-foreground">
                <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold">{t("officeAssistant")}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                    <ChevronUp className="h-4 w-4" />
                </Button>
            </CardHeader>

            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-muted/20 px-4 h-10">
                    <TabsTrigger value="chat" className="text-xs">{t("chat")}</TabsTrigger>
                    <TabsTrigger value="boosts" className="text-xs">{t("boosts")} ⚡</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${m.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-muted text-muted-foreground rounded-bl-none'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t bg-background flex gap-2">
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder={t("typeMessage")}
                            className="h-8 text-sm"
                        />
                        <Button size="icon" className="h-8 w-8" onClick={handleSend}>
                            <Send className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="boosts" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
                    <div className="text-xs text-muted-foreground mb-2">{t("productivityHacks")}</div>
                    {BOOSTS.map((boost, i) => (
                        <div key={i} className="border rounded-md p-3 bg-card shadow-sm">
                            <div className="flex items-center gap-2 mb-1.5 font-semibold text-sm text-primary">
                                <Zap className="h-3 w-3" />
                                {t(boost.title)}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {t(boost.content)}
                            </p>
                        </div>
                    ))}
                </TabsContent>
            </Tabs>
        </Card>
    );
}
