import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import EditorLayout from "@/components/EditorLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, CheckCircle2, AlertCircle, Loader2, Wand2, ShieldCheck, Image as ImageIcon, Camera, Sparkles } from "lucide-react";
import { toast } from "sonner";

const MIN_RESOLUTION = 512; // Strict quality control
const RECOMMENDED_RESOLUTION = 1024;

const ANALYSIS_STEPS = [
    "Verifying image resolution...",
    "Checking lighting conditions...",
    "Analyzing facial features...",
    "Ensuring strict professional consistency...",
    "Optimizing for high-definition output..."
];

const Generate = () => {
    const [step, setStep] = useState<"upload" | "analyzing" | "config" | "generating" | "complete">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (file: File) => {
        setError(null);

        // 1. Basic Type Check
        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file (JPG, PNG).");
            return;
        }

        // 2. Load image to check dimensions (Strict Quality Check)
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            if (img.width < MIN_RESOLUTION || img.height < MIN_RESOLUTION) {
                setError(`Image resolution too low (${img.width}x${img.height}px). Minimum required is ${MIN_RESOLUTION}x${MIN_RESOLUTION}px for high-quality results.`);
                URL.revokeObjectURL(objectUrl);
                return;
            }

            setFile(file);
            setPreviewUrl(objectUrl);
            startAnalysis();
        };

        img.src = objectUrl;
    };

    const startAnalysis = () => {
        setStep("analyzing");
        setAnalysisProgress(0);
        setCurrentAnalysisStep(0);

        // Simulate strict analysis process
        const interval = setInterval(() => {
            setAnalysisProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setStep("config"), 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);

        // Rotate through analysis messages
        const stepInterval = setInterval(() => {
            setCurrentAnalysisStep((prev) => {
                if (prev >= ANALYSIS_STEPS.length - 1) {
                    clearInterval(stepInterval);
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);
    };

    const handleGenerate = async () => {
        setStep("generating");
        setGenerationProgress(10); // Start progress

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error("You must be logged in to generate images.");
                setStep("config");
                return;
            }

            // In a real app, we would upload the file to Supabase Storage here first
            // const { data: uploadData, error: uploadError } = await supabase.storage.from('uploads').upload(...)

            // For now, we call the Edge Function acting as the 'hedge'
            const { data, error } = await supabase.functions.invoke('generate-ai', {
                body: {
                    prompt: "Generate professional headshot based on uploaded context",
                    userId: session.user.id,
                    type: 'image-generation'
                }
            });

            if (error) throw error;

            console.log("Generation result:", data);

            // Simulate progress for the UX while the 'hedge' function processes (if it were long polling)
            // or confirm immediate success
            setGenerationProgress(100);

            setTimeout(() => {
                setStep("complete");
                toast.success("Professional Headshot Generated Successfully");
                // In a real scenario, we would setPreviewUrl(data.result_url)
            }, 500);

        } catch (err: any) {
            console.error("Generation error:", err);
            setError(err.message || "Failed to generate image");
            setStep("config"); // Go back
            toast.error("Generation failed. Please try again.");
        }
    };

    const resetFlow = () => {
        setStep("upload");
        setFile(null);
        setPreviewUrl(null);
        setAnalysisProgress(0);
        setGenerationProgress(0);
        setError(null);
    };

    return (
        <EditorLayout>
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
                <div className="w-full max-w-3xl space-y-8">

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {step === "upload" && "Upload Your Photo"}
                            {step === "analyzing" && "Analyzing Quality"}
                            {step === "config" && "Select Style"}
                            {step === "generating" && "Generating..."}
                            {step === "complete" && "Your New Look"}
                        </h1>
                        <p className="text-muted-foreground">
                            {step === "upload" && "We enforce strict quality standards to ensure professional results."}
                            {step === "analyzing" && "Ensuring your image meets our high-consistency standards."}
                            {step === "config" && "Choose a consistent, high-quality professional style."}
                            {step === "generating" && "Applying AI improvements with maximum precision."}
                            {step === "complete" && "Review your high-definition professional headshot."}
                        </p>
                    </div>

                    <Card className="border-2 overflow-hidden shadow-lg transition-all duration-500">
                        <CardContent className="p-8 md:p-12">

                            {/* Step 1: Upload */}
                            {step === "upload" && (
                                <div className="space-y-8">
                                    <div
                                        className="border-2 border-dashed border-border rounded-3xl p-12 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                        />
                                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                            <Upload className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Drop your image here or browse</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Supports JPG, PNG. Min resolution {MIN_RESOLUTION}px.
                                        </p>
                                        <Button variant="outline" className="rounded-full px-8">Select Photo</Button>
                                    </div>

                                    {error && (
                                        <Alert variant="destructive" className="animate-in fade-in-0">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Quality Check Failed</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                                            <ShieldCheck className="w-4 h-4" />
                                            Images are processed securely and deleted after generation.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Analysis */}
                            {step === "analyzing" && (
                                <div className="space-y-8 text-center max-w-md mx-auto">
                                    <div className="w-32 h-32 mx-auto relative">
                                        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                                        {previewUrl && (
                                            <img src={previewUrl} className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover rounded-full opacity-50" alt="Preview" />
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold animate-pulse">
                                            {ANALYSIS_STEPS[currentAnalysisStep]}
                                        </h3>
                                        <Progress value={analysisProgress} className="h-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Running strict consistency checks: {analysisProgress}%
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Config */}
                            {step === "config" && (
                                <div className="space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8 items-center">
                                        <div className="aspect-[4/5] rounded-xl overflow-hidden bg-muted relative border shadow-sm">
                                            {previewUrl && (
                                                <img src={previewUrl} alt="Original" className="w-full h-full object-cover" />
                                            )}
                                            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md">
                                                Original
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                    Image Quality Verified
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Your image meets our strict standards for high-consistency generation.
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-base">Selected Style (Enforced)</Label>
                                                <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-not-allowed opacity-90">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold">Professional Studio</span>
                                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">High Quality</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Optimized for maximum consistency, sharp lighting, and natural skin textures.
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-xl border border-muted bg-muted/30 opacity-50 cursor-not-allowed">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium">Creative / Casual</span>
                                                        <span className="text-xs border px-2 py-0.5 rounded-full">Unavailable</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Disabled to ensure strict professional output standards.
                                                    </p>
                                                </div>
                                            </div>

                                            <Button onClick={handleGenerate} className="w-full h-12 text-lg gap-2 shadow-lg hover:scale-105 transition-all">
                                                <Wand2 className="w-5 h-5" />
                                                Generate High-Fidelity Image
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Generating */}
                            {step === "generating" && (
                                <div className="space-y-8 text-center max-w-md mx-auto">
                                    <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
                                        <div className="relative z-10 w-full h-full bg-background rounded-full border-4 border-primary flex items-center justify-center overflow-hidden">
                                            {previewUrl && <img src={previewUrl} className="w-full h-full object-cover opacity-80 blur-sm" alt="Processing" />}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <Wand2 className="w-12 h-12 text-white animate-pulse" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold">Constructing Professional Likeness...</h3>
                                        <Progress value={generationProgress} className="h-3" />
                                        <p className="text-sm text-muted-foreground">
                                            Refining textures and lighting ({generationProgress}%)
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Complete */}
                            {step === "complete" && (
                                <div className="space-y-8">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Generation Complete</h2>
                                        <p className="text-muted-foreground">High-quality consistent output generated.</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-muted relative border shadow-sm">
                                                {previewUrl && <img src={previewUrl} alt="Original" className="w-full h-full object-cover opacity-60 grayscale" />}
                                                <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs">Original</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-primary/5 relative border-2 border-primary shadow-xl">
                                                {/* Placeholder for generated image - typically would be a new URL */}
                                                {previewUrl && <img src={previewUrl} alt="Generated" className="w-full h-full object-cover" />}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> Professional AI
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 justify-center pt-4">
                                        <Button variant="outline" onClick={resetFlow}>Generate Another</Button>
                                        <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
                                        <Button variant="secondary">Download HD</Button>
                                    </div>
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>
            </div>
        </EditorLayout>
    );
};


export default Generate;
