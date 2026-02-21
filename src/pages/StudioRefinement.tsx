import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import EditorLayout from "@/components/EditorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  RotateCcw,
  Download,
  Share2,
  History,
  Wand2,
  MessageSquare,
  ChevronLeft,
  Settings2,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/utils/upload";

type GenderMode = "Gentlemen" | "Ladies";
type StudioType = "Portrait" | "Hair" | "Accessories" | "Background" | "PromptYourself";

interface StudioOption {
  label: string;
  value: string;
}

const STUDIO_OPTIONS = {
  Portrait: {
    Gentlemen: {
      outfit: ["Full Suit", "Blazer & Trousers", "Smart Casual", "Business Formal", "Boardroom Executive"],
      attireType: ["Two-Piece Suit", "Three-Piece Suit", "Tuxedo", "Blazer Only", "Sport Coat"],
      shirtStyle: ["Dress Shirt", "Oxford", "Poplin", "Twill", "French Cuff"],
      blazerStyle: ["Single-Breasted", "Double-Breasted", "Peak Lapel", "Notch Lapel", "Shawl Collar"],
      colorScheme: ["Navy", "Charcoal", "Black", "Grey", "Tan", "Custom"],
      neckline: ["Standard Collar", "Spread Collar", "Button-Down", "Cutaway", "Windsor"],
      posture: ["Standing Professional", "Seated Executive", "Lean Confidence", "Arms Crossed", "Natural"],
      accessories: ["Tie", "Bow Tie", "Pocket Square", "Lapel Pin", "None"],
      details: ["Sharp Lines", "Soft Blend", "High Contrast", "Balanced", "Minimal"]
    },
    Ladies: {
      outfit: ["Full Suit", "Blazer & Skirt", "Blazer & Trousers", "Sheath Dress", "Executive Ensemble"],
      attireType: ["Power Suit", "Tailored Blazer", "Professional Dress", "Business Casual", "Corporate Formal"],
      shirtStyle: ["Silk Blouse", "Button-Up", "Shell Top", "Knit Top", "Structured Shirt"],
      blazerStyle: ["Single-Breasted", "Collarless", "Peak Lapel", "Notch Lapel", "Open Front"],
      colorScheme: ["Navy", "Black", "Burgundy", "Cream", "Grey", "Custom"],
      neckline: ["V-Neck", "Round Neck", "Boat Neck", "Collar", "Jewel Neck"],
      posture: ["Standing Professional", "Seated Executive", "Confident Stance", "Natural", "Poised"],
      accessories: ["Statement Necklace", "Subtle Jewelry", "Scarf", "Brooch", "None"],
      details: ["Sharp Lines", "Soft Blend", "High Contrast", "Balanced", "Elegant"]
    }
  },
  Hair: {
    Gentlemen: {
      style: ["Classic Taper", "Low Fade", "Mid Fade", "High Fade", "Slick Back", "Side Part", "Textured Crop", "Pompadour"],
      texture: ["Smooth", "Wavy", "Textured", "Natural", "Sleek"],
      grooming: ["Clean Cut", "Professional", "Sharp Lines", "Natural Edge", "Soft Blend"],
      length: ["Short", "Medium Short", "Medium", "Slightly Long"],
      finish: ["Matte", "Natural Shine", "Glossy", "Textured"]
    },
    Ladies: {
      style: ["Sleek Straight", "Soft Waves", "Professional Updo", "Low Bun", "High Ponytail", "Side Part", "Protective Style", "Natural Curls"],
      texture: ["Straight", "Wavy", "Curly", "Coily", "Natural"],
      volume: ["Flat", "Subtle Volume", "Full Volume", "Textured Volume"],
      length: ["Short", "Shoulder Length", "Medium", "Long"],
      finish: ["Glossy", "Natural Shine", "Matte", "Soft"]
    }
  },
  Accessories: {
    Gentlemen: {
      watches: ["Leather Strap", "Metal Band", "Chronograph", "Dress Watch", "Smart Watch", "None"],
      ties: ["Solid Color", "Striped", "Patterned", "Textured", "Bow Tie", "None"],
      glasses: ["Aviator", "Rectangular", "Round", "Wayfarer", "None"],
      lapelPins: ["Flag Pin", "Company Logo", "Simple Pin", "Flower", "None"],
      cufflinks: ["Silver", "Gold", "Engraved", "Modern", "Classic", "None"],
      other: ["Pocket Square", "Tie Clip", "Belt", "None"]
    },
    Ladies: {
      jewelry: ["Statement Necklace", "Delicate Necklace", "Pearl Necklace", "Pendant", "None"],
      earrings: ["Studs", "Hoops", "Drop Earrings", "Pearl Earrings", "None"],
      glasses: ["Cat Eye", "Rectangular", "Round", "Oversized", "None"],
      watches: ["Leather Strap", "Metal Band", "Dress Watch", "Smart Watch", "None"],
      brooch: ["Floral", "Geometric", "Pearl", "Vintage", "None"],
      other: ["Scarf", "Hair Accessories", "Belt", "None"]
    }
  },
  Background: {
    shared: {
      setting: ["Modern Office", "Executive Suite", "Boardroom", "Studio Gradient", "Corporate Lobby", "Clean White", "Soft Grey", "Warm Neutral"],
      lighting: ["Natural Light", "Studio Light", "Soft Ambient", "Dramatic", "Balanced"],
      depth: ["Shallow Focus", "Full Depth", "Blurred Background", "Sharp Background"],
      mood: ["Professional", "Confident", "Approachable", "Authoritative", "Friendly"],
      style: ["Minimal", "Corporate", "Modern", "Classic", "Contemporary"]
    }
  }
};

