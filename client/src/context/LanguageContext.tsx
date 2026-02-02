import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "ur";

interface Translations {
    [key: string]: {
        en: string;
        ur: string;
    };
}

export const translations: Translations = {
    dashboard: { en: "Dashboard", ur: "ڈیش بورڈ" },
    groups: { en: "Groups", ur: "گروپس" },
    jobsQueue: { en: "Jobs Queue", ur: "جابز کیو" },
    auditLogs: { en: "Audit Logs", ur: "آڈٹ لاگز" },
    settings: { en: "Settings", ur: "سیٹنگز" },
    appearance: { en: "Appearance", ur: "ظاہری شکل" },
    signOut: { en: "Sign Out", ur: "سائن آؤٹ" },
    totalGroups: { en: "Total Groups", ur: "کل گروپس" },
    activeTravelers: { en: "Active Travelers", ur: "فعال مسافر" },
    pendingJobs: { en: "Pending Jobs", ur: "زیر التواء کام" },
    successRate: { en: "Success Rate", ur: "کامیابی کی شرح" },
    recentGroups: { en: "Recent Groups", ur: "حالیہ گروپس" },
    groupName: { en: "Group Name", ur: "گروپ کا نام" },
    status: { en: "Status", ur: "حیثیت" },
    createdAt: { en: "Created At", ur: "تخلیق کی تاریخ" },
    action: { en: "Action", ur: "عمل" },
    viewDetails: { en: "View Details", ur: "تفصیلات دیکھیں" },
    overview: { en: "Overview of your operations and current status.", ur: "آپ کے آپریشنز اور موجودہ صورتحال کا جائزہ۔" },
    travelers: { en: "Travelers", ur: "مسافر" },
    passport: { en: "Passport", ur: "پاسپورٹ" },
    nationality: { en: "Nationality", ur: "قومیت" },
    riskScore: { en: "Risk Score", ur: "رسک سکور" },
    runRiskScan: { en: "Run Risk Scan", ur: "رسک اسکین چلائیں" },
    submitToNusuk: { en: "Submit to Nusuk", ur: "نسک پر جمع کرائیں" },
    draftHotelMsg: { en: "Draft Hotel Msg", ur: "ہوٹل میسج ڈرافٹ کریں" },
    scanning: { en: "Scanning...", ur: "اسکیننگ جاری ہے..." },
    submitting: { en: "Submitting...", ur: "جمع ہو رہا ہے..." },
    copied: { en: "Copied", ur: "کاپی ہو گیا" },
    hotelMsgCopied: { en: "Hotel msg copied to clipboard", ur: "ہوٹل کا پیغام کلپ بورڈ پر کاپی ہو گیا۔" },
    executiveObjectives: { en: "Executive Objectives", ur: "ایگزیکٹو مقاصد" },
    aiScan: { en: "AI Scan", ur: "اے آئی اسکین" },
    officeAssistant: { en: "Office Assistant", ur: "آفس اسسٹنٹ" },
    chat: { en: "Chat", ur: "چیٹ" },
    boosts: { en: "BOOSTs", ur: "بوسٹس" },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        return (localStorage.getItem("language") as Language) || "en";
    });

    useEffect(() => {
        localStorage.setItem("language", language);
        document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: string) => {
        return translations[key]?.[language] || key;
    };

    const isRtl = language === "ur";

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
            <div className={isRtl ? "font-urdu" : "font-sans"}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
    return context;
}
