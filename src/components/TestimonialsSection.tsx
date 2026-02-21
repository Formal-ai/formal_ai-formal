import { useRef, useState } from "react";

const TestimonialsSection = () => {
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

  const testimonials = [
    {
      quote: "Formal.AI saved me thousands on professional photoshoots. The AI styling looks incredibly natural and business-ready.",
      author: "Sarah Chen",
      role: "CEO, TechStart",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      quote: "As a recent graduate, Formal.AI helped me create polished LinkedIn photos instantly. Game-changer for job applications.",
      author: "Marcus Johnson",
      role: "Software Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      quote: "The accessory editing is phenomenal. I can test different looks for client meetings without multiple outfit changes.",
      author: "Lisa Rodriguez",
      role: "Corporate Consultant",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150"
    }
  ];

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="py-12 blue-grid-bg relative overflow-hidden min-h-[90vh] flex items-center"
      style={{
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
      } as React.CSSProperties}
    >
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="mb-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight reveal-on-scroll">
            Loved by Professionals
          </h2>
          <p className="text-blue-300/40 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed reveal-on-scroll stagger-delay-1">
            See how professionals are using Formal.AI to elevate their image
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`deep-sea-glass p-8 flex flex-col items-center text-center reveal-on-scroll stagger-delay-${index + 1}`}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-900/40 mb-4 bg-blue-950/40 shadow-lg">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-0.5">
                  {testimonial.author}
                </h3>
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">
                  {testimonial.role}
                </p>
              </div>

              <div className="w-8 h-px bg-blue-500/20 mb-4" />

              <p className="text-blue-100/80 leading-relaxed text-base italic">
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
