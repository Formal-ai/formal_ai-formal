import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Camera, Users, ImageIcon } from "lucide-react";
import StudioLayout from "@/components/StudioLayout";
import { GenderMode } from "@/data/studioOptions";
import { supabase } from "@/integrations/supabase/client";

interface StudioPageLayoutProps {
  title: string;
  subtitle: string;
  studioType: string;
  children: (props: {
    genderMode: GenderMode;
    selections: Record<string, string>;
    handleSelectionChange: (key: string, value: string) => void;
  }) => React.ReactNode;
}

type StudioStep = "gender" | "upload" | "customize";

const StudioPageLayout = ({ title, subtitle, studioType, children }: StudioPageLayoutProps) => {
  const [currentStep, setCurrentStep] = useState<StudioStep>("gender");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [genderMode, setGenderMode] = useState<GenderMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [agreement, setAgreement] = useState(false);
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

  const handleSelectionChange = (key: string, value: string) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const handleGenderSelect = (gender: GenderMode) => {
    setGenderMode(gender);
    setSelections({});
    setCurrentStep("upload");
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

  const handleRegenerate = async () => {
    if (!generatedImage || !genderMode) {
      toast({
        title: "Missing Information",
        description: "Please complete all steps first.",
        variant: "destructive"
      });
      return;
    }

    if (!agreement) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the Terms of Service to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get User
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Authentication Required", description: "Please log in to generate images.", variant: "destructive" });
        return;
      }

      // 2. Prepare Constraints
      // Filter out empty/None values
      const constraints = Object.entries(selections).reduce((acc, [key, value]) => {
        if (value && value !== "None") {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      // 3. Call Backend
      const { data, error } = await supabase.functions.invoke('generate-ai', {
        body: {
          type: studioType.toLowerCase(),
          userId: session.user.id,
          image: generatedImage, // Sending Base64 (Caution: Size limit)
          constraints: {
            ...constraints,
            genderMode // Include gender mode in constraints
          }
        }
      });

      if (error) {
        if (error.status === 429) {
          throw new Error("You're generating too fast! Please wait a moment.");
        }
        throw error;
      }

      if (data.error) throw new Error(data.error);

      console.log("Generation Success:", data);

      toast({
        title: "Generation Complete",
        description: "Your image has been processed successfully.",
      });

      // If we got a real image result (if we were using image model), we'd update it here.
      // setGeneratedImage(data.result); 

    } catch (error: any) {
      console.error("Generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToGender = () => {
    setCurrentStep("gender");
    setGenderMode(null);
    setGeneratedImage(null);
    setSelections({});
  };

  const handleBackToUpload = () => {
    setCurrentStep("upload");
    setGeneratedImage(null);
    setSelections({});
  };

  return (
    <StudioLayout>
      <div className="min-h-screen bg-background py-8 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-serif">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentStep === "gender" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
              <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold">1</span>
              <span className="text-sm font-medium">Gender</span>
            </div>
            <div className="w-8 h-0.5 bg-border hidden sm:block" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentStep === "upload" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
              <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold">2</span>
              <span className="text-sm font-medium">Upload</span>
            </div>
            <div className="w-8 h-0.5 bg-border hidden sm:block" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentStep === "customize" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
              <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold">3</span>
              <span className="text-sm font-medium">Customize</span>
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

          {/* Step 1: Gender Selection */}
          {currentStep === "gender" && (
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
                <div className="w-20 h-20 rounded-full ios-glass-card flex items-center justify-center mx-auto">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-serif">Select Your Style Mode</h2>
                  <p className="text-muted-foreground">
                    Choose your style category to see personalized options
                  </p>
                </div>
                <div className="flex gap-4 justify-center max-w-md mx-auto">
                  <Button
                    onClick={() => handleGenderSelect("Gentlemen")}
                    className="flex-1 py-8 text-lg font-semibold rounded-xl ios-glass-button hover:scale-105 transition-all"
                  >
                    Gentlemen
                  </Button>
                  <Button
                    onClick={() => handleGenderSelect("Ladies")}
                    className="flex-1 py-8 text-lg font-semibold rounded-xl ios-glass-button hover:scale-105 transition-all"
                  >
                    Ladies
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload/Camera */}
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                  <span className="text-sm font-medium">Mode: {genderMode}</span>
                </div>
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
                <Button
                  variant="ghost"
                  onClick={handleBackToGender}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Back to Gender Selection
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Customize */}
          {currentStep === "customize" && genderMode && (
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
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                    Mode: {genderMode}
                  </div>
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

              {/* Controls Section */}
              <div className="rounded-2xl ios-glass-card p-6 space-y-6 animate-slide-up">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold font-serif">
                    Customization Options
                  </h3>
                  {children({ genderMode, selections, handleSelectionChange })}
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

                {/* Regenerate Button */}
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    className="ios-glass-button px-10 py-5 text-base rounded-xl hover:scale-105 transition-all shadow-xl"
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

export default StudioPageLayout;

// Reusable Select Component for Studios
export const StudioSelect = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-muted-foreground">
      {label}
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="ios-glass-input h-11">
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent className="bg-background/95 backdrop-blur-xl border border-border shadow-xl z-50">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
