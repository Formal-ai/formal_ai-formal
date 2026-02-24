
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
      quote: "I had outdated professional photos, and this app helped me create higher quality ones. As an event host, Formal AI turns unpolished speaker photos into portraits that match my event standards.",
      author: "Mandipa Amantle Hlabano",
      role: "CEO, PutYouthOn & Her Armour",
      avatar: "/testimonials/bo-jackson.jpg"
    },
    {
      quote: "Formal.AI saved me thousands on professional photoshoots for my social media and Linkedin. The AI styling looks incredibly natural and business-ready.",
      author: "Bo Jackson",
      role: "Managing Director, Growthority (Pty) Ltd",
      avatar: "/testimonials/mandipa.jpg"
    },
    {
      quote: "As a university student, Formal.AI helped me create polished professional images instantly for my GBV fliers.",
      author: "Angela Mabena",
      role: "UB Radio Journalist",
      avatar: "/testimonials/angela.jpg"
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
          <p className="text-blue-300/90 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed reveal-on-scroll stagger-delay-1">
            See how professionals are using Formal.AI to elevate their image
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`deep-sea-glass p-8 flex flex-col items-center text-center reveal-on-scroll stagger-delay-${index + 1}`}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 dark:border-white/10 mb-4 bg-primary/5 dark:bg-white/5 shadow-xl transition-transform hover:scale-110 duration-500">
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

              <p className="text-blue-50/90 leading-relaxed text-base italic">
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
