import { useRef, useState } from "react";
import { Camera, Ratio, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { BackgroundStars } from "./ui/background-stars";

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
      icon: Camera,
      title: "Identity Preservation",
      description: "Facial structure, expression, and defining features are never altered. You still look like yourself.",
      path: "/portrait-studio"
    },
    {
      icon: Ratio,
      title: "No Distortion Styling",
      description: "Attire, accessories, and grooming are applied without warping proportions or artificial artifacts.",
      path: "/accessories-studio"
    },
    {
      icon: Award,
      title: "Business-Ready Output",
      description: "Images are calibrated for LinkedIn, CVs, and corporate use — not creative experimentation.",
      path: "/background-studio"
    }
  ];

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative py-16 md:py-24 animate-fade-in liquid-glass-section overflow-hidden rounded-[3.5rem] mt-12 mb-12"
      style={{
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
      } as React.CSSProperties}
    >
      <BackgroundStars className="opacity-40" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16 typing-effect-trigger">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="typing-effect">Built for professional <br className="md:hidden" /> <span className="text-blue-500">credibility</span></span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed reveal-on-scroll stagger-delay-1">
            Formal.AI is designed for high-stakes professional contexts where accuracy and identity preservation matter.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 hover:cursor-default">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Link
                key={index}
                to={benefit.path}
                className={`ios-glass-card p-8 text-center group hover:scale-105 reveal-on-scroll stagger-delay-${index + 1} flex flex-col items-center !rounded-[2.5rem]`}
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
      </div>
    </section>
  );
};

export default KeyBenefitsSection;

