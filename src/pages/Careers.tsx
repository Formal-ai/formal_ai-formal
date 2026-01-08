import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const Careers = () => {
    return (
        <div className="min-h-screen bg-background animate-fade-in">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center space-y-6 mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold">Join the Formal.AI Team</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Help us redefine professional appearance with AI.
                    </p>
                </div>

                <div className="grid gap-8 max-w-4xl mx-auto">
                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
                        <h3 className="text-2xl font-semibold mb-2">Senior AI Engineer</h3>
                        <p className="text-muted-foreground mb-4">Remote • Full-time</p>
                        <p className="mb-6">Lead the development of our core image generation models.</p>
                        <Button>Apply Now</Button>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
                        <h3 className="text-2xl font-semibold mb-2">Product Designer</h3>
                        <p className="text-muted-foreground mb-4">New York / Remote • Full-time</p>
                        <p className="mb-6">Shape the user experience of our professional appearance platform.</p>
                        <Button>Apply Now</Button>
                    </div>
                    <Footer />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Careers;
