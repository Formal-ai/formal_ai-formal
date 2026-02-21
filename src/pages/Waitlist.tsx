import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Meteors } from "@/components/ui/meteors";
import { Stars } from "@/components/ui/stars";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import CountrySelect from '@/components/ui/country-select';
import { cn } from "@/lib/utils";
import { Waves } from "@/components/ui/wave-background";

/* ─── Types ─── */
type Role = "" | "customer" | "designer";

interface IdentityData {
    fullName: string;
    email: string;
    phone: string;
    ageRange: string;
}

const PhoneInputComponent = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
    return (
        <Input
            className={cn(
                "bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white h-12 rounded-2xl focus:ring-1 focus:ring-primary transition-all font-light flex-1",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
PhoneInputComponent.displayName = "PhoneInputComponent";

/* ─── Option Card ─── */
const OptionCard = ({
    selected,
    onClick,
    label,
}: {
    selected: boolean;
    onClick: () => void;
    label: string;
}) => (
    <motion.button
        type="button"
        whileHover={{ scale: 1.005, backgroundColor: "rgba(var(--primary), 0.02)" }}
        whileTap={{ scale: 0.995 }}
        onClick={onClick}
        className={`group w-full text-left py-4 px-5 rounded-[2rem] border transition-all duration-300 relative overflow-hidden ${selected
            ? "border-primary dark:border-white bg-primary/5 dark:bg-white/5 shadow-md shadow-primary/5 dark:shadow-white/5"
            : "border-border/50 dark:border-white/10 hover:border-primary/30 dark:hover:border-white/20 bg-card/50 dark:bg-white/[0.02]"
            }`}
    >
        <div className={`absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity duration-300 ${selected ? "opacity-100" : ""}`} />

        <div className="flex items-center justify-between relative z-10">
            <p className={`text-[15px] transition-colors duration-200 ${selected ? "font-semibold text-foreground dark:text-white" : "text-muted-foreground group-hover:text-foreground/80 dark:group-hover:text-white/80"}`}>
                {label}
            </p>

            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selected
                ? "border-primary dark:border-white bg-primary dark:bg-white scale-110"
                : "border-muted-foreground/30 group-hover:border-primary/50 dark:group-hover:border-white/50"
                }`}>
                {selected && (
                    <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        width="10" height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-primary-foreground dark:text-black stroke-[4px]"
                    >
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                )}
            </div>
        </div>
    </motion.button>
);

/* ─── Question Block (single-select) ─── */
const QuestionBlock = ({
    question,
    options,
    value,
    onChange,
    index,
    required = true,
}: {
    question: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (v: string) => void;
    index: number;
    required?: boolean;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="space-y-4 mb-8"
    >
        <div className="flex items-baseline gap-4">
            <span className="text-2xl font-mono text-muted-foreground/40 font-bold select-none">
                0{index + 1}
            </span>
            <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-semibold text-foreground dark:text-white leading-tight">
                    {question} {required && <span className="text-red-500 text-sm align-top">*</span>}
                </h3>
            </div>
        </div>

        <div className="grid gap-3 pl-0 md:pl-10">
            {options.map((opt) => (
                <OptionCard
                    key={opt.value}
                    selected={value === opt.value}
                    onClick={() => onChange(opt.value)}
                    label={opt.label}
                />
            ))}
        </div>
    </motion.div>
);

/* ─── Customer Questions ─── */
const customerQuestions = [
    {
        key: "excites",
        question: "What excites you most about Formal.AI?",
        options: [
            { label: "Trying outfits virtually before buying", value: "virtual-tryon" },
            { label: "Getting studio-quality professional photos instantly", value: "pro-photos" },
            { label: "Experimenting with hairstyles and accessories risk-free", value: "hair-accessories" },
            { label: "All of the above", value: "all" },
        ],
    },
    {
        key: "firstStudio",
        question: "Which studio would you use first?",
        options: [
            { label: "Dress Yourself (virtual try-on)", value: "dress-yourself" },
            { label: "Portrait Studio (professional headshots)", value: "portrait" },
            { label: "Hair and Accessories Studio", value: "hair" },
            { label: "Background Studio", value: "background" },
            { label: "Magic Prompt (AI-assisted styling)", value: "magic-prompt" },
        ],
    },
    {
        key: "tryonFrequency",
        question: "How often would you use a virtual try-on feature?",
        options: [
            { label: "Daily", value: "daily" },
            { label: "A few times a week", value: "few-weekly" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly or for special occasions", value: "monthly" },
        ],
    },
    {
        key: "buyIntent",
        question: "If a virtual try-on looked great, would you purchase directly?",
        options: [
            { label: "Yes, immediately", value: "instant-buy" },
            { label: "Likely, if the price is right", value: "price-dependent" },
            { label: "Maybe, I would save it first", value: "screenshot-first" },
            { label: "No, I prefer to browse only", value: "explore-only" },
        ],
    },
    {
        key: "tellFriend",
        question: "What would make you recommend Formal.AI to others?",
        options: [
            { label: "Photorealistic AI-generated images", value: "photorealism" },
            { label: "Ability to shop outfits directly in the app", value: "in-app-shopping" },
            { label: "Time saved when preparing for events", value: "time-save" },
            { label: "The overall experience and ease of use", value: "fun" },
        ],
    },
    {
        key: "pricing",
        question: "Which pricing model would you prefer?",
        options: [
            { label: "Free tier with limited features", value: "free-forever" },
            { label: "Free trial, then $9.99/month for unlimited access", value: "freemium" },
            { label: "Pay-per-image ($1\u20132 each)", value: "pay-per-use" },
            { label: "Premium annual subscription with full access", value: "premium-annual" },
        ],
    },
    {
        key: "usageFrequency",
        question: "How often do you see yourself using Formal.AI?",
        options: [
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
            { label: "Only for special events", value: "special-events" },
        ],
    },
];

/* ─── Designer Questions ─── */
const designerQuestions = [
    {
        key: "sellChannel",
        question: "Where do you currently sell your clothing or designs?",
        options: [
            { label: "My own website", value: "own-website" },
            { label: "Social media (Instagram, TikTok)", value: "social" },
            { label: "Physical retail or pop-up shops", value: "retail" },
            { label: "Online marketplaces (Etsy, Depop, etc.)", value: "marketplace" },
            { label: "I'm just starting out", value: "starting-out" },
        ],
    },
    {
        key: "returnProblem",
        question: "How significant are returns caused by sizing or fit issues?",
        options: [
            { label: "Minimal impact", value: "minimal" },
            { label: "Noticeable but manageable", value: "annoying" },
            { label: "A major cost to my business", value: "major" },
            { label: "Not applicable yet", value: "not-launched" },
        ],
    },
    {
        key: "virtualTryonImpact",
        question: "How would virtual try-on for your designs impact your business?",
        options: [
            { label: "Significantly — fewer returns, higher conversion", value: "game-changer" },
            { label: "Worth testing", value: "interested" },
            { label: "Uncertain — I would need to see results first", value: "need-proof" },
        ],
    },
    {
        key: "marketplace",
        question: "Would you list products on Formal.AI's marketplace for try-on and direct purchase?",
        options: [
            { label: "Yes, absolutely", value: "yes-future" },
            { label: "Possibly, depending on commission terms", value: "depends-commission" },
            { label: "No, I prefer driving traffic to my own store", value: "own-store" },
        ],
    },
    {
        key: "monthlyReleases",
        question: "How many new products do you release per month?",
        options: [
            { label: "1\u20135 items", value: "1-5" },
            { label: "6\u201320 items", value: "6-20" },
            { label: "21\u201350 items", value: "21-50" },
            { label: "50+ items", value: "50+" },
        ],
    },
    {
        key: "readyToJoin",
        question: "How interested are you in offering virtual try-on to your customers?",
        options: [
            { label: "Very interested — ready to get started", value: "sign-me-up" },
            { label: "Interested — keep me updated", value: "intrigued" },
            { label: "Curious, but I have questions", value: "have-questions" },
        ],
    },
];

/* ─── Main Component ─── */
const Waitlist = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1
    const [identity, setIdentity] = useState<IdentityData>({
        fullName: "",
        email: "",
        phone: "",
        ageRange: "",
    });
    const [identityErrors, setIdentityErrors] = useState<Partial<IdentityData>>({});

    // Step 2
    const [role, setRole] = useState<Role>("");

    // Step 3 — answers keyed by question key
    const [answers, setAnswers] = useState<Record<string, string>>({});

    // Honeypot
    const [honeypot, setHoneypot] = useState("");

    const [waitlistId, setWaitlistId] = useState<string | null>(null);

    /* ─── Validation ─── */
    const validateIdentity = (): boolean => {
        const errors: Partial<IdentityData> = {};
        if (!identity.fullName || identity.fullName.length < 2) errors.fullName = "Full name must be at least 2 characters";
        if (!identity.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email)) errors.email = "Please enter a valid email";
        if (!identity.phone || identity.phone.length < 5) errors.phone = "Please enter a valid phone number";
        if (!identity.ageRange) errors.ageRange = "Please select an age range";
        setIdentityErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep3 = (): boolean => {
        const questions = role === "customer" ? customerQuestions : designerQuestions;
        const missing = questions.filter((q) => !answers[q.key]);
        if (missing.length > 0) {
            toast.error(`Please answer all questions (${missing.length} remaining)`);
            return false;
        }
        return true;
    };

    /* ─── Submit ─── */
    const onSubmit = async () => {
        if (honeypot) return;
        if (!validateStep3()) return;

        setIsSubmitting(true);
        try {
            const { data, error } = await (supabase as any)
                .from("waitlist")
                .insert({
                    full_name: identity.fullName,
                    email: identity.email,
                    phone_number: identity.phone,
                    use_case: role === "customer" ? "Customer" : "Designer/Brand",
                    motivation: role === "customer" ? "Aspiring Customer" : "Designer/Brand Owner",
                    status: "pending",
                    metadata: {
                        ageRange: identity.ageRange,
                        role,
                        ...answers,
                    },
                })
                .select()
                .single();

            if (error) throw error;
            if (data) setWaitlistId((data as any).id);
            setIsSubmitted(true);
            toast.success("Your spot has been secured.");
        } catch (error: any) {
            console.error(error);
            if (error.code === "23505" || error.message?.includes("duplicate key")) {
                toast.info("You are already on the waitlist! We'll be in touch.");
                setIsSubmitted(true);
            } else {
                toast.error(error.message || "Failed to join waitlist. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ─── Step Config ─── */
    const totalSteps = 3;
    const progressPercent = step === 1 ? "33%" : step === 2 ? "66%" : "100%";

    const stepTitles: Record<number, { title: string; desc: string }> = {
        1: { title: "Identity", desc: "No friction, real commitment." },
        2: { title: "Who Are You?", desc: "Help us tailor the perfect experience for you." },
        3: { title: role === "customer" ? "Your Style Preferences" : "Your Business", desc: role === "customer" ? "Help us build exactly what you want." : "Let's understand how Formal.AI can accelerate your brand." },
    };

    const ageOptions = ["Under 18", "18–24", "25–34", "35–44", "45+"];

    return (
        <div className="min-h-screen bg-black text-foreground transition-colors duration-300 relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <Waves
                    backgroundColor="transparent"
                    strokeColor="rgba(255,255,255,0.08)"
                />
            </div>
            <Stars number={150} />
            <Meteors number={20} />
            <Header />
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[85vh] relative z-10">
                {!isSubmitted ? (
                    <div className="w-full max-w-3xl space-y-8 relative z-10">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase leading-tight"
                            >
                                Join The <span className="animate-glow-pulse text-foreground inline-block">FORMAL.AI</span> Waitlist
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                            >
                                Get <span className="animate-glow-pulse text-foreground font-medium inline-block">24 hours</span> of free professional image generation, priority access to new studios, and early feature unlocks before public launch.
                            </motion.p>
                        </div>

                        {/* Form Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card className="bg-card/70 dark:bg-card/40 border-border dark:border-white/10 text-card-foreground dark:text-white backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden ring-1 ring-border/5 dark:ring-white/5 transition-all duration-500">
                                {/* Progress Bar */}
                                <div className="h-0.5 bg-muted dark:bg-white/5 w-full">
                                    <motion.div
                                        className="h-full bg-primary dark:bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        animate={{ width: progressPercent }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                </div>

                                <CardHeader className="pt-8 px-8 pb-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        {[1, 2, 3].map((s) => (
                                            <div
                                                key={s}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${s === step
                                                    ? "bg-primary dark:bg-white text-primary-foreground dark:text-black border-primary dark:border-white"
                                                    : s < step
                                                        ? "bg-primary/20 dark:bg-white/20 text-primary dark:text-white border-primary/30 dark:border-white/30"
                                                        : "bg-transparent text-muted-foreground dark:text-white/30 border-border dark:border-white/10"
                                                    }`}
                                            >
                                                {s < step ? "✓" : s}
                                            </div>
                                        ))}
                                    </div>
                                    <CardTitle className="text-2xl font-semibold tracking-tight">{stepTitles[step]?.title}</CardTitle>
                                    <CardDescription className="text-muted-foreground">{stepTitles[step]?.desc}</CardDescription>
                                </CardHeader>

                                <CardContent className="p-8">
                                    <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" aria-hidden="true" />

                                    <AnimatePresence mode="wait">
                                        {/* ────── STEP 1: Identity ────── */}
                                        {step === 1 && (
                                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                                <div className="grid gap-5">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-muted-foreground dark:text-neutral-300">Full Name <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            value={identity.fullName}
                                                            onChange={(e) => setIdentity({ ...identity, fullName: e.target.value })}
                                                            placeholder="Enter your name"
                                                            className="bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white h-12 rounded-2xl focus:ring-1 focus:ring-primary transition-all font-light"
                                                            autoFocus
                                                        />
                                                        {identityErrors.fullName && <p className="text-xs text-red-500 font-medium">{identityErrors.fullName}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-muted-foreground dark:text-neutral-300">Email Address <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            type="email"
                                                            value={identity.email}
                                                            onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                                                            placeholder="name@example.com"
                                                            className="bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white h-12 rounded-2xl focus:ring-1 focus:ring-primary transition-all font-light"
                                                        />
                                                        {identityErrors.email && <p className="text-xs text-red-500 font-medium">{identityErrors.email}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-muted-foreground dark:text-neutral-300">
                                                            Phone Number <span className="text-red-500">*</span>
                                                            <span className="text-muted-foreground text-xs ml-2 font-normal">(Required for invite notification)</span>
                                                        </Label>
                                                        <PhoneInput
                                                            international
                                                            countryCallingCodeEditable={false}
                                                            countrySelectComponent={CountrySelect}
                                                            defaultCountry="BW"
                                                            value={identity.phone}
                                                            onChange={(value) => setIdentity({ ...identity, phone: value || "" })}
                                                            className="flex items-center gap-2"
                                                            inputComponent={PhoneInputComponent}
                                                            placeholder="Enter phone number"
                                                        />
                                                        {identityErrors.phone && <p className="text-xs text-red-500 font-medium">{identityErrors.phone}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-muted-foreground dark:text-neutral-300">Age Range <span className="text-red-500">*</span></Label>
                                                        <div className="grid grid-cols-5 gap-2">
                                                            {ageOptions.map((age) => (
                                                                <button
                                                                    key={age}
                                                                    type="button"
                                                                    onClick={() => setIdentity({ ...identity, ageRange: age })}
                                                                    className={`py-3 px-2 rounded-2xl text-xs font-medium border-2 transition-all ${identity.ageRange === age
                                                                        ? "border-primary dark:border-white bg-primary/10 dark:bg-white/10 text-foreground dark:text-white"
                                                                        : "border-border dark:border-white/10 text-muted-foreground hover:border-primary/40 dark:hover:border-white/30"
                                                                        }`}
                                                                >
                                                                    {age}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {identityErrors.ageRange && <p className="text-xs text-red-500 font-medium">{identityErrors.ageRange}</p>}
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    className="w-full h-11 mt-4 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm transition-transform active:scale-[0.98]"
                                                    onClick={() => {
                                                        if (validateIdentity()) setStep(2);
                                                    }}
                                                >
                                                    Continue
                                                </Button>
                                            </motion.div>
                                        )}

                                        {/* ────── STEP 2: Role Selection ────── */}
                                        {step === 2 && (
                                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                                <p className="text-sm font-medium text-muted-foreground dark:text-neutral-300">
                                                    Choose the path that best describes you <span className="text-red-500">*</span>
                                                </p>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {/* Customer Card */}
                                                    <motion.button
                                                        type="button"
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setRole("customer")}
                                                        className={`text-left p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${role === "customer"
                                                            ? "border-primary dark:border-white bg-primary/5 dark:bg-white/5 shadow-xl shadow-primary/10 dark:shadow-white/10"
                                                            : "border-border dark:border-white/10 hover:border-primary/40 dark:hover:border-white/30"
                                                            }`}
                                                    >
                                                        <span className="text-[11px] font-semibold uppercase tracking-widest text-primary/70 dark:text-white/50 mb-2 block">Customer</span>
                                                        <h3 className="text-base font-bold text-foreground dark:text-white leading-snug">I want to style myself</h3>
                                                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Virtual try-on, professional photos, hairstyles and accessories</p>
                                                        {role === "customer" && (
                                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-xs font-semibold text-primary dark:text-white uppercase tracking-wider">
                                                                ✓ Selected
                                                            </motion.div>
                                                        )}
                                                    </motion.button>

                                                    {/* Designer Card */}
                                                    <motion.button
                                                        type="button"
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setRole("designer")}
                                                        className={`text-left p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${role === "designer"
                                                            ? "border-primary dark:border-white bg-primary/5 dark:bg-white/5 shadow-xl shadow-primary/10 dark:shadow-white/10"
                                                            : "border-border dark:border-white/10 hover:border-primary/40 dark:hover:border-white/30"
                                                            }`}
                                                    >
                                                        <span className="text-[11px] font-semibold uppercase tracking-widest text-primary/70 dark:text-white/50 mb-2 block">Brand / Designer</span>
                                                        <h3 className="text-base font-bold text-foreground dark:text-white leading-snug">I want to sell my designs</h3>
                                                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">List your products, enable virtual try-on, and sell directly to customers</p>
                                                        {role === "designer" && (
                                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-xs font-semibold text-primary dark:text-white uppercase tracking-wider">
                                                                ✓ Selected
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="flex-1 h-11 rounded-2xl border border-border dark:border-white/10 hover:bg-accent/50 text-muted-foreground"
                                                        onClick={() => setStep(1)}
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        className="flex-[2] h-11 rounded-2xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                                        disabled={!role}
                                                        onClick={() => {
                                                            if (!role) {
                                                                toast.error("Please select a path to continue.");
                                                                return;
                                                            }
                                                            setStep(3);
                                                        }}
                                                    >
                                                        Continue
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* ────── STEP 3: Conditional Questions ────── */}
                                        {step === 3 && (
                                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                                {(role === "customer" ? customerQuestions : designerQuestions).map((q, idx) => (
                                                    <QuestionBlock
                                                        key={q.key}
                                                        question={q.question}
                                                        options={q.options}
                                                        value={answers[q.key] || ""}
                                                        onChange={(v) => setAnswers({ ...answers, [q.key]: v })}
                                                        index={idx}
                                                    />
                                                ))}

                                                <div className="flex gap-4 pt-6">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="flex-1 h-11 rounded-2xl border border-border dark:border-white/10 hover:bg-accent/50 text-muted-foreground"
                                                        onClick={() => setStep(2)}
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        className="flex-[2] h-11 rounded-2xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                                        disabled={isSubmitting}
                                                        onClick={onSubmit}
                                                    >
                                                        {isSubmitting ? "Securing your spot..." : "Secure My Spot"}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                ) : (
                    /* ────── SUCCESS SCREEN ────── */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-lg w-full space-y-6"
                    >
                        {/* Confirmation Card */}
                        <Card className="bg-card dark:bg-[#0a0a0a] border-border dark:border-white/10 text-card-foreground dark:text-white shadow-2xl rounded-[3rem] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                            <CardContent className="p-12 text-center space-y-6 relative z-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="w-16 h-16 bg-primary dark:bg-white rounded-full mx-auto flex items-center justify-center mb-6"
                                >
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary-foreground dark:text-black">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight">You're on the waitlist</h2>
                                    <p className="text-muted-foreground text-lg leading-relaxed">
                                        We're onboarding early users in limited waves. You'll be notified first when your access is ready.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Challenge CTA */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <Card className="bg-gradient-to-br from-primary/5 via-card to-primary/10 dark:from-white/5 dark:via-[#0a0a0a] dark:to-white/10 border-primary/20 dark:border-white/20 text-card-foreground dark:text-white shadow-xl rounded-[3rem] overflow-hidden cursor-pointer group"
                                onClick={() => navigate("/waitlist/challenge", { state: { waitlistId } })}
                            >
                                <CardContent className="p-8 text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center mx-auto">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary dark:text-white">
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold">Quick Challenge</h3>
                                    <p className="text-muted-foreground">
                                        Can you tell AI from reality? Guess correctly and unlock a <span className="font-bold text-foreground dark:text-white">SURPRISE bonus</span> when we launch!
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate("/waitlist/challenge", { state: { waitlistId } });
                                        }}
                                        className="mt-2 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold group-hover:shadow-lg transition-all"
                                    >
                                        Take the Challenge →
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <div className="text-center">
                            <Link to="/">
                                <Button variant="link" className="text-muted-foreground hover:text-foreground">
                                    Return to Homepage
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default Waitlist;
