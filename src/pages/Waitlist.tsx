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

interface BusinessData {
    companyName: string;
    jobTitle: string;
    websiteUrl: string;
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
        whileHover={{ scale: 1.01, backgroundColor: "rgba(var(--primary), 0.02)" }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={`group w-full text-left py-3.5 px-4 md:py-4 md:px-6 rounded-2xl md:rounded-[2rem] border transition-all duration-300 relative overflow-hidden ${selected
            ? "border-primary dark:border-white bg-primary/10 dark:bg-white/10 shadow-lg shadow-primary/5 dark:shadow-white/5"
            : "border-border/60 dark:border-white/20 hover:border-primary/50 dark:hover:border-white/40 bg-card/80 dark:bg-white/[0.05]"
            }`}
    >
        <div className={`absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity duration-300 ${selected ? "opacity-100" : ""}`} />

        <div className="flex items-center justify-between gap-4 relative z-10">
            <p className={`text-[0.9375rem] md:text-base leading-relaxed transition-colors duration-200 flex-1 ${selected ? "font-bold text-foreground dark:text-white" : "text-zinc-800 dark:text-zinc-200 font-medium group-hover:text-foreground dark:group-hover:text-white"}`}>
                {label}
            </p>

            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${selected
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
        className="space-y-4 mb-10"
    >
        <div className="flex items-start gap-3 md:gap-4">
            <span className="text-xl md:text-2xl font-mono text-primary/60 dark:text-blue-400/60 font-bold select-none pt-0.5 md:pt-1">
                0{index + 1}
            </span>
            <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold font-serif text-foreground dark:text-white leading-tight tracking-tight">
                    {question} {required && <span className="text-red-500 text-sm align-top font-normal">*</span>}
                </h3>
            </div>
        </div>

        <div className="grid gap-3.5 pl-0 md:pl-10">
            {options.map((opt) => (
                <OptionCard
                    key={opt.value}
                    selected={value === opt.value}
                    onClick={() => onChange(opt.value)}
                    label={opt.label}
                />
            ))}
        </div>
    </motion.div >
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
            { label: "Pay-per-image ($1–2 each)", value: "pay-per-use" },
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
            { label: "1–5 items", value: "1-5" },
            { label: "6–20 items", value: "6-20" },
            { label: "21–50 items", value: "21-50" },
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
    const [business, setBusiness] = useState<BusinessData>({
        companyName: "",
        jobTitle: "",
        websiteUrl: "",
    });
    const [businessErrors, setBusinessErrors] = useState<Partial<BusinessData>>({});

    // Step 3 — answers keyed by question key
    const [answers, setAnswers] = useState<Record<string, string>>({});

    // Honeypot
    const [honeypot, setHoneypot] = useState("");

    const [waitlistId, setWaitlistId] = useState<string | null>(null);
    const [challengeSelection, setChallengeSelection] = useState<"a" | "b" | null>(null);

    const shareMessage = `The Formal AI waitlist is NOW OPEN!

If you want AI-generated professional portraits or you’re a designer wanting to showcase your brand digitally, 

Waitlist members get priority access and launch benefits.

Join here:👇
https://formalai.studio/`;

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

    const validateBusiness = (): boolean => {
        if (role !== "designer") return true;
        const errors: Partial<BusinessData> = {};
        if (!business.companyName || business.companyName.trim().length < 2) errors.companyName = "Company name is required";
        if (!business.jobTitle || business.jobTitle.trim().length < 2) errors.jobTitle = "Job title is required";
        if (business.websiteUrl && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(business.websiteUrl)) {
            errors.websiteUrl = "Please enter a valid URL";
        }
        setBusinessErrors(errors);
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

    const validateStep4 = (): boolean => {
        if (!challengeSelection) {
            toast.error("Please select an image to continue.");
            return false;
        }
        return true;
    };

    /* ─── Submit ─── */
    const onSubmit = async () => {
        if (honeypot) return;
        if (!validateStep4()) return;

        setIsSubmitting(true);
        try {
            // DEBUG: Log everything before submission
            console.log("DEBUG: Submitting waitlist form", {
                identity,
                role,
                answers,
                challengeSelection,
                metadata: {
                    ageRange: identity.ageRange,
                    role,
                    ...answers,
                    challengeSelection: challengeSelection,
                    challengeCorrect: challengeSelection === "a",
                }
            });

            // 1. Insert into waitlist
            const { data: waitlistData, error: waitlistError } = await (supabase as any)
                .from("waitlist")
                .insert({
                    full_name: identity.fullName,
                    email: identity.email,
                    phone_number: identity.phone,
                    company_name: role === "designer" ? business.companyName : null,
                    job_title: role === "designer" ? business.jobTitle : null,
                    website_url: role === "designer" ? business.websiteUrl : null,
                    use_case: role === "customer" ? "Customer" : "Designer/Brand",
                    motivation: role === "customer" ? "Aspiring Customer" : "Designer/Brand Owner",
                    status: "pending",
                    metadata: {
                        ageRange: identity.ageRange,
                        role,
                        ...answers,
                        challengeSelection: challengeSelection,
                        challengeCorrect: challengeSelection === "a",
                    },
                })
                .select()
                .single();

            if (waitlistError) throw waitlistError;

            const newWaitlistId = (waitlistData as any).id;
            setWaitlistId(newWaitlistId);

            // 2. Insert into challenge_submissions
            const isCorrect = challengeSelection === "a";
            const { error: challengeError } = await (supabase
                .from("challenge_submissions" as any) as any)
                .insert({
                    waitlist_id: newWaitlistId,
                    selection: challengeSelection,
                    is_correct: isCorrect,
                });

            if (challengeError) {
                console.error("Error submitting challenge:", challengeError);
                // We don't throw here to avoid failing the whole process if just the challenge log fails
            }

            setIsSubmitted(true);
            toast.success("Your spot has been secured!");
        } catch (error) {
            const err = error as { code?: string; message?: string };
            console.error(err);
            if (err.code === "23505" || err.message?.includes("duplicate key")) {
                toast.info("You are already on the waitlist! We'll be in touch.");
                setIsSubmitted(true);
            } else {
                toast.error(err.message || "Failed to join waitlist. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ─── Step Config ─── */
    const totalSteps = 4;
    const progressPercent = step === 1 ? "25%" : step === 2 ? "50%" : step === 3 ? "75%" : "100%";

    const stepTitles: Record<number, { title: string; desc: string }> = {
        1: { title: "Identity", desc: "No friction, real commitment." },
        2: { title: "Who Are You?", desc: "Help us tailor the perfect experience for you." },
        3: { title: role === "customer" ? "Your Style Preferences" : "Your Business", desc: role === "customer" ? "Help us build exactly what you want." : "Let's understand how Formal.AI can accelerate your brand." },
        4: { title: "", desc: "" },
    };

    const ageOptions = ["Under 18", "18–24", "25–34", "35–44", "45+"];

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <Waves
                    backgroundColor="transparent"
                    strokeColor="hsla(var(--foreground) / 0.08)"
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

                                <CardHeader className="pt-8 px-6 md:px-8 pb-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        {[1, 2, 3, 4].map((s) => (
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
                                    <CardTitle className="text-3xl md:text-4xl font-bold font-serif tracking-tight">{stepTitles[step]?.title}</CardTitle>
                                    <CardDescription className="text-base md:text-lg text-muted-foreground mt-2">{stepTitles[step]?.desc}</CardDescription>
                                </CardHeader>

                                <CardContent className="p-4 md:p-8">
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
                                                        <div className="flex flex-wrap gap-2">
                                                            {ageOptions.map((age) => (
                                                                <button
                                                                    key={age}
                                                                    type="button"
                                                                    onClick={() => setIdentity({ ...identity, ageRange: age })}
                                                                    className={`flex-1 min-w-[80px] py-3 px-3 rounded-2xl text-sm font-semibold border-2 transition-all whitespace-nowrap ${identity.ageRange === age
                                                                        ? "border-primary dark:border-white bg-primary/10 dark:bg-white/10 text-foreground dark:text-white"
                                                                        : "border-border dark:border-white/10 text-foreground/70 dark:text-white/60 hover:border-primary/40 dark:hover:border-white/30"
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
                                                        className={`text-left p-6 rounded-[2.5rem] border-2 transition-all duration-300 relative overflow-hidden ${role === "customer"
                                                            ? "border-primary dark:border-white bg-primary/5 dark:bg-white/5 shadow-xl shadow-primary/10 dark:shadow-white/10"
                                                            : "border-border dark:border-white/10 hover:border-primary/40 dark:hover:border-white/30"
                                                            }`}
                                                    >
                                                        {/* Customer styling pattern background */}
                                                        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
                                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cstyle%3E.c%7Bfill:none;stroke:%236b9bd2;stroke-width:1%7D%3C/style%3E%3C/defs%3E%3C!-- Hand mirror --%3E%3Ccircle cx='45' cy='35' r='18' class='c'/%3E%3Ccircle cx='45' cy='35' r='14' class='c'/%3E%3Cline x1='45' y1='53' x2='45' y2='75' class='c' stroke-width='3'/%3E%3C!-- Hair comb --%3E%3Crect x='130' y='20' width='30' height='8' rx='2' class='c'/%3E%3Cline x1='135' y1='28' x2='135' y2='42' class='c'/%3E%3Cline x1='140' y1='28' x2='140' y2='42' class='c'/%3E%3Cline x1='145' y1='28' x2='145' y2='42' class='c'/%3E%3Cline x1='150' y1='28' x2='150' y2='42' class='c'/%3E%3Cline x1='155' y1='28' x2='155' y2='42' class='c'/%3E%3C!-- Sunglasses --%3E%3Cellipse cx='35' cy='120' rx='16' ry='12' class='c'/%3E%3Cellipse cx='75' cy='120' rx='16' ry='12' class='c'/%3E%3Cline x1='51' y1='118' x2='59' y2='118' class='c'/%3E%3Cline x1='19' y1='115' x2='10' y2='112' class='c'/%3E%3Cline x1='91' y1='115' x2='100' y2='112' class='c'/%3E%3C!-- Lipstick --%3E%3Crect x='145' y='100' width='12' height='35' rx='2' class='c'/%3E%3Cpath d='M145 100 L151 85 L157 100' class='c'/%3E%3Cline x1='145' y1='120' x2='157' y2='120' class='c'/%3E%3C!-- Sparkles --%3E%3Cpath d='M100 80 L103 73 L106 80 L103 87 Z' class='c'/%3E%3Cline x1='96' y1='80' x2='110' y2='80' class='c'/%3E%3Cpath d='M170 160 L172 155 L174 160 L172 165 Z' class='c'/%3E%3Cline x1='167' y1='160' x2='177' y2='160' class='c'/%3E%3Cpath d='M30 170 L32 166 L34 170 L32 174 Z' class='c'/%3E%3Cline x1='28' y1='170' x2='36' y2='170' class='c'/%3E%3C!-- Hanger --%3E%3Cpath d='M120 160 L140 180 L100 180 Z' class='c'/%3E%3Cline x1='120' y1='153' x2='120' y2='160' class='c'/%3E%3Ccircle cx='120' cy='150' r='3' class='c'/%3E%3C/svg%3E")`,
                                                            backgroundSize: '200px 200px',
                                                        }} />
                                                        <span className="relative z-10 text-[15px] font-black font-serif uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-3 block">Customer</span>
                                                        <h3 className="relative z-10 text-lg font-bold text-foreground dark:text-white leading-snug">I want to style myself</h3>
                                                        <p className="relative z-10 text-sm text-muted-foreground mt-1.5 leading-relaxed">Virtual try-on, professional photos, hairstyles and accessories</p>
                                                        {role === "customer" && (
                                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mt-3 text-xs font-semibold text-primary dark:text-white uppercase tracking-wider">
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
                                                        className={`text-left p-6 rounded-[2.5rem] border-2 transition-all duration-300 relative overflow-hidden ${role === "designer"
                                                            ? "border-amber-700/60 dark:border-amber-600/50 bg-amber-900/10 dark:bg-amber-900/15 shadow-xl shadow-amber-900/10 dark:shadow-amber-800/10"
                                                            : "border-border dark:border-white/10 hover:border-amber-700/40 dark:hover:border-amber-600/30"
                                                            }`}
                                                    >
                                                        {/* Designer pattern background */}
                                                        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
                                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cstyle%3E.c%7Bfill:none;stroke:%23c4956a;stroke-width:1%7D%3C/style%3E%3C/defs%3E%3C!-- Measuring tape horizontal --%3E%3Cline x1='0' y1='30' x2='200' y2='30' class='c'/%3E%3Cline x1='10' y1='26' x2='10' y2='34' class='c'/%3E%3Cline x1='20' y1='28' x2='20' y2='32' class='c'/%3E%3Cline x1='30' y1='28' x2='30' y2='32' class='c'/%3E%3Cline x1='40' y1='28' x2='40' y2='32' class='c'/%3E%3Cline x1='50' y1='26' x2='50' y2='34' class='c'/%3E%3Cline x1='60' y1='28' x2='60' y2='32' class='c'/%3E%3Cline x1='70' y1='28' x2='70' y2='32' class='c'/%3E%3Cline x1='80' y1='28' x2='80' y2='32' class='c'/%3E%3Cline x1='90' y1='26' x2='90' y2='34' class='c'/%3E%3Cline x1='100' y1='28' x2='100' y2='32' class='c'/%3E%3Cline x1='110' y1='28' x2='110' y2='32' class='c'/%3E%3Cline x1='120' y1='28' x2='120' y2='32' class='c'/%3E%3Cline x1='130' y1='26' x2='130' y2='34' class='c'/%3E%3Cline x1='140' y1='28' x2='140' y2='32' class='c'/%3E%3Cline x1='150' y1='28' x2='150' y2='32' class='c'/%3E%3Cline x1='160' y1='28' x2='160' y2='32' class='c'/%3E%3Cline x1='170' y1='26' x2='170' y2='34' class='c'/%3E%3C!-- Scissors --%3E%3Cellipse cx='60' cy='90' rx='10' ry='6' class='c' transform='rotate(-20 60 90)'/%3E%3Cellipse cx='60' cy='100' rx='10' ry='6' class='c' transform='rotate(20 60 100)'/%3E%3Cline x1='68' y1='90' x2='85' y2='80' class='c'/%3E%3Cline x1='68' y1='100' x2='85' y2='110' class='c'/%3E%3C!-- Thread spool --%3E%3Crect x='140' y='80' width='20' height='30' rx='3' class='c'/%3E%3Cline x1='140' y1='88' x2='160' y2='88' class='c'/%3E%3Cline x1='140' y1='102' x2='160' y2='102' class='c'/%3E%3Ccircle cx='150' cy='95' r='4' class='c'/%3E%3C!-- Measuring tape vertical --%3E%3Cline x1='170' y1='0' x2='170' y2='200' class='c'/%3E%3Cline x1='166' y1='20' x2='174' y2='20' class='c'/%3E%3Cline x1='168' y1='40' x2='172' y2='40' class='c'/%3E%3Cline x1='166' y1='60' x2='174' y2='60' class='c'/%3E%3Cline x1='168' y1='80' x2='172' y2='80' class='c'/%3E%3Cline x1='166' y1='100' x2='174' y2='100' class='c'/%3E%3Cline x1='168' y1='120' x2='172' y2='120' class='c'/%3E%3Cline x1='166' y1='140' x2='174' y2='140' class='c'/%3E%3Cline x1='168' y1='160' x2='172' y2='160' class='c'/%3E%3Cline x1='166' y1='180' x2='174' y2='180' class='c'/%3E%3C!-- Needle and thread --%3E%3Cline x1='20' y1='140' x2='50' y2='170' class='c'/%3E%3Ccircle cx='18' cy='138' r='2' class='c'/%3E%3Cpath d='M50 170 Q60 155 55 145 Q50 155 65 150' class='c'/%3E%3C!-- Hanger --%3E%3Cpath d='M100 140 L115 160 L85 160 Z' class='c'/%3E%3Cline x1='100' y1='135' x2='100' y2='140' class='c'/%3E%3Ccircle cx='100' cy='133' r='3' class='c'/%3E%3C/svg%3E")`,
                                                            backgroundSize: '200px 200px',
                                                        }} />
                                                        <span className="relative z-10 text-[15px] font-black font-serif uppercase tracking-wider text-amber-700 dark:text-amber-500 mb-3 block">Brand / Designer</span>
                                                        <h3 className="relative z-10 text-lg font-bold text-foreground dark:text-white leading-snug">I want to sell my designs</h3>
                                                        <p className="relative z-10 text-sm text-muted-foreground mt-1.5 leading-relaxed">List your products, enable virtual try-on, and sell directly to customers</p>
                                                        {role === "designer" && (
                                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mt-3 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                                                ✓ Selected
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                </div>

                                                <AnimatePresence>
                                                    {role === "designer" && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="space-y-4 pt-4 px-1 pb-1 border-t border-border/50 dark:border-white/5">
                                                                <div className="grid md:grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-medium text-muted-foreground dark:text-neutral-300">Company Name <span className="text-red-500">*</span></Label>
                                                                        <Input
                                                                            value={business.companyName}
                                                                            onChange={(e) => setBusiness({ ...business, companyName: e.target.value })}
                                                                            placeholder="Your brand or company"
                                                                            className="bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white h-11 rounded-2xl focus:ring-1 focus:ring-primary font-light"
                                                                        />
                                                                        {businessErrors.companyName && <p className="text-xs text-red-500 font-medium">{businessErrors.companyName}</p>}
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-medium text-muted-foreground dark:text-neutral-300">Job Title <span className="text-red-500">*</span></Label>
                                                                        <Input
                                                                            value={business.jobTitle}
                                                                            onChange={(e) => setBusiness({ ...business, jobTitle: e.target.value })}
                                                                            placeholder="e.g. Creative Director"
                                                                            className="bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white h-11 rounded-2xl focus:ring-1 focus:ring-primary font-light"
                                                                        />
                                                                        {businessErrors.jobTitle && <p className="text-xs text-red-500 font-medium">{businessErrors.jobTitle}</p>}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-medium text-muted-foreground dark:text-neutral-300">Website URL <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                                                                    <Input
                                                                        value={business.websiteUrl}
                                                                        onChange={(e) => setBusiness({ ...business, websiteUrl: e.target.value })}
                                                                        placeholder="https://yourbrand.com"
                                                                        className="bg-background dark:bg-white/5 border-border dark:border-white/10 text-foreground dark:text-white h-11 rounded-2xl focus:ring-1 focus:ring-primary font-light"
                                                                    />
                                                                    {businessErrors.websiteUrl && <p className="text-xs text-red-500 font-medium">{businessErrors.websiteUrl}</p>}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

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
                                                            if (validateBusiness()) {
                                                                setStep(3);
                                                            }
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
                                                        onClick={() => {
                                                            if (validateStep3()) setStep(4);
                                                        }}
                                                    >
                                                        Continue
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* ────── STEP 4: AI Challenge ────── */}
                                        {step === 4 && (
                                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                                <div className="text-center space-y-4 mb-8">
                                                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3">
                                                        AI or Real?
                                                        <motion.span
                                                            animate={{
                                                                scale: [1, 1.2, 1],
                                                                rotate: [0, 15, -15, 0]
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: "easeInOut"
                                                            }}
                                                        >
                                                            🎯
                                                        </motion.span>
                                                    </h2>
                                                    <p className="text-lg md:text-xl text-muted-foreground font-medium">
                                                        One of these images was created by AI. The other is a real photograph.
                                                    </p>
                                                    <div className="pt-4">
                                                        <p className="text-[1.4rem] md:text-2xl font-black text-white leading-tight font-serif tracking-tight">
                                                            Click the one you think was <span className="text-white">Generated</span> using <span className="animate-flash-effect text-blue-500 dark:text-blue-400 inline-block font-black font-serif">Formal.AI</span>!
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                                    {/* Image A */}
                                                    <motion.div
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`relative rounded-2xl md:rounded-[2rem] overflow-hidden cursor-pointer border-2 md:border-4 transition-all duration-300 ${challengeSelection === "a" ? "border-primary shadow-xl" : "border-transparent"
                                                            }`}
                                                        onClick={() => setChallengeSelection("a")}
                                                    >
                                                        <img src="/images/challenge/image-a.png" alt="Candidate A" className="w-full aspect-[3/4] sm:aspect-[4/5] object-cover" />
                                                        {challengeSelection === "a" && (
                                                            <div className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2">
                                                                <svg width="24" height="24" className="md:w-8 md:h-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] filter transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                                                    <motion.path
                                                                        initial={{ pathLength: 0 }}
                                                                        animate={{ pathLength: 1 }}
                                                                        d="M20 6L9 17L4 12"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}

                                                        <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-black/40 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-white/10 text-[8px] md:text-[10px] font-bold tracking-widest uppercase text-white/90">OPTION A</div>
                                                    </motion.div>

                                                    {/* Image B */}
                                                    <motion.div
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`relative rounded-2xl md:rounded-[2rem] overflow-hidden cursor-pointer border-2 md:border-4 transition-all duration-300 ${challengeSelection === "b" ? "border-primary shadow-xl" : "border-transparent"
                                                            }`}
                                                        onClick={() => setChallengeSelection("b")}
                                                    >
                                                        <img src="/images/challenge/image-b.png" alt="Candidate B" className="w-full aspect-[3/4] sm:aspect-[4/5] object-cover" />
                                                        {challengeSelection === "b" && (
                                                            <div className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2">
                                                                <svg width="24" height="24" className="md:w-8 md:h-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] filter transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                                                    <motion.path
                                                                        initial={{ pathLength: 0 }}
                                                                        animate={{ pathLength: 1 }}
                                                                        d="M20 6L9 17L4 12"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}

                                                        <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-black/40 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-white/10 text-[8px] md:text-[10px] font-bold tracking-widest uppercase text-white/90">OPTION B</div>
                                                    </motion.div>
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="flex-1 h-11 rounded-2xl border border-border dark:border-white/10 hover:bg-accent/50 text-muted-foreground"
                                                        onClick={() => setStep(3)}
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        className="flex-[2] h-11 rounded-2xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg overflow-hidden group relative"
                                                        disabled={isSubmitting || !challengeSelection}
                                                        onClick={onSubmit}
                                                    >
                                                        <motion.div
                                                            className="absolute inset-0 bg-white/20 translate-x-[-100%]"
                                                            animate={isSubmitting ? { x: "100%" } : { x: "-100%" }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        />
                                                        {isSubmitting ? "Securing your spot..." : "Secure My Spot 🔒"}
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
                        className="max-w-xl w-full space-y-8"
                    >
                        <Card className="bg-card dark:bg-[#0a0a0a] border-border dark:border-white/10 text-card-foreground dark:text-white shadow-2xl rounded-[3.5rem] overflow-hidden relative border-2 ring-1 ring-white/10 transition-all duration-700">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                            <CardContent className="p-10 text-center space-y-8 relative z-10 font-sans">
                                <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                    className="text-6xl mb-4"
                                >
                                    🥳
                                </motion.div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black tracking-tight uppercase bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">
                                        You're on the list!
                                    </h2>

                                </div>

                                <div className="pt-8 border-t border-white/5 space-y-6">
                                    <div className="relative overflow-hidden rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-primary/5 group transition-all duration-500 hover:border-primary/30">
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                                        <div className="relative space-y-3">
                                            <h3 className="text-2xl font-serif font-black tracking-tight text-white leading-tight">
                                                Invite your Friends to be part of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary animate-pulse">Elite! 👑</span>
                                            </h3>

                                        </div>
                                    </div>

                                    <div className="relative group max-w-md mx-auto">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                                        <div className="relative flex items-center gap-3 bg-black/60 dark:bg-white/5 border border-white/10 rounded-[1.5rem] p-2 pl-5 transition-all duration-300 group-hover:border-white/20 group-hover:bg-black/80">
                                            <span className="text-sm text-neutral-400 font-mono truncate flex-1">
                                                formalai.studio
                                            </span>
                                            <Button
                                                variant="secondary"
                                                className="rounded-2xl h-10 px-6 text-xs font-bold bg-white text-black hover:bg-neutral-200 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(shareMessage);
                                                    toast.success("Message copied to clipboard!");
                                                }}
                                            >
                                                Copy Message
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-5 pt-4">
                                        {[
                                            {
                                                name: "X",
                                                color: "#000000",
                                                icon: (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                ),
                                                onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`)
                                            },
                                            {
                                                name: "WhatsApp",
                                                color: "#25D366",
                                                icon: (
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                ),
                                                onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`)
                                            },
                                            {
                                                name: "Instagram",
                                                color: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                                                icon: (
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                    </svg>
                                                ),
                                                onClick: () => toast.info("Instagram sharing coming soon!")
                                            },
                                            {
                                                name: "Facebook",
                                                color: "#1877F2",
                                                icon: (
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                    </svg>
                                                ),
                                                onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=https://formalai.studio/`)
                                            },
                                            {
                                                name: "Email",
                                                color: "#333333",
                                                icon: (
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                                    </svg>
                                                ),
                                                onClick: () => window.location.href = `mailto:?subject=Join the Formal.AI Waitlist&body=${encodeURIComponent(shareMessage)}`
                                            }
                                        ].map((app) => (
                                            <div key={app.name} className="flex flex-col items-center gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1, y: -5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={app.onClick}
                                                    style={{ background: app.color }}
                                                    className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] flex items-center justify-center shadow-lg relative overflow-hidden group"
                                                >
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] rounded-[1.25rem]" />
                                                    {app.icon}
                                                </motion.button>
                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{app.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

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
