import { useRef, useState } from "react";
import { Play } from "lucide-react";

const VideoDemoSection = () => {
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
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-slide-up">
          See Formal.AI in Action
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto animate-slide-up stagger-1">
          Watch how AI transforms your professional image with photorealistic styling
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="relative ios-glass-card p-4 group hover:scale-[1.02] transition-all duration-500 animate-scale-in">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20">
            {/* Placeholder for video - replace with actual embed */}
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary blur-3xl opacity-50 animate-pulse" />
                  <button className="relative ios-glass-button p-8 rounded-full hover:scale-110 transition-transform duration-300">
                    <Play size={48} className="text-primary fill-primary" />
                  </button>
                </div>
                <p className="text-lg font-medium">Demo Video Coming Soon</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto px-4">
                  See how Formal.AI transforms professional photos with AI-powered styling and enhancement
                </p>
              </div>
            </div>
            
            {/* Animated background effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse animation-delay-100" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoDemoSection;
