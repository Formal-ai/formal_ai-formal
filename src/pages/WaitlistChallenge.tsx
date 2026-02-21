import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Meteors } from "@/components/ui/meteors";
import { Stars } from "@/components/ui/stars";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/*
 * ═══════════════════════════════════════════
 *  CONFIGURATION — change these when ready
 * ═══════════════════════════════════════════
 *
 * Replace the placeholder images with your real ones in /public/images/challenge/
 * Set AI_IMAGE_KEY to "a" or "b" depending on which one is the AI image.
 */
const IMAGE_A = "/images/challenge/image-a.png";
const IMAGE_B = "/images/challenge/image-b.png";
const AI_IMAGE_KEY = "a"; // "a" or "b" — which one is the AI-generated image?

const REFERRAL_URL = "https://formalai.studio/waitlist";

const WaitlistChallenge = () => {
    const [selected, setSelected] = useState<"a" | "b" | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);
    const location = useLocation();

    const handleSelect = (choice: "a" | "b") => {
        if (hasSubmitted) return;
        setSelected(choice);
    };

    const handleSubmit = async () => {
        if (!selected) {
            toast.error("Please select which image you think is AI-generated.");
            return;
        }
        setHasSubmitted(true);

        const isCorrect = selected === AI_IMAGE_KEY;
        const result = {
            selection: selected,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString()
        };

        // Store in localStorage
        try {
            const stored = JSON.parse(localStorage.getItem("fai_challenge") || "{}");
            localStorage.setItem("fai_challenge", JSON.stringify({ ...stored, ...result }));
        } catch {
            // localStorage not available
        }

        // Store in Supabase if we have a waitlist ID
        const waitlistId = location.state?.waitlistId;
        if (waitlistId) {
            try {
                // First get the current metadata
                const { data: currentData } = await supabase
                    .from("waitlist")
                    .select("metadata")
                    .eq("id", waitlistId)
                    .single();

                const currentMetadata = (currentData as any)?.metadata || {};

                // Update with challenge result
                await (supabase as any)
                    .from("waitlist")
                    .update({
                        metadata: {
                            ...currentMetadata,
                            challenge: result
                        }
                    })
                    .eq("id", waitlistId);
            } catch (err) {
                console.error("Failed to save challenge result", err);
            }
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(REFERRAL_URL);
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 3000);
        } catch {
            toast.error("Could not copy, please copy manually.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-neutral-900/50 dark:from-background dark:via-background dark:to-neutral-900/10 text-foreground transition-colors duration-300 selection:bg-primary/30 relative overflow-hidden font-sans">
            <Stars number={150} />
            <Meteors number={20} />
            <Header />

            <main className="pt-20 md:pt-32 pb-10 md:pb-20 px-4 md:px-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] md:min-h-[85vh]">
                <div className="w-full max-w-3xl space-y-6 md:space-y-8 relative z-10">
                    <AnimatePresence mode="wait">
                        {!hasSubmitted ? (
                            <motion.div
                                key="challenge"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6 md:space-y-8"
                            >
                                {/* Title */}
                                <div className="text-center space-y-2 md:space-y-3">
                                    <motion.div
                                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                                        className="text-4xl md:text-6xl"
                                    >
                                        🎯
                                    </motion.div>
                                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                                        AI or Real?
                                    </h1>
                                    <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto px-4">
                                        One of these images was created by AI. The other is a real photograph.
                                        <br className="hidden md:block" />
                                        <span className="font-medium text-foreground dark:text-white block mt-1">Click the one you think is AI-generated.</span>
                                    </p>
                                </div>

                                {/* Image Cards */}
                                <div className="grid grid-cols-2 gap-3 md:gap-6">
                                    {/* Image A */}
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect("a")}
                                        className="cursor-pointer group relative"
                                    >
                                        <Card className={`overflow-hidden rounded-3xl border-2 transition-all duration-300 ${selected === "a"
                                            ? "border-primary dark:border-white shadow-2xl shadow-primary/20 dark:shadow-white/20 ring-2 ring-primary/30 dark:ring-white/30"
                                            : "border-border/50 dark:border-white/5 hover:border-primary/40 dark:hover:border-white/30"
                                            }`}>
                                            <div className="relative aspect-[3/4] bg-muted dark:bg-white/5 overflow-hidden">
                                                <img
                                                    src={IMAGE_A}
                                                    alt="Image A"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center bg-secondary/50">Image A placeholder<br/><br/>Add your image at:<br/>/public/images/challenge/image-a.jpg</div>';
                                                    }}
                                                />
                                                {/* Selection Overlay */}
                                                <AnimatePresence>
                                                    {selected === "a" && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="absolute inset-0 bg-primary/20 dark:bg-white/10 backdrop-blur-[2px] flex items-center justify-center"
                                                        >
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -45 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                exit={{ scale: 0, rotate: 45 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                                className="w-20 h-20 bg-primary dark:bg-white rounded-full flex items-center justify-center shadow-lg"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={3}
                                                                    stroke="currentColor"
                                                                    className="w-10 h-10 text-primary-foreground dark:text-black"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                </svg>
                                                            </motion.div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <CardContent className="p-3 md:p-6 text-center relative">
                                                <div className="absolute inset-x-0 -top-6 flex justify-center">
                                                    <div className={`px-3 py-1 md:px-4 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${selected === "a"
                                                        ? "bg-primary text-primary-foreground dark:bg-white dark:text-black"
                                                        : "bg-muted text-muted-foreground"
                                                        }`}>
                                                        Option A
                                                    </div>
                                                </div>
                                                <p className={`mt-2 text-xs md:text-base font-medium transition-colors duration-300 ${selected === "a" ? "text-primary dark:text-white" : "text-muted-foreground"}`}>
                                                    {selected === "a" ? "Selected" : "Tap"}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Image B */}
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect("b")}
                                        className="cursor-pointer group relative"
                                    >
                                        <Card className={`overflow-hidden rounded-3xl border-2 transition-all duration-300 ${selected === "b"
                                            ? "border-primary dark:border-white shadow-2xl shadow-primary/20 dark:shadow-white/20 ring-2 ring-primary/30 dark:ring-white/30"
                                            : "border-border/50 dark:border-white/5 hover:border-primary/40 dark:hover:border-white/30"
                                            }`}>
                                            <div className="relative aspect-[3/4] bg-muted dark:bg-white/5 overflow-hidden">
                                                <img
                                                    src={IMAGE_B}
                                                    alt="Image B"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center bg-secondary/50">Image B placeholder<br/><br/>Add your image at:<br/>/public/images/challenge/image-b.jpg</div>';
                                                    }}
                                                />
                                                {/* Selection Overlay */}
                                                <AnimatePresence>
                                                    {selected === "b" && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="absolute inset-0 bg-primary/20 dark:bg-white/10 backdrop-blur-[2px] flex items-center justify-center"
                                                        >
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -45 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                exit={{ scale: 0, rotate: 45 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                                className="w-20 h-20 bg-primary dark:bg-white rounded-full flex items-center justify-center shadow-lg"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={3}
                                                                    stroke="currentColor"
                                                                    className="w-10 h-10 text-primary-foreground dark:text-black"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                </svg>
                                                            </motion.div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <CardContent className="p-3 md:p-6 text-center relative">
                                                <div className="absolute inset-x-0 -top-6 flex justify-center">
                                                    <div className={`px-3 py-1 md:px-4 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${selected === "b"
                                                        ? "bg-primary text-primary-foreground dark:bg-white dark:text-black"
                                                        : "bg-muted text-muted-foreground"
                                                        }`}>
                                                        Option B
                                                    </div>
                                                </div>
                                                <p className={`mt-2 text-xs md:text-base font-medium transition-colors duration-300 ${selected === "b" ? "text-primary dark:text-white" : "text-muted-foreground"}`}>
                                                    {selected === "b" ? "Selected" : "Tap"}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>

                                {/* Submit */}
                                <div className="text-center">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!selected}
                                        className={`h-12 md:h-16 px-8 md:px-12 rounded-2xl text-sm md:text-lg font-bold transition-all shadow-lg ${selected
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] shadow-primary/25 dark:shadow-white/10 animate-pulse"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                            }`}
                                    >
                                        {selected ? "🔒 Lock In My Answer" : "Select an image"}
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            /* ────── THANK YOU + REFERRAL ────── */
                            <motion.div
                                key="thanks"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <Card className="bg-card dark:bg-[#0a0a0a] border-border dark:border-white/10 text-card-foreground dark:text-white shadow-2xl rounded-3xl overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                                    <CardContent className="p-12 text-center space-y-6 relative z-10">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                            className="text-6xl"
                                        >
                                            🎉
                                        </motion.div>
                                        <div className="space-y-3">
                                            <h2 className="text-3xl font-bold tracking-tight">Challenge Accepted!</h2>
                                            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                                                Thank you for participating! You'll find out if you won when Formal.AI launches. Stay tuned! 🚀
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Referral Section */}
                                <Card className="bg-gradient-to-br from-primary/5 via-card to-primary/10 dark:from-white/5 dark:via-[#0a0a0a] dark:to-white/10 border-primary/20 dark:border-white/20 text-card-foreground dark:text-white shadow-xl rounded-3xl overflow-hidden">
                                    <CardContent className="p-8 text-center space-y-5">
                                        <h3 className="text-xl font-bold">Invite Friends, Get Rewarded 🎁</h3>
                                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                            Share the waitlist with friends. The more people who join through you, the bigger your launch bonus!
                                        </p>

                                        {/* Copy Link */}
                                        <div className="flex items-center gap-2 max-w-md mx-auto">
                                            <div className="flex-1 bg-background dark:bg-white/5 border border-border dark:border-white/10 rounded-xl px-4 py-3 text-sm text-muted-foreground truncate font-mono">
                                                {REFERRAL_URL}
                                            </div>
                                            <Button
                                                onClick={copyLink}
                                                className="h-12 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all"
                                            >
                                                {copied ? "✓ Copied!" : "Copy"}
                                            </Button>
                                        </div>

                                        {/* Share Buttons */}
                                        <div className="flex justify-center gap-3 pt-2">
                                            <a
                                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just joined the Formal.AI waitlist! 🚀 The future of AI fashion is here. Secure your spot & join me: " + REFERRAL_URL)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-80 text-sm font-medium transition-opacity flex items-center gap-2"
                                            >
                                                <span>𝕏</span> Share
                                            </a>
                                            <a
                                                href={`https://wa.me/?text=${encodeURIComponent("Check out Formal.AI — AI-powered fashion try-on! Join the waitlist: " + REFERRAL_URL)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-5 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 text-sm font-medium transition-colors"
                                            >
                                                WhatsApp
                                            </a>
                                            <a
                                                href={`mailto:?subject=${encodeURIComponent("Join Formal.AI Waitlist")}&body=${encodeURIComponent("Hey! I just joined the Formal.AI waitlist for AI-powered fashion try-on. You should check it out: " + REFERRAL_URL)}`}
                                                className="px-5 py-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 text-sm font-medium transition-colors"
                                            >
                                                ✉️ Email
                                            </a>
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
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default WaitlistChallenge;
