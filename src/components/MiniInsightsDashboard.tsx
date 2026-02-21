import { useEffect, useState } from "react";
import { TrendingUp, MessageSquare, Heart } from "lucide-react";

interface MiniInsightsDashboardProps {
  totalMessages: number;
  averageRelationshipScore: number;
  lastSentiment: string;
}

const MiniInsightsDashboard = ({
  totalMessages,
  averageRelationshipScore,
  lastSentiment
}: MiniInsightsDashboardProps) => {
  const [displayTotal, setDisplayTotal] = useState(0);
  const [displayAverage, setDisplayAverage] = useState(0);

  useEffect(() => {
    // Animate counter for total messages
    let current = displayTotal;
    const increment = Math.ceil((totalMessages - displayTotal) / 20);
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalMessages) {
        setDisplayTotal(totalMessages);
        clearInterval(timer);
      } else {
        setDisplayTotal(current);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [totalMessages]);

  useEffect(() => {
    // Animate counter for average score
    let current = displayAverage;
    const increment = (averageRelationshipScore - displayAverage) / 20;
    const timer = setInterval(() => {
      current += increment;
      if (Math.abs(current - averageRelationshipScore) < 0.1) {
        setDisplayAverage(averageRelationshipScore);
        clearInterval(timer);
      } else {
        setDisplayAverage(current);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [averageRelationshipScore]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'negative':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  return (
    <section className="mt-8 mb-12 animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-muted-foreground">Quick Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {/* Total Messages */}
        <div className="ios-glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground font-medium">TOTAL</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold tabular-nums animate-pulse text-black">
              {displayTotal}
            </div>
            <p className="text-sm text-muted-foreground">Messages Analyzed</p>
          </div>
        </div>

        {/* Average Relationship Score */}
        <div className="ios-glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 animate-scale-in stagger-1">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-purple-400/10">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-xs text-muted-foreground font-medium">AVERAGE</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold tabular-nums animate-pulse text-black">
              {displayAverage.toFixed(1)}<span className="text-lg text-muted-foreground">/10</span>
            </div>
            <p className="text-sm text-muted-foreground">Relationship Score</p>
          </div>
        </div>

        {/* Last Sentiment */}
        <div className="ios-glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 animate-scale-in stagger-2">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-pink-400/10">
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-xs text-muted-foreground font-medium">LATEST</div>
          </div>
          <div className="space-y-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getSentimentColor(lastSentiment)}`}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span className="text-sm font-semibold capitalize">{lastSentiment}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Sentiment Detected</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiniInsightsDashboard;
