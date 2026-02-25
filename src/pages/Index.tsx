import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import KeyBenefitsSection from "@/components/KeyBenefitsSection";
import WhoIsForSection from "@/components/WhoIsForSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import MobileWaitlistFAB from "@/components/MobileWaitlistFAB";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Index = () => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-background page-transition">
      <Header />

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <KeyBenefitsSection />
        </div>

        <HowItWorksSection />

        <TestimonialsSection />

        <WhoIsForSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <CTASection />
        </div>
      </main>

      <Footer />
      <BackToTop />
      <MobileWaitlistFAB />
    </div>
  );
};

export default Index;
