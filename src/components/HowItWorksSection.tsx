import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageCompare } from "./ui/image-compare";
import { Waves } from "./ui/wave-background";

const frames = [
  {
    original: "/images/slider/1-original.png",
    formal: "/images/slider/1-formal.png",
  },
  {
    original: "/images/slider/2-original.png",
    formal: "/images/slider/2-formal.png",
  },
  {
    original: "/images/slider/3-original.png",
    formal: "/images/slider/3-formal.png",
  },
  {
    original: "/images/slider/4-original.png",
    formal: "/images/slider/4-formal.png",
  },
];

const HowItWorksSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextFrame = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % frames.length);
  };

  const prevFrame = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + frames.length) % frames.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  return (
    <section className="py-16 md:py-20 bg-background overflow-hidden relative transition-colors duration-500">
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-100"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
        }}
      >
        <Waves
          backgroundColor="transparent"
          strokeColor="rgba(0,0,0,0.05)"
          className="dark:hidden"
        />
        <Waves
          backgroundColor="transparent"
          strokeColor="rgba(255,255,255,0.05)"
          className="hidden dark:block"
        />
      </div>
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center mb-10 space-y-3">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
          >
            Real results. Real people.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto"
          >
            Professional refinement without altering identity. See the difference our AI makes while maintaining true likeness.
          </motion.p>
        </div>

        <div className="relative group max-w-[360px] mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={prevFrame}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-12 xl:-translate-x-16 z-20 p-3 md:p-4 rounded-full bg-white/20 dark:bg-neutral-800/40 backdrop-blur-xl text-neutral-900 dark:text-neutral-50 shadow-2xl hover:scale-110 hover:bg-white/30 dark:hover:bg-neutral-700/50 transition-all duration-300 border border-white/30 dark:border-white/10"
            aria-label="Previous frame"
          >
            <ChevronLeft size={22} className="drop-shadow-sm font-bold" />
          </button>

          <button
            onClick={nextFrame}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-12 xl:translate-x-16 z-20 p-3 md:p-4 rounded-full bg-white/20 dark:bg-neutral-800/40 backdrop-blur-xl text-neutral-900 dark:text-neutral-50 shadow-2xl hover:scale-110 hover:bg-white/30 dark:hover:bg-neutral-700/50 transition-all duration-300 border border-white/30 dark:border-white/10"
            aria-label="Next frame"
          >
            <ChevronRight size={22} className="drop-shadow-sm font-bold" />
          </button>

          {/* Comparison Container */}
          <div className="relative bg-white/50 dark:bg-neutral-900/50 rounded-[3.5rem] p-3 md:p-4 border border-neutral-200/50 dark:border-neutral-800/50 shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-sm">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                }}
                className="w-full h-full flex justify-center"
              >
                <ImageCompare
                  original={frames[currentIndex].original}
                  formal={frames[currentIndex].formal}
                  className="rounded-3xl w-full aspect-[4/5] shadow-inner"
                />
              </motion.div>
            </AnimatePresence>
          </div>



          {/* Frame Indicators */}
          <div className="flex justify-center gap-3 mt-6">
            {frames.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex
                  ? "w-8 bg-neutral-900 dark:bg-neutral-50"
                  : "w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                  }`}
                aria-label={`Go to frame ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;


