import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EditorLayout from "@/components/EditorLayout";
import {
    Image as ImageIcon,
    CreditCard,
    Heart,
    TrendingUp,
    Sparkles,
    Clock,
    ChevronRight,
    RotateCcw,
    Lightbulb,
    CheckCircle2
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, subDays, isWithinInterval } from "date-fns";

const Dashboard = () => {
    const [userName, setUserName] = useState<string>("Professional");
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        totalGenerations: 0,
        savedGenerations: 0,
        monthlyGenerations: 0,
        credits: 0,
        weeklyGenerations: 0
    });
    const [recentCreations, setRecentCreations] = useState<any[]>([]);
    const [chartData, setChartData] = useState<{ name: string, generations: number }[]>([]);
    const [styleStats, setStyleStats] = useState<{ name: string, value: number, color: string }[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            // M6 FIX: Use getUser() for server-verified auth instead of getSession()
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const userId = user.id;
            setUserName(user.user_metadata?.full_name || "Professional");

            // 1. Fetch Profile (Credits)
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('credits')
                .eq('id', userId)
                .single();

            // H5 FIX: Limit query to most recent 200 generations to prevent large payloads
            const { data: generations } = await (supabase as any)
                .from('generations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(200);

            if (generations) {
                const now = new Date();
                const monthStart = startOfMonth(now);

                const total = generations.length;
                const saved = generations.filter(g => g.is_saved).length;
                const monthly = generations.filter(g => new Date(g.created_at) >= monthStart).length;
                const oneWeekAgo = subDays(now, 7);
                const weekly = generations.filter(g => new Date(g.created_at) >= oneWeekAgo).length;

                setAnalytics({
                    totalGenerations: total,
                    savedGenerations: saved,
                    monthlyGenerations: monthly,
                    credits: profile?.credits || 0,
                    weeklyGenerations: weekly
                });

                // Recent 4 creations
                setRecentCreations(generations.slice(0, 4));

                // Process Chart Data (Last 7 days)
                const last7Days = Array.from({ length: 7 }).map((_, i) => {
                    const d = subDays(now, 6 - i);
                    const dayName = format(d, 'EEE');
                    const count = generations.filter(g =>
                        format(new Date(g.created_at), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')
                    ).length;
                    return { name: dayName, generations: count };
                });
                setChartData(last7Days);

                // Process Style Stats
                const styles = ['Portrait', 'Hair', 'Accessories', 'Background', 'Magic'];
                const stats = styles.map((style, i) => {
                    const count = generations.filter(g => ((g as any).type || '').toLowerCase().includes(style.toLowerCase())).length;
                    const colors = ['var(--primary)', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                    return { name: `${style} Studio`, value: count, color: colors[i] };
                }).filter(s => s.value > 0);

                // If no data, show empty placeholders or sorted stats
                setStyleStats(stats.length > 0 ? stats.sort((a, b) => b.value - a.value) : [
                    { name: 'Portrait Studio', value: 0, color: 'var(--primary)' },
                    { name: 'Business Formal', value: 0, color: '#8b5cf6' },
                    { name: 'Creative Studio', value: 0, color: '#ec4899' },
                    { name: 'Custom Magic', value: 0, color: '#f59e0b' },
                ]);
            } else {
                // H6 FIX: Include weeklyGenerations in fallback state
                setAnalytics({
                    totalGenerations: 0,
                    savedGenerations: 0,
                    monthlyGenerations: 0,
                    credits: profile?.credits || 0,
                    weeklyGenerations: 0
                });
                setChartData(Array.from({ length: 7 }).map((_, i) => ({ name: format(subDays(now, 6 - i), 'EEE'), generations: 0 })));
                setStyleStats([
                    { name: 'Portrait Studio', value: 0, color: 'var(--primary)' },
                    { name: 'Business Formal', value: 0, color: '#8b5cf6' },
                    { name: 'Creative Studio', value: 0, color: '#ec4899' },
                    { name: 'Custom Magic', value: 0, color: '#f59e0b' },
                ]);
            }
            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    const now = new Date();

    return (
        <EditorLayout>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in transition-all duration-300">

                {/* 1. Welcome Overview */}
                <header className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-serif">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {analytics.totalGenerations === 0
                            ? "Start your professional styling journey today"
                            : "Here’s how your AI styling is performing"}
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="ios-glass-card border-none shadow-sm group hover:scale-[1.02] transition-transform">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-4xl font-bold tracking-tighter transition-all duration-1000">
                                    {analytics.totalGenerations}
                                </span>
                                <p className="text-sm font-medium text-muted-foreground">Images Generated</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="ios-glass-card border-none shadow-sm group hover:scale-[1.02] transition-transform">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-500/10 rounded-xl">
                                    <Clock className="w-5 h-5 text-purple-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-4xl font-bold tracking-tighter">
                                    {analytics.monthlyGenerations}
                                </span>
                                <p className="text-sm font-medium text-muted-foreground">This Month’s Usage</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="ios-glass-card border-none shadow-sm group hover:scale-[1.02] transition-transform">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-amber-500/10 rounded-xl">
                                    <CreditCard className="w-5 h-5 text-amber-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-4xl font-bold tracking-tighter">
                                    {analytics.credits > 0 ? analytics.credits : Math.max(0, 2 - analytics.weeklyGenerations)}
                                </span>
                                <p className="text-sm font-medium text-muted-foreground font-sans">
                                    {analytics.credits > 0 ? "Credits Remaining" : "Free Weekly Images Left"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="ios-glass-card border-none shadow-sm group hover:scale-[1.02] transition-transform">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-green-500/10 rounded-xl">
                                    <Heart className="w-5 h-5 text-green-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-4xl font-bold tracking-tighter">
                                    {analytics.savedGenerations}
                                </span>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 font-serif">
                                    Images Saved
                                    {analytics.savedGenerations > 0 && <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded">High results</span>}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 2. Usage Over Time */}
                    <Card className="lg:col-span-2 border-none shadow-sm ios-glass-card overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold font-serif">Usage Over Time</CardTitle>
                                <CardDescription>Consistency in your professional styling</CardDescription>
                            </div>
                            <Tabs defaultValue="7" className="w-[200px]">
                                <TabsList className="bg-muted/50 rounded-full h-8">
                                    <TabsTrigger value="7" className="text-xs rounded-full">7d</TabsTrigger>
                                    <TabsTrigger value="30" className="text-xs rounded-full" disabled>30d</TabsTrigger>
                                    <TabsTrigger value="90" className="text-xs rounded-full" disabled>90d</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                                fontSize: '12px',
                                                padding: '12px'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="generations"
                                            stroke="var(--primary)"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorUsage)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5. Credit Management */}
                    <Card className="border-none shadow-sm ios-glass-card">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold font-serif">Credit Balance</CardTitle>
                            <CardDescription>Managed for your efficiency</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Remaining Credits</span>
                                    <span className="text-muted-foreground">{analytics.credits} / 1000</span>
                                </div>
                                <Progress value={(analytics.credits / 1000) * 100} className="h-2.5 bg-primary/10" />
                            </div>

                            <div className="p-5 rounded-2xl bg-muted/40 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-background rounded-full">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Estimated Generations</p>
                                        <p className="text-2xl font-bold text-primary">~{Math.floor(analytics.credits / 4)}</p>
                                        <p className="text-xs text-muted-foreground mt-1 text-serif italic line-clamp-2">Based on your average usage</p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full rounded-2xl bg-primary hover:opacity-90 transition-all font-semibold"
                                    onClick={() => window.location.href = '/pricing'}
                                >
                                    Upgrade Plan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* 3. Style & Result Insights */}
                    <Card className="border-none shadow-sm ios-glass-card">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold font-serif">Style Preferences</CardTitle>
                            <CardDescription>What identifies best with your profile</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={styleStats} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
                                            width={160}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                            {styleStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                <Link to="/portrait-studio" className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm hover:bg-primary/10 transition-colors cursor-pointer">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <p>Users tend to save <strong>Professional Headshot</strong> more often</p>
                                </Link>
                                <Link to="/hair-studio" className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-sm hover:bg-purple-500/10 transition-colors cursor-pointer">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    <p>Great choice for LinkedIn and professional profiles</p>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Quality Signals */}
                    <Card className="border-none shadow-sm ios-glass-card">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold font-serif">Quality Signals</CardTitle>
                            <CardDescription>Success markers for your results</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-3xl font-bold text-green-500 tracking-tighter">
                                        {analytics.totalGenerations > 0 ? Math.round((analytics.savedGenerations / analytics.totalGenerations) * 100) : 0}%
                                    </p>
                                    <p className="text-sm font-medium">Images you kept</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight">Indicating your satisfaction with generated output.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-3xl font-bold text-blue-500 tracking-tighter">
                                        {analytics.totalGenerations > 0 ? (analytics.totalGenerations / (analytics.totalGenerations - analytics.savedGenerations + 1)).toFixed(1) : "0.0"}x
                                    </p>
                                    <p className="text-sm font-medium">Refined results</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight">Refinements are part of achieving the perfect look.</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/50">
                                <p className="text-sm font-medium mb-4">Session Satisfaction</p>
                                <div className="flex justify-between items-center bg-muted/30 p-4 rounded-3xl">
                                    {['Confident', 'Satisfied', 'Exploring'].map((label, i) => (
                                        <div key={label} className="flex flex-col items-center gap-2">
                                            <div className={`w-10 h-1 rounded-full ${analytics.totalGenerations > 0 && i === 0 ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                                            <span className={`text-[11px] font-medium ${analytics.totalGenerations > 0 && i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* 6. Recent Generations Feed */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight font-serif">Recent Creations</h2>
                        <Link to="/history">
                            <Button variant="ghost" className="gap-2 text-primary font-medium">
                                View All <ChevronRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentCreations.length > 0 ? recentCreations.map((item) => (
                            <Card key={item.id} className="overflow-hidden border-none shadow-sm group glass-card">
                                <div className="aspect-[4/5] bg-muted/50 relative overflow-hidden">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.type} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground italic">No Preview</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex gap-2">
                                        <Link to={`/${item.type.toLowerCase().split(' ')[0]}-studio`}>
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                                                <RotateCcw size={14} />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <CardContent className="p-4 space-y-1">
                                    <h4 className="font-semibold text-sm line-clamp-1">{item.type}</h4>
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span>{format(new Date(item.created_at), 'MMM d, h:mm a')}</span>
                                        <div className="flex items-center gap-1 text-green-500 font-medium">
                                            <div className="w-1 h-1 rounded-full bg-green-500" />
                                            Completed
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="col-span-full py-12 text-center ios-glass-card rounded-3xl border border-dashed border-muted-foreground/30">
                                <p className="text-muted-foreground italic font-sans">No creations yet. Start styling to see them here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 7. Smart Tips Panel */}
                <section className="bg-primary/5 rounded-[2.5rem] p-8 md:p-12 border border-primary/10">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="bg-primary/10 p-5 rounded-3xl">
                            <Lightbulb className="w-10 h-10 text-primary" />
                        </div>
                        <div className="space-y-4 text-center md:text-left flex-1 font-serif">
                            <h3 className="text-2xl font-bold font-serif">Pro Tips for Best Results</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                                <div className="space-y-2">
                                    <p className="font-semibold text-sm">Optimal Lighting</p>
                                    <p className="text-sm text-muted-foreground">Business headshots tend to save best with neutral, soft lighting.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold text-sm">Iteration is Key</p>
                                    <p className="text-sm text-muted-foreground">Users often get their best result on the second or third generation.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold text-sm">LinkedIn Ready</p>
                                    <p className="text-sm text-muted-foreground">Try consistent backgrounds for a more professional LinkedIn feed.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </EditorLayout>
    );
};

export default Dashboard;
