import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    User,
    Scissors,
    Palette,
    Image,
    Sparkles,
    History,
    Download,
    UserCircle,
    Settings,
    Menu,
    X,
    Zap,
    HelpCircle,
    LogOut,
    ChevronRight,
    Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import formalAiLogo from "@/assets/formal-ai-logo.png";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EditorLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setProfile(data);
            }
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/");
        toast.success("Signed out successfully");
    };

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/portrait-studio", label: "Portrait Studio", icon: User, isStudio: true },
        { path: "/hair-studio", label: "Hair Studio", icon: Scissors, isStudio: true },
        { path: "/accessories-studio", label: "Accessories Studio", icon: Palette, isStudio: true },
        { path: "/background-studio", label: "Background Studio", icon: Image, isStudio: true },
        { path: "/prompt-yourself-studio", label: "Prompt Yourself Studio", icon: Sparkles, isStudio: true },
        { path: "/history", label: "History", icon: History },
        { path: "/downloads", label: "Downloads", icon: Download },
        { path: "/account", label: "Account", icon: UserCircle },
        { path: "/settings", label: "Settings", icon: Settings },
    ];

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? "w-72" : "w-20"
                    } bg-card border-r border-border transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-40`}
            >
                {/* Logo & Toggle */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                    {isSidebarOpen ? (
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-white overflow-hidden">
                                <img src={formalAiLogo} alt="Formal.AI" className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="font-bold font-serif">Formal.AI</span>
                        </Link>
                    ) : (
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-white overflow-hidden mx-auto">
                            <img src={formalAiLogo} alt="Formal.AI" className="w-full h-full object-contain p-1" />
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={!isSidebarOpen ? "absolute top-4 right-2" : ""}
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            // @ts-ignore
                            const isStudio = item.isStudio;

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isStudio && isSidebarOpen ? "ml-4" : ""
                                            } ${isActive
                                                ? "bg-primary text-primary-foreground shadow-lg"
                                                : "hover:bg-accent hover:text-accent-foreground"
                                            }`}
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile Section at Bottom */}
                <div className="p-4 border-t border-border">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className={`w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-accent transition-all group ${!isSidebarOpen && "justify-center"}`}>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-primary flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                                    {getInitials(profile?.full_name || "User")}
                                </div>
                                {isSidebarOpen && (
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{profile?.full_name || "Professional"}</p>
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Zap className="w-2.5 h-2.5" />
                                            Plus Plan
                                        </p>
                                    </div>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent side="right" align="end" className="w-64 p-2 ios-glass-card shadow-2xl border-primary/20" sideOffset={12}>
                            <div className="p-3 border-b border-border mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-primary flex items-center justify-center text-white font-bold">
                                        {getInitials(profile?.full_name || "User")}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate">{profile?.full_name || "Professional"}</p>
                                        <p className="text-xs text-muted-foreground truncate opacity-70">@{profile?.full_name?.toLowerCase().replace(' ', '') || "user"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <button onClick={() => navigate("/pricing")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-all text-sm font-medium">
                                    <Zap className="w-4 h-4 text-primary" />
                                    Upgrade Plan
                                </button>
                                <button onClick={() => navigate("/personalization")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-all text-sm font-medium">
                                    <Fingerprint className="w-4 h-4" />
                                    Personalization
                                </button>
                                <button onClick={() => navigate("/settings")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-all text-sm font-medium">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                                <div className="h-px bg-border my-2 mx-2" />
                                <button onClick={() => navigate("/help")} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-accent transition-all text-sm font-medium">
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="w-4 h-4" />
                                        Help
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-30" />
                                </button>
                                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-all text-sm font-medium">
                                    <LogOut className="w-4 h-4" />
                                    Log out
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`flex-1 ${isSidebarOpen ? "ml-72" : "ml-20"} transition-all duration-300`}
            >
                {children}
            </main>
        </div>
    );
};

export default EditorLayout;
