import { useState } from "react";
import EditorLayout from "@/components/EditorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sparkles, Palette, Zap, Target, Sliders, Wand2 } from "lucide-react";
import { toast } from "sonner";

const Personalization = () => {
    const [aiCreativity, setAiCreativity] = useState([70]);
    const [formalBias, setFormalBias] = useState([85]);

    const handleSave = () => {
        toast.success("Personalization preferences updated successfully!");
    };

    return (
        <EditorLayout>
            <div className="p-6 md:p-8 space-y-8 animate-fade-in max-w-5xl mx-auto">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-primary" />
                            AI Personalization
                        </h1>
                        <p className="text-muted-foreground mt-2">Fine-tune how Formal.AI shapes your professional aesthetic</p>
                    </div>
                    <Button onClick={handleSave} className="rounded-full px-8 bg-primary hover:scale-105 transition-all">
                        Save Preferences
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Creative Controls */}
                    <Card className="ios-glass-card overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                Model Behavior
                            </CardTitle>
                            <CardDescription>Adjust the intelligence engine's core logic</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label className="text-sm font-medium">AI Creativity & Variance</Label>
                                    <span className="text-xs text-muted-foreground font-mono">{aiCreativity}%</span>
                                </div>
                                <Slider
                                    value={aiCreativity}
                                    onValueChange={setAiCreativity}
                                    max={100}
                                    step={1}
                                    className="cursor-pointer"
                                />
                                <p className="text-[11px] text-muted-foreground italic">Lower values produce more consistent, "safer" results. Higher values allow for more experimental styles.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label className="text-sm font-medium">Formal Bias (Adherence)</Label>
                                    <span className="text-xs text-muted-foreground font-mono">{formalBias}%</span>
                                </div>
                                <Slider
                                    value={formalBias}
                                    onValueChange={setFormalBias}
                                    max={100}
                                    step={1}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Aesthetic Preferences */}
                    <Card className="ios-glass-card">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-blue-500" />
                                Visual DNA
                            </CardTitle>
                            <CardDescription>Define your signature professional look</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { id: "soft-lighting", label: "Prioritize Soft Studio Lighting", desc: "Evenly distributed lights for a clean look" },
                                { id: "texture-boost", label: "Enhance Fabric Textures", desc: "Sharper details for suits and ties" },
                                { id: "bg-blur", label: "Automatic Bokeh Effect", desc: "Stronger background blur for focus" },
                                { id: "color-grading", label: "Corporate Color Grading", desc: "Subtle blue/neutral professional tones" }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">{item.label}</Label>
                                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <Switch id={item.id} defaultChecked={item.id.includes('soft') || item.id.includes('color')} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Advanced Directives */}
                    <Card className="ios-glass-card md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Target className="w-5 h-5" />
                                Custom Directives (Plus & Professional)
                            </CardTitle>
                            <CardDescription>Invisible guidelines sent with every generation request</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-2xl bg-black/5 border border-dashed border-primary/20 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {['Italian Cut', 'Double Breasted', 'Navy/Charcoal Core', 'High Contrast', 'Minimalist', 'Sharp Jawline Focus'].map(tag => (
                                        <div key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20 flex items-center gap-1">
                                            {tag}
                                            <Wand2 className="w-3 h-3" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs text-muted-foreground leading-relaxed">
                                    These directives effectively "nudge" the Antigravity model to favor your specific anatomy and style preferences without having to manually prompt them every time.
                                    <span className="text-primary font-bold ml-1">Included in your Plus subscription.</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </EditorLayout>
    );
};

export default Personalization;
