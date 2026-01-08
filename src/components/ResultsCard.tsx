import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ResultsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor?: string;
  delay?: number;
}

const ResultsCard = ({ icon: Icon, label, value, iconColor = "text-primary", delay = 0 }: ResultsCardProps) => {
  return (
    <div 
      className="ios-glass-card p-6 hover:scale-105 transition-all duration-300 animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-background/40 ${iconColor}`}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1 font-medium">{label}</p>
          <p className="text-base leading-relaxed">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;
