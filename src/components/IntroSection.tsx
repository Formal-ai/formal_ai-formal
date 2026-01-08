const IntroSection = () => {
  return (
    <section className="max-w-4xl mx-auto py-12 md:py-16 px-4 animate-fade-in">
      <div className="text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold leading-tight animate-slide-up">
          Formal.AI is building the world's first AI-powered professional appearance assistant.
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-slide-up stagger-1">
          We enable users to instantly generate, refine, or modify formal attire, accessories, and corporate looks 
          using cutting-edge image manipulation and stylist intelligence. Our mission is simple: help professionals 
          look their best instantly, affordably, and at scale.
        </p>
      </div>
    </section>
  );
};

export default IntroSection;
