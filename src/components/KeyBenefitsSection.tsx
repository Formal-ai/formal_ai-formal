import { useRef, useState } from "react";
import { Bell, Layers, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const KeyBenefitsSection = () => {
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
  const benefits = [
    {
      icon: Bell,
      title: "Photorealistic Virtual Styling",
      description: "AI-powered image editing that preserves your identity while transforming your professional appearance.",
      path: "/portrait-studio"
    },
    {
      icon: Layers,
      title: "Accessory & Style Editing",
      description: "Easily modify ties, bows, watches, glasses, hair color and style without distortion—all naturally realistic.",
      path: "/accessories-studio"
    },
    {
      icon: TrendingUp,
      title: "Professional Image Enhancement",
      description: "Automatic lighting, color correction, and background replacement for business-ready images.",
      path: "/background-studio"
    }
  ];

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
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-slide-up">
          Why Formal.AI?
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto animate-slide-up stagger-1">
          Enterprise-grade AI styling for professionals who demand excellence
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Link
              key={index}
              to={benefit.path}
              className="ios-glass-card p-8 text-center group hover:scale-105 transition-all duration-500 animate-scale-in flex flex-col items-center"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 animate-pulse" />
                <div className="relative p-5 rounded-2xl bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors duration-500">
                  <Icon size={48} strokeWidth={1.5} className="text-primary" />
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default KeyBenefitsSection;
