import { Building2, Calendar } from "lucide-react";

interface ContactCardProps {
  contact: {
    id: string;
    name: string;
    company: string;
    lastInteraction: string;
    relationshipHealth: number;
  };
  onClick: () => void;
  animationDelay: number;
}

const ContactCard = ({ contact, onClick, animationDelay }: ContactCardProps) => {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get color based on relationship health
  const getHealthColor = (health: number) => {
    if (health >= 80) return "bg-green-500";
    if (health >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div
      onClick={onClick}
      className="ios-glass-card p-6 cursor-pointer group hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-scale-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Avatar */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center group-hover:border-primary/60 transition-colors duration-300">
            <span className="text-primary font-semibold text-lg">
              {getInitials(contact.name)}
            </span>
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors duration-300">
            {contact.name}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Building2 size={14} />
            <span className="truncate">{contact.company}</span>
          </div>
        </div>
      </div>

      {/* Last Interaction */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Calendar size={14} />
        <span>Last contact: {formatDate(contact.lastInteraction)}</span>
      </div>

      {/* Relationship Health */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Relationship Health</span>
          <span className="font-semibold">{contact.relationshipHealth}%</span>
        </div>
        <div className="relative h-2 bg-muted/20 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${getHealthColor(contact.relationshipHealth)}`}
            style={{ width: `${contact.relationshipHealth}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
