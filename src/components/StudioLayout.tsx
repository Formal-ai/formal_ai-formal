import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Home,
    LayoutDashboard,
    ChevronDown,
    User,
    Scissors,
    Palette,
    Image as ImageIcon,
    Sparkles,
    LogOut,
    Sun,
    Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import formalAiLogo from "@/assets/formal-ai-logo.png";
import { supabase } from "@/integrations/supabase/client";

interface StudioLayoutProps {
    children: ReactNode;
}

const StudioLayout = ({ children }: StudioLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        setIsDark(savedTheme === "dark");

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
    }, []);

    const studios = [
        { path: "/portrait-studio", label: "Portrait Studio", icon: User },
        { path: "/hair-studio", label: "Hair Studio", icon: Scissors },
        { path: "/accessories-studio", label: "Accessories Studio", icon: Palette },
        { path: "/background-studio", label: "Background Studio", icon: ImageIcon },
        { path: "/prompt-yourself-studio", label: "Prompt Yourself", icon: Sparkles },
    ];

    const currentStudio = studios.find(s => s.path === location.pathname);
    const otherStudios = studios.filter(s => s.path !== location.pathname);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const navRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!navRef.current) return;
        const rect = navRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Studio Navigation Bar */}
            <nav className="sticky top-0 z-50 w-full p-2 sm:p-4">
                <div
                    ref={navRef}
                    onMouseMove={handleMouseMove}
                    className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between liquid-glass-nav"
                    style={{
                        '--mouse-x': `${mousePosition.x}px`,
                        '--mouse-y': `${mousePosition.y}px`,
                    } as React.CSSProperties}
                >
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-white overflow-hidden p-0">
                                <img src={formalAiLogo} alt="Formal.AI" className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="font-bold font-serif hidden sm:inline-block">Formal.AI</span>
                        </Link>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-1">
                            <Link to="/">
                                <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
                                    <Home className="w-4 h-4" />
                                    Home
                                </Button>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="rounded-full gap-2">
                                        <span className="text-primary font-semibold">{currentStudio?.label || "Studios"}</span>
                                        <ChevronDown className="w-4 h-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56 glass-pane p-2">
                                    <div className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">Other Studios</div>
                                    {otherStudios.map((studio) => {
                                        const Icon = studio.icon;
                                        return (
                                            <DropdownMenuItem key={studio.path} asChild>
                                                <Link to={studio.path} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg">
                                                    <Icon className="w-4 h-4" />
                                                    <span>{studio.label}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-full"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>

                        <Link to="/dashboard">
                            <Button className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 gap-2">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Button>
                        </Link>

                        {user && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSignOut}
                                className="rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default StudioLayout;
