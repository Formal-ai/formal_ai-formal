import { useState } from "react";
import { Upload, MessageSquare, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FeatureCardsProps {
  onAnalyze: (data: { audioFile?: File; messageText?: string }) => void;
}

const FeatureCards = ({ onAnalyze }: FeatureCardsProps) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        setAudioFile(file);
      }
    }
  };

  const handleAnalyze = () => {
    if (audioFile || messageText.trim()) {
      onAnalyze({
        audioFile: audioFile || undefined,
        messageText: messageText.trim() || undefined,
      });
    }
  };

  return (
    <section className="space-y-8 mb-12 animate-fade-in">
      {/* Instructional Text */}
      <div className="text-center max-w-2xl mx-auto space-y-2 animate-slide-up">
        <h2 className="text-2xl md:text-3xl font-bold">Get Started</h2>
        <p className="text-muted-foreground text-lg">
          Upload your voice note or paste an email — our AI will organize everything instantly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Voice Note Upload Card */}
        <div className="rounded-[2rem] ios-glass-card p-8 space-y-6 animate-slide-up stagger-1">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold">Voice Note Upload</h3>
          </div>
          
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ios-glass-input ${
              isDragging ? "border-primary bg-primary/10" : "border-border/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="audio/mp3,audio/wav,audio/mpeg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="audio-upload"
            />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              {audioFile ? audioFile.name : "Drop your audio file here or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground">Supports MP3, WAV</p>
          </div>
        </div>

        {/* Message/Email Paste Card */}
        <div className="rounded-[2rem] ios-glass-card p-8 space-y-6 animate-slide-up stagger-2">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h3 className="text-2xl font-bold">Paste Message or Email</h3>
          </div>
          
          <Textarea
            placeholder="Paste your message or email content here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="min-h-[200px] rounded-2xl ios-glass-input transition-all resize-none border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      {/* Analyze Button with Tooltip */}
      <div className="flex justify-center mt-8 animate-scale-in stagger-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleAnalyze}
                disabled={!audioFile && !messageText}
                className="ios-glass-button px-12 py-4 rounded-2xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 flex items-center gap-2 text-black"
              >
                <Sparkles size={20} className="text-primary" />
                Analyze Now
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="ios-glass-card border-primary/20">
              <p className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                Powered by Gemini AI
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </section>
  );
};

export default FeatureCards;
