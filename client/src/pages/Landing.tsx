import { Link, useLocation } from "wouter";
import { useDemo } from "@/context/DemoContext";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroImg from "@/assets/hero-placeholder.jpg"; // Placeholder logic handled by standard img

export default function Landing() {
  const isSupabaseConnected = import.meta.env.VITE_SUPABASE_URL;
  const { startDemo } = useDemo();
  const [, setLocation] = useLocation();

  const handleDemo = () => {
    startDemo();
    setLocation("/dashboard");
  };

  const blueprints = [
    {
      id: "item-1",
      title: "Group Management Blueprint",
      content: "Effortlessly organize thousands of pilgrims into logical groups. Track status from draft to approval with our granular workflow engine."
    },
    {
      id: "item-2",
      title: "Automated Visa Processing",
      content: "Direct integration with Nusuk (simulated) allows for bulk visa processing. Reduce manual data entry errors by 95%."
    },
    {
      id: "item-3",
      title: "Risk & Compliance Engine",
      content: "AI-powered risk scoring for every traveler. Detect potential issues before submission to authorities."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-display font-bold">
              U
            </div>
            <span className="text-xl font-bold font-display tracking-tight">UmrahOps</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground hidden sm:inline-block">
              {isSupabaseConnected ? "Supabase Connected" : "Demo Mode"}
            </span>
            <Link href="/dashboard">
              <Button variant="default" className="font-semibold shadow-lg shadow-primary/20">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background gradient blob */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-[1.1]">
              Modern Operations for <br />
              <span className="text-gradient">Umrah Management</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Streamline your pilgrim workflows, automate visa processing, and ensure compliance with a platform built for the future of religious tourism.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button onClick={handleDemo} variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg bg-background/50 backdrop-blur-sm hover:bg-muted/50">
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">Nusuk Integration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seamless synchronization with official ministry portals. Manage groups and visas without leaving your dashboard.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">Instant Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Bulk upload thousands of travelers via CSV. Our engine parses, validates, and queues them for processing instantly.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/50 flex items-center justify-center text-accent-foreground mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">Compliance First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built-in audit trails and risk scoring ensure you stay compliant with regulations while maximizing efficiency.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blueprint Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">System Architecture</h2>
            <p className="text-muted-foreground">Explore the modules that power the UmrahOps platform.</p>
          </div>

          <div className="bg-background rounded-2xl border border-border shadow-xl shadow-black/5 p-2 sm:p-8">
            <Accordion type="single" collapsible className="w-full">
              {blueprints.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border-b-border/50">
                  <AccordionTrigger className="text-lg font-medium px-4 hover:bg-muted/30 rounded-lg transition-colors">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 text-base leading-relaxed py-4">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-background rounded-lg flex items-center justify-center text-foreground font-display font-bold">
              U
            </div>
            <span className="text-xl font-bold font-display">UmrahOps</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 UmrahOps. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
