import { useEffect, useCallback, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Quote } from "lucide-react";

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
      avatar: "👩‍💼"
    },
    {
      quote: "As a recent graduate, Formal.AI helped me create polished LinkedIn photos instantly. Game-changer for job applications.",
      author: "Marcus Johnson",
      role: "Software Engineer",
      avatar: "👨‍🎓"
    },
    {
      quote: "The accessory editing is phenomenal. I can test different looks for client meetings without multiple outfit changes.",
      author: "Lisa Rodriguez",
      role: "Corporate Consultant",
      avatar: "👩‍💻"
    }
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    skipSnaps: false
  });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(scrollNext, 4000);

    const onPointerDown = () => clearInterval(autoplay);
    const onPointerUp = () => {
      clearInterval(autoplay);
      const newAutoplay = setInterval(scrollNext, 4000);
      return () => clearInterval(newAutoplay);
    };

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);

    return () => {
      clearInterval(autoplay);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi, scrollNext]);

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
          Loved by Professionals
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto animate-slide-up stagger-1">
          See how professionals are using Formal.AI to elevate their image
        </p>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0"
            >
              <div className="ios-glass-card p-8 h-full hover:scale-105 transition-all duration-500 cursor-grab active:cursor-grabbing">
                <Quote size={32} className="text-primary/40 mb-4" />
                <p className="text-lg leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
