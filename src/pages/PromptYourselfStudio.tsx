import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Camera, Wand2, ImageIcon } from "lucide-react";
import StudioLayout from "@/components/StudioLayout";
import { supabase } from "@/integrations/supabase/client";

type StudioStep = "upload" | "customize";

const PromptYourselfStudio = () => {
  const [currentStep, setCurrentStep] = useState<StudioStep>("upload");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [agreement, setAgreement] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGeneratedImage(e.target?.result as string);
        setCurrentStep("customize");
      };
      reader.readAsDataURL(file);
    }
  };

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleBackToUpload = () => {
    setCurrentStep("upload");
    setGeneratedImage(null);
    setCustomPrompt("");
  };

  const handleRegenerate = async () => {
    if (!generatedImage) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }

    if (!customPrompt.trim()) {
      toast({
        title: "No Instructions",
        description: "Please describe the modification you want.",
        variant: "destructive"
      });
      return;
    }

    if (!agreement) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the Terms of Service.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get User
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Authentication Required", description: "Please log in.", variant: "destructive" });
        return;
      }

      // 2. Call Backend
      const { data, error } = await supabase.functions.invoke('generate-ai', {
        body: {
          type: 'magic',
          userId: session.user.id,
          image: generatedImage,
          prompt: customPrompt // Passing 'prompt' for magic type
        }
      });

      if (error) {
        if (error.status === 429) throw new Error("Rate limit exceeded. Please slow down.");
        throw error;
      }

      if (data.error) throw new Error(data.error);

      console.log("Generation Success:", data);

      toast({
        title: "Magic Complete",
        description: "Your custom styling has been applied.",
      });

      // setGeneratedImage(data.result);

    } catch (error: any) {
      console.error("Magic generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StudioLayout>
      <div className="min-h-screen bg-background py-8 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-serif">
              Prompt Yourself Studio
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Describe any modification you want and let AI bring your vision to life.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentStep === "upload" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
              <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold">1</span>
              <span className="text-sm font-medium">Upload</span>
            </div>
            <div className="w-8 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentStep === "customize" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
              <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold">2</span>
              <span className="text-sm font-medium">Describe</span>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Step 1: Upload/Camera */}
          {currentStep === "upload" && (
            <div
              ref={sectionRef}
              onMouseMove={handleMouseMove}
              className="rounded-2xl ios-glass-card liquid-glass-section p-8 animate-scale-in"
              style={{
                '--mouse-x': `${mousePosition.x}px`,
                '--mouse-y': `${mousePosition.y}px`,
              } as React.CSSProperties}
            >
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-serif">Upload Your Photo</h2>
                  <p className="text-muted-foreground">
                    Choose from your gallery or take a new photo
                  </p>
                </div>
                <div className="flex gap-4 justify-center max-w-lg mx-auto">
                  <Button
                    onClick={openGallery}
                    className="flex-1 py-12 flex-col gap-3 rounded-xl ios-glass-button hover:scale-105 transition-all"
                  >
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-lg font-semibold">Gallery</span>
                    <span className="text-xs text-muted-foreground">Choose from device</span>
                  </Button>
                  <Button
                    onClick={openCamera}
                    className="flex-1 py-12 flex-col gap-3 rounded-xl ios-glass-button hover:scale-105 transition-all"
                  >
                    <Camera className="w-10 h-10" />
                    <span className="text-lg font-semibold">Camera</span>
                    <span className="text-xs text-muted-foreground">Take a new photo</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Customize */}
          {currentStep === "customize" && (
            <>
              {/* Image Preview Section */}
              <div
                ref={sectionRef}
                onMouseMove={handleMouseMove}
                className="rounded-2xl ios-glass-card liquid-glass-section p-6 animate-scale-in"
                style={{
                  '--mouse-x': `${mousePosition.x}px`,
                  '--mouse-y': `${mousePosition.y}px`,
                } as React.CSSProperties}
              >
                <div className="flex items-center justify-end mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToUpload}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Change Photo
                  </Button>
                </div>
                {generatedImage && (
                  <div className="relative aspect-[4/5] max-w-md mx-auto rounded-xl overflow-hidden border border-border shadow-2xl">
                    <img
                      src={generatedImage}
                      alt="Generated professional image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Prompt Section */}
              <div className="rounded-2xl ios-glass-card p-6 space-y-6 animate-slide-up">
                <div className="space-y-4">
                  <Label htmlFor="custom-prompt" className="text-lg font-medium flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-accent" />
                    Describe Your Modification
                  </Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="Describe the exact modification you want. Example: Add a navy blazer with glass-office background and soft cinematic lighting."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="ios-glass-input min-h-[180px] text-base resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be as specific as possible. Mention outfit details, colors, background, lighting, accessories, and any other changes you'd like.
                  </p>
                </div>

                <div className="flex items-center space-x-2 justify-center py-2">
                  <Checkbox
                    id="terms"
                    checked={agreement}
                    onCheckedChange={(checked) => setAgreement(checked as boolean)}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={handleRegenerate}
                    disabled={isLoading || !customPrompt.trim()}
                    className="ios-glass-button px-10 py-5 text-base rounded-xl hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Look
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </StudioLayout>
  );
};

export default PromptYourselfStudio;
