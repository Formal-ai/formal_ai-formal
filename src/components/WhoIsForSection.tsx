import { useRef, useEffect, useState } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import {
    Briefcase,
    Rocket,
    Calendar,
    Compass,
    GraduationCap,
    Camera,
    Scissors,
} from 'lucide-react';

const personas = [
    {
        id: 'executives',
        title: 'Executives',
        subtitle: 'Board-ready portraits and media-grade profiles.',
        tag: 'Corporate',
        icon: Briefcase,
    },
    {
        id: 'founders',
        title: 'Founders',
        subtitle: 'Investor-ready visuals that build trust instantly.',
        tag: 'Visionary',
        icon: Rocket,
    },
    {
        id: 'hosts',
        title: 'Event Hosts',
        subtitle: 'Speaker headshots that match your event standard.',
        tag: 'Presence',
        icon: Calendar,
    },
    {
        id: 'consultants',
        title: 'Consultants',
        subtitle: 'Credibility visuals for premium client conversion.',
        tag: 'Authority',
        icon: Compass,
    },
    {
        id: 'graduates',
        title: 'Graduates',
        subtitle: 'Job-market polish without studio costs.',
        tag: 'Future',
        icon: GraduationCap,
    },
    {
        id: 'creators',
        title: 'Creators',
        subtitle: 'Professional branding assets for public-facing work.',
        tag: 'Media',
        icon: Camera,
    },
    {
        id: 'designers',
        title: 'Fashion Brands',
        subtitle: 'Lookbooks and campaign visuals without production.',
        tag: 'Style',
        icon: Scissors,
    },
];

// Quadruple for seamless infinite loop
const infinitePersonas = [...personas, ...personas, ...personas, ...personas];

const CARD_W = 360;      // px – card width
const CARD_GAP = 32;     // px – gap between cards
const CARD_SLOT = CARD_W + CARD_GAP;

/* ═══════════════════════════════════════════════════════
   CARD — renders both states (original + metallic)
   and uses a clip-path to reveal the metallic side
   as the scanner passes over it.
   ═══════════════════════════════════════════════════════ */

interface CardProps {
    persona: typeof personas[0];
    /** 0–1 how far the scanner has swept across this card. 0 = untouched, 1 = fully scanned */
    scanProgress: number;
}

