import { createContext, useContext, useState, ReactNode } from "react";

interface DemoContextType {
    isDemoMode: boolean;
    startDemo: () => void;
    stopDemo: () => void;
    currentStep: number;
    nextStep: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const startDemo = () => {
        setIsDemoMode(true);
        setCurrentStep(0);
    };

    const stopDemo = () => {
        setIsDemoMode(false);
        setCurrentStep(0);
    };

    const nextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    return (
        <DemoContext.Provider value={{ isDemoMode, startDemo, stopDemo, currentStep, nextStep }}>
            {children}
        </DemoContext.Provider>
    );
}

export function useDemo() {
    const context = useContext(DemoContext);
    if (!context) throw new Error("useDemo must be used within a DemoProvider");
    return context;
}
