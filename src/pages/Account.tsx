import { useState, useEffect } from "react";
import EditorLayout from "@/components/EditorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Shield, CreditCard, Zap, Settings as SettingsIcon, History, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

const Account = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setProfile({
                    ...(data as any),
                    email: session.user.email
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/");
        toast.success("Successfully signed out");
    };

    const getInitials = (name: string) => {
        return name
            ? name.split(' ').map(n => n[0]).join('').toUpperCase()
            : 'U';
    };

    return (
        <EditorLayout>
            <div className="p-6 md:p-8 space-y-8 animate-fade-in max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-background">
                            {getInitials(profile?.full_name || "User")}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-serif tracking-tight">{profile?.full_name || "Professional"}</h1>
                            <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4" />
                                {profile?.email || "loading..."}
                            </p>
                            <div className="flex gap-2 mt-3">
                                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest">Plus Model</span>
                                <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-full gap-2" onClick={() => navigate("/settings")}>
                            <SettingsIcon className="w-4 h-4" />
                            Settings
                        </Button>
                        <Button className="rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 gap-2" onClick={handleSignOut}>
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <Card className="ios-glass-card md:col-span-2 overflow-hidden border-none shadow-xl">
                        <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-primary" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" />
                                Subscription Details
                            </CardTitle>
                            <CardDescription>Manage your plan and billing cycles</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 rounded-2xl bg-black/5 flex items-center justify-between border border-primary/10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">Free Plan</p>
                                        <p className="text-sm text-muted-foreground">Subscription plans coming soon</p>
                                    </div>
                                </div>
                                <Button onClick={() => navigate("/pricing")} className="rounded-full px-6 bg-primary text-primary-foreground font-bold" disabled>Coming Soon</Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-black/5 space-y-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Available Credits</p>
                                    <p className="text-2xl font-bold tabular-nums">{profile?.credits || 0}</p>
                                    <p className="text-[10px] text-muted-foreground mt-2">Free tier: 2 images/week</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/5 space-y-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Studio Access</p>
                                    <p className="text-2xl font-bold">All Studios</p>
                                    <p className="text-[10px] text-primary flex items-center gap-1 mt-2">
                                        <Zap className="w-3 h-3" /> 5 studios available
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="ios-glass-card border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl">Activity Meta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate("/history")}>
                                    <div className="flex items-center gap-3">
                                        <History className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        <span className="text-sm font-medium">Render History</span>
                                    </div>
                                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Active</span>
                                </div>
                                <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate("/history")}>
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                                        <span className="text-sm font-medium">Privacy Level</span>
                                    </div>
                                    <span className="text-xs font-bold text-green-500">Maximum</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-sm font-medium">Member Since</span>
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground">{profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : "2024"}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <p className="text-xs font-bold text-muted-foreground mb-3 text-center uppercase tracking-widest">Connect Identity</p>
                                <div className="flex justify-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 hover:scale-110 transition-all cursor-pointer">
                                        <span className="text-lg font-bold text-blue-500">G</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center border border-black/20 hover:scale-110 transition-all cursor-pointer">
                                        <span className="text-lg font-bold">X</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 hover:scale-110 transition-all cursor-pointer">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </EditorLayout>
    );
};

export default Account;
