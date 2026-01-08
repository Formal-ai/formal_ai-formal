import { Mail, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Contact {
  name: string;
  company: string;
  email: string;
  lastInteraction: string;
  relationshipHealth: number;
  sentiment: string;
  conversationSummary: string;
  actionItems: string[];
  nextFollowUp: string;
  suggestedReply: string;
}

interface ContactDetailsDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactDetailsDialog = ({ contact, open, onOpenChange }: ContactDetailsDialogProps) => {
  if (!contact) return null;

  const getSentimentColor = (sentiment: string) => {
    if (sentiment.includes("Very Positive")) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (sentiment.includes("Positive")) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto ios-glass-card border-border/20">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
              <span className="text-primary font-semibold text-2xl">
                {contact.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-1">{contact.name}</DialogTitle>
              <DialogDescription className="text-base">
                {contact.company} • {contact.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Sentiment & Health */}
          <div className="flex gap-4">
            <div className="flex-1 ios-glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Sentiment</span>
              </div>
              <Badge className={getSentimentColor(contact.sentiment)}>
                {contact.sentiment}
              </Badge>
            </div>
            <div className="flex-1 ios-glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Health Score</span>
              </div>
              <span className="text-2xl font-bold text-primary">{contact.relationshipHealth}%</span>
            </div>
          </div>

          {/* Conversation Summary */}
          <div className="ios-glass-card p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              Conversation Summary
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {contact.conversationSummary}
            </p>
          </div>

          {/* Action Items */}
          <div className="ios-glass-card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              Action Items
            </h3>
            <ul className="space-y-2">
              {contact.actionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Follow-up */}
          <div className="ios-glass-card p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              Next Follow-up
            </h3>
            <p className="text-muted-foreground">
              {formatDate(contact.nextFollowUp)}
            </p>
          </div>

          {/* Suggested Reply */}
          <div className="ios-glass-card p-4">
            <h3 className="font-semibold mb-2">AI-Suggested Reply</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {contact.suggestedReply}
            </p>
            <Button className="w-full ios-glass-button">
              <Mail size={16} className="mr-2" />
              Compose Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailsDialog;
