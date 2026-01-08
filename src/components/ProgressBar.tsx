import { useEffect, useState } from "react";

interface ProgressBarProps {
  isAnalyzing: boolean;
}

const ProgressBar = ({ isAnalyzing }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 150);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  }, [isAnalyzing]);

  if (!isAnalyzing && progress === 0) return null;

  return (
    <div className="w-full ios-glass-card p-6 animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Analyzing with AI...</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="relative h-3 bg-background/40 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 transition-all duration-300 ease-out animate-pulse"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
