import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import KeyBenefitsSection from "@/components/KeyBenefitsSection";
import VideoDemoSection from "@/components/VideoDemoSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const Index = () => {

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Key Benefits */}
        <KeyBenefitsSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Video Demo */}
        <VideoDemoSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Call to Action */}
        <CTASection />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
