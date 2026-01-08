import { useRef, useState } from "react";
import formalAiHero from "@/assets/formal-ai-hero-new.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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
      <div className="grid md:grid-cols-2 gap-6 md:gap-12 p-6 md:p-12 lg:p-16 items-center">
        {/* Left side - CRM Visual */}
        <div className="relative aspect-square rounded-[2rem] overflow-hidden animate-scale-in group flex items-center justify-center">
          <img
            src={formalAiHero}
            alt="Formal.AI Professional Styling"
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