const Card = ({ persona, scanProgress }: CardProps) => {
    const Icon = persona.icon;

    // clipPercent: how much of the card the scanner has revealed (left → right)
    // The metallic layer sits behind; the original layer clips away from the LEFT
    // so as scanProgress goes 0→1, the original layer disappears left-to-right
    const revealPercent = Math.max(0, Math.min(100, scanProgress * 100));
    const isScanning = scanProgress > 0 && scanProgress < 1;

    return (
        <div
            className="relative flex-shrink-0"
            style={{
                width: CARD_W,
                height: 190,
                // Subtle 3D perspective tilt on scanned cards
                transform: scanProgress >= 1
                    ? 'perspective(800px) rotateY(-1.5deg) rotateX(0.5deg)'
                    : 'perspective(800px) rotateY(0deg)',
                transition: 'transform 0.5s ease',
            }}
        >
            {/* ── Layer 1 (behind): Silver Metallic Scanned State ── */}
            <div
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    boxShadow: scanProgress >= 1
                        ? '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.8)'
                        : '0 4px 16px rgba(0,0,0,0.3)',
                    transition: 'box-shadow 0.4s ease',
                }}
            >
                {/* Base silver gradient — matte finish */}
                <div
                    className="absolute inset-0 bg-[#d1d1d6]"
                    style={{
                        background: 'linear-gradient(135deg, #e2e2e6 0%, #c8c8cd 40%, #dcdce0 100%)',
                    }}
                />

                {/* Micro-noise texture for matte-brushed feel */}
                <div
                    className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Animated Glint / Sheen */}
                <motion.div
                    animate={{
                        left: ['-100%', '200%'],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] pointer-events-none"
                    style={{ filter: 'blur(30px)' }}
                />

                {/* Elegant flowing curves — SVG overlay */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 360 190"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,140 Q80,80 180,100 T360,40"
                        fill="none"
                        stroke="rgba(255,255,255,0.6)"
                        strokeWidth="60"
                        style={{ filter: 'blur(10px)' }}
                    />
                    <path
                        d="M0,180 Q120,60 240,120 T360,20"
                        fill="none"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="40"
                        style={{ filter: 'blur(8px)' }}
                    />
                    <path
                        d="M-20,160 Q100,50 200,110 T380,30"
                        fill="none"
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth="1"
                    />
                </svg>

                {/* Rim Lighting (3D Bevel) */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/90" />
                <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-white/50" />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/10" />

                <div className="relative h-full p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: 'linear-gradient(135deg, #e8e8ed, #d1d1d6)',
                                    border: '1px solid rgba(0,0,0,0.12)',
                                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.08)',
                                }}
                            >
                                <Icon size={30} strokeWidth={2.5} className="text-slate-700" />
                            </div>
                            <h3
                                className="text-xl font-black text-slate-800 tracking-wide leading-tight uppercase"
                                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em' }}
                            >
                                {persona.title}
                            </h3>
                        </div>

                        {/* Tag badge with blue accent */}
                        <div
                            className="px-3 py-1 rounded-md"
                            style={{
                                background: 'rgba(59,130,246,0.08)',
                                border: '1px solid rgba(59,130,246,0.15)',
                                opacity: scanProgress > 0.4 ? 1 : 0,
                                transform: scanProgress > 0.4 ? 'scale(1)' : 'scale(0.8)',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                                {persona.tag}
                            </span>
                        </div>
                    </div>

                    <p
                        className="text-slate-600/80 text-[13px] leading-relaxed max-w-[310px] uppercase font-medium tracking-wider"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        {persona.subtitle}
                    </p>
                </div>
            </div>

            {/* ── Layer 2 (in front): Original Clean State — clips away as scanned ── */}
            <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                    // Clip from the left: as revealPercent grows, this layer disappears
                    clipPath: `inset(0 0 0 ${revealPercent}%)`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
            >
                {/* Lighter blue base gradient */}
                <div className="absolute inset-0" style={{
                    background: 'linear-gradient(135deg, #1e3a6e 0%, #1a3568 30%, #163060 60%, #122b55 100%)',
                }} />

                {/* Flowing wavy SVG curves overlay */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 360 190"
                    preserveAspectRatio="none"
                >
                    {/* Large flowing wave - lighter blue */}
                    <path
                        d="M-50,190 Q50,100 150,140 T350,60 L400,60 L400,200 L-50,200 Z"
                        fill="rgba(255,255,255,0.04)"
                    />
                    {/* Medium flowing wave */}
                    <path
                        d="M-30,190 Q80,80 180,130 T380,40 L400,40 L400,200 L-30,200 Z"
                        fill="rgba(255,255,255,0.03)"
                    />
                    {/* Thin accent curve line */}
                    <path
                        d="M-20,180 Q90,70 200,120 T400,30"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="1.5"
                    />
                    {/* Another thin wispy curve */}
                    <path
                        d="M-40,160 Q60,90 160,130 T360,50"
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth="1"
                    />
                </svg>

                {/* Subtle light sheen at top-right */}
                <div className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full" style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                }} />

                {/* Border */}
                <div className="absolute inset-0 rounded-2xl border border-white/[0.1]" />

                <div className="relative h-full p-6 flex flex-col justify-between">
                    {/* Top: icon + title */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center flex-shrink-0">
                            <Icon size={30} strokeWidth={2.5} className="text-white/50" />
                        </div>
                        <h3
                            className="text-xl font-black text-white/90 tracking-wide leading-tight"
                            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em' }}
                        >
                            {persona.title}
                        </h3>
                    </div>

                    {/* Bottom: subtitle */}
                    <p
                        className="text-white/50 text-[13px] leading-relaxed max-w-[310px] font-medium tracking-wider"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        {persona.subtitle}
                    </p>
                </div>
            </div>

            {/* ── Lens Flare / Flash at the contact point ── */}
            {isScanning && (
                <div
                    className="absolute top-0 bottom-0 pointer-events-none"
                    style={{
                        left: `${revealPercent}%`,
                        zIndex: 25,
                    }}
                >
                    <div
                        className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[4px]"
                        style={{
                            background: 'radial-gradient(circle, #fff 0%, rgba(59,130,246,0.9) 30%, transparent 80%)',
                            mixBlendMode: 'plus-lighter',
                            filter: 'blur(2px)'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════
   SCANNER BEAM — High-intensity stationary beam
   ═══════════════════════════════════════════════════════ */

const ScannerBeam = () => (
    <div className="absolute left-1/2 top-[-5%] bottom-[-5%] -translate-x-1/2 pointer-events-none z-30 flex items-center justify-center w-24">
        {/* Massive atmospheric glow */}
        <div className="absolute inset-y-0 w-24 bg-blue-500/[0.06] blur-[60px]" />

        {/* The single continuous line with pointy tips */}
        <div className="relative h-full w-[4px]">
            {/* The main white beam with tapered ends using SVG */}
            <svg
                className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,1)]"
                viewBox="0 0 4 100"
                preserveAspectRatio="none"
            >
                {/* Outer Glow Path */}
                <path
                    d="M2 0 L6 4 L6 96 L2 100 L-2 96 L-2 4 Z"
                    fill="rgba(59,130,246,0.3)"
                    className="blur-[2px]"
                />
                {/* Main White Path */}
                <path
                    d="M2 0 L4 2 L4 98 L2 100 L0 98 L0 2 Z"
                    fill="white"
                />
            </svg>

            {/* Inner intense core pulsing */}
            <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-white shadow-[0_0_12px_white]"
            />

            {/* Energy Aura Pulse */}
            <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2], scaleX: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-y-0 -left-2 -right-2 bg-blue-400/20 blur-[10px]"
            />

            {/* Beam spread / volumetric light */}
            <div className="absolute inset-y-0 -left-10 -right-10 bg-blue-600/[0.04] blur-[30px]" />

            {/* Sharp "Tips" accents - Small bright points at the very ends */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white]" />
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════ */

const WhoIsForSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollXRef = useRef(0);
    const [isHovered, setIsHovered] = useState(false);

    const [cardScans, setCardScans] = useState<number[]>(() => new Array(infinitePersonas.length).fill(0));
    const scannerCenterXRef = useRef(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);

    useEffect(() => {
        const update = () => { scannerCenterXRef.current = window.innerWidth / 2; };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    useAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;

        const speed = isHovered ? 0.8 : 3.5;
        const oneSetWidth = (CARD_SLOT) * personas.length;

        scrollXRef.current += speed;
        if (scrollXRef.current >= oneSetWidth) {
            scrollXRef.current -= oneSetWidth;
        }

        container.scrollLeft = scrollXRef.current;

        const scannerX = scannerCenterXRef.current;
        const children = container.children;
        const newScans = new Array(children.length);

        for (let i = 0; i < children.length; i++) {
            const el = children[i] as HTMLElement;
            const rect = el.getBoundingClientRect();
            const cardLeft = rect.left;
            const cardRight = rect.right;
            const cardWidth = rect.width;

            if (cardWidth === 0) {
                newScans[i] = 0;
                continue;
            }

            if (cardRight <= scannerX) {
                newScans[i] = 1;
            } else if (cardLeft >= scannerX) {
                newScans[i] = 0;
            } else {
                newScans[i] = Math.max(0, Math.min(1, (scannerX - cardLeft) / cardWidth));
            }
        }

        setCardScans(newScans);
    });

    return (
        <section className="py-24 md:py-32 relative overflow-hidden bg-[#020205] flex flex-col items-center justify-center min-h-[600px]">
            {/* Background elements */}
            <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/[0.03] blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/[0.03] blur-[150px] rounded-full pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 w-full flex flex-col items-center">
                {/* Header Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex flex-col items-center text-center mb-20 px-4"
                >
                    <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-none mb-4">
                        Who is{' '}
                        <span className="relative">
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                                Formal.AI
                            </span>
                            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm" />
                        </span>{' '}
                        for?
                    </h2>
                    <p className="text-white/40 text-sm md:text-base uppercase tracking-[0.2em] font-medium max-w-2xl">
                        Powering visual identity for the next generation of professional brands
                    </p>
                </motion.div>

                {/* Scoped Interactive Area */}
                <div
                    className="relative w-full overflow-visible"
                    style={{ height: 320 }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Horizontal Blending Fades */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020205] to-transparent z-20 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020205] to-transparent z-20 pointer-events-none" />

                    {/* The Track with subtle hover lift */}
                    <motion.div
                        animate={{ y: isHovered ? -10 : 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        ref={containerRef}
                        className="flex w-full overflow-x-hidden no-scrollbar items-center py-10"
                        style={{ gap: CARD_GAP }}
                    >
                        {infinitePersonas.map((persona, idx) => (
                            <Card
                                key={`${persona.id}-${idx}`}
                                persona={persona}
                                scanProgress={cardScans[idx] ?? 0}
                            />
                        ))}
                    </motion.div>

                    {/* Highly Energized Scanner Beam */}
                    <ScannerBeam />
                </div>
            </div>

        </section>
    );
};

export default WhoIsForSection;
