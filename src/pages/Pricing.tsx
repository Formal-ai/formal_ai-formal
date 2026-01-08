import Header from "@/components/Header";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const Pricing = () => {
    return (
        <div className="min-h-screen bg-background animate-fade-in">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center space-y-6 mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your professional needs.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter */}
                    <div className="p-8 rounded-3xl bg-card border border-border/50 flex flex-col">
                        <h3 className="text-2xl font-semibold mb-2">Starter</h3>
                        <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
                        <p className="text-muted-foreground mb-8">Perfect for trying out Formal.AI</p>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> 3 AI Generations</li>
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Basic Styles</li>
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Standard Quality</li>
                        </ul>
                        <Button variant="outline" className="w-full">Get Started</Button>
                    </div>

                    {/* Professional */}
                    <div className="p-8 rounded-3xl bg-primary/5 border-2 border-primary flex flex-col relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                            Most Popular
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">Professional</h3>
                        <div className="text-4xl font-bold mb-4">$29<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
                        <p className="text-muted-foreground mb-8">For serious professionals</p>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> Unlimited Generations</li>
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> All Studios Access</li>
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> HD Downloads</li>
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> Priority Support</li>
                        </ul>
                        <Button className="w-full">Start Free Trial</Button>
                    </div>

                    {/* Enterprise */}
                    <div className="p-8 rounded-3xl bg-card border border-border/50 flex flex-col">
                        <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
                        <div className="text-4xl font-bold mb-4">Custom</div>
                        <p className="text-muted-foreground mb-8">For teams and organizations</p>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Everything in Pro</li>
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> API Access</li>
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> SSO Integration</li>
                            <li className="flex items-center gap-3"><Check className="h-5 w-5 text-green-500" /> Dedicated Account Manager</li>
                        </ul>
                        <Button variant="outline" className="w-full">Contact Sales</Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Pricing;
