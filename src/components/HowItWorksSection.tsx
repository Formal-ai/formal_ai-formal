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
    <section className="py-20 md:py-32 bg-transparent overflow-hidden relative rounded-[3.5rem] my-12">
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
        <div className="text-center mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            Real results. Real people.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-600 dark:text-neutral-400 font-medium max-w-2xl mx-auto"
          >
            Professional refinement without altering identity. See the difference our AI makes while maintaining true likeness.
          </motion.p>
        </div>

        <div className="relative group max-w-md mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={prevFrame}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 xl:-translate-x-16 z-20 p-4 rounded-full bg-white/10 dark:bg-neutral-800/20 backdrop-blur-md text-neutral-800 dark:text-neutral-200 shadow-xl hover:scale-110 hover:bg-white/20 dark:hover:bg-neutral-700/30 transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:block border border-white/20 dark:border-white/10"
            aria-label="Previous frame"
          >
            <ChevronLeft size={28} className="drop-shadow-sm" />
          </button>

          <button
            onClick={nextFrame}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 xl:translate-x-16 z-20 p-4 rounded-full bg-white/10 dark:bg-neutral-800/20 backdrop-blur-md text-neutral-800 dark:text-neutral-200 shadow-xl hover:scale-110 hover:bg-white/20 dark:hover:bg-neutral-700/30 transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:block border border-white/20 dark:border-white/10"
            aria-label="Next frame"
          >
            <ChevronRight size={28} className="drop-shadow-sm" />
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

          {/* Mobile Carousel Controls */}
          <div className="flex justify-center gap-4 mt-8 md:hidden">
            <button
              onClick={prevFrame}
              className="p-3 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-md active:scale-95 transition-all"
              aria-label="Previous frame"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextFrame}
              className="p-3 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-md active:scale-95 transition-all"
              aria-label="Next frame"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Frame Indicators */}
          <div className="flex justify-center gap-3 mt-8">
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


