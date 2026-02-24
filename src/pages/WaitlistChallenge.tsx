import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Waves } from "@/components/ui/wave-background";
import { Stars } from "@/components/ui/stars";
import { Meteors } from "@/components/ui/meteors";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const WaitlistChallenge = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const waitlistId = location.state?.waitlistId;

    const [selectedImage, setSelectedImage] = useState<"a" | "b" | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Image A is AI, Image B is Real. Our challenge A is the high-quality AI generation.
    const AI_IMAGE = "a";

    const handleSumbit = async () => {
        if (!selectedImage) {
            toast.error("Please select which image you think is AI-generated.");
            return;
        }

        setIsSubmitting(true);
        const correct = selectedImage === AI_IMAGE;
        setIsCorrect(correct);

        try {
            // We record the submission to supabase challenge_submissions table
            // This table should contain: id, waitlist_id, selection, is_correct, created_at
            const { error } = await (supabase
                .from("challenge_submissions" as any) as any)
                .insert({
                    waitlist_id: waitlistId,
                    selection: selectedImage,
                    is_correct: correct,
                });

            if (error) {
                console.error("Error submitting challenge:", error);
            }

            setShowResult(true);
            if (correct) {
                toast.success("Sharp eye! You identified the AI image.");
            } else {
                toast.info("Close! It's getting harder to tell, isn't it?");
            }
        } catch (err) {
            console.error(err);
            setShowResult(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
            <style>
                {`
                .formal-flash {
                    animation: formal-flash 3s ease-in-out infinite;
                    font-weight: 900;
                }
                @keyframes formal-flash {
                    0%, 100% { 
                        opacity: 0.8; 
                        text-shadow: 0 0 5px rgba(255,255,255,0.1); 
                    }
                    50% { 
                        opacity: 1; 
                        text-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4);
                        color: #fff;
                    }
                }
                .image-brighten {
                    filter: brightness(1.05) contrast(1.05);
                }
                `}
            </style>

            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <Waves backgroundColor="transparent" strokeColor="rgba(255,255,255,0.08)" />
            </div>
            <Stars number={150} />
            <Meteors number={20} />
            <Header />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[85vh] relative z-10">
                <AnimatePresence mode="wait">
                    {!showResult ? (
                        <motion.div
                            key="challenge"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-4xl space-y-10"
                        >
                            <div className="text-center space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2"
                                >
                                    Early Access Bonus Challenge
                                </motion.div>
                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">
                                    Can you spot the <span className="text-blue-400">GenAI</span>?
                                </h1>
                                <p className="text-lg md:text-2xl text-zinc-100 max-w-2xl mx-auto font-medium">
                                    Select the image you think was generated using <span className="formal-flash">Formal.AI</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                                {/* Image A */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className={`group relative rounded-[2.5rem] overflow-hidden cursor-pointer border-4 transition-all duration-500 ${selectedImage === "a" ? "border-white shadow-[0_0_50px_rgba(255,255,255,0.3)]" : "border-white/5 hover:border-white/20"
                                        }`}
                                    onClick={() => setSelectedImage("a")}
                                >
                                    <img src="/images/challenge/image-a.png" alt="Candidate A" className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105 image-brighten" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-30" />
                                    <div className="absolute bottom-6 right-6">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${selectedImage === "a" ? "bg-white border-white scale-110 shadow-lg" : "bg-black/20 border-white/40 backdrop-blur-md"
                                            }`}>
                                            {selectedImage === "a" && <div className="w-4 h-4 bg-black rounded-full" />}
                                        </div>
                                    </div>
                                    <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10">
                                        Candidate A
                                    </div>
                                </motion.div>

                                {/* Image B */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className={`group relative rounded-[2.5rem] overflow-hidden cursor-pointer border-4 transition-all duration-500 ${selectedImage === "b" ? "border-white shadow-[0_0_50px_rgba(255,255,255,0.3)]" : "border-white/5 hover:border-white/20"
                                        }`}
                                    onClick={() => setSelectedImage("b")}
                                >
                                    <img src="/images/challenge/image-b.png" alt="Candidate B" className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105 image-brighten" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-30" />
                                    <div className="absolute bottom-6 right-6">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${selectedImage === "b" ? "bg-white border-white scale-110 shadow-lg" : "bg-black/20 border-white/40 backdrop-blur-md"
                                            }`}>
                                            {selectedImage === "b" && <div className="w-4 h-4 bg-black rounded-full" />}
                                        </div>
                                    </div>
                                    <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10">
                                        Candidate B
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex justify-center pt-10">
                                <Button
                                    onClick={handleSumbit}
                                    disabled={!selectedImage || isSubmitting}
                                    className="px-16 py-8 text-xl rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-black shadow-2xl disabled:opacity-30 group"
                                >
                                    {isSubmitting ? "Verifying..." : (
                                        <span className="flex items-center gap-3">
                                            Lock In My Answer <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl w-full text-center space-y-8"
                        >
                            <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-3xl rounded-[4rem] p-16 shadow-3xl overflow-hidden relative border-2">
                                <div className={`absolute top-0 left-0 w-full h-1.5 ${isCorrect ? "bg-primary" : "bg-zinc-600"}`} />
                                <CardContent className="space-y-10 p-0">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                                        className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto"
                                    >
                                        {isCorrect ? (
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-black">
                                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : (
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-black">
                                                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </motion.div>

                                    <div className="space-y-4">
                                        <h2 className="text-5xl font-black italic tracking-tighter">
                                            {isCorrect ? "MASTER EYE!" : "ALMOST!"}
                                        </h2>
                                        <p className="text-2xl text-zinc-400 leading-snug">
                                            {isCorrect
                                                ? "Impressive intuition. You identified our high-fidelity AI generation. Your priority bonus is now secured."
                                                : "Candidate A was the AI! It's frighteningly realistic. We've still locked in your participant bonus for testing our limits."
                                            }
                                        </p>
                                    </div>

                                    <div className="pt-4 space-y-4 max-w-sm mx-auto">
                                        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500">Your Secured Bonus</p>
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                            <div className="text-left">
                                                <div className="font-bold text-white">Genesis Studio Access</div>
                                                <div className="text-xs text-zinc-500 font-medium">+250 Beta Credits</div>
                                            </div>
                                            <div className="bg-white text-black px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest shadow-lg">UNLOCKED</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 pt-10">
                                        <Button
                                            onClick={() => navigate("/")}
                                            className="w-full h-16 rounded-3xl bg-white text-black font-black text-lg hover:bg-zinc-200 transition-all shadow-xl"
                                        >
                                            Return to Headquarters
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full h-14 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/5 font-bold transition-all"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`Try to spot the AI! I entered the Formal.AI challenge and it's insane. Join the waitlist here: ${window.location.origin}/waitlist`);
                                                toast.success("Challenge invite copied!");
                                            }}
                                        >
                                            Challenge a Colleague
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <p className="text-zinc-600 text-xs font-medium uppercase tracking-[0.2em]">
                                Verification ID: {waitlistId?.substring(0, 8) || "GENESIS"}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default WaitlistChallenge;