const StudioRefinement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [genderMode, setGenderMode] = useState<GenderMode>("Gentlemen");
  const [studioType, setStudioType] = useState<StudioType>("Portrait");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = searchParams.get("image");
    const mode = searchParams.get("gender") as GenderMode;
    const type = searchParams.get("type") as StudioType;

    if (img) setGeneratedImage(img);
    if (mode) setGenderMode(mode);
    if (type) setStudioType(type);
  }, [searchParams]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Reset selections when gender or studio changes
  useEffect(() => {
    setSelections({});
    setCustomPrompt("");
  }, [genderMode, studioType]);

  const handleSelectionChange = (key: string, value: string) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGeneratedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    setIsLoading(true);

    // Build instructions from selections
    const instructions = studioType === "PromptYourself"
      ? customPrompt
      : Object.entries(selections)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        sonnerToast.error("Please log in to continue");
        return;
      }

      // Storage Flow
      let finalImageUrl = generatedImage;
      if (generatedImage.startsWith('data:')) {
        finalImageUrl = await uploadImage(generatedImage);
      }

      const { data, error } = await supabase.functions.invoke('generate-ai', {
        body: {
          imageUrl: finalImageUrl,
          type: studioType.toLowerCase(),
          genderMode,
          prompt: instructions,
          userId: session.user.id
        }
      });

      if (error || data.error) throw new Error(error?.message || data.error || 'Failed to refine');

      // Update the UI with processed result
      if (data.result) {
        setGeneratedImage(data.result);
      }

      // In this demo flow, we re-set the image or show the new analysis
      toast({
        title: "Success!",
        description: data.message || "Your image has been refined.",
      });

      if (data.description) {
        toast({
          title: "AI Stylist Insights",
          description: data.description.slice(0, 100) + "...",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStudioControls = () => {
    if (studioType === "PromptYourself") {
      return (
        <div className="space-y-4">
          <Label htmlFor="custom-prompt" className="text-lg font-medium">
            Describe Your Modification
          </Label>
          <Textarea
            id="custom-prompt"
            placeholder="E.g., 'Change the suit to navy blue with a burgundy tie and add a modern office background...'"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="ios-glass-input min-h-[150px] text-base"
          />
        </div>
      );
    }

    if (studioType === "Background") {
      const options = STUDIO_OPTIONS.Background.shared;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(options).map(([key, values]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <Select onValueChange={(value) => handleSelectionChange(key, value)}>
                <SelectTrigger id={key} className="ios-glass-input">
                  <SelectValue placeholder={`Select ${key}`} />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl border border-border">
                  {values.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      );
    }

    const studioOptions = STUDIO_OPTIONS[studioType]?.[genderMode];
    if (!studioOptions) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(studioOptions).map(([key, values]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
            <Select onValueChange={(value) => handleSelectionChange(key, value)}>
              <SelectTrigger id={key} className="ios-glass-input">
                <SelectValue placeholder={`Select ${key}`} />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border border-border">
                {values.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Studio Refinement
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Intelligent AI-powered refinements for your professional appearance.
            Select your preferences and watch the magic happen.
          </p>
        </div>

        {/* Image Preview Section */}
        <div
          ref={sectionRef}
          onMouseMove={handleMouseMove}
          className="rounded-3xl ios-glass-card liquid-glass-section p-8 animate-scale-in"
          style={{
            '--mouse-x': `${mousePosition.x}px`,
            '--mouse-y': `${mousePosition.y}px`,
          } as React.CSSProperties}
        >
          {generatedImage ? (
            <div className="relative aspect-square max-w-2xl mx-auto rounded-2xl overflow-hidden border-2 border-border shadow-2xl">
              <img
                src={generatedImage}
                alt="Generated professional image"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="ios-glass-button p-3 rounded-full hover:scale-110 transition-all">
                    <Upload className="w-5 h-5" />
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="aspect-square max-w-2xl mx-auto rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center space-y-4 p-12">
              <div className="w-20 h-20 rounded-full ios-glass-card flex items-center justify-center">
                <Upload className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Upload Your Image</h3>
                <p className="text-muted-foreground">
                  Start by uploading a professional photo to refine
                </p>
              </div>
              <label htmlFor="image-upload">
                <Button className="ios-glass-button px-6 py-3 rounded-xl">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Controls Section */}
        {generatedImage && (
          <div className="rounded-3xl ios-glass-card p-8 space-y-8 animate-slide-up">
            {/* Gender & Studio Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="gender-mode" className="text-lg font-medium flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Gender Mode
                </Label>
                <Select value={genderMode} onValueChange={(value) => setGenderMode(value as GenderMode)}>
                  <SelectTrigger id="gender-mode" className="ios-glass-input h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border border-border">
                    <SelectItem value="Gentlemen">Gentlemen</SelectItem>
                    <SelectItem value="Ladies">Ladies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="studio-type" className="text-lg font-medium flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-accent" />
                  Studio Type
                </Label>
                <Select value={studioType} onValueChange={(value) => setStudioType(value as StudioType)}>
                  <SelectTrigger id="studio-type" className="ios-glass-input h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border border-border">
                    <SelectItem value="Portrait">Portrait Studio</SelectItem>
                    <SelectItem value="Hair">Hair Studio</SelectItem>
                    <SelectItem value="Accessories">Accessories Studio</SelectItem>
                    <SelectItem value="Background">Background Studio</SelectItem>
                    <SelectItem value="PromptYourself">PromptYourself Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Studio-Specific Controls */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">
                {studioType} Options for {genderMode}
              </h3>
              {renderStudioControls()}
            </div>

            {/* Regenerate Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="ios-glass-button px-12 py-6 text-lg rounded-2xl hover:scale-105 transition-all shadow-2xl"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    Regenerate Look
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioRefinement;
