import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, Cookie, ShieldCheck, BarChart3, Megaphone, Share2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface CookiePreferences {
    essential: boolean;
    performance: boolean;
    analytics: boolean;
    advertising: boolean;
    social: boolean;
    uncategorized: boolean;
}

const STORAGE_KEY = "TERMLY_COOKIE_CONSENT";

export const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true,
        performance: true,
        analytics: true,
        advertising: true,
        social: true,
        uncategorized: true,
    });

    useEffect(() => {
        const consent = localStorage.getItem(STORAGE_KEY);
        if (!consent) {
            const timer = setTimeout(() => setShowBanner(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = {
            essential: true,
            performance: true,
            analytics: true,
            advertising: true,
            social: true,
            uncategorized: true,
        };
        savePreferences(allAccepted);
    };

    const handleSavePreferences = () => {
        savePreferences(preferences);
    };

    const savePreferences = (prefs: CookiePreferences) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...prefs,
            timestamp: new Date().toISOString(),
        }));
        setShowBanner(false);
        setShowPreferences(false);
    };

    const togglePreference = (key: keyof CookiePreferences) => {
        if (key === 'essential') return;
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const PreferenceItem = ({
        id,
        title,
        description,
        icon: Icon,
        enabled,
        isEssential = false
    }: {
        id: keyof CookiePreferences;
        title: string;
        description: string;
        icon: any;
        enabled: boolean;
        isEssential?: boolean;
    }) => (
        <div className="border border-border/10 rounded-2xl bg-muted/20 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground">{title}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground h-7"
                        onClick={() => toggleSection(id)}
                    >
                        {expandedSection === id ? "Hide Details" : "Details"}
                        {expandedSection === id ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </Button>
                    <Switch
                        checked={enabled}
                        onCheckedChange={() => togglePreference(id)}
                        disabled={isEssential}
                    />
                </div>
            </div>
            <AnimatePresence>
                {expandedSection === id && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 overflow-hidden"
                    >
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <>
            <AnimatePresence>
                {showBanner && !showPreferences && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className="ios-glass-card p-4 md:p-6 rounded-[2rem] border border-white/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                                <div className="flex items-start gap-4">
                                    <div className="hidden sm:flex p-3 bg-primary/10 rounded-2xl">
                                        <Cookie className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed max-w-4xl">
                                            We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyse website traffic. By clicking "Accept", you agree to our website's cookie use as described in our <Link to="/cookie-policy" className="text-primary hover:underline font-medium">Cookie Policy</Link>. You can change your cookie settings at any time by clicking <button onClick={() => setShowPreferences(true)} className="text-primary hover:underline font-medium">"Preferences"</button>.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-3 w-full md:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPreferences(true)}
                                        className="flex-1 md:flex-none h-12 rounded-full border-border/20 px-8 font-semibold hover:bg-muted/50 transition-all active:scale-95"
                                    >
                                        Preferences
                                    </Button>
                                    <Button
                                        onClick={handleAcceptAll}
                                        className="flex-1 md:flex-none h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 px-10 font-bold shadow-lg transition-all active:scale-95"
                                    >
                                        Accept
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPreferences && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setShowPreferences(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="ios-glass-card w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 relative z-[71]"
                        >
                            <div className="p-6 md:p-8 border-b border-border/10 flex items-center justify-between bg-muted/10">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-foreground">Cookie Preferences</h2>
                                    <p className="text-sm text-muted-foreground">Customize how we use cookies at Formal.AI</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-muted"
                                    onClick={() => setShowPreferences(false)}
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    We use different types of cookies to optimise your experience on our website. Click on the categories below to learn more about their purposes. You may choose which types of cookies to allow and can change your preferences at any time. The choices you make are saved for a maximum duration of 12 months. Remember that disabling cookies may affect your experience.
                                </p>

                                <div className="space-y-3">
                                    <PreferenceItem
                                        id="essential"
                                        title="Strictly Necessary Cookies"
                                        description="These cookies are necessary to the core functionality of our website and some of its features, such as access to secure areas."
                                        icon={ShieldCheck}
                                        enabled={preferences.essential}
                                        isEssential={true}
                                    />
                                    <PreferenceItem
                                        id="performance"
                                        title="Performance and Functionality"
                                        description="These cookies are used to enhance the performance and functionality of our websites but are nonessential to their use. However, without these cookies, certain functionality (like videos) may become unavailable."
                                        icon={Cookie}
                                        enabled={preferences.performance}
                                    />
                                    <PreferenceItem
                                        id="analytics"
                                        title="Analytics and Customisation"
                                        description="These cookies collect information that can help us understand how our websites are being used. This information can also be used to measure effectiveness in our marketing campaigns or to curate a personalised site experience for you."
                                        icon={BarChart3}
                                        enabled={preferences.analytics}
                                    />
                                    <PreferenceItem
                                        id="advertising"
                                        title="Advertising Cookies"
                                        description="These cookies are used to make advertising messages more relevant to you. They prevent the same ad from continuously reappearing, ensure that ads are properly displayed for advertisers, and in some cases select advertisements that are based on your interests."
                                        icon={Megaphone}
                                        enabled={preferences.advertising}
                                    />
                                    <PreferenceItem
                                        id="social"
                                        title="Social Media Cookies"
                                        description="These cookies enable you to share our website's content through third-party social networks and other websites. These cookies may also be used for advertising purposes."
                                        icon={Share2}
                                        enabled={preferences.social}
                                    />
                                    <PreferenceItem
                                        id="uncategorized"
                                        title="Uncategorised Cookies"
                                        description="These are cookies that have not yet been categorised. We are in the process of classifying these cookies with the help of their providers."
                                        icon={HelpCircle}
                                        enabled={preferences.uncategorized}
                                    />
                                </div>

                                <div className="pt-6 text-center">
                                    <p className="text-xs text-muted-foreground">
                                        Learn more by visiting our <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 border-t border-border/10 flex flex-col sm:flex-row gap-4 bg-muted/5">
                                <Button
                                    variant="outline"
                                    onClick={handleAcceptAll}
                                    className="flex-1 h-12 rounded-full border-border/20 font-semibold hover:bg-muted/50 transition-all active:scale-95"
                                >
                                    Accept All
                                </Button>
                                <Button
                                    onClick={handleSavePreferences}
                                    className="flex-1 h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold shadow-lg transition-all active:scale-95"
                                >
                                    Save Preferences
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
