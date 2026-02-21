import { useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from "@/lib/utils";

const CTASection = () => {
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
      className="py-16 md:py-24 animate-fade-in liquid-glass-section"
      style={{
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
      } as React.CSSProperties}
    >
      <div className="relative rounded-[3.5rem] overflow-hidden ios-glass-hero p-12 md:p-16 text-center border border-white/10">
        {/* New Animated Dotted Surface Background */}
        <DottedSurface className="opacity-40" />

        {/* Existing Cursor Light Effect (handled by liquid-glass-section class) */}

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-scale-in">
            <Sparkles size={20} className="text-primary" />
            <span className="text-sm font-medium">Ready to Get Started?</span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-up font-serif">
            Transform Your Professional Image Today
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up stagger-1">
            Join professionals worldwide who look their best with AI-powered styling, instantly and affordably.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in stagger-2">
            <Link to="/waitlist">
              <Button className="ios-glass-button px-8 py-6 text-lg rounded-full hover:scale-105 transition-all duration-300 shadow-2xl">
                Join The Waitlist
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              No credit card required • 5-minute setup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

