import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { Meteors } from "@/components/ui/meteors";
import { ArrowRight, Camera, User, Building2, GraduationCap, CheckCircle2, ShieldCheck, Sparkles, Layers } from "lucide-react";
import { Link } from "react-router-dom";

/* ─── Components ─── */

const HeroStoryBlock = () => {
    return (
        <section className="relative min-h-[60vh] flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Stars />
            </div>

            <motion.div
                initial={{ opacity: 0, filter: "blur(4px)", scale: 0.98 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 text-center max-w-4xl mx-auto"
            >

                <h1 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight text-foreground uppercase italic">
                    Your face is <span className="text-primary animate-subtle-glow">your brand.</span><br />
                    Your image is <span className="text-foreground/40">your leverage.</span>
                </h1>


                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <Link to="/waitlist">
                        <Button
                            size="lg"
                            className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90 h-14 px-8 rounded-2xl font-bold text-lg transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Join the Waitlist <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                className="absolute inset-0 bg-primary/20"
                            />
                        </Button>
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
};

const ProblemSection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scaleX = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);

    const problems = [
        {
            icon: <Camera className="w-8 h-8 text-primary" />,
            title: "Studio photoshoots are expensive and time-consuming",
            desc: "The cost of gear, venue, and professional editing keeps quality out of reach for many.",
            align: "left"
        },
        {
            icon: <Building2 className="w-8 h-8 text-primary" />,
            title: "Event organizers struggle with low-quality speaker images",
            desc: "Keynote speakers often provide inconsistent, blurry assets that dilute the event branding.",
            align: "center"
        },
        {
            icon: <GraduationCap className="w-8 h-8 text-primary" />,
            title: "Young professionals cannot access polished branding assets",
            desc: "The barrier to entry for a premium digital identity should not be determined by your budget.",
            align: "right"
        }
    ];

    return (
        <section ref={containerRef} className="py-24 px-4 relative">
            <motion.div
                style={{ scaleX }}
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent origin-center z-50"
            />

            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-black text-foreground max-w-3xl leading-tight">
                        Professional image is expensive, inconsistent, and inaccessible.
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {problems.map((prob, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                x: i === 0 ? -100 : i === 2 ? 100 : 0,
                                y: i === 1 ? 100 : 0
                            }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                type: "spring",
                                stiffness: 50,
                                damping: 15,
                                delay: i * 0.1
                            }}
                            whileHover={{ scale: 1.02 }}
                            className="p-8 rounded-[2.5rem] bg-secondary/30 border border-border/50 flex flex-col items-start gap-4 transition-colors hover:border-primary/20"
                        >
                            <div className="p-3 rounded-2xl bg-primary/10">
                                {prob.icon}
                            </div>
                            <h3 className="text-xl font-bold text-foreground leading-snug">
                                {prob.title}
                            </h3>
                            <p className="text-muted-foreground">
                                {prob.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center text-2xl font-black italic text-muted-foreground uppercase tracking-tight"
                >
                    The world expects polish. <span className="text-foreground">Not everyone has access to it.</span>
                </motion.p>
            </div>
        </section>
    );
};

const OriginStory = () => {
    const textArr = [
        "Formal.AI started with a frustration.",
        "As a young founder building in a competitive ecosystem, I kept noticing something:",
        "Talented people were losing credibility because of weak visuals.",
        "Speakers sending blurry photos.",
        "Founders using cropped party pictures on investor decks.",
        "Graduates entering the job market with unpolished profiles.",
        "It was not a talent problem.",
        "It was an access problem.",
        "So we asked a better question:",
        "What if AI could remove the barrier between potential and presentation?",
        "Formal.AI was built as the answer.",
        "Not filters.",
        "Not fake faces.",
        "Identity-preserving, precision-driven professional enhancement."
    ];

    const highlights = ["access problem", "remove the barrier", "credibility", "potential", "presentation"];

    return (
        <section className="py-24 px-4 bg-secondary/20 border-y border-border/50">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <span className="text-primary font-bold uppercase tracking-[0.2em] text-xs">Origin Story</span>
                    <h2 className="text-4xl md:text-6xl font-black text-foreground mt-2">Where Formal.AI Began</h2>
                </motion.div>

                <div className="space-y-6">
                    {textArr.map((text, i) => {
                        const isShort = text === "It was an access problem.";
                        return (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className={`text-xl md:text-2xl ${i < 3 ? "text-foreground font-bold" : "text-muted-foreground font-medium"}`}
                            >
                                {isShort ? (
                                    <TypewriterText text={text} delay={0.2} />
                                ) : (
                                    <HighlightedText text={text} highlights={highlights} />
                                )}
                            </motion.p>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

const HighlightedText = ({ text, highlights }: { text: string; highlights: string[] }) => {
    const words = text.split(" ");
    return (
        <span>
            {words.map((word, i) => {
                const cleanWord = word.replace(/[.,]/g, "").toLowerCase();
                const isHighlight = highlights.some(h => h.includes(cleanWord) || cleanWord.includes(h));

                return (
                    <span key={i} className="relative inline-block mr-1.5 overflow-hidden">
                        {isHighlight && (
                            <motion.span
                                initial={{ x: "-100%" }}
                                whileInView={{ x: "100%" }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
                                className="absolute inset-0 bg-primary/20 -z-1"
                            />
                        )}
                        <span className={isHighlight ? "text-primary font-black" : ""}>{word}</span>
                    </span>
                );
            })}
        </span>
    );
};

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    const [displayedText, setDisplayedText] = useState("");
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (inView) {
            let i = 0;
            const timer = setInterval(() => {
                setDisplayedText(text.slice(0, i));
                i++;
                if (i > text.length) clearInterval(timer);
            }, 50);
            return () => clearInterval(timer);
        }
    }, [inView, text]);

    return <span ref={ref} className="text-foreground font-black italic border-l-2 border-primary pl-4 py-1">{displayedText}</span>;
};

const CapabilityEngine = () => {
    const capabilities = [
        {
            title: "Studio-Grade Portrait Generation",
            desc: "Photorealistic headshots calibrated for lighting, posture, and facial integrity.",
            icon: ShieldCheck
        },
        {
            title: "Attire Precision Editing",
            desc: "Business-ready wardrobe visualization tailored to your body structure.",
            icon: User
        },
        {
            title: "Accessory & Detail Refinement",
            desc: "Subtle, realistic adjustments that elevate without distorting identity.",
            icon: Sparkles
        },
        {
            title: "Identity Preservation Core",
            desc: "Our AI is trained to enhance without replacing who you are.",
            icon: Layers
        }
    ];

    return (
        <section className="py-24 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl md:text-5xl font-black text-foreground uppercase italic tracking-tight">
                        Not a photo app. <br />
                        <span className="text-primary">A professional presence engine.</span>
                    </h2>
                    <p className="text-muted-foreground mt-4 text-lg">We enhance credibility without compromising authenticity.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {capabilities.map((cap, i) => (
                        <CapabilityCard key={i} {...cap} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const CapabilityCard = ({ title, desc, icon: Icon, index }: any) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });

    return (
        <div ref={ref} className="group relative p-10 rounded-[3rem] bg-secondary/30 border border-border/50 overflow-hidden">
            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase opacity-40">
                    <span className={inView ? "text-muted-foreground" : "text-foreground"}>Raw</span>
                    <span className={inView ? "text-primary" : "text-muted-foreground"}>Formal</span>
                </div>

                <div className="relative h-px bg-border w-full overflow-hidden">
                    <motion.div
                        initial={{ left: "-100%" }}
                        animate={inView ? { left: "0%" } : {}}
                        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.5 }}
                        className="absolute inset-0 bg-primary"
                    />
                </div>

                <div className="flex items-start gap-6">
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50">
                        <motion.div
                            animate={inView ? { fill: "currentColor" } : { fill: "transparent" }}
                            className="text-primary"
                        >
                            <Icon className="w-8 h-8" />
                        </motion.div>
                    </div>
                    <div>
                        <motion.h3
                            animate={inView ? { fontWeight: 900, scale: 1.02 } : { fontWeight: 600, scale: 1 }}
                            className="text-2xl font-bold text-foreground mb-2 origin-left transition-all duration-700"
                        >
                            {title}
                        </motion.h3>
                        <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                            {desc}
                        </p>
                    </div>
                </div>
            </div>

            <motion.div
                animate={inView ? { opacity: 0.05, filter: "blur(40px)" } : { opacity: 0 }}
                className="absolute inset-x-0 bottom-0 top-1/2 bg-primary z-0 pointer-events-none"
            />
        </div>
    );
};

const MissionSection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const opacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]);

    return (
        <section ref={containerRef} className="py-40 px-4 relative overflow-hidden bg-background">
            <motion.div
                style={{ y, opacity: 0.15 }}
                className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
            >
                <div className="w-[120%] h-[120%] bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-[120px]" />
            </motion.div>

            <div className="max-w-5xl mx-auto relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-8"
                >
                    <span className="text-primary font-bold uppercase tracking-[0.2em] text-xs">Our Mission</span>
                </motion.div>

                <h2 className="text-4xl md:text-7xl font-black text-foreground leading-tight mb-12">
                    To democratize access to <br />
                    <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary/50 to-foreground/50">
                        professional-grade visual identity.
                    </span>
                </h2>

                <div className="space-y-6 text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
                    <p>
                        We believe presentation should not be limited by geography, budget, or studio access.
                    </p>
                    <div className="relative pt-12 text-foreground font-bold italic">
                        <p>We are building a system where credibility is not a privilege. It is a tool.</p>
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="absolute bottom-[-10px] left-0 h-1 bg-primary"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

const ValuesSection = () => {
    const values = [
        {
            title: "Identity Protection",
            desc: "We prioritize the integrity of your true face. Our engine enhances features, highlights confidence, and optimizes lighting while ensuring you stay distinctively you."
        },
        {
            title: "Democratized Excellence",
            desc: "Quality that used to cost thousands is now accessible instantly. We're leveling the professional playing field for everyone, everywhere."
        },
        {
            title: "Precision Integrity",
            desc: "Every pixel is calculated for professional context. From the lapel of a suit to the catchlight in the eyes, we focus on the details that signal competence."
        }
    ];

    return (
        <section className="py-24 px-4 bg-background border-t border-border/50">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-black text-foreground uppercase tracking-widest mb-16 opacity-30">Our Values</h2>

                <div className="divide-y divide-border/50">
                    {values.map((val, i) => (
                        <ValueRow key={i} {...val} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const ValueRow = ({ title, desc }: { title: string; desc: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [checked, setChecked] = useState(false);

    return (
        <div
            className="py-10 group cursor-pointer"
            onClick={() => {
                setIsOpen(!isOpen);
                setChecked(true);
            }}
            onMouseEnter={() => setChecked(true)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <motion.div
                            initial={false}
                            animate={checked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                            className="text-primary"
                        >
                            <CheckCircle2 className="w-8 h-8" />
                        </motion.div>
                        {!checked && <div className="w-6 h-6 rounded-full border border-border" />}
                    </div>
                    <h3 className={`text-2xl md:text-3xl font-black transition-all ${isOpen ? "text-primary" : "text-foreground/80 group-hover:text-foreground"}`}>
                        {title}
                    </h3>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-muted-foreground"
                >
                    <ArrowRight className="w-6 h-6 rotate-90" />
                </motion.div>
            </div>

            <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
            >
                <p className="pt-6 pl-14 text-muted-foreground text-lg leading-relaxed max-w-2xl">
                    {desc}
                </p>
            </motion.div>
        </div>
    );
};

const ClosingCTA = () => {
    const [ringProgress, setRingProgress] = useState(0);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    useEffect(() => {
        return scrollYProgress.onChange(v => setRingProgress(v));
    }, [scrollYProgress]);

    return (
        <section ref={containerRef} className="py-32 px-4 relative overflow-hidden flex items-center justify-center">
            <Meteors number={10} />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto text-center relative z-10"
            >
                <h2 className="text-4xl md:text-7xl font-black text-foreground leading-tight mb-8 uppercase italic">
                    Your Opportunity Deserves <br />
                    <span className="text-primary">a Professional Image.</span>
                </h2>

                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium">
                    Join the waitlist and be first to access our AI professional studios.
                    Early access members receive priority studio credits and launch benefits.
                </p>

                <div className="relative inline-block group">
                    {/* Ring completion indicator */}
                    <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="48%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeDasharray="100 100"
                            strokeDashoffset={100 - (ringProgress * 100)}
                            className="transition-all duration-300 ease-out"
                        />
                    </svg>

                    <Link to="/waitlist">
                        <motion.div
                            whileHover={{ scale: 1.05, letterSpacing: "0.1em" }}
                            whileTap={{ scale: 0.98, y: 1 }}
                            className="relative"
                        >
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 px-12 rounded-2xl font-black text-xl shadow-[0_0_40px_rgba(var(--primary),0.3)] transition-all"
                            >
                                Join The Waitlist
                            </Button>

                            {/* Confetti-free soft glow */}
                            <motion.div
                                animate={{
                                    opacity: ringProgress > 0.9 ? [0.1, 0.2, 0.1] : 0,
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-primary/20 blur-3xl -z-1"
                            />
                        </motion.div>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
};

const About = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-500">
            <Header />
            <main className="relative pt-0">
                <HeroStoryBlock />
                <ProblemSection />
                <OriginStory />
                <CapabilityEngine />
                <MissionSection />
                <ValuesSection />
                <ClosingCTA />
            </main>
            <Footer />
        </div>
    );
};

export default About;
