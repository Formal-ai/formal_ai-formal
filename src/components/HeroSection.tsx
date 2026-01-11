import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    // Set slow playback rate once video is loaded
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.4;
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative rounded-[2.5rem] ios-glass-hero liquid-glass-section mb-12 animate-fade-in"
      style={{
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
      } as React.CSSProperties}
    >
      <div className="grid md:grid-cols-2 gap-4 md:gap-12 p-4 pt-2 md:p-12 lg:p-16 items-center">
        {/* Left side - Animated Video */}
        <div className="relative aspect-square max-w-[280px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[500px] mx-auto md:ml-0 md:-mt-4 rounded-[2rem] overflow-hidden group flex items-center justify-center bg-black/5 animate-scale-in shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover pointer-events-none select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src="/animated-hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Premium Gradient Overlay/Vignette */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem] pointer-events-none" />
        </div>

        {/* Right side - Content */}
        <div className="flex flex-col justify-center space-y-6 md:space-y-8">
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight animate-slide-down hover:text-primary transition-colors duration-300 cursor-default">
              <span className="inline-block animate-glow-pulse">AI-Powered</span>{" "}
              <span className="inline-block hover:animate-pulse animation-delay-100">Professional</span>{" "}
              <span className="inline-block hover:animate-pulse animation-delay-200">Appearance</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl animate-slide-up stagger-1 hover:text-foreground transition-colors duration-300">
              Instantly generate, refine, or modify formal attire and corporate looks with cutting-edge AI stylist intelligence.
            </p>
          </div>

          <Link to="/dashboard" className="animate-scale-in stagger-2">
            <Button className="ios-glass-button px-8 py-6 text-lg rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg">
              Generate New Look
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
