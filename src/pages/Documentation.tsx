import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Documentation = () => {
    return (
        <div className="min-h-screen bg-background animate-fade-in">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="hidden lg:block space-y-8 sticky top-24 h-fit">
                        <div>
                            <h3 className="font-semibold mb-3">Getting Started</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="text-foreground font-medium">Introduction</li>
                                <li>Quick Start Guide</li>
                                <li>Account Setup</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">Studios</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>Portrait Studio</li>
                                <li>Hair Studio</li>
                                <li>Accessories Studio</li>
                                <li>Background Studio</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">API Reference</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>Authentication</li>
                                <li>Endpoints</li>
                                <li>Rate Limits</li>
                            </ul>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="lg:col-span-3 space-y-12">
                        <section>
                            <h1 className="text-4xl font-bold mb-6">Formal.AI Documentation</h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Welcome to the official documentation for Formal.AI. Learn how to use our AI-powered professional appearance platform to enhance your digital presence.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold">Quick Start</h2>
                            <p className="text-muted-foreground">
                                Formal.AI uses advanced AI to generate and refine professional headshots. To get started, navigate to the <span className="text-primary font-medium">Dashboard</span> and try uploading your first photo.
                            </p>
                            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                // Example API integration code would go here
                            // M8 FIX: Removed console.log for production
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold">Core Concepts</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-[2.5rem] bg-card border border-border shadow-md">
                                    <h3 className="font-semibold mb-2">Studios</h3>
                                    <p className="text-sm text-muted-foreground">Diverse editing suites for specific needs like hair, background, or accessories.</p>
                                </div>
                                <div className="p-6 rounded-[2.5rem] bg-card border border-border shadow-md">
                                    <h3 className="font-semibold mb-2">Generations</h3>
                                    <p className="text-sm text-muted-foreground">AI-created variations of your uploaded photos, preserving your identity.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Documentation;
