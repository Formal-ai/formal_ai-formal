import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

// Mock data
const weeklyData = [
  { day: "Mon", messages: 12, voiceNotes: 5 },
  { day: "Tue", messages: 15, voiceNotes: 8 },
  { day: "Wed", messages: 8, voiceNotes: 3 },
  { day: "Thu", messages: 18, voiceNotes: 10 },
  { day: "Fri", messages: 22, voiceNotes: 12 },
  { day: "Sat", messages: 6, voiceNotes: 2 },
  { day: "Sun", messages: 4, voiceNotes: 1 },
];

const sentimentData = [
  { week: "Week 1", positive: 65, neutral: 25, negative: 10 },
  { week: "Week 2", positive: 70, neutral: 20, negative: 10 },
  { week: "Week 3", positive: 68, neutral: 22, negative: 10 },
  { week: "Week 4", positive: 75, neutral: 18, negative: 7 },
];

const healthDistribution = [
  { name: "Healthy", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Neutral", value: 35, color: "hsl(var(--chart-2))" },
  { name: "At Risk", value: 20, color: "hsl(var(--chart-3))" },
];

const actionItems = [
  { id: 1, task: "Follow up with Sarah Chen about Q2 partnership", date: "2025-01-15", contact: "Sarah Chen" },
  { id: 2, task: "Send renewal contract to Marcus Johnson", date: "2025-01-12", contact: "Marcus Johnson" },
  { id: 3, task: "Share API documentation with David Park", date: "2025-01-13", contact: "David Park" },
  { id: 4, task: "Connect James Wilson to advisory board", date: "2025-01-16", contact: "James Wilson" },
  { id: 5, task: "Check Q1 budget with Emily Rodriguez", date: "2025-01-20", contact: "Emily Rodriguez" },
  { id: 6, task: "Send value content to Lisa Thompson", date: "2025-01-18", contact: "Lisa Thompson" },
];

const Insights = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">Insights</h1>
          <p className="text-muted-foreground text-lg">
            Get actionable insights from your relationships — powered by AI intelligence.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="ios-glass-card p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="text-primary" size={20} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Contacts</span>
            </div>
            <p className="text-3xl font-bold">124</p>
          </div>
          
          <div className="ios-glass-card p-6 animate-scale-in" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <TrendingUp className="text-chart-1" size={20} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Avg Health Score</span>
            </div>
            <p className="text-3xl font-bold">78%</p>
          </div>
          
          <div className="ios-glass-card p-6 animate-scale-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <Calendar className="text-chart-2" size={20} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">This Week</span>
            </div>
            <p className="text-3xl font-bold">85</p>
          </div>
          
          <div className="ios-glass-card p-6 animate-scale-in" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <CheckCircle2 className="text-chart-3" size={20} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Action Items</span>
            </div>
            <p className="text-3xl font-bold">12</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Overview */}
          <div className={`ios-glass-card p-6 transition-all duration-700 ${isVisible ? "animate-scale-in" : "opacity-0"}`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              Weekly Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                />
                <Legend />
                <Bar dataKey="messages" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} animationDuration={1000} />
                <Bar dataKey="voiceNotes" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment Trends */}
          <div className={`ios-glass-card p-6 transition-all duration-700 ${isVisible ? "animate-scale-in" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-chart-1 rounded-full" />
              Sentiment Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="positive" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={{ r: 5 }} animationDuration={1500} />
                <Line type="monotone" dataKey="neutral" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 5 }} animationDuration={1500} />
                <Line type="monotone" dataKey="negative" stroke="hsl(var(--chart-3))" strokeWidth={3} dot={{ r: 5 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Relationship Health Distribution */}
          <div className={`ios-glass-card p-6 transition-all duration-700 ${isVisible ? "animate-scale-in" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-chart-2 rounded-full" />
              Health Distribution
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={healthDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {healthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {healthDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Action Items */}
          <div className={`lg:col-span-2 ios-glass-card p-6 transition-all duration-700 ${isVisible ? "animate-scale-in" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-chart-3 rounded-full" />
              Top Action Items
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {actionItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${400 + index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium mb-1">{item.task}</p>
                      <p className="text-sm text-muted-foreground">{item.contact}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground whitespace-nowrap">{formatDate(item.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Insights;
