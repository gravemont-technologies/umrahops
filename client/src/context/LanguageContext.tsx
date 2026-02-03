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
    demoStep1Title: { en: "Morning Review", ur: "صبح کا جائزہ" },
    demoStep1Desc: { en: "Start your day by reviewing critical objectives. Check the Objectives panel for AI-prioritized tasks.", ur: "اپنے دن کا آغاز اہم مقاصد کے جائزے سے کریں۔ AI کی ترجیح یافتہ کاموں کے لیے آبجیکٹیوز پینل چیک کریں۔" },
    demoStep1Action: { en: "Go to Objectives", ur: "مقاصد پر جائیں" },
    demoStep2Title: { en: "Verify Traveler Data", ur: "مسافر کے ڈیٹا کی تصدیق" },
    demoStep2Desc: { en: "Deep dive into a specific group. Verify passport details against NUSUK requirements.", ur: "کسی خاص گروپ کا گہرائی سے جائزہ لیں۔ نسک کے تقاضوں کے مطابق پاسپورٹ کی تفصیلات کی تصدیق کریں۔" },
    demoStep2Action: { en: "Inspect Traveler", ur: "مسافر کا معائنہ کریں" },
    demoStep3Title: { en: "Coordinate Hotel", ur: "ہوٹل کے ساتھ ہم آہنگی" },
    demoStep3Desc: { en: "Group A needs 50 beds. Generate a WhatsApp message to the hotel manager.", ur: "گروپ A کو 50 بستروں کی ضرورت ہے۔ ہوٹل مینیجر کو واٹس ایپ پیغام بھیجیں۔" },
    demoStep3Action: { en: "Draft Message", ur: "پیغام ڈرافٹ کریں" },
    demoStep4Title: { en: "Submit to NUSUK", ur: "نسک پر جمع کرائیں" },
    demoStep4Desc: { en: "All checks passed. Submit the group for visa processing with one click.", ur: "تمام چیک مکمل ہو گئے۔ ویزا پروسیسنگ کے لیے ایک کلک کے ساتھ گروپ جمع کرائیں۔" },
    demoStep4Action: { en: "Simulate Submit", ur: "جمع کرانے کا عمل آزمائیں" },
    demoComplete: { en: "Demo Complete", ur: "ڈیمو مکمل ہو گیا" },
    demoCompleteDesc: { en: "You have completed the walkthrough.", ur: "آپ نے واک تھرو مکمل کر لیا ہے۔" },
    demoFinish: { en: "Finish", ur: "ختم کریں" },
    step: { en: "Step", ur: "مرحلہ" },
    detailsMismatch: { en: "Details Mismatch", ur: "تفصیلات کی مطابقت میں فرق" },
    nusukStatus: { en: "NUSUK Status", ur: "نسک کی صورتحال" },
    arrival: { en: "Arrival", ur: "آمد" },
    hotel: { en: "Hotel", ur: "ہوٹل" },
    pending: { en: "Pending", ur: "زیر التواء" },
    demoMode: { en: "Demo Mode", ur: "ڈیمو موڈ" },
    officeAssistantWelcome: { en: "Salaam! Operations Assistant online. How can I help?", ur: "سلام! آپریشنز اسسٹنٹ آن لائن ہے۔ میں آپ کی کیا مدد کر سکتا ہوں؟" },
    typeMessage: { en: "Type message...", ur: "پیغام ٹائپ کریں..." },
    productivityHacks: { en: "High-leverage productivity hacks.", ur: "اعلیٰ درجے کے پیداواری ہیک۔" },
    boost1Title: { en: "Ask questions to your Excel file", ur: "اپنی ایکسل فائل سے سوالات پوچھیں" },
    boost1Content: { en: "Don't manually filter. Upload your sheet to Copilot/ChatGPT and ask: 'Identify groups with >5 travelers missing photos'. It saves ~15 mins per group.", ur: "دستی طور پر فلٹر نہ کریں۔ اپنی شیٹ کو Copilot/ChatGPT پر اپ لوڈ کریں اور پوچھیں: 'ان گروپس کی نشاندہی کریں جن میں 5 سے زیادہ زائرین کی تصاویر غائب ہیں'۔ یہ فی گروپ تقریباً 15 منٹ بچاتا ہے۔" },
    boost2Title: { en: "Browser Profiles", ur: "براؤزر پروفائلز" },
    boost2Content: { en: "Create a dedicated Chrome Profile for 'Umrah Operations' with NUSUK auto-login. Keeps cookies separate from personal browsing.", ur: "نسک آٹو لاگ ان کے ساتھ 'عمرہ آپریشنز' کے لیے ایک وقف کردہ کروم پروفائل بنائیں۔ کوکیز کو ذاتی براؤزنگ سے الگ رکھتا ہے۔" },
    boost3Title: { en: "Whatsapp Web Shortcuts", ur: "واٹس ایپ ویب شارٹ کٹس" },
    boost3Content: { en: "Use 'Ctrl + Alt + N' to start a new chat quickly. Use templates stored in this app to avoid re-typing.", ur: "نئی چیٹ جلدی شروع کرنے کے لیے 'Ctrl + Alt + N' استعمال کریں۔ دوبارہ ٹائپ کرنے سے بچنے کے لیے اس ایپ میں اسٹور کردہ ٹیمپلیٹس استعمال کریں۔" },
    respDelay: { en: "Tell them: 'The visa server is feeling moody today, but I'm charming it. Need that file ASAP to keep the mood up!'", ur: "انہیں بتائیں: 'ویزا سرور آج تھوڑا موڈی محسوس کر رہا ہے، لیکن میں اسے منا رہا ہوں۔ موڈ کو برقرار رکھنے کے لیے جلد از جلد اس فائل کی ضرورت ہے!'" },
    respUrgent: { en: "Reply: 'On it faster than a taxi to Haram at 3 AM.'", ur: "جواب دیں: 'صبح 3 بجے حرم کی ٹیکسی سے بھی تیز کام پر لگا ہوں۔'" },
    respCoffee: { en: "I can't pour coffee, but I can pour data. Go get a V60 to maximize focus.", ur: "میں کافی نہیں ڈال سکتا، لیکن میں ڈیٹا ڈال سکتا ہوں۔ فوکس کو زیادہ سے زیادہ کرنے کے لیے V60 حاصل کریں۔" },
    respHello: { en: "Salaam! I'm here to keep your workflow flowing. Ask me for a boost or a joke.", ur: "سلام! میں آپ کے ورک فلو کو رواں رکھنے کے لیے یہاں ہوں۔ مجھ سے بوسٹ یا لطیفے کے لیے پوچھیں۔" },
    respHelp: { en: "I can help with: 'delaying colleague', 'how to scan', 'boost productivity'.", ur: "میں 'رابطے میں تاخیر'، 'اسکین کرنے کا طریقہ'، 'پیداواری صلاحیت بڑھانے' میں مدد کر سکتا ہوں۔" },
    respScan: { en: "To scan passports: Go to Group Details > Upload CSV or click the 'Run Risk Scan' button.", ur: "پاسپورٹ اسکین کرنے کے لیے: گروپ کی تفصیلات پر جائیں > CSV اپ لوڈ کریں یا 'رن رسک اسکین' بٹن پر کلک کریں۔" },
    respDefault: { en: "I'm just a simple rule-based bot. Try asking about 'delay' or 'help'.", ur: "میں صرف ایک سادہ رول بیسڈ بوٹ ہوں۔ 'تاخیر' یا 'مدد' کے بارے میں پوچھنے کی کوشش کریں۔" },
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
