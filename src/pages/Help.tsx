import EditorLayout from "@/components/EditorLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare, Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Help = () => {
    return (
        <EditorLayout>
            <div className="p-6 md:p-8 space-y-8 animate-fade-in max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold font-serif">Help & Support</h1>
                    <p className="text-muted-foreground">Find answers or reach out to our team</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        <h3 className="font-bold">Live Chat</h3>
                        <p className="text-xs text-muted-foreground">Average response: 5 mins</p>
                        <Button variant="outline" size="sm" className="w-full rounded-full">Start Chat</Button>
                    </div>
                    <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-3">
                        <Mail className="w-6 h-6 text-purple-500" />
                        <h3 className="font-bold">Email Support</h3>
                        <p className="text-xs text-muted-foreground">Available 24/7</p>
                        <Button variant="outline" size="sm" className="w-full rounded-full">Message Us</Button>
                    </div>
                    <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 space-y-3">
                        <Phone className="w-6 h-6 text-orange-500" />
                        <h3 className="font-bold">Direct Line</h3>
                        <p className="text-xs text-muted-foreground">Priority for Professionals</p>
                        <Button variant="outline" size="sm" className="w-full rounded-full">Call Support</Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-serif">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {[
                            { q: "How do I upgrade to the Plus model?", a: "Navigate to the Pricing page or click 'Upgrade Plan' from your profile menu. Once payment is processed, your account will immediately gain access to Plus features and the Antigravity v4 engine." },
                            { q: "Can I use Formal.AI for social media?", a: "Absolutely! While we focus on corporate and formal aesthetics, many users use the Portrait Studio for LinkedIn, X, and professional portfolios." },
                            { q: "Are my photos kept private?", a: "Yes. We take privacy seriously. Your uploaded photos are processed securely and are never shared or used to train public models without explicit consent." },
                            { q: "How many credits are included in the Free tier?", a: "New users receive 5 free credits upon signing up to explore the studios. Credits refresh monthly for subscription plans." }
                        ].map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border rounded-2xl px-4 bg-card/50">
                                <AccordionTrigger className="hover:no-underline font-medium">{faq.q}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                <div className="p-6 rounded-2xl bg-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-background border flex items-center justify-center">
                            <ExternalLink className="w-6 h-6 opacity-30" />
                        </div>
                        <div>
                            <p className="font-bold font-serif">Developer Documentation</p>
                            <p className="text-sm text-muted-foreground">Explore our API and SDK integrations</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="rounded-full">Visit Wiki</Button>
                </div>
            </div>
        </EditorLayout>
    );
};

export default Help;
