import { useRef, useState } from "react";
import { Mic, Brain, UserPlus } from "lucide-react";

const HowItWorksSection = () => {
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

  const steps = [
    {
      icon: Mic,
      title: "Upload Your Photo",
      description: "Share your professional headshot or business photo for AI enhancement.",
      color: "text-blue-400"
    },
    {
      icon: Brain,
      title: "AI Transforms Your Image",
      description: "Our AI analyzes and enhances your appearance with professional styling intelligence.",
      color: "text-purple-400"
    },
    {
      icon: UserPlus,
      title: "Get Business-Ready Results",
      description: "Receive photorealistic professional images with perfect lighting, styling, and backgrounds.",
      color: "text-green-400"
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
          How It Works
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto animate-slide-up stagger-1">
          Three simple steps to transform your professional appearance
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="ios-glass-card p-8 group hover:scale-105 transition-all duration-500 animate-scale-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative mb-6">
                <div className={`inline-block p-4 rounded-2xl bg-background/40 ${step.color} group-hover:animate-pulse`}>
                  <Icon size={40} strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              </div>
              
              <div className="relative">
                <span className="absolute -left-4 -top-2 text-6xl font-bold text-primary/10">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold mb-3 relative z-10">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorksSection;
