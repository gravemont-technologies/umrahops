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
    accessDashboard: { en: "Access Dashboard", ur: "ڈیش بورڈ تک رسائی" },
    heroTitle1: { en: "Modern Operations for", ur: "جدید آپریشنز برائے" },
    heroTitle2: { en: "Umrah Management", ur: "عمرہ مینجمنٹ" },
    heroSubtitle: { en: "Streamline your pilgrim workflows, automate visa processing, and ensure compliance with a platform built for the future of religious tourism.", ur: "اپنے مسافروں کے کام کے فلو کو ہموار کریں، ویزا پروسیسنگ کو خودکار بنائیں، اور مذہبی سیاحت کے مستقبل کے لیے بنائے گئے پلیٹ فارم کے ساتھ تعمیل کو یقینی بنائیں۔" },
    getStarted: { en: "Get Started", ur: "شروع کریں" },
    viewDemo: { en: "View Demo", ur: "ڈیمو دیکھیں" },
    nusukIntegration: { en: "Nusuk Integration", ur: "نسک انٹیگریشن" },
    nusukIntegrationDesc: { en: "Seamless synchronization with official ministry portals. Manage groups and visas without leaving your dashboard.", ur: "سرکاری وزارتی پورٹلز کے ساتھ ہموار ہم آہنگی۔ اپنے ڈیش بورڈ کو چھوڑے بغیر گروپس اور ویزوں کا نظم کریں۔" },
    instantProcessing: { en: "Instant Processing", ur: "فوری پروسیسنگ" },
    instantProcessingDesc: { en: "Bulk upload thousands of travelers via CSV. Our engine parses, validates, and queues them for processing instantly.", ur: "سی ایس وی کے ذریعے ہزاروں مسافروں کو بلک میں اپ لوڈ کریں۔ ہمارا انجن فوری طور پر ان کا تجزیہ کرتا ہے، تصدیق کرتا ہے اور پروسیسنگ کے لیے لائن میں لگاتا ہے۔" },
    complianceFirst: { en: "Compliance First", ur: "پہلے تعمیل" },
    complianceFirstDesc: { en: "Built-in audit trails and risk scoring ensure you stay compliant with regulations while maximizing efficiency.", ur: "بلٹ ان آڈٹ ٹریلز اور رسک اسکورنگ اس بات کو یقینی بناتے ہیں کہ آپ کارکردگی کو زیادہ سے زیادہ کرتے ہوئے ضوابط کی تعمیل کرتے رہیں۔" },
    systemArchitecture: { en: "System Architecture", ur: "سسٹم آرکیٹیکچر" },
    systemArchitectureDesc: { en: "Explore the modules that power the UmrahOps platform.", ur: "ان ماڈیولز کو دریافت کریں جو UmrahOps پلیٹ فارم کو طاقت دیتے ہیں۔" },
    allRightsReserved: { en: "© 2026 UmrahOps. All rights reserved.", ur: "© 2026 UmrahOps۔ جملہ حقوق محفوظ ہیں۔" },
    groupManagementBlueprint: { en: "Group Management Blueprint", ur: "گروپ مینجمنٹ بلو پرنٹ" },
    groupManagementBlueprintDesc: { en: "Effortlessly organize thousands of pilgrims into logical groups. Track status from draft to approval with our granular workflow engine.", ur: "ہزاروں زائرین کو منطقی گروہوں میں آسانی سے منظم کریں۔ ہمارے تفصیلی ورک فلو انجن کے ساتھ ڈرافٹ سے منظوری تک کی صورتحال کو ٹریک کریں۔" },
    automatedVisaProcessing: { en: "Automated Visa Processing", ur: "خودکار ویزا پروسیسنگ" },
    automatedVisaProcessingDesc: { en: "Direct integration with Nusuk (simulated) allows for bulk visa processing. Reduce manual data entry errors by 95%.", ur: "نسک (نقلی) کے ساتھ براہ راست انٹیگریشن بلک ویزا پروسیسنگ کی اجازت دیتا ہے۔ دستی ڈیٹا انٹری کی غلطیوں کو 95٪ تک کم کریں۔" },
    riskComplianceEngine: { en: "Risk & Compliance Engine", ur: "رسک اور تعمیل انجن" },
    riskComplianceEngineDesc: { en: "AI-powered risk scoring for every traveler. Detect potential issues before submission to authorities.", ur: "ہر مسافر کے لیے اے آئی سے چلنے والا رسک اسکورنگ۔ حکام کو جمع کرانے سے پہلے ممکنہ مسائل کا پتہ لگائیں۔" },
    placeholderGroup: { en: "e.g. November 2026 Umrah", ur: "مثال کے طور پر نومبر 2026 عمرہ" },
    loading: { en: "Loading...", ur: "لوڈنگ..." },
    groupNotFound: { en: "Group not found", ur: "گروپ نہیں ملا" },
    recentSystemJobs: { en: "Recent System Jobs", ur: "حالیہ سسٹم جابز" },
    noJobsInQueue: { en: "No jobs in queue.", ur: "کیو میں کوئی کام نہیں ہے۔" },
    visaIssuanceRate: { en: "Visa issuance rate", ur: "ویزا جاری کرنے کی شرح" },
    processingVisasSyncs: { en: "Processing visas & syncs", ur: "ویزوں اور ہم آہنگی کی پروسیسنگ" },
    newArrivals: { en: "new arrivals", ur: "نئی آمد" },
    fromLastWeek: { en: "from last week", ur: "گزشتہ ہفتے سے" },
    selectStatus: { en: "Select status", ur: "حیثیت منتخب کریں" },
    createGroup: { en: "Create Group", ur: "گروپ بنائیں" },
    draft: { en: "Draft", ur: "ڈرافٹ" },
    submitted: { en: "Submitted", ur: "جمع کر دیا" },
    approved: { en: "Approved", ur: "منظور شدہ" },
    travelersCount: { en: "Travelers Count", ur: "مسافروں کی تعداد" },
    visaIssued: { en: "Visa Issued", ur: "ویزا جاری کر دیا گیا" },
    pendingIssues: { en: "Pending Issues", ur: "زیر التواء مسائل" },
    checklist: { en: "Checklist", ur: "چیک لسٹ" },
    groupCreated: { en: "Group created", ur: "گروپ بن گیا" },
    travelersAdded: { en: "Travelers added", ur: "مسافروں کا اضافہ کر دیا گیا" },
    riskScanComplete: { en: "Risk scan complete", ur: "رسک اسکین مکمل" },
    submittedToNusuk: { en: "Submitted to Nusuk", ur: "نسک پر جمع کر دیا گیا" },
    manualAdd: { en: "Manual Add", ur: "دستی اضافہ" },
    managePilgrims: { en: "Manage pilgrims in this group", ur: "اس گروپ میں زائرین کا نظم کریں" },
    noTravelersAdded: { en: "No travelers added yet. Import via CSV.", ur: "ابھی تک کوئی مسافر شامل نہیں کیا گیا۔ سی ایس وی کے ذریعے امپورٹ کریں۔" },
    riskScanCompleteMsg: { en: "Risk Scan Complete", ur: "رسک اسکین مکمل ہو گیا" },
    riskScanFailed: { en: "Risk Scan Failed", ur: "رسک اسکین ناکام ہو گیا" },
    submittedToNusukMsg: { en: "Submitted to NUSUK", ur: "نسک پر جمع کر دیا گیا" },
    nusukSubmitFailed: { en: "NUSUK Submit Failed", ur: "نسک رپورٹ جمع کرانے میں ناکامی" },
    noActiveObjectives: { en: "No active objectives. Click AI Scan to analyze workflow.", ur: "کوئی فعال مقاصد نہیں ہیں۔ ورک فلو کا تجزیہ کرنے کے لیے AI اسکین پر کلک کریں۔" },
    aiObjectivesUpdated: { en: "AI Objectives Updated", ur: "AI مقاصد اپ ڈیٹ کر دیئے گئے" },
    newTasksGenerated: { en: "New tasks generated based on workflow status.", ur: "ورک فلو کی صورتحال کی بنیاد پر نئے کام تخلیق کیے گئے ہیں۔" },
    critical: { en: "Critical", ur: "نازک" },
    completed: { en: "Completed", ur: "مکمل" },
    aiGenerated: { en: "AI generated", ur: "AI کے ذریعے تیار کردہ" },
    allGroups: { en: "All Groups", ur: "تمام گروپس" },
    searchGroups: { en: "Search groups...", ur: "گروپس تلاش کریں..." },
    filter: { en: "Filter", ur: "فلٹر" },
    sort: { en: "Sort", ur: "ترتیب دیں" },
    noGroupsCreateAbove: { en: "No groups found. Create your first group above.", ur: "کوئی گروپس نہیں ملے۔ اوپر اپنا پہلا گروپ بنائیں۔" },
    manageGroupsDesc: { en: "Manage your Umrah groups and view their status.", ur: "اپنے عمرہ گروپس کا نظم کریں اور ان کی حیثیت دیکھیں۔" },
    aiTask1: { en: "Verify Mahram relationship for Traveler #14 (Potential mismatch)", ur: "مسافر #14 کے لیے محرم کے رشتے کی تصدیق کریں (ممکنہ عدم مطابقت)" },
    aiTask2: { en: "Confirm Hotel Check-in for 50 beds with Pullman Zamzam", ur: "پل مین زمزم کے ساتھ 50 بستروں کے لیے ہوٹل چیک ان کی تصدیق کریں" },
    auditLogsDesc: { en: "Track all system activities and changes.", ur: "تمام سسٹم کی سرگرمیوں اور تبدیلیوں کو ٹریک کریں۔" },
    systemActivity: { en: "System Activity", ur: "سسٹم کی سرگرمی" },
    loadingAuditTrail: { en: "Loading audit trail...", ur: "آڈٹ ٹریل لوڈ ہو رہا ہے..." },
    noActivityRecorded: { en: "No activity recorded yet.", ur: "ابھی تک کوئی سرگرمی ریکارڈ نہیں کی گئی۔" },
    jobsQueueDesc: { en: "Monitor background tasks for visa submissions and syncs.", ur: "ویزا جمع کرانے اور ہم آہنگی کے پس منظر کے کاموں کی نگرانی کریں۔" },
    activeJobs: { en: "Active Jobs", ur: "فعال جابز" },
    noJobsRunning: { en: "No jobs are currently running.", ur: "فی الحال کوئی کام نہیں چل رہا ہے۔" },
    systemJobsQueue: { en: "System Jobs Queue", ur: "سسٹم جابز کیو" },
    jobsQueueSubDesc: { en: "Background processes and automation status.", ur: "پس منظر کے عمل اور آٹومیشن کی صورتحال۔" },
    noJobsInHistory: { en: "No jobs in history.", ur: "تاریخ میں کوئی جابز نہیں ہیں۔" },
    loadingQueue: { en: "Loading queue...", ur: "کیو لوڈ ہو رہا ہے..." },
    processingFailed: { en: "Processing failed. Check logs for details.", ur: "پروسیسنگ ناکام ہو گئی۔ تفصیلات کے لیے لاگز چیک کریں۔" },
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
