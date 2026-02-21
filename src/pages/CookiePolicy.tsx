import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const CookiePolicy = () => {
    return (
        <div className="min-h-screen bg-background page-transition">
            <Header />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="ios-glass-card p-8 md:p-12 rounded-[2.5rem] space-y-8">
                    <header className="space-y-4 border-b border-border/10 pb-8">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Cookie Policy</h1>
                        <p className="text-muted-foreground italic">Last updated February 21, 2026</p>
                    </header>

                    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
                        <p>
                            This Cookie Policy explains how <strong>Formal.AI</strong> ("Company", "we", "us", and "our") uses cookies and similar technologies to recognise you when you visit our website at <a href="https://formal.ai" className="text-primary hover:underline">https://formal.ai</a> ("Website"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
                        </p>

                        <p>
                            In some cases we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
                        </p>

                        <section className="space-y-4 pt-4">
                            <h2 className="text-2xl font-bold text-foreground">What are cookies?</h2>
                            <p>
                                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                            </p>
                            <p>
                                Cookies set by the website owner (in this case, Formal.AI) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g. advertising, interactive content, and analytics).
                            </p>
                        </section>

                        <section className="space-y-4 pt-4">
                            <h2 className="text-2xl font-bold text-foreground">Why do we use cookies?</h2>
                            <p>
                                We use first- and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.
                            </p>
                        </section>

                        <section className="space-y-4 pt-4">
                            <h2 className="text-2xl font-bold text-foreground">How can I control cookies?</h2>
                            <p>
                                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
                            </p>
                            <p>
                                The Cookie Consent Manager can be found in the notification banner and on our Website. If you choose to reject cookies, you may still use our Website though your access to some functionality and areas of our Website may be restricted.
                            </p>
                        </section>

                        <section className="space-y-6 pt-4">
                            <h2 className="text-2xl font-bold text-foreground">Specific Cookie Types</h2>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-foreground">Essential website cookies:</h3>
                                <p>These cookies are strictly necessary to provide you with services available through our Website.</p>
                                <div className="overflow-hidden border border-border/10 rounded-xl bg-muted/20">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Purpose</th>
                                                <th className="p-3">Provider</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/10">
                                            <tr>
                                                <td className="p-3">csrf_token</td>
                                                <td className="p-3">Protects against hacking and malicious actors.</td>
                                                <td className="p-3">formal.ai</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3">COOKIE_CONSENT</td>
                                                <td className="p-3">Stores user's cookie consent preferences.</td>
                                                <td className="p-3">formal.ai</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-foreground">Analytics and customisation cookies:</h3>
                                <p>These cookies collect information to help us understand how our Website is being used.</p>
                                <div className="overflow-hidden border border-border/10 rounded-xl bg-muted/20">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Purpose</th>
                                                <th className="p-3">Provider</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/10">
                                            <tr>
                                                <td className="p-3">_ga, _gid</td>
                                                <td className="p-3">Google Analytics session tracking.</td>
                                                <td className="p-3">google.com</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 pt-4 border-t border-border/10 mt-12 pb-8">
                            <h2 className="text-2xl font-bold text-foreground">Where can I get further information?</h2>
                            <p>
                                If you have any questions about our use of cookies or other technologies, please email us at <a href="mailto:hello@formal.ai" className="text-primary hover:underline">hello@formal.ai</a> or by post to:
                            </p>
                            <div className="bg-muted/20 p-6 rounded-2xl border border-border/10">
                                <p className="not-italic font-medium text-foreground">
                                    Formal.AI Headquarters<br />
                                    AI Innovation District<br />
                                    San Francisco, CA<br />
                                    United States
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
            <BackToTop />
        </div>
    );
};

export default CookiePolicy;
