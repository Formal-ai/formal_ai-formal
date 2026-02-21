import Header from "@/components/Header";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-down">
            About Formal.AI
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed animate-slide-up stagger-1">
            The AI-powered professional appearance platform helping you look polished, confident, and business-ready instantly.
          </p>
        </div>

        {/* Story Section */}
        <section className="mb-16 space-y-6 text-muted-foreground animate-slide-up stagger-2">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
          <p>
            Formal.AI began with a simple question: What if we could use AI to help professionals look their best without the hassle of a studio photoshoot?
          </p>
          <p>
            In a digital-first world, your professional image matters more than ever. We wanted to create a solution that
            prioritizes authenticity, quality, and ease of use.
            Formal.AI is our answer to that need.
          </p>
          <p>
            We provide tools that matter: photorealistic professional headshots, realistic attire adjustments,
            and precise accessory editing. Our technology is grounded in advanced AI, designed to preserve your identity while enhancing your professional presence.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16 rounded-2xl bg-card p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              We believe that everyone deserves to look their professional best. Formal.AI is dedicated to
              offering accessible, high-quality, and identity-preserving AI tools that help users:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span>Generate studio-quality professional portraits instantly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span>Adjust formal clothing and accessories with precision</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span>Maintain natural facial identity and features</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span>Present a polished, credible image to the world</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Authenticity</h3>
              <p className="text-muted-foreground">
                We share real experiences, honest reflections, and genuine insights—not curated perfection.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Thoughtfulness</h3>
              <p className="text-muted-foreground">
                Every article is carefully researched, thoughtfully written, and designed to add real value.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Inclusivity</h3>
              <p className="text-muted-foreground">
                We welcome diverse perspectives and believe everyone's journey deserves respect and representation.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
              <p className="text-muted-foreground">
                We promote practices that are sustainable for individuals, communities, and the planet.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 rounded-2xl bg-card">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Secure your spot now and be the first to know when we launch our professional AI studios.
          </p>
          <Link to="/waitlist">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8">
              Join The Waitlist
            </Button>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
