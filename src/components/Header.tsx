import { useState, useEffect, useRef } from "react";
import { Menu, X, Moon, Sun, ChevronDown, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import formalAiLogo from "@/assets/formal-ai-logo.png";

const LAUNCH_MODE = import.meta.env.VITE_LAUNCH_MODE || "live";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    // Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfileName("");
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const [profileName, setProfileName] = useState("");

  const fetchProfile = async (userId: string) => {
    // @ts-ignore
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    // @ts-ignore
    if (data?.full_name) {
      // @ts-ignore
      setProfileName(data.full_name.split(' ')[0]);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className={`sticky top-0 z-50 py-2 sm:py-4 transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl bg-background/80' : ''}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          onMouseMove={handleMouseMove}
          className="relative flex items-center justify-between h-14 sm:h-16 liquid-glass-nav px-4 sm:px-6 group"
          style={{
            '--mouse-x': `${mousePosition.x}px`,
            '--mouse-y': `${mousePosition.y}px`,
          } as React.CSSProperties}
        >
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-white overflow-hidden p-0">
                <img src={formalAiLogo} alt="Formal.AI Logo" className="w-full h-full object-contain p-1" />
              </div>
              <span className="text-base sm:text-xl font-bold font-serif truncate">
                {profileName ? `${profileName}'s Studio` : "Formal.AI"}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 relative z-10">
            <Link
              to="/"
              className={`glass-nav-item rounded-full px-4 py-2 transition-all nav-underline-effect ${location.pathname === "/" ? "active" : ""}`}
            >
              Home
            </Link>

            {LAUNCH_MODE === "waitlist" ? (
              <Link
                to="/waitlist"
                className={`glass-nav-item rounded-full px-4 py-2 transition-all nav-underline-effect ${location.pathname === "/waitlist" ? "active" : ""}`}
              >
                Waitlist
              </Link>
            ) : (
              <>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="glass-nav-item rounded-full px-4 py-2 bg-transparent hover:bg-accent/50 data-[state=open]:bg-accent/50">
                        Studios
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[240px] gap-1 p-2 bg-background/95 backdrop-blur-xl border border-border shadow-xl rounded-lg">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/portrait-studio"
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium">Portrait Studio</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/hair-studio"
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium">Hair Studio</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/accessories-studio"
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium">Accessories Studio</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/background-studio"
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium">Background Studio</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/prompt-yourself-studio"
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium">Prompt Yourself Studio</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

                <Link
                  to="/pricing"
                  className={`glass-nav-item rounded-full px-4 py-2 transition-all nav-underline-effect ${location.pathname === "/pricing" ? "active" : ""}`}
                >
                  Pricing
                </Link>
                <Link
                  to="/contacts"
                  className={`glass-nav-item rounded-full px-4 py-2 transition-all nav-underline-effect ${location.pathname === "/contacts" ? "active" : ""}`}
                >
                  Contacts
                </Link>
              </>
            )}

            <Link
              to="/about"
              className={`glass-nav-item rounded-full px-4 py-2 transition-all nav-underline-effect ${location.pathname === "/about" ? "active" : ""}`}
            >
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 relative z-10">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full glass-nav-item transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>

            {user && LAUNCH_MODE !== "waitlist" ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button className="hidden md:flex bg-primary/90 backdrop-blur-sm hover:bg-primary text-primary-foreground rounded-full px-6 py-2 hover:scale-105 transition-all shadow-lg">
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex p-2 rounded-full glass-nav-item hover:bg-red-500/10 hover:text-red-500 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : LAUNCH_MODE === "waitlist" ? (
              <Link to="/waitlist" className="hidden md:flex">
                <Button className="ios-glass-button rounded-full px-6 py-2 hover:scale-105 transition-all shadow-lg">
                  Join The Waitlist
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" className="hidden md:flex text-sm font-medium hover:bg-transparent hover:text-primary transition-colors">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth?signup=true">
                  <Button className="hidden md:flex bg-primary/90 backdrop-blur-sm hover:bg-primary text-primary-foreground rounded-full px-6 py-2 hover:scale-105 transition-all shadow-lg">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-1.5 sm:p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link to="/" className="text-sm font-medium hover:text-accent transition-colors">
                Home
              </Link>
              {LAUNCH_MODE === "waitlist" ? (
                <>
                  <Link to="/waitlist" className="text-sm font-medium hover:text-accent transition-colors">
                    Waitlist
                  </Link>
                  <Link to="/about" className="text-sm font-medium hover:text-accent transition-colors">
                    About
                  </Link>
                  <Link to="/waitlist" className="w-full">
                    <Button className="ios-glass-button rounded-full w-full py-4 font-semibold">
                      Join The Waitlist
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-sm font-medium text-muted-foreground px-2">Studios</div>
                  <Link to="/portrait-studio" className="text-sm font-medium hover:text-accent transition-colors pl-4">
                    Portrait Studio
                  </Link>
                  <Link to="/hair-studio" className="text-sm font-medium hover:text-accent transition-colors pl-4">
                    Hair Studio
                  </Link>
                  <Link to="/accessories-studio" className="text-sm font-medium hover:text-accent transition-colors pl-4">
                    Accessories Studio
                  </Link>
                  <Link to="/background-studio" className="text-sm font-medium hover:text-accent transition-colors pl-4">
                    Background Studio
                  </Link>
                  <Link to="/prompt-yourself-studio" className="text-sm font-medium hover:text-accent transition-colors pl-4">
                    Prompt Yourself Studio
                  </Link>
                  <Link to="/pricing" className="text-sm font-medium hover:text-accent transition-colors">
                    Pricing
                  </Link>
                  <Link to="/contacts" className="text-sm font-medium hover:text-accent transition-colors">
                    Contacts
                  </Link>
                  <Link to="/about" className="text-sm font-medium hover:text-accent transition-colors">
                    About
                  </Link>
                  <Link to="/dashboard" className="w-full">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-full">
                      Join Now
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
